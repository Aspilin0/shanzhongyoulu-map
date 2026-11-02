"""Park geometry traced from the clearer 2026-11-02 screenshots.

Reference plane is the 1789 x 1396 northern screenshot, extended south using
the second screenshot: x_north = x_south - 330, y_north = y_south + 530.
The overview confirms the junction topology. Curves are long cubic segments,
not polylines with rounded corners. Renderer and planting share this geometry.
"""
import math
import re

REFERENCE_SIZE = (1789, 1600)
EXTENT = (-120, 60, 1870, 1540)
TREE_GAP = 24
PLAZA = [(428,1023),(530,1014),(538,1074),(498,1083),(498,1098),(433,1104)]
NORTH=(610,410)
WEST=(497,700)
CENTER=(650,710)
EAST=(1047,450)
PLAZA_WEST=(480,1019)
PLAZA_EAST=(522,1015)
SOUTH=(515,1130)
RIVERSIDE=(744,1220)

def line(points):
    return 'M '+' L '.join(f'{x},{y}' for x,y in points)

# Forest outline follows the OSM screenshot, including its narrowing southern tip.
FOREST = [(90,390),(113,320),(180,269),(270,245),(330,229),(384,244),
    (476,231),(530,197),(582,182),(665,198),(742,170),(795,134),
    (851,132),(915,129),(976,112),(1018,61),(1125,61),(1155,270),
    (1180,460),(1190,630),(1125,630),(1020,655),(934,723),(850,810),
    (774,930),(727,1020),(674,1150),(622,1270),(576,1420),(568,1545),
    (354,1545),(205,1420),(166,1240),(144,1085),(155,1000),(210,921),
    (252,803),(199,728),(153,678),(114,599)]
SHORE=[(1600,845),(1750,685),(1910,640),(1910,1110),(1390,1110),(1380,1058)]
WATER_EXCLUSION=SHORE
WATER_PATH=line(SHORE)+' Z'
STREAM='M700 1740 C725 1510 815 1335 950 1240 C1090 1105 1190 1100 1330 1040 C1470 970 1650 900 1910 750'

ROUTES=[
    dict(id='road-west',kind='road',width=42,d='M-95 -100 C-60 300 0 800 70 1200 C95 1380 120 1520 140 1660'),
    dict(id='road-east',kind='road',width=42,d='M1170 -100 C1200 170 1240 390 1280 670 C1305 890 1320 1036 1375 1120'),
    dict(id='road-library',kind='road',width=42,d='M900 1740 C970 1475 1117 1255 1375 1120 C1537 1102 1700 1140 1920 1210'),
    dict(id='riverside',kind='trail',width=19,d='M620 1660 C638 1445 678 1313 744 1220 C855 1065 958 968 1138 918 C1213 860 1273 838 1310 835 C1450 792 1580 725 1730 640'),
    dict(id='west-approach',kind='trail',width=16,d='M117 555 C173 525 214 518 250 544 C286 570 308 603 348 606 C406 607 444 594 470 657 C482 677 489 693 497 700'),
    dict(id='west-spine',kind='trail',width=16,d='M497 700 C461 748 469 781 485 824 C500 872 495 895 499 932 C506 960 494 988 480 1019'),
    dict(id='north-approach',kind='trail',width=16,d='M500 215 C524 250 549 325 570 355 C588 385 603 390 610 410'),
    dict(id='north-ridge',kind='trail',width=16,d='M610 410 C675 403 715 380 760 393 C812 408 832 416 869 413 C924 414 959 403 992 432 C1012 446 1030 449 1047 450'),
    dict(id='north-spine',kind='trail',width=16,d='M610 410 C574 447 603 492 630 536 C647 566 667 597 657 625 C651 655 647 681 650 710'),
    dict(id='cross-link',kind='trail',width=16,d='M497 700 C548 678 586 690 650 710'),
    dict(id='east-traverse',kind='trail',width=16,d='M650 710 C697 686 692 636 733 594 C751 559 775 559 805 568 C858 580 912 571 941 560 C976 546 984 504 1008 481 C1021 470 1032 458 1047 450'),
    dict(id='east-entrance',kind='trail',width=16,d='M1047 450 C1112 437 1139 432 1165 423 C1196 416 1216 403 1245 390'),
    dict(id='south-story',kind='trail',width=16,d='M650 710 C646 770 650 828 614 872 C574 922 543 937 530 985 C526 998 525 1006 522 1015'),
    dict(id='plaza-exit',kind='trail',width=16,d='M515 1080 C510 1098 511 1117 515 1130'),
    dict(id='south-spine',kind='trail',width=16,d='M515 1130 C479 1169 490 1205 482 1239 C477 1284 484 1339 488 1375'),
    dict(id='pavilion-link',kind='trail',width=16,d='M515 1130 C532 1163 558 1189 580 1205 C606 1207 615 1217 647 1223 C677 1237 709 1216 744 1220'),
    dict(id='south-fork',kind='trail',width=16,d='M300 1400 C364 1385 396 1368 432 1376 C453 1372 482 1367 488 1375 C508 1392 530 1400 558 1407'),
]

