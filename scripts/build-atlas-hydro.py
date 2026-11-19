"""Build province-wide surface water and honest centreline-only cartography.
Run extract-atlas-hydro.py first to refresh the committed source snapshot.
"""
import gzip,json,importlib.util,collections
from pathlib import Path
from shapely.geometry import shape,LineString,Point
from shapely.ops import unary_union,transform
from shapely import make_valid,STRtree
spec=importlib.util.spec_from_file_location('base',Path(__file__).with_name('build-atlas-water.py'))
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)

def lineparts(g):
    if g.is_empty:return []
    if g.geom_type=='LineString':return [g]
    if hasattr(g,'geoms'):return [p for child in g.geoms for p in lineparts(child)]
    return []
def poly(coords):
    from shapely.geometry import Polygon
    return unary_union([Polygon(p[0],p[1:]) for p in coords])

def disjoint_details(data):
    # Contradictory overlapping OSM records must not create coplanar z-fighting.
    # Retain the seasonal classification conservatively; the wet footprint stays identical.
    from shapely.geometry import Polygon,MultiPolygon
    by_id={w['id']:w for w in data['water']}
    for city in data['land']:
        permanent=by_id.get('detail-permanent-'+city);seasonal=by_id.get('detail-seasonal-'+city)
        if not permanent or not seasonal:continue
        a=MultiPolygon([Polygon(p[0],p[1:]) for p in permanent['polygons']])
        c=MultiPolygon([Polygon(p[0],p[1:]) for p in seasonal['polygons']])
        if a.intersection(c).area>0:
            permanent['polygons']=b.coordinates(a.difference(c))
def main():
    data=b.build(write=False)
    src=json.load(gzip.open(b.DEST/'hydro-source.geo.json.gz','rt',encoding='utf8'))
    geo=json.loads((b.DEST/'jiangsu.geo.json').read_text(encoding='utf8'))
    cities={b.IDS[int(f['properties']['adcode'])//100-3201]:transform(b.project,make_valid(shape(f['geometry']))) for f in geo['features']}
    province=unary_union(list(cities.values()));existing=unary_union([poly(w['polygons']) for w in data['water']])
    groups=collections.defaultdict(list);details=collections.defaultdict(list);lines=[];counts=collections.Counter();names=[];flow=[]
    for i,f in enumerate(src['features']):
        tags=f['properties']['tags'];g=transform(b.gcj,make_valid(shape(f['geometry'])))
        if not g.intersects(province):continue
        g=g.intersection(province)
        if g.is_empty:continue
        if f['properties']['shape']=='area':
            counts['areas']+=1
            if existing.intersects(g):g=g.difference(existing)
            if g.is_empty:continue
            # Do not enlarge shorelines; simplify below overview pixel scale.
            g=g.simplify(.025,preserve_topology=True).intersection(g)
            kind='river' if tags.get('water')=='river' or tags.get('waterway')=='riverbank' else 'lake'
            if tags.get('intermittent')=='yes' or tags.get('seasonal') not in [None,'no']:kind='seasonal'
            for part in b.polygons(g):
                if part.area>=.3:groups[kind].append(part)
                else:details['seasonal' if kind=='seasonal' else 'permanent'].append(part)
            if tags.get('name'):names.append({'id':f['properties']['id'],'name':tags['name'],'kind':kind,'area':round(g.area,4)})
        else:
            counts['lines']+=1
            major=tags.get('waterway') in ['river','canal']
            directed=tags.get('waterway') in ['river','stream'] and tags.get('flow_direction')!='both' and tags.get('tidal')!='yes'
            for part in lineparts(g):
                part=part.simplify(.025)
                coords=list(part.coords)
                if tags.get('flow_direction')=='backward':coords.reverse()
                s=0;encoded=[]
                for j,p in enumerate(coords):
                    if j:s+=Point(coords[j-1]).distance(Point(p))
                    encoded.append([round(p[0],4),round(p[1],4),round(s,4)])
                if directed:flow.append(encoded)
                lines.append((part,major,tags.get('intermittent')=='yes'))
        if i%5000==0:print('Processed',i,flush=True)
    # Distinct families, union to deduplicate overlapping multipolygon/way records.
    occupied=existing;new=[]
    for kind in ['lake','river','seasonal']:
        g=unary_union(groups[kind]).difference(occupied);occupied=unary_union([occupied,g])
        new.append({'id':'network-'+kind,'kind':'river' if kind=='river' else 'lake','seasonal':kind=='seasonal','polygons':b.coordinates(g),'network':True})
    print('Carving geographic water from all cities',dict(counts),flush=True)
    data['land']={key:b.coordinates(g.difference(occupied)) for key,g in cities.items()}
    data['landEdges']={key:[[[round(x,5),round(y,5)] for x,y in line.coords] for line in lineparts(g.boundary.difference(occupied))] for key,g in cities.items()}
    data['water']+=new;data['networkFlow']=flow
    print('Partitioning small surface waters',flush=True)
    area_parts=b.polygons(occupied)
    for family,parts in details.items():
        family_water=unary_union(parts).difference(occupied)
        area_parts.extend(b.polygons(family_water))
        for key,city in cities.items():
            detail=family_water.intersection(city)
            if not detail.is_empty:data['water'].append({'id':'detail-'+family+'-'+key,'kind':'lake','seasonal':family=='seasonal','detail':True,'city':key,'polygons':b.coordinates(detail),'network':True})
    # Lines are paths only, never buffered into invented banks. Partition by city
    # so they follow its existing lift animation. Hide portions covered by real areas.
    data['waterLines']={key:{'major':[],'minor':[],'seasonal':[]} for key in cities}
    # Index the existing groups directly; union only the nearby candidates for
    # each line, not all provincial polygons a second time.
    areas=area_parts;tree=STRtree(areas)
    print('Clipping centreline-only waterways',len(lines),flush=True)
    for index,(part,major,seasonal) in enumerate(lines):
        if index%5000==0:print('Waterway',index,flush=True)
        nearby=tree.query(part,predicate='intersects')
        rest=part.difference(unary_union([areas[i] for i in nearby])) if len(nearby) else part
        if rest.is_empty:continue
        for key,city in cities.items():
            if not rest.intersects(city):continue
            for segment in lineparts(rest.intersection(city)):
                data['waterLines'][key]['seasonal' if seasonal else 'major' if major else 'minor'].append([[round(x,4),round(y,4)] for x,y in segment.coords])
    data['hydroCoverage']={'timestamp':src['timestamp'],'source':src['source'],'counts':dict(counts),'sourceErrors':src['errors'],'namedAreas':sorted(names,key=lambda n:-n['area'])}
    data['version']=2
    disjoint_details(data)
    pending=b.DEST/'water-geometry.pending.json'
    pending.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
    pending.replace(b.DEST/'water-geometry.json')
    print('DONE',dict(counts),'bytes',(b.DEST/'water-geometry.json').stat().st_size,flush=True)
if __name__=='__main__':main()
