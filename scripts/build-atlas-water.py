"""Rebuild the local atlas water extract. Requires Python 3 + shapely >= 2.

Usage: python scripts/build-atlas-water.py [--source tmp]
Default: rebuild from the committed WGS84 extract, without a network request.
--source: refresh the extract from cached OSM responses (see water-sources.md).
No geographic outline is drawn by hand. Output is committed; no runtime API.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, LineString, Point, box
from shapely.ops import polygonize, unary_union, transform
from shapely import make_valid, set_precision

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'apps/web/src/data/atlas'
IDS = ['nanjing','wuxi','xuzhou','changzhou','suzhou','nantong','lianyungang','huaian','yancheng','yangzhou','zhenjiang','taizhou','suqian']

def gcj(lon, lat):
    # WGS84 -> GCJ-02, then the exact local projection used by geometry.js.
    x, y = lon - 105, lat - 35
    a, ee = 6378245.0, 0.00669342162296594323
    dy = -100 + 2*x + 3*y + .2*y*y + .1*x*y + .2*math.sqrt(abs(x))
    dy += (20*math.sin(6*x*math.pi)+20*math.sin(2*x*math.pi))*2/3
    dy += (20*math.sin(y*math.pi)+40*math.sin(y/3*math.pi))*2/3
    dy += (160*math.sin(y/12*math.pi)+320*math.sin(y*math.pi/30))*2/3
    dx = 300+x+2*y+.1*x*x+.1*x*y+.1*math.sqrt(abs(x))
    dx += (20*math.sin(6*x*math.pi)+20*math.sin(2*x*math.pi))*2/3
    dx += (20*math.sin(x*math.pi)+40*math.sin(x/3*math.pi))*2/3
    dx += (150*math.sin(x/12*math.pi)+300*math.sin(x/30*math.pi))*2/3
    rad=lat/180*math.pi; magic=1-ee*math.sin(rad)**2
    dy=dy*180/((a*(1-ee))/(magic*math.sqrt(magic))*math.pi)
    dx=dx*180/(a/math.sqrt(magic)*math.cos(rad)*math.pi)
    return project(lon+dx,lat+dy)

def project(lon,lat):
    return ((lon-119.25)*math.cos(math.radians(33))*100,(lat-33)*100)

def polygons(g):
    if g.is_empty: return []
    if g.geom_type=='Polygon': return [g]
    return [p for child in g.geoms for p in polygons(child)]

def coordinates(g):
    # Topology-aware snapping avoids self-intersections caused by naive rounding
    # at near-tangent water/administrative boundary intersections.
    g=set_precision(make_valid(g),grid_size=.00001)
    return [[[list(map(lambda n:round(n,5),p)) for p in ring.coords]
             for ring in [poly.exterior,*poly.interiors]] for poly in polygons(g)]

def relation(e):
    def rings(role):
        lines=[LineString([(p['lon'],p['lat']) for p in m['geometry']])
               for m in e['members'] if m['role']==role and m.get('geometry')]
        return unary_union(list(polygonize(lines)))
    return make_valid(rings('outer').difference(rings('inner')))

def extract(source):
    def read(name): return json.loads((source/name).read_text(encoding='utf-8-sig'))
    river_result=read('yangtze-search.json')[0]
    lake_result=next(r for r in read('taihu-search.json') if r['osm_type']=='relation' and r['osm_id']==1126533)
    assert river_result['osm_type']=='relation' and river_result['osm_id']==9392345
    raw_lines=river_result['geojson']['coordinates']
    corridor=box(118.2,31.1,122.1,32.6)
    lines=shape({'type':'MultiLineString','coordinates':raw_lines}).intersection(corridor)
    selected=[]; surfaces=[]
    for e in read('river-surfaces.json')['elements']:
        g=relation(e)
        if g.intersection(lines).length>.02:
            selected.append(f"relation/{e['id']}");surfaces.append(g)
    for e in read('river-ways.json')['elements']:
        coords=[(p['lon'],p['lat']) for p in e.get('geometry',[])]
        if len(coords)<4 or coords[0]!=coords[-1]: continue
        g=make_valid(Polygon(coords))
        if g.intersection(lines).length>.02:
            selected.append(f"way/{e['id']}");surfaces.append(g)
    river=unary_union(surfaces)
    # OSM switches from river polygons to natural=coastline at the estuary.
    # Polygonize those actual banks with the existing river boundary. The box is
    # an extraction window offshore, NOT a substituted shoreline.
    estuary=read('estuary.json')['elements']
    coast=[LineString([(p['lon'],p['lat']) for p in e['geometry']]) for e in estuary
           if e['type']=='way' and e.get('tags',{}).get('natural')=='coastline']
    extent=box(120.8,31.45,122.1,32.1)
    coast_network=unary_union([unary_union(coast).intersection(extent),river.boundary.intersection(extent),extent.boundary])
    estuary_faces=[g for g in polygonize(coast_network) if g.intersection(lines).length>.01]
    river=unary_union([river,*estuary_faces])
    coast_ids=[f"way/{e['id']}" for e in estuary if e['type']=='way' and e.get('tags',{}).get('natural')=='coastline']
    # Fail closed if a substantial main-channel stretch is missing.
    main=LineString(raw_lines[0]).intersection(box(118.4,31.5,121.1,32.5))
    uncovered=main.difference(river.buffer(.00015)).length
    assert uncovered<.015, f'Missing riverbank coverage: {uncovered:.4f} degrees'
    lake=shape(lake_result['geojson'])
    source_geo={'type':'FeatureCollection','features':[
        {'type':'Feature','properties':{'id':'yangtze','osm':selected,'coastline':coast_ids,'offshoreExtract':[120.8,31.45,122.1,32.1]},'geometry':mapping(river)},
        {'type':'Feature','properties':{'id':'taihu','osm':['relation/1126533']},'geometry':mapping(lake)},
        {'type':'Feature','properties':{'id':'flow','osm':['relation/9392345'],'firstLine':'main_stream'},'geometry':river_result['geojson']}]}
    (DEST/'water-source.geo.json').write_text(json.dumps(source_geo,separators=(',',':')),encoding='utf8')
    manifest={name:hashlib.sha256((source/name).read_bytes()).hexdigest() for name in ['river-surfaces.json','river-ways.json','taihu-search.json','yangtze-search.json','estuary.json']}
    (DEST/'water-source-checksums.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')

def build(source=None):
    if source: extract(source)
    features=json.loads((DEST/'water-source.geo.json').read_text(encoding='utf8'))['features']
    river=shape(features[0]['geometry']);lake=shape(features[1]['geometry'])
    raw_lines=features[2]['geometry']['coordinates'];selected=features[0]['properties']['osm']
    corridor=box(118.2,31.1,122.1,32.6)
    main=LineString(raw_lines[0]).intersection(box(118.4,31.5,121.1,32.5))
    uncovered=main.difference(river.buffer(.00015)).length
    assert uncovered<.015, f'Missing riverbank coverage: {uncovered:.4f} degrees'
    geo=json.loads((DEST/'jiangsu.geo.json').read_text(encoding='utf8'))
    cities={IDS[int(f['properties']['adcode'])//100-3201]:transform(project,make_valid(shape(f['geometry']))) for f in geo['features']}
    province=unary_union(list(cities.values()))
    # Simplify only below ~15 metres; preserve polygon topology and island holes.
    river=transform(gcj,river)
    river=river.simplify(.012,preserve_topology=True).intersection(river).intersection(province)
    lake=transform(gcj,lake)
    lake=lake.simplify(.012,preserve_topology=True).intersection(lake)
    water=unary_union([river,lake]);land={key:g.difference(water) for key,g in cities.items()}
    island_land=unary_union([Polygon(r) for p in polygons(lake) for r in p.interiors]).difference(province)
    # Retain real branches, assigning their endpoints to the main-channel chainage.
    main_projected=transform(gcj,LineString(raw_lines[0]))
    origin=main_projected.project(Point(gcj(118.4,31.5)))
    flow=[]
    for i,raw in enumerate(raw_lines):
        line=LineString(raw).intersection(corridor)
        if line.is_empty: continue
        parts=[line] if line.geom_type=='LineString' else list(line.geoms)
        for part in parts:
            part=transform(gcj,part).simplify(.04)
            start=main_projected.project(part.boundary.geoms[0])-origin
            end=main_projected.project(part.boundary.geoms[-1])-origin
            points=list(part.coords);distance=0;encoded=[]
            for j,p in enumerate(points):
                if j: distance+=math.dist(points[j-1],p)
                s=start+distance if i==0 else start+(end-start)*distance/part.length
                encoded.append([round(p[0],5),round(p[1],5),round(s,5)])
            flow.append(encoded)
    result={'version':1,'projection':'GCJ-02 -> local equirectangular (119.25,33), scale 100',
            'land':{key:coordinates(g) for key,g in land.items()},'islands':coordinates(island_land),
            'water':[{'id':'yangtze','kind':'river','polygons':coordinates(river)},
                     {'id':'taihu','kind':'lake','polygons':coordinates(lake)}],'flow':flow}
    (DEST/'water-geometry.json').write_text(json.dumps(result,separators=(',',':')),encoding='utf8')
    # Geometry invariants: water is genuinely carved out, all cities survive, lake islands are dry.
    assert len(land)==13 and all(not g.is_empty and g.is_valid for g in land.values())
    assert sum(g.intersection(water).area for g in land.values())<1e-6
    assert all(g.is_valid for g in [river,lake])
    print('OSM river surfaces:',selected)
    print('Lake islands:',sum(len(p.interiors) for p in polygons(lake)))
    print('River/mainline missing length:',uncovered)
    print('Generated bytes:',(DEST/'water-geometry.json').stat().st_size)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path)
    build(parser.parse_args().source)
