"""Directed walking graph sampled from real park trails; no forced return loops."""
import math
from atlas_layout import ROUTES, EXTENT, sample_path
from stone_layout import STONES


def project(point, points):
    best = (float('inf'), 0, points[0])
    walked = 0
    for a, b in zip(points, points[1:]):
        dx, dy = b[0]-a[0], b[1]-a[1]
        length = math.dist(a, b)
        t = max(0, min(1, ((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(length*length))) if length else 0
        p = (a[0]+t*dx, a[1]+t*dy)
        candidate = (math.dist(point, p), walked+t*length, p)
        if candidate[0] < best[0]: best = candidate
        walked += length
    return best[1], best[2]


def trail(name, reverse=False):
    points = sample_path(next(r['d'] for r in ROUTES if r['id'] == name))
    return points[::-1] if reverse else points


def build_tour(pins):
    x0, y0, w, h = EXTENT
    nodes, links, edges = {}, {}, []
    def node(key, point, **props):
        nodes[key] = dict(x=round((point[0]-x0)/w*100,5), y=round((point[1]-y0)/h*100,5), **props)
        links.setdefault(key, [])
    stone_ids = {}
    for i, (name, x, y) in enumerate(STONES):
        key = 'stone:'+name
        node(key, (x,y), kind='stone', stoneIndex=i, title=name)
        stone_ids[name] = key
    fixed = {
        'entry':((1245,390),'东侧入口'), 'west':((497,700),'西侧岔路'),
        'plaza-west':((480,1019),'求是巢西侧'), 'plaza-east':((522,1015),'求是巢东侧'),
        'plaza':((480,1057),'求是巢'), 'south-fork':((488,1375),'南侧岔路'),
        'riverside':((744,1220),'滨水岔路'), 'north-exit':((500,215),'北侧出口'),
        'west-exit':((117,555),'西侧出口'), 'southwest-exit':((300,1400),'南侧步道西端'),
        'southeast-exit':((558,1407),'南侧步道东端')
    }
    for key,(point,title) in fixed.items(): node(key,point,kind='junction',title=title)
    nodes['plaza'].update(kind='place',poiId='F04')
    river = trail('riverside')
    at = min(range(len(river)), key=lambda i: math.dist(river[i], (744,1220)))
    south = min(range(at+1), key=lambda i: abs(river[i][1]-1510))
    north = min(range(at,len(river)), key=lambda i: math.dist(river[i], (1138,918)))
    node('river-south-exit',river[south],kind='junction',title='滨水步道南段')
    node('river-east-exit',river[north],kind='junction',title='滨水步道东段')
    fork = trail('south-fork')
    middle = min(range(len(fork)), key=lambda i: math.dist(fork[i], (488,1375)))
    def edge(key, start, end, points, names, places, label):
        stops = []
        for name in names:
            stone = next(s for s in STONES if s[0] == name)
            distance, _ = project(stone[1:],points)
            stops.append((distance,stone_ids[name]))
        for place in places:
            distance, point = project(pins[place],points)
            name = 'place:'+place
            node(name,point,kind='place',poiId=place)
            stops.append((distance,name))
        chain = [start] + [k for _,k in sorted(stops)] + [end]
        for a,b in zip(chain,chain[1:]): links[a].append(dict(to=b,label=label,edge=key))
        edges.append(dict(id=key,start=start,end=end,stops=chain,points=[[round(x,2),round(y,2)] for x,y in points]))
    edge('entry','entry','stone:樟树',trail('east-entrance',True),['杭州','西天目','建德','兰溪','金华','玉山','南昌'],['F01','F02','F03'],'进入园区')
    edge('ridge','stone:樟树','stone:衡阳',trail('north-ridge',True),['衡山','攸县','耒阳','茶陵','永丰'],['N02'],'北侧山脊 · 四库全书')
    edge('east','stone:樟树','stone:宜山',trail('east-traverse',True),['吉安','赣州','大庾','南雄','曲江','三水'],['N01'],'东侧园路 · 抢运校产')
    edge('north-spine','stone:衡阳','stone:宜山',trail('north-spine'),['桂林','荔浦'],[],'桂林、荔浦 · 中央路口')
    edge('north-gate','stone:衡阳','north-exit',trail('north-approach',True),[],[],'北侧出口')
    edge('cross','stone:宜山','west',trail('cross-link',True),[],['N03'],'西侧园路 · 费巩明灯')
    edge('south-story','stone:宜山','plaza-east',trail('south-story'),['青岩','贵阳','遵义'],['N04'],'南侧园路 · 手摇发电')
    edge('west-gate','west','west-exit',trail('west-approach',True),[],[],'西侧出口')
    edge('west-spine','west','plaza-west',trail('west-spine'),[],[],'求是巢 · 百鸟归林')
    edge('plaza-west','plaza-west','plaza',[(480,1019),(480,1057)],[],['N05'],'穿过求是巢广场')
    edge('plaza-east','plaza-east','plaza',[(522,1015),(530,1040),(480,1057)],[],[],'穿过求是巢广场')
    edge('plaza-exit','plaza','stone:湄潭',[(480,1057),(515,1080)]+trail('plaza-exit')[1:],[],[],'湄潭 · 南侧路口')
    edge('south-spine','stone:湄潭','south-fork',trail('south-spine'),['永兴'],[],'永兴 · 周年纪念雕塑')
    edge('pavilion','stone:湄潭','riverside',trail('pavilion-link'),[],['P01'],'纪念碑亭 · 滨水步道')
    edge('southwest','south-fork','southwest-exit',fork[:middle+1][::-1],[],['F05'],'周年纪念雕塑 · 步道西端')
    edge('southeast','south-fork','southeast-exit',fork[middle:],[],[],'南侧步道东端')
    edge('river-south','riverside','river-south-exit',river[south:at+1][::-1],[],[],'沿河向南')
    edge('river-east','riverside','river-east-exit',river[at:north+1],[],[],'沿河向东')
    return dict(start='stone:杭州',nodes=nodes,next=links,edges=edges)
