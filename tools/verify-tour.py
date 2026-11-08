import json
import math
import unittest
from pathlib import Path
from atlas_layout import EXTENT, ROUTES, PLAZA, sample_path, in_polygon

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT/'js/geometry.js').read_text(encoding='utf-8').split(' = ',1)[1].rstrip(';\n'))
tour = data['tour']


MAIN_STONES = ['杭州','西天目','建德','兰溪','金华','玉山','南昌','樟树','吉安','赣州','大庾','南雄','曲江','三水','宜山','青岩','贵阳','遵义','湄潭']


def assert_mainline(stops):
    ids=[s['id'] for s in stops]
    if 'place:N03' not in ids:
        raise ValueError('费巩明灯必须纳入主线')
    if not ids.index('stone:宜山') < ids.index('place:N03') < ids.index('stone:青岩'):
        raise ValueError('费巩明灯应在宜山之后、青岩之前')
    names=[s['title'] for s in stops if s['kind']=='stone']
    if names != MAIN_STONES:
        raise ValueError('下一站只走西迁之路主线，不插入分支')
    if len(ids)!=len(set(ids)):
        raise ValueError('主线不可重复停靠绕圈')


class TourTests(unittest.TestCase):
    def test_mainline_stones_and_lamp_in_order(self):
        assert_mainline(tour['stops'])

    def test_start_end_and_no_repeated_stops(self):
        stops=tour['stops']
        self.assertEqual(stops[0]['id'],'stone:杭州')
        self.assertEqual(stops[-1]['id'],'stone:湄潭')
        self.assertEqual(len(stops),26)
        self.assertEqual(len({s['id'] for s in stops}),len(stops))

    def test_mainline_also_stops_at_its_landmarks(self):
        self.assertEqual({s['poiId'] for s in tour['stops'] if s['kind']=='place'}, {'F01','F02','F03','N01','N03','N04','F04'})

    def test_stops_are_on_a_path_or_inside_the_paved_plaza(self):
        x0,y0,w,h=EXTENT
        segments=[(a,b) for r in ROUTES if r['kind']=='trail' for a,b in zip(sample_path(r['d']),sample_path(r['d'])[1:])]
        def distance(p,a,b):
            dx,dy=b[0]-a[0],b[1]-a[1]
            t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
            return math.dist(p,(a[0]+t*dx,a[1]+t*dy))
        for node in tour['stops']:
            name=node['id']
            p=(x0+node['x']*w/100,y0+node['y']*h/100)
            self.assertTrue(in_polygon(p,PLAZA) or min(distance(p,a,b) for a,b in segments)<.1,name)

    def test_lamp_omitted_from_mainline_is_rejected(self):
        with self.assertRaisesRegex(ValueError,'明灯'):
            assert_mainline([s for s in tour['stops'] if s['id']!='place:N03'])


if __name__=='__main__': unittest.main(verbosity=2)
