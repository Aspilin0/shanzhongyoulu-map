# -*- coding: utf-8 -*-
"""Illustrated park traced in pixels of the supplied 1920 x 1498 map.
Owns BOTH the SVG geometry and HTML pin positions. No invented circular route.
The dense stone-name correspondences remain provisional; this is a visitor map.
"""
from pathlib import Path
import json, random, math
from html import escape
from atlas_layout import ROUTES, PLAZA, TREE_GAP, WATER_PATH, STREAM, FOREST, EXTENT, REFERENCE_SIZE, in_polygon, conflicts, assert_layout, tree_bounds

ROOT = Path(__file__).resolve().parents[1]
ANNOTATED_PINS = {
    'N01': (1062, 513), 'N02': (845, 404), 'N03': (707, 574),
    'N04': (669, 795), 'N05': (535, 828), 'P01': (710, 970),
    'F01': (1222, 335), 'F02': (1145, 380), 'F03': (1243, 454),
    'F04': (601, 859), 'F05': (417, 1190),
}
ALIASES = {'S01':'N01','S02':'N03','S03':'N02','S04':'N05','S05':'N04'}
ANNOTATED_STONES = [
    ('杭州',1213,395),('西天目',1185,393),('建德',1163,394),('兰溪',1137,392),
    ('金华',1113,395),('玉山',1090,397),('南昌',1064,402),('樟树',1039,407),
    ('吉安',1022,438),('赣州',1058,476),('大庾',976,494),('南雄',932,487),
    ('西江',876,484),('三水',814,497),('荔浦',716,480),('桂林',699,422),
    ('衡山',864,348),('攸县',774,349),('泰和',914,375),('崇陵',966,367),
    ('茶陵',1013,381),('宜山',736,615),('青岩',710,695),('贵阳',663,741),
    ('遵义',627,799),('湄潭',622,836),('永兴',604,923),
]
# Registration preserves the old annotated landmark/stone relationships while
# taking road geometry from the new map. Only the wood structure and pavilion
# are directly named in the new screenshots; other positions remain estimates.
REGISTRATION = [
    ((700,384),(610,410)),((606,590),(497,700)),((732,590),(650,710)),
    ((1050,397),(1047,450)),((601,859),(480,1057)),((602,922),(515,1130)),
    ((710,970),(613,1216)),((845,990),(744,1220)),((581,1095),(488,1375)),
]
def register_position(x,y):
    weighted=[]
    for (a,b),(u,v) in REGISTRATION:
        d=math.hypot(x-a,y-b)
        if d<.01:return (u,v)
        weighted.append((1/d**2,u-a,v-b))
    total=sum(w for w,_,_ in weighted)
    return (round(x+sum(w*dx for w,dx,_ in weighted)/total,1),
            round(y+sum(w*dy for w,_,dy in weighted)/total,1))
PINS={k:register_position(*v) for k,v in ANNOTATED_PINS.items()}
PINS['F04']=(480,1057)
PINS['P01']=(613,1216)
STONES=[(n,*register_position(x,y)) for n,x,y in ANNOTATED_STONES]