def sample_path(d):
    """Sample the actual rendered M/L/C/Q path, with <= 3 px curve steps."""
    tokens=re.findall(r'[MLCQ]|-?\d+(?:\.\d+)?',d)
    points=[];i=0;command=None
    while i<len(tokens):
        if tokens[i] in ('M','L','C','Q'):command=tokens[i];i+=1
        if command in ('M','L'):
            points.append((float(tokens[i]),float(tokens[i+1])));i+=2
            command='L'
        elif command=='C':
            a=points[-1];b=tuple(map(float,tokens[i:i+2]));c=tuple(map(float,tokens[i+2:i+4]));e=tuple(map(float,tokens[i+4:i+6]));i+=6
            n=math.ceil((math.dist(a,b)+math.dist(b,c)+math.dist(c,e))/3)
            for k in range(1,n+1):
                t=k/n;u=1-t
                points.append((u**3*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t**3*e[0],
                               u**3*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t**3*e[1]))
        elif command=='Q':
            a=points[-1];b=tuple(map(float,tokens[i:i+2]));e=tuple(map(float,tokens[i+2:i+4]));i+=4
            n=max(1,math.ceil((math.dist(a,b)+math.dist(b,e))/3))
            for k in range(1,n+1):
                t=k/n;u=1-t
                points.append((u*u*a[0]+2*u*t*b[0]+t*t*e[0],u*u*a[1]+2*u*t*b[1]+t*t*e[1]))
        else:raise ValueError('Unsupported road command: '+str(command))
    return points

def segment_hits_box(a,b,box):
    xmin,ymin,xmax,ymax=box
    lo,hi=0.,1.
    for origin,delta,mn,mx in [(a[0],b[0]-a[0],xmin,xmax),(a[1],b[1]-a[1],ymin,ymax)]:
        if abs(delta)<1e-12:
            if origin<mn or origin>mx:return False
        else:
            x,y=(mn-origin)/delta,(mx-origin)/delta
            lo=max(lo,min(x,y));hi=min(hi,max(x,y))
            if lo>hi:return False
    return True

SAMPLED = [(r,sample_path(r['d'])) for r in ROUTES]

def tree_bounds(tree):
    x,y,s,_=tree
    # This conservative envelope encloses every Bezier control point and shadow.
    return (x-26*s,y-65*s,x+27*s,y+11*s)

def in_polygon(p,polygon):
    x,y=p;inside=False
    for (ax,ay),(bx,by) in zip(polygon,polygon[1:]+polygon[:1]):
        if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:inside=not inside
    return inside

def conflicts(tree,gap=TREE_GAP):
    xmin,ymin,xmax,ymax=tree_bounds(tree)
    hit=[]
    for route,points in SAMPLED:
        pad=route['width']/2+gap+0.5  # sampling / rounding allowance
        box=(xmin-pad,ymin-pad,xmax+pad,ymax+pad)
        if any(segment_hits_box(a,b,box) for a,b in zip(points,points[1:])):hit.append(route['id'])
    # Using the entire plaza bounding box is conservative and excludes its corners too.
    px0=min(p[0] for p in PLAZA);py0=min(p[1] for p in PLAZA)
    px1=max(p[0] for p in PLAZA);py1=max(p[1] for p in PLAZA)
    if not (xmax+gap<px0 or xmin-gap>px1 or ymax+gap<py0 or ymin-gap>py1):hit.append('qiusichao-plaza')
    water_box=(xmin-gap,ymin-gap,xmax+gap,ymax+gap)
    if any(in_polygon(p,WATER_EXCLUSION) for p in [(xmin,ymin),(xmin,ymax),(xmax,ymin),(xmax,ymax)]) or any(segment_hits_box(a,b,water_box) for a,b in zip(SHORE,SHORE[1:])):hit.append('water-shore')
    stream_box=(xmin-gap-18,ymin-gap-18,xmax+gap+18,ymax+gap+18)
    stream=sample_path(STREAM)
    if any(segment_hits_box(a,b,stream_box) for a,b in zip(stream,stream[1:])):hit.append('stream')
    return hit

def assert_layout(trees):
    for i,t in enumerate(trees):
        hit=conflicts(t)
        if hit:raise ValueError(f'Tree {i} at {t[:2]} is too close to {", ".join(hit)}. Move the whole crown at least {TREE_GAP}px away from the road edge.')
