"""Check the generated map, including the formerly unsafe roadside tree."""
from pathlib import Path
import math
import unittest
import xml.etree.ElementTree as ET
from atlas_layout import ROUTES, SAMPLED, TREE_GAP, tree_bounds, assert_layout, sample_path, in_polygon

ROOT=Path(__file__).resolve().parents[1]
SVG=ET.parse(ROOT/'assets/map/beishan-map.svg').getroot()

def distance(p,a,b):
    dx,dy=b[0]-a[0],b[1]-a[1]
    t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
    return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)

class MapLayoutTests(unittest.TestCase):
    def test_rendered_trees_leave_full_road_clearance(self):
        trees=[tuple(map(float,n.attrib['data-position'].split(','))) for n in SVG.iter() if n.get('class')=='map-tree']
        self.assertGreater(len(trees),0,'Map has no trees to inspect')
        assert_layout(trees)

    def test_legacy_roadside_tree_is_rejected(self):
        # Historical roadside candidate, retained as a known unsafe input.
        # The independent test below covers crown-only intrusions.
        old_tree=(1168,170,.59,0)
        with self.assertRaisesRegex(ValueError,'road-east'):
            assert_layout([old_tree])

    def test_crown_clearance_is_not_just_trunk_clearance(self):
        candidate=(1137,170,.87,0)
        r,pts=next((r,p) for r,p in SAMPLED if r['id']=='road-east')
        trunk_distance=min(distance(candidate[:2],a,b) for a,b in zip(pts,pts[1:]))
        self.assertGreater(trunk_distance,r['width']/2+TREE_GAP)
        with self.assertRaisesRegex(ValueError,'road-east'):
            assert_layout([candidate])

    def test_qiushichao_is_inside_a_paved_plaza(self):
        plaza=next(n for n in SVG.iter() if n.get('id')=='qiusichao-plaza')
        points=sample_path(plaza.get('d').replace(' Z',''))
        self.assertTrue(in_polygon((480,1057),points),'Reference wood structure must sit inside the paved plaza')

    def test_reference_junctions_are_connected(self):
        # Independently read from the supplied reference, not chapter order.
        for point,count in [((650,710),4),((515,1130),3),((744,1220),2)]:
            with self.subTest(junction=point):
                nearby=[r['id'] for r,ps in SAMPLED if r['kind']=='trail' and
                    min(distance(point,a,b) for a,b in zip(ps,ps[1:]))<=4]
                self.assertGreaterEqual(len(nearby),count,'Reference path junction is disconnected: '+str(nearby))

    def test_road_network_used_for_rendering_matches_the_guard(self):
        rendered={n.get('data-route-id'):n.get('d') for n in SVG.iter() if n.get('class')=='map-route'}
        self.assertEqual(rendered,{r['id']:r['d'] for r in ROUTES},'Regenerate the SVG with tools/build-map.py; do not edit road paths by hand')

if __name__=='__main__':unittest.main(verbosity=2)
