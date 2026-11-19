"""Build the atlas ocean from Natural Earth 1:10m ocean and a Jiangsu OSM extract.

Uses numpy, scipy, shapely, pyshp, pillow and osmium. Pass the Natural Earth ocean
ZIP and a Jiangsu .osm.pbf. Both inputs are used offline.
"""

import argparse
import importlib.util
import json
from pathlib import Path

import numpy as np
import osmium
import shapefile
from PIL import Image
from scipy.ndimage import distance_transform_edt
from shapely import contains_xy, get_parts, make_valid, set_precision, transform
from shapely.geometry import LineString, Point, Polygon, box, shape
from shapely.ops import linemerge, polygonize, unary_union


ROOT = Path(__file__).resolve().parents[1] / 'apps/web/src/data/atlas'
DEPTH_RANGE = 140
projection_spec = importlib.util.spec_from_file_location('atlas_water', Path(__file__).with_name('build-atlas-water.py'))
atlas_water = importlib.util.module_from_spec(projection_spec)
projection_spec.loader.exec_module(atlas_water)


class Coastlines(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.lines = []

    def way(self, way):
        if way.tags.get('natural') == 'coastline' and all(n.location.valid() for n in way.nodes):
            self.lines.append(LineString([(n.lon, n.lat) for n in way.nodes]))


def ocean_geometry(natural_earth, osm):
    extent = box(116, 26, 143, 39)
    with shapefile.Reader(str(natural_earth)) as source:
        ocean = unary_union([make_valid(shape(g.__geo_interface__)).intersection(extent)
                             for g in source.shapes()])

    survey = Coastlines()
    survey.apply_file(str(osm), locations=True, idx='flex_mem')
    coastlines = list(linemerge(survey.lines).geoms)
    mainland = max(coastlines, key=lambda line: line.length)

    # Use the continuous surveyed Jiangsu coast through the center of the view.
    # Beyond its two ends the regional ocean polygon supplies the coastline.
    patch = box(118.65, 31.9, 124, 35.06)
    edges = unary_union([patch.boundary, mainland.intersection(patch)])
    faces = list(polygonize(edges))
    if len(faces) < 2:
        raise ValueError('Jiangsu coastline does not cross the expected regional window')
    coastal_sea = next(face for face in faces if face.covers(Point(123, 33)))
    islands = [make_valid(Polygon(line)) for line in coastlines if line.is_ring]
    coastal_sea = coastal_sea.difference(unary_union(islands))
    combined = ocean.difference(patch).union(coastal_sea)
    projected = transform(combined, lambda points: np.array([atlas_water.gcj(x, y) for x, y in points]))
    return set_precision(make_valid(projected).simplify(.15), .001)


def build(natural_earth, osm):
    ocean = ocean_geometry(natural_earth, osm)
    polygons = [[[[round(x, 3), round(y, 3)] for x, y in ring.coords]
                 for ring in [polygon.exterior, *polygon.interiors]]
                for polygon in get_parts(ocean) if polygon.geom_type == 'Polygon' and polygon.area > .2]

    # Encode distance to dry land in atlas units. This drives color and wave
    # damping, while the vector polygons define the actual visible water.
    left, bottom, right, top = -80, -600, 1440, 560
    spacing = 2
    x = np.arange(left + spacing / 2, right, spacing)
    y = np.arange(top - spacing / 2, bottom, -spacing)
    xx, yy = np.meshgrid(x, y)
    wet = contains_xy(ocean, xx, yy)
    distance = distance_transform_edt(wet, sampling=spacing)
    depth = np.uint8(np.rint(np.minimum(distance / DEPTH_RANGE, 1) * 255))
    Image.fromarray(depth).save(ROOT / 'ocean-distance.png', optimize=True)
    (ROOT / 'ocean-geometry.json').write_text(json.dumps({
        'distanceBounds': [left, bottom, right, top], 'distanceRange': DEPTH_RANGE,
        'polygons': polygons,
    }, separators=(',', ':')) + '\n', encoding='utf8')


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('natural_earth', type=Path)
    cli.add_argument('osm', type=Path)
    args = cli.parse_args()
    build(args.natural_earth, args.osm)