def path(d,fill='none',stroke='none',sw=1,extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def text(x,y,s,size=20,color='#68634e',extra=''):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" {extra}>{escape(s)}</text>'
def tree(x,y,s=1,t=0):
    crown=['#7da253','#98b96b','#628e55','#acc67d'][t%4]
    if t%3==0:
        body=path('M0 1 Q-16 -16 -3 -53 Q0 -64 5 -48 Q20 -15 0 1Z',crown,'#6c8150',1.2)+path('M0 -49 Q-5 -21 0 0',stroke='#65824d',sw=1.2)
    else:
        body=path('M-5 -4 C-21 -8 -22 -27 -13 -33 C-18 -48 1 -59 10 -44 C26 -44 25 -25 18 -22 C24 -8 10 0 -5 -4Z',crown,'#667f4e',1.2)+path('M3 -44 C-7 -30 6 -23 -7 -11',stroke='#d7dba1',sw=2,extra='opacity=".75"')
    return f'<g class="map-tree" data-position="{x:.1f},{y:.1f},{s:.2f},{t}" transform="translate({x:.1f} {y:.1f}) scale({s:.2f})"><ellipse cy="4" rx="17" ry="5" fill="#738c50" opacity=".12"/>{path("M0 7 L0 -12",stroke="#85714d",sw=3)}{body}</g>'
def building(x,y,w,h,roof='#c17b5b'):
    return f'<g transform="translate({x} {y})">'+path(f'M0 0 L{w} -12 L{w+15} 0 L15 13Z',roof,'#766e58',1.5)+path(f'M15 13 L{w+15} 0 L{w+15} {h} L15 {h+13}Z','#f4e4bb','#766e58',1.5)+path(f'M0 0 L15 13 L15 {h+13} L0 {h}Z','#c5b98e','#766e58',1.5)+''.join(path(f'M{k} 19 L{k} {h+3}',stroke='#938b70',sw=3) for k in range(26,int(w),14))+'</g>'
def pavilion(x,y):
    return f'<g transform="translate({x} {y})">'+path('M-28 10 L0 24 L35 8 L8 -5Z','#d0bf93','#8a795b',1.2)+path('M-20 1 L-20 -33 M23 -3 L23 -37',stroke='#9c6f4e',sw=6)+path('M-7 6 L-7 -24 L9 -28 L9 2Z','#b8b09a','#716c57',1.4)+path('M-34 -32 Q-17 -36 0 -60 Q18 -43 37 -45 L30 -32 L-4 -21Z','#9f795e','#76624e',1.8)+path('M-32 -34 L-4 -24 L33 -43 M-4 -24 L0 -58',stroke='#e1c696',sw=2)+'</g>'
def sculpture(x,y,kind):
    start=f'<g transform="translate({x} {y})">'+path('M-23 7 L7 15 L30 3 L0 -5Z','#d5c6a2','#938a70',1.3)
    if kind=='N01': art=building(-19,-16,23,20,'#a58252')+building(5,-29,21,19,'#c2a374')
    elif kind=='N02': art=path('M-20 -8 L-20 -30 L1 -24 L20 -34 L20 -12 L0 -1Z','#b18c53','#6e6247',1.5)+path('M0 -2 L0 -24 M-15 -25 L-4 -21 M5 -21 L16 -27',stroke='#e2c996',sw=2)
    elif kind=='N03': art=path('M-14 2 L12 0 L6 -6 L4 -25 L-5 -25 L-8 -5Z','#9e8050','#665b42',1.5)+path('M-11 -25 L11 -28 L5 -38 L-5 -36Z','#cda45f','#665b42',1.5)+path('M0 -31 Q-6 -41 1 -46 Q8 -37 0 -31Z','#f0c25d','#ad8645',1)
    elif kind=='N04': art=path('M-17 -3 L-17 -21 L9 -27 L17 -21 L17 -7Z','#92987a','#686c54',1.5)+path('M-20 -20 L-27 -26 L-33 -21 M11 -22 L20 -34 L28 -33',stroke='#786e53',sw=4)+path('M27 -32 L27 -52',stroke='#786e53',sw=2)+'<circle cx="27" cy="-57" r="6" fill="#efcb72" stroke="#8d8054"/>'
    else: art=path('M-3 2 L0 -37 M0 -25 L-14 -35 M0 -17 L15 -30',stroke='#86784f',sw=4)+path('M-24 -39 Q-16 -45 -10 -38 Q-3 -47 4 -43 M8 -45 Q16 -52 23 -46 Q31 -52 36 -49 M-4 -56 Q4 -61 10 -55',stroke='#9c8050',sw=3)
    return start+art+'</g>'
def build():
    rng=random.Random(1937)
    view=' '.join(map(str,EXTENT))
    svg=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" role="img" aria-labelledby="map-title map-desc">',
         '<title id="map-title">北山西迁文化园</title>',
         '<desc id="map-desc">道路依据 2026 年 11 月新提供的清晰地图重绘。西侧迪臣路、东侧校园路、北部环路、求是巢广场与南侧碑亭接入滨水步道。</desc>',
         '<style>text{font-family:KaiTi,STKaiti,"楷体",serif}</style>',
         '<rect x="-200" y="-100" width="2300" height="2000" fill="#f8f6ed"/>']
    ground=line_polygon(FOREST)
    # An illustrated ground edge, generous lawns and blue water follow the new
    # campus reference. All streets remain in the same measured reference plane.
    svg.append(path(ground,'#85ad70',extra='transform="translate(0 10)"'))
    svg.append(path(ground,'#c9dfb2'))
    svg.append(path('M1125 61 C1200 240 1205 470 1190 630 C985 656 830 920 674 1150 C618 1294 581 1430 568 1545 L620 1660 C705 1400 750 1160 1138 918 L1310 835 L1280 600 L1170 0Z','#e0ebbc'))
    svg.append(path(WATER_PATH,'#8dc9db'))
    svg.append(path(STREAM,stroke='#b7d9df',sw=42))
    svg.append(path(STREAM,stroke='#79b9cb',sw=28))
    # Outer edges before surfaces make every junction continuous.
    for r in ROUTES:
        svg.append(path(r['d'],stroke='#e8e0cd' if r['kind']=='road' else '#b4ad8c',sw=r['width'],extra=f'class="map-route" data-route-id="{r["id"]}"'))
    for r in ROUTES:
        svg.append(path(r['d'],stroke='#747c70' if r['kind']=='road' else '#fffdf4',sw=r['width']-(10 if r['kind']=='road' else 4)))
    for r in ROUTES:
        if r['kind']=='road':svg.append(path(r['d'],stroke='#f5f0de',sw=1.6,extra='stroke-dasharray="14 17"'))
    svg.append(path(line_polygon(PLAZA),'#f6efd9','#b4ad8c',2,extra='id="qiusichao-plaza"'))

    clear=[(x,y,62) for x,y in PINS.values()]+[(880,790,86)]
    clusters=[(325,420,150,145,22),(852,260,165,85,20),(812,535,160,80,20),
        (339,740,120,140,23),(805,875,155,160,25),(362,1115,120,140,24),
        (424,1380,100,100,18),(1070,560,58,130,10)]
    trees=[];rejected=0
    for cx,cy,rx,ry,n in clusters:
        planted=0
        for _ in range(n*30):
            if planted>=n:break
            x=cx+rng.uniform(-rx,rx);y=cy+rng.uniform(-ry,ry)
            candidate=(round(x,1),round(y,1),round(rng.uniform(.57,.87),2),rng.randrange(4))
            bounds=tree_bounds(candidate)
            if not all(in_polygon(c,FOREST) for c in [(bounds[0],bounds[1]),(bounds[2],bounds[1]),(bounds[0],bounds[3]),(bounds[2],bounds[3])]):continue
            if any(math.hypot(x-px,y-py)<r for px,py,r in clear):continue
            if conflicts(candidate):rejected+=1;continue
            if any(math.hypot(x-a,y-b)<24 for a,b,_,_ in trees):continue
            trees.append(candidate);planted+=1
    assert_layout(trees)
    for x,y,scale,t in sorted(trees,key=lambda p:p[1]):svg.append(tree(x,y,scale,t))

    # Small architectural volumes replace the former identical floating strips.
    svg += [building(105,72,310,38,'#b8795f'),building(430,24,245,48,'#bd876b')]
    for x,y,w,h in [(1430,1260,260,40),(1390,1330,330,40),(1360,1435,300,40)]:
        svg.append(building(x,y,w,h,'#c48768'))
    svg.append(building(1480,1275,50,168,'#b47b60'))
    svg.append(building(470,1034,28,23,'#a77550'))
    svg.append(pavilion(*PINS['P01']))
    for k in ['N01','N02','N03','N04','N05']:svg.append(sculpture(*PINS[k],k))
    for k in ['F01','F03']:
        x,y=PINS[k]
        svg.append(f'<g transform="translate({x} {y})">'+path('M-15 5 L-12 -23 L3 -30 L16 -17 L13 6Z','#b6b092','#7d7d65',1.5)+'</g>')
    # Only one geographic label; names and explanations belong to the UI.
    svg.append(text(820,797,'校友林',46,'#6d8b5c','letter-spacing="8"'))
    svg.append('</svg>')
    out=ROOT/'assets/map';out.mkdir(parents=True,exist_ok=True)
    (out/'beishan-map.svg').write_text('\n'.join(svg),encoding='utf-8')
    (out/'layout-audit.json').write_text(json.dumps({'treeCount':len(trees),'rejectedRoadsideCandidates':rejected,'minimumCrownToRoadGap':TREE_GAP,'routeCount':len(ROUTES),'trees':trees,'reference':'2026-11-02 clear screenshots'},ensure_ascii=False,indent=2),encoding='utf-8')
    x0,y0,w,h=EXTENT
    def pct(x,y):return {'x':round((x-x0)/w*100,5),'y':round((y-y0)/h*100,5)}
    pins={k:pct(*v) for k,v in PINS.items()}
    for k,v in ALIASES.items():pins[k]=pins[v]
    geometry={'referenceSize':REFERENCE_SIZE,'extent':EXTENT,'pins':pins,'stones':[dict(n=n,**pct(x,y)) for n,x,y in STONES]}
    (ROOT/'js/geometry.js').write_text('// Generated with the SVG by tools/build-atlas.py.\nwindow.PARK_MAP = '+json.dumps(geometry,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    print(f'Built {len(ROUTES)} continuous routes; {len(trees)} safe trees, {rejected} unsafe candidates rejected.')

def line_polygon(points):
    return 'M '+' L '.join(f'{x},{y}' for x,y in points)+' Z'

if __name__=='__main__':build()
