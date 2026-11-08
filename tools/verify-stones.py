"""Check rendered coordinates against independent reference junctions and roads."""
import json
import math
import unittest
from pathlib import Path
from atlas_layout import ROUTES, sample_path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT/'js/geometry.js').read_text(encoding='utf-8').split(' = ', 1)[1].rstrip(';\n'))
x0, y0, w, h = data['extent']
points = {s['n']: (x0+s['x']*w/100, y0+s['y']*h/100) for s in data['stones']}
trails = [sample_path(r['d']) for r in ROUTES if r['kind'] == 'trail']


def distance(p, a, b):
    dx, dy = b[0]-a[0], b[1]-a[1]
    t = max(0, min(1, ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
    return math.dist(p, (a[0]+t*dx, a[1]+t*dy))


def assert_on_trail(point):
    gap = min(distance(point, a, b) for ps in trails for a, b in zip(ps, ps[1:]))
    if gap > .1:
        raise ValueError(f'Stone is {gap:.1f}px from the trail centerline; place it along the rendered trail')


class StoneTests(unittest.TestCase):
    def test_all_28_stones_are_on_rendered_trails(self):
        self.assertEqual(len(points), 28)
        for name, point in points.items():
            with self.subTest(name=name):
                assert_on_trail(point)

    def test_four_reference_junctions(self):
        for name, expected in {'樟树': (1047,450), '衡阳': (610,410), '宜山': (650,710), '湄潭': (515,1130)}.items():
            self.assertLess(math.dist(points[name], expected), .01, name)

    def test_real_legacy_offroad_point_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'from the trail'):
            assert_on_trail((1179.9,478.8))

    def test_other_stones_have_even_spacing_along_each_section(self):
        # Along-road distances are independently recovered from the generated points.
        for names, route, reverse in [(['杭州','西天目','建德','兰溪','金华','玉山','南昌'],'east-entrance',True),
                                      (['吉安','赣州','大庾','南雄','西江','三水'],'east-traverse',True),
                                      (['衡山','攸县','泰和','崇陵','茶陵'],'north-ridge',False),
                                      (['青岩','贵阳','遵义'],'south-story',False)]:
            ps = sample_path(next(r['d'] for r in ROUTES if r['id'] == route))
            if reverse: ps.reverse()
            traveled = 0
            positions = []
            for a,b in zip(ps,ps[1:]):
                for name in names:
                    if distance(points[name],a,b) < .01:
                        positions.append((name,traveled+math.dist(a,points[name])))
                traveled += math.dist(a,b)
            ordered = [dict(positions)[n] for n in names]
            stops = [0] + ordered + [traveled]
            gaps = [b-a for a,b in zip(stops,stops[1:])]
            self.assertLess(max(gaps)-min(gaps), .05)


if __name__ == '__main__': unittest.main(verbosity=2)
