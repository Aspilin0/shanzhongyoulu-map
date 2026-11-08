"""Stone order and junctions from the annotated map; other sites evenly spaced.

Distances follow the rendered trail centerline, never straight-line interpolation.
"""
import math
from atlas_layout import ROUTES, sample_path, NORTH, EAST, CENTER, SOUTH


def point_at(points, fraction):
    lengths = [math.dist(a, b) for a, b in zip(points, points[1:])]
    target = sum(lengths) * fraction
    for a, b, length in zip(points, points[1:], lengths):
        if target <= length:
            t = target / length if length else 0
            return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
        target -= length
    return points[-1]


def distribute(names, route_id, reverse=False):
    route = next(r for r in ROUTES if r['id'] == route_id)
    points = sample_path(route['d'])
    if reverse:
        points.reverse()
    return [(name, *point_at(points, (i + 1) / (len(names) + 1))) for i, name in enumerate(names)]


STONES = (
    distribute(['杭州', '西天目', '建德', '兰溪', '金华', '玉山', '南昌'], 'east-entrance', True)
    + [('樟树', *EAST)]
    + distribute(['吉安', '赣州', '大庾', '南雄', '西江', '三水'], 'east-traverse', True)
    + distribute(['荔浦', '桂林'], 'north-spine', True)
    + [('衡阳', *NORTH)]
    + distribute(['衡山', '攸县', '泰和', '崇陵', '茶陵'], 'north-ridge')
    + [('宜山', *CENTER)]
    + distribute(['青岩', '贵阳', '遵义'], 'south-story')
    + [('湄潭', *SOUTH)]
    + distribute(['永兴'], 'south-spine')
)
