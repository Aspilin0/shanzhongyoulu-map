"""Main itinerary sampled from real park trails; branches are free exploration."""
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
    """One main walking itinerary; branch markers stay available on the map."""
    x0, y0, w, h = EXTENT
    stones = {name: (i, (x, y)) for i, (name, x, y) in enumerate(STONES)}
    stops = []

    def section(points, names=(), places=()):
        ordered = []
        for name in names:
            index, point = stones[name]
            distance, _ = project(point, points)
            ordered.append((distance, 'stone:'+name, point, dict(kind='stone', stoneIndex=index, title=name)))
        for place in places:
            distance, point = project(pins[place], points)
            ordered.append((distance, 'place:'+place, point, dict(kind='place', poiId=place)))
        for _, key, point, props in sorted(ordered):
            stops.append(dict(id=key, x=round((point[0]-x0)/w*100,5), y=round((point[1]-y0)/h*100,5), **props))

    section(trail('east-entrance', True),
            ['杭州','西天目','建德','兰溪','金华','玉山','南昌','樟树'], ['F01','F02','F03'])
    section(trail('east-traverse', True),
            ['吉安','赣州','大庾','南雄','曲江','三水','宜山'], ['N01'])
    # The lamp is encountered at the central junction on the main southbound path.
    section(trail('south-story'), ['青岩','贵阳','遵义'], ['N03','N04'])
    section([(522,1015),(530,1040),(480,1057)], places=['F04'])
    section([(480,1057),(515,1080)]+trail('plaza-exit')[1:], ['湄潭'])
    start = next(i for i, stop in enumerate(stops) if stop['id']=='stone:杭州')
    return dict(stops=stops[start:])
