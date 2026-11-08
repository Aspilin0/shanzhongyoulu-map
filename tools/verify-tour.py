import json
import math
import unittest
from pathlib import Path
from atlas_layout import EXTENT, ROUTES, PLAZA, sample_path, in_polygon

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT/'js/geometry.js').read_text(encoding='utf-8').split(' = ',1)[1].rstrip(';\n'))
tour = data['tour']


def paths(graph, node, seen=()):
    if node in seen: raise ValueError('Route loops back to an earlier stop: '+node)
    children = graph[node]
    if not children: return [seen+(node,)]
    return [p for edge in children for p in paths(graph,edge['to'],seen+(node,))]


class TourTests(unittest.TestCase):
    def test_every_branch_finishes_without_repeating_a_stop(self):
        routes = paths(tour['next'],tour['start'])
        self.assertGreater(len(routes),6)
        for route in routes:
            self.assertEqual(len(route),len(set(route)))
            self.assertLess(len(route),60)

    def test_all_stones_and_all_eleven_landmarks_can_be_reached(self):
        reachable = set(n for path in paths(tour['next'],tour['start']) for n in path)
        self.assertEqual({tour['nodes'][n]['poiId'] for n in reachable if tour['nodes'][n].get('poiId')}, {'N01','N02','N03','N04','N05','F01','F02','F03','F04','F05','P01'})
        self.assertEqual(len([n for n in reachable if tour['nodes'][n]['kind']=='stone']),28)

    def test_real_junctions_offer_forward_branch_choices(self):
        for node, expected in {'stone:樟树':{'ridge','east'},'stone:宜山':{'cross','south-story'},'stone:湄潭':{'south-spine','pavilion'}}.items():
            self.assertEqual({e['edge'] for e in tour['next'][node]},expected)

    def test_stops_are_on_a_path_or_inside_the_paved_plaza(self):
        x0,y0,w,h=EXTENT
        segments=[(a,b) for r in ROUTES if r['kind']=='trail' for a,b in zip(sample_path(r['d']),sample_path(r['d'])[1:])]
        def distance(p,a,b):
            dx,dy=b[0]-a[0],b[1]-a[1]
            t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
            return math.dist(p,(a[0]+t*dx,a[1]+t*dy))
        for name,node in tour['nodes'].items():
            p=(x0+node['x']*w/100,y0+node['y']*h/100)
            self.assertTrue(in_polygon(p,PLAZA) or min(distance(p,a,b) for a,b in segments)<.1,name)

    def test_a_forced_return_to_zhangshu_is_rejected(self):
        graph={k:list(v) for k,v in tour['next'].items()}
        graph['stone:衡阳'].append({'to':'stone:樟树'})
        with self.assertRaisesRegex(ValueError,'loops back'): paths(graph,tour['start'])


if __name__=='__main__': unittest.main(verbosity=2)
