"""Geographic regression checks for the committed water extract (requires shapely)."""
import importlib.util
import json
from pathlib import Path
import unittest
from shapely.geometry import Polygon, MultiPolygon, shape, Point
from shapely.ops import unary_union, transform

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'apps/web/src/data/atlas'
spec=importlib.util.spec_from_file_location('builder',ROOT/'scripts/build-atlas-water.py')
builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
data=json.loads((DATA/'water-geometry.json').read_text(encoding='utf8'))
source=json.loads((DATA/'water-source.geo.json').read_text())
def geometry(coords): return MultiPolygon([Polygon(p[0],p[1:]) for p in coords])
water={b['id']:geometry(b['polygons']) for b in data['water']}
land={k:geometry(v) for k,v in data['land'].items()}

class WaterGeography(unittest.TestCase):
    def test_water_and_all_city_geometries_are_valid(self):
        self.assertEqual(len(land),13)
        for g in [*land.values(),*water.values()]:
            self.assertTrue(g.is_valid)
            self.assertFalse(g.is_empty)

    def test_land_is_carved_out_not_painted_over(self):
        # Large surfaces are carved; tiny ponds are exact shoreline overlays on
        # the city top, avoiding thousands of invisible vertical wall faces.
        wet=unary_union([water[b['id']] for b in data['water'] if not b.get('detail')])
        for g in land.values(): self.assertLess(g.intersection(wet).area,.002)
        original=json.loads((DATA/'jiangsu.geo.json').read_text(encoding='utf8'))
        province=unary_union([transform(builder.project,shape(f['geometry'])) for f in original['features']])
        rebuilt=unary_union([*land.values(),wet.intersection(province)])
        self.assertLess(province.symmetric_difference(rebuilt).area,.01)
        self.assertLess(water['yangtze'].difference(province).area,.002)

    def test_lake_uses_full_source_shoreline_and_sixty_dry_islands(self):
        lake=water['taihu']
        actual=transform(builder.gcj,shape(source['features'][1]['geometry']))
        self.assertLess(lake.hausdorff_distance(actual),.013)
        self.assertEqual(sum(len(p.interiors) for p in builder.polygons(lake)),60)
        for p in builder.polygons(lake):
            for ring in p.interiors:
                self.assertFalse(lake.contains(Polygon(ring).representative_point()))

    def test_river_is_confined_to_sourced_banks(self):
        actual=transform(builder.gcj,shape(source['features'][0]['geometry']))
        self.assertTrue(actual.buffer(.013).covers(water['yangtze']))
        # City centres / dry locations must not become part of a failed estuary polygon.
        for point in [(121.15,31.6),(121.2,31.9),(120.6,31.3)]:
            self.assertFalse(water['yangtze'].contains(Point(builder.gcj(*point))))

    def test_flow_uses_downstream_chainage_on_main_and_side_channels(self):
        self.assertGreater(len(data['flow']),4)
        for line in data['flow']:
            self.assertGreater(len(line),1)
            self.assertTrue(all(b[2]>a[2] for a,b in zip(line,line[1:])))
        self.assertGreater(max(p[2] for line in data['flow'] for p in line),300)

    def test_province_network_coverage(self):
        self.assertEqual(data['version'],2)
        self.assertGreater(data['hydroCoverage']['counts']['areas'],70000)
        self.assertGreater(data['hydroCoverage']['counts']['lines'],30000)
        self.assertEqual(set(data['waterLines']),set(land))
        for city,families in data['waterLines'].items():
            self.assertTrue(any(families.values()),city)
            self.assertTrue(any(b.get('city')==city for b in data['water']))
        names=' '.join(n['name'] for n in data['hydroCoverage']['namedAreas'])
        for name in ['洪泽湖','高邮湖','骆马湖','阳澄湖','白马湖']:
            self.assertIn(name,names)
        self.assertGreater(len(data['networkFlow']),1000)

    def test_network_stays_in_province_and_details_follow_city(self):
        original=json.loads((DATA/'jiangsu.geo.json').read_text(encoding='utf8'))
        cities={builder.IDS[int(f['properties']['adcode'])//100-3201]:transform(builder.project,shape(f['geometry'])) for f in original['features']}
        province=unary_union(list(cities.values()))
        for body in data['water']:
            if not body.get('network'):continue
            area=water[body['id']]
            self.assertLess(area.difference(province).area,.003,body['id'])
            if body.get('city'):self.assertLess(area.difference(cities[body['city']]).area,.003,body['id'])
        for line in data['networkFlow']:
            self.assertTrue(all(b[2]>=a[2] for a,b in zip(line,line[1:])))
        for city in cities:
            permanent=water.get('detail-permanent-'+city)
            seasonal=water.get('detail-seasonal-'+city)
            if permanent is not None and seasonal is not None:
                self.assertLess(permanent.intersection(seasonal).area,.002,city+' overlapping surface layers')

if __name__=='__main__': unittest.main()
