"""Extract ALL mapped surface-water areas and waterways from a Jiangsu OSM PBF.
Development dependencies: osmium, shapely. No requests are made by the browser.
"""
import argparse,gzip,json,hashlib
from pathlib import Path
import osmium
from shapely.geometry import shape,mapping
from shapely import make_valid

ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'apps/web/src/data/atlas'
class Water(osmium.SimpleHandler):
    def __init__(self):
        super().__init__();self.features=[];self.errors=[];self.factory=osmium.geom.GeoJSONFactory()
    def area(self,a):
        t=dict(a.tags)
        if not (t.get('natural')=='water' or t.get('waterway')=='riverbank' or t.get('landuse') in ['reservoir','basin']):return
        try:
            g=make_valid(shape(json.loads(self.factory.create_multipolygon(a))))
            self.features.append({'type':'Feature','properties':{'id':f"{'way' if a.from_way() else 'relation'}/{a.orig_id()}",'shape':'area','tags':t},'geometry':mapping(g)})
        except Exception as e:self.errors.append([str(a.orig_id()),str(e)])
    def way(self,w):
        t=dict(w.tags)
        if t.get('waterway') not in ['river','stream','canal','drain','ditch','tidal_channel']:return
        if t.get('tunnel') not in [None,'no'] or t.get('covered')=='yes':return
        try:
            self.features.append({'type':'Feature','properties':{'id':f'way/{w.id}','shape':'line','tags':t},'geometry':json.loads(self.factory.create_linestring(w))})
        except Exception as e:self.errors.append([str(w.id),str(e)])

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('pbf',type=Path);a=p.parse_args()
    handler=Water();handler.apply_file(str(a.pbf),locations=True,idx='flex_mem')
    header=osmium.io.Reader(str(a.pbf)).header()
    payload={'type':'FeatureCollection','source':'https://download.geofabrik.de/asia/china/jiangsu.html','timestamp':header.get('osmosis_replication_timestamp'),'sha256':hashlib.sha256(a.pbf.read_bytes()).hexdigest(),'errors':handler.errors,'features':handler.features}
    with gzip.open(DEST/'hydro-source.geo.json.gz','wt',encoding='utf8') as f:json.dump(payload,f,ensure_ascii=False,separators=(',',':'))
    print('Areas:',sum(f['properties']['shape']=='area' for f in handler.features),'Lines:',sum(f['properties']['shape']=='line' for f in handler.features),'Errors:',handler.errors[:5],flush=True)
