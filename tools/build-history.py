# -*- coding: utf-8 -*-
"""
生成五章的历史侧示意图（原创矢量插画 SVG）。

为什么是矢量而不是 AIGC：
- 站点的历史侧配图位支持 SVG / JPG 两种格式，先用原创矢量插画把 P0 填满，
  不留空框；后续如果配好图像模型渠道，把同名的 .jpg 放进 assets/history/ 并在
  assets/history/ 里删掉对应 .svg，前端会自动改用位图。
- 页面保留「历史示意图」标识，出处统一放在详情的「资料来源」，图下只描述画面。

用法：python build-history.py   → 写出 site/assets/history/N01..N05.svg
"""
from pathlib import Path

W, H = 1600, 1200
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "assets" / "history"
OUT.mkdir(parents=True, exist_ok=True)

PAPER = "#f2ecdd"
INK = "#3c4438"
INK_SOFT = "#5d6657"
GREEN_1 = "#cfd7c6"
GREEN_2 = "#b9c6b0"
GREEN_3 = "#a2b49a"
GOLD = "#b08246"
GOLD_L = "#d7b380"
WATER = "#dbe4de"
WATER_D = "#c2d0c8"
DARK = "#414a40"


def head(extra_defs=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}" role="img">\n'
        f'<defs>\n'
        f'<radialGradient id="vig" cx="50%" cy="45%" r="72%">'
        f'<stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>'
        f'<stop offset="100%" stop-color="#8a7f63" stop-opacity=".22"/></radialGradient>\n'
        f'<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="#f7f2e5"/><stop offset="1" stop-color="{PAPER}"/></linearGradient>\n'
        f'{extra_defs}'
        f'</defs>\n'
        f'<rect width="{W}" height="{H}" fill="url(#sky)"/>\n'
    )


def tail():
    return f'<rect width="{W}" height="{H}" fill="url(#vig)"/>\n</svg>\n'


def hills():
    return (
        f'<path d="M0 700 C 180 622 340 664 520 606 C 700 548 860 596 1040 548 '
        f'C 1220 500 1400 540 1600 502 L1600 780 L0 780 Z" fill="{GREEN_1}" opacity=".85"/>\n'
        f'<path d="M0 760 C 200 706 380 738 560 692 C 760 640 940 682 1140 634 '
        f'C 1320 592 1480 618 1600 590 L1600 820 L0 820 Z" fill="{GREEN_2}" opacity=".8"/>\n'
    )


def waves(y0, rows, color=WATER_D, op=".55"):
    out = []
    for i in range(rows):
        y = y0 + i * 46
        amp = 7 - i * 0.5
        out.append(
            f'<path d="M40 {y} C 200 {y-amp} 360 {y+amp} 520 {y} C 680 {y-amp} 840 {y+amp} 1000 {y} '
            f'C 1160 {y-amp} 1320 {y+amp} 1560 {y}" fill="none" stroke="{color}" '
            f'stroke-width="2" opacity="{op}"/>'
        )
    return "\n".join(out) + "\n"


def crate(x, y, w, h, fill="#a89b7d", stroke=INK_SOFT):
    """带十字捆扎线的木箱"""
    return (
        f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{fill}" '
        f'stroke="{stroke}" stroke-width="2.4"/>'
        f'<line x1="{x}" y1="{y+h*0.36}" x2="{x+w}" y2="{y+h*0.36}" stroke="{stroke}" stroke-width="1.4" opacity=".7"/>'
        f'<line x1="{x+w*0.22}" y1="{y}" x2="{x+w*0.22}" y2="{y+h}" stroke="{stroke}" stroke-width="1.2" opacity=".45"/>'
        f'<line x1="{x+w*0.78}" y1="{y}" x2="{x+w*0.78}" y2="{y+h}" stroke="{stroke}" stroke-width="1.2" opacity=".45"/>'
        f'</g>\n'
    )


def boat(cx, cy, s=1.0, shade=DARK):
    """乌篷船侧视轮廓：实心船体 + 明色篷顶 + 船头货箱"""
    return (
        f'<g transform="translate({cx},{cy}) scale({s})">'
        # 船体：上缘微拱，底部收成弧
        f'<path d="M -160,2 Q 0,-16 160,2 L 144,14 C 112,36 60,46 0,46 '
        f'C -60,46 -112,36 -144,14 Z" fill="{shade}"/>'
        # 篷
        f'<path d="M -62,4 C -54,-48 54,-48 62,4 Z" fill="#8d9483" stroke="{shade}" stroke-width="2.6"/>'
        f'<g stroke="{shade}" stroke-width="1.3" opacity=".45">'
        f'<line x1="-30" y1="-34" x2="-30" y2="3"/>'
        f'<line x1="0" y1="-40" x2="0" y2="3"/>'
        f'<line x1="30" y1="-34" x2="30" y2="3"/>'
        f'</g>'
        # 船头货箱
        f'<rect x="86" y="-18" width="34" height="24" rx="2" fill="#b3a687" stroke="{shade}" stroke-width="2"/>'
        f'<line x1="86" y1="-6" x2="120" y2="-6" stroke="{shade}" stroke-width="1.2" opacity=".55"/>'
        # 水影
        f'<path d="M -120,54 C -70,70 70,70 120,54" fill="none" stroke="{WATER_D}" '
        f'stroke-width="3" opacity=".55"/>'
        f'</g>\n'
    )


def snow(n=0):
    return ""


def tree(x, y, s=1.0, c="#8fa383"):
    """(x, y) 是树干落地点，树向上生长"""
    return (
        f'<g transform="translate({x},{y}) scale({s})">'
        f'<path d="M 0,0 L 0,-84" stroke="{INK_SOFT}" stroke-width="7" stroke-linecap="round"/>'
        f'<circle cx="0" cy="-116" r="58" fill="{c}"/>'
        f'<circle cx="-44" cy="-82" r="42" fill="{c}"/>'
        f'<circle cx="44" cy="-86" r="44" fill="{c}"/>'
        f'<circle cx="-16" cy="-64" r="36" fill="{c}"/>'
        f'</g>\n'
    )


# --------------------------------------------------------------- N01 启程
def scene_n01():
    L = [head()]
    L.append(hills())
    L.append(f'<rect x="0" y="742" width="{W}" height="{H-742}" fill="{WATER}"/>\n')
    L.append(waves(790, 8))
    # 左岸码头
    L.append(f'<path d="M0 742 L0 940 L 430 900 L 470 760 L 300 742 Z" fill="#d6cdb4" '
             f'stroke="{INK_SOFT}" stroke-width="2" opacity=".95"/>\n')
    L.append(f'<path d="M470 760 L 470 900 L 430 900" fill="none" stroke="{INK_SOFT}" stroke-width="2.4"/>\n')
    # 木箱堆
    L.append(crate(96, 742, 108, 88))
    L.append(crate(212, 754, 100, 82))
    L.append(crate(140, 654, 96, 82, fill="#b3a687"))
    # 船
    L.append(boat(640, 900, 1.0))
    L.append(boat(1000, 960, 1.15, shade="#4a5348"))
    L.append(boat(1330, 892, 0.9, shade="#535c50"))
    # 落雪
    import random
    rng = random.Random(37)
    L.append('<g fill="#ffffff" opacity=".55">\n')
    for _ in range(70):
        L.append(f'<circle cx="{rng.uniform(20,1580):.0f}" cy="{rng.uniform(120,900):.0f}" '
                 f'r="{rng.uniform(1.4,3.2):.1f}"/>')
    L.append('</g>\n')
    L.append(tail())
    return "".join(L)


# --------------------------------------------------------------- N02 守护
def scene_n02():
    L = [head()]
    # 远岭（圆缓）
    L.append(f'<path d="M0 690 C 170 566 300 528 450 566 C 590 602 688 646 800 620 '
             f'C 928 590 1014 524 1168 532 C 1328 540 1452 612 1600 592 '
             f'L1600 920 L0 920 Z" fill="{GREEN_1}" opacity=".92"/>\n')
    L.append(f'<path d="M0 800 C 196 700 348 668 508 700 C 646 728 726 772 836 754 '
             f'C 966 732 1082 676 1232 684 C 1382 692 1484 748 1600 734 '
             f'L1600 1040 L0 1040 Z" fill="{GREEN_2}" opacity=".92"/>\n')
    # 地面
    L.append(f'<rect x="0" y="930" width="{W}" height="{H-930}" fill="{GREEN_3}" opacity=".55"/>\n')
    L.append(f'<path d="M0 930 C 240 912 480 940 760 928 C 1060 916 1320 936 1600 922" '
             f'fill="none" stroke="{INK_SOFT}" stroke-width="2" opacity=".28"/>\n')
    # 洞窟
    L.append(f'<path d="M 690 962 L 690 852 Q 800 742 910 852 L 910 962 Z" fill="{DARK}"/>\n')
    L.append('<ellipse cx="800" cy="930" rx="130" ry="72" fill="%s" opacity=".22"/>\n' % GOLD_L)
    L.append(f'<path d="M 690 962 L 690 852 Q 800 742 910 852 L 910 962" fill="none" '
             f'stroke="{INK}" stroke-width="3" opacity=".8"/>\n')
    # 洞口的暖光外溢
    L.append(f'<path d="M 690 962 L 560 1090 L 1040 1090 L 910 962 Z" fill="{GOLD_L}" opacity=".13"/>\n')
    # 洞内书箱
    L.append(crate(716, 902, 64, 54, fill="#8b8367", stroke="#cfc6a8"))
    L.append(crate(792, 910, 58, 48, fill="#7d7660", stroke="#cfc6a8"))
    # 洞外堆叠的书箱
    L.append(crate(1006, 962, 112, 92, fill="#a89b7d"))
    L.append(crate(1130, 976, 100, 80, fill="#b3a687"))
    L.append(crate(1064, 874, 96, 78, fill="#9d9276"))
    L.append(crate(390, 980, 96, 78, fill="#ae9f80"))
    # 捆扎的线装书
    L.append(f'<g stroke="{INK_SOFT}" stroke-width="2">\n')
    for i in range(3):
        x = 176 + i * 78
        L.append(f'<rect x="{x}" y="1042" width="66" height="20" rx="3" fill="#c9bda0"/>')
        L.append(f'<line x1="{x+9}" y1="1042" x2="{x+9}" y2="1062"/>')
        L.append(f'<line x1="{x+57}" y1="1042" x2="{x+57}" y2="1062"/>')
    L.append(f'<rect x="196" y="1018" width="66" height="20" rx="3" fill="#d3c6a9"/>')
    L.append('</g>\n')
    # 上山小路
    L.append(f'<path d="M 150 1200 C 380 1108 610 1118 760 986" fill="none" stroke="{GOLD}" '
             f'stroke-width="4" stroke-dasharray="2 14" opacity=".5"/>\n')
    # 岭上的树
    for x, y, s in ((180, 828, .9), (300, 806, .7), (1280, 806, .85), (1420, 826, .95)):
        L.append(tree(x, y, s, "#93a888"))
    L.append(tail())
    return "".join(L)


# --------------------------------------------------------------- N03 灯火
def scene_n03():
    L = [head()]
    # 暗窗
    L.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#3f4a3f" opacity=".10"/>\n')
    # 窗棂
    L.append(f'<g stroke="{INK_SOFT}" stroke-width="3" opacity=".28" fill="none">\n')
    L.append('<rect x="150" y="120" width="300" height="360" rx="6"/>')
    L.append('<line x1="300" y1="120" x2="300" y2="480"/>')
    L.append('<line x1="150" y1="300" x2="450" y2="300"/>')
    L.append('</g>\n')
    # 光锥
    L.append(f'<path d="M 800 560 L 470 1060 L 1130 1060 Z" fill="{GOLD_L}" opacity=".16"/>\n')
    # 光晕
    for r, op in ((250, ".10"), (185, ".14"), (120, ".18")):
        L.append(f'<circle cx="800" cy="500" r="{r}" fill="{GOLD_L}" opacity="{op}"/>\n')
    # 桌面
    L.append(f'<rect x="0" y="1010" width="{W}" height="{H-1010}" fill="#c9bda0" opacity=".7"/>\n')
    L.append(f'<line x1="0" y1="1010" x2="{W}" y2="1010" stroke="{INK_SOFT}" stroke-width="3" opacity=".6"/>\n')
    # 摊开的书
    L.append(f'<g stroke="{INK_SOFT}" stroke-width="2.4" fill="#f6f1e2">\n')
    L.append('<path d="M 540 1010 C 640 986 730 992 800 1010 C 870 992 960 986 1060 1010 L 1054 1076 '
             'C 960 1054 870 1060 800 1078 C 730 1060 640 1054 546 1076 Z"/>')
    L.append('<line x1="800" y1="1012" x2="800" y2="1078"/>')
    L.append('</g>\n')
    L.append(f'<g stroke="{INK_SOFT}" stroke-width="1.4" opacity=".5">\n')
    for i in range(4):
        y = 1030 + i * 13
        L.append(f'<line x1="580" y1="{y}" x2="760" y2="{y-6}"/>')
        L.append(f'<line x1="840" y1="{y-6}" x2="1020" y2="{y}"/>')
    L.append('</g>\n')
    # 灯：铁皮香烟罐灯身
    L.append(f'<rect x="752" y="700" width="96" height="200" rx="14" fill="#9d9478" '
             f'stroke="{INK}" stroke-width="3"/>\n')
    L.append(f'<rect x="752" y="700" width="96" height="18" rx="9" fill="#8b8268" '
             f'stroke="{INK}" stroke-width="2.4"/>\n')
    # 罐身小孔
    L.append('<g fill="#f3d9a6">\n')
    for r in range(4):
        for c in range(3):
            L.append(f'<circle cx="{772 + c*28}" cy="{752 + r*34}" r="4.6"/>')
    L.append('</g>\n')
    # 玻璃罩
    L.append(f'<path d="M 764 700 L 776 470 L 824 470 L 836 700 Z" fill="#f7edcf" opacity=".55" '
             f'stroke="{INK_SOFT}" stroke-width="2.4"/>\n')
    # 火焰
    L.append(f'<path d="M 800 690 C 776 650 792 606 800 588 C 808 606 824 650 800 690 Z" fill="{GOLD}"/>\n')
    L.append(f'<path d="M 800 682 C 788 656 798 630 800 620 C 802 630 812 656 800 682 Z" fill="#f0c070"/>\n')
    L.append(tail())
    return "".join(L)


# --------------------------------------------------------------- N04 创造
def scene_n04():
    L = [head()]
    # 地面
    L.append(f'<rect x="0" y="960" width="{W}" height="{H-960}" fill="#cfc4a8" opacity=".55"/>\n')
    L.append(f'<line x1="0" y1="960" x2="{W}" y2="960" stroke="{INK_SOFT}" stroke-width="3" opacity=".5"/>\n')
    # 机身
    L.append(f'<rect x="470" y="700" width="420" height="260" rx="10" fill="#98a08c" '
             f'stroke="{INK}" stroke-width="3.4"/>\n')
    L.append(f'<rect x="486" y="686" width="388" height="20" rx="5" fill="#8a927e" '
             f'stroke="{INK}" stroke-width="2.4"/>\n')
    L.append(f'<rect x="856" y="650" width="26" height="60" rx="4" fill="#8a927e" '
             f'stroke="{INK}" stroke-width="2.4"/>\n')
    L.append(f'<rect x="500" y="736" width="150" height="88" rx="6" fill="#7e867a" stroke="{INK}" stroke-width="2"/>\n')
    L.append(f'<g stroke="{INK_SOFT}" stroke-width="2" opacity=".7">\n')
    for i in range(4):
        L.append(f'<line x1="512" y1="{754 + i*18}" x2="636" y2="{754 + i*18}"/>')
    L.append('</g>\n')
    # 飞轮
    L.append(f'<circle cx="740" cy="830" r="118" fill="none" stroke="{INK}" stroke-width="10"/>\n')
    L.append(f'<circle cx="740" cy="830" r="24" fill="{INK}"/>\n')
    L.append(f'<g stroke="{INK}" stroke-width="6">\n')
    for a in range(0, 360, 45):
        import math
        x = 740 + 112 * math.cos(math.radians(a))
        y = 830 + 112 * math.sin(math.radians(a))
        L.append(f'<line x1="740" y1="830" x2="{x:.1f}" y2="{y:.1f}"/>')
    L.append('</g>\n')
    # 皮带
    L.append(f'<path d="M 740 712 L 1020 776" stroke="{INK_SOFT}" stroke-width="9" fill="none"/>\n')
    L.append(f'<path d="M 740 948 L 1020 848" stroke="{INK_SOFT}" stroke-width="9" fill="none"/>\n')
    # 小皮带轮
    L.append(f'<circle cx="1020" cy="812" r="44" fill="#c3b795" stroke="{INK}" stroke-width="4"/>\n')
    L.append(f'<circle cx="1020" cy="812" r="12" fill="{INK}"/>\n')
    # 摇柄
    L.append(f'<path d="M 890 960 L 890 1030 L 968 1030" fill="none" stroke="{INK}" stroke-width="8"/>\n')
    L.append(f'<circle cx="968" cy="1030" r="17" fill="#c3b795" stroke="{INK}" stroke-width="4"/>\n')
    # 电缆到灯泡底座
    L.append(f'<path d="M 890 760 C 1010 730 1104 700 1192 622" fill="none" stroke="{INK_SOFT}" '
             f'stroke-width="4" stroke-linejoin="round"/>\n')
    # 灯泡
    L.append(f'<circle cx="1200" cy="520" r="50" fill="#fbeccc" stroke="{GOLD}" stroke-width="4"/>\n')
    L.append(f'<path d="M 1188 562 L 1188 584 L 1212 584 L 1212 562 Z" fill="#9a9280" '
             f'stroke="{INK}" stroke-width="2.4"/>\n')
    L.append(f'<rect x="1182" y="584" width="36" height="20" rx="4" fill="#9a9280" '
             f'stroke="{INK}" stroke-width="2.4"/>\n')
    L.append(f'<path d="M 1188 534 L 1196 548 L 1204 530 L 1212 544" fill="none" '
             f'stroke="{GOLD}" stroke-width="3" stroke-linejoin="round"/>\n')
    # 光芒：只留朝上的六道短线
    L.append(f'<g stroke="{GOLD}" stroke-width="3.2" opacity=".7" stroke-linecap="round">\n')
    import math as _m
    for a in (-180, -150, -120, -90, -60, -30, 0):
        rr1, rr2 = 62, 92
        x1 = 1200 + rr1 * _m.cos(_m.radians(a)); y1 = 520 + rr1 * _m.sin(_m.radians(a))
        x2 = 1200 + rr2 * _m.cos(_m.radians(a)); y2 = 520 + rr2 * _m.sin(_m.radians(a))
        L.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"/>')
    L.append('</g>\n')
    L.append(tail())
    return "".join(L)


# --------------------------------------------------------------- N05 归林
def scene_n05():
    L = [head()]
    # 远岭
    L.append(f'<path d="M0 640 C 200 534 372 508 528 548 C 668 584 758 626 878 604 '
             f'C 1006 580 1108 516 1258 524 C 1408 532 1522 592 1600 574 '
             f'L1600 812 L0 812 Z" fill="{GREEN_1}" opacity=".92"/>\n')
    # 近岭
    L.append(f'<path d="M0 726 C 216 660 408 692 604 640 C 800 588 968 626 1160 578 '
             f'C 1338 534 1498 566 1600 546 L1600 812 L0 812 Z" fill="{GREEN_2}" opacity=".9"/>\n')
    # 江面
    L.append(f'<rect x="0" y="792" width="{W}" height="{H-792}" fill="{WATER}"/>\n')
    L.append(waves(846, 7))
    # 岸线
    L.append(f'<path d="M0 792 C 240 764 420 788 620 766 C 820 744 1010 766 1210 744 '
             f'C 1390 724 1520 738 1600 726" fill="none" stroke="{GOLD}" stroke-width="4" '
             f'stroke-dasharray="2 14" opacity=".45"/>\n')
    # 岸上的树线
    for x, y, s in ((120, 784, 1.0), (262, 792, 0.78), (398, 782, 0.62),
                    (1244, 790, 0.8), (1372, 782, 1.05), (1520, 792, 0.68)):
        L.append(tree(x, y, s, "#93a888" if s > 0.8 else "#9cae90"))
    # 飞鸟
    L.append(f'<g stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round">\n')
    birds = [(560, 300, 1.0), (660, 250, .85), (760, 300, .7), (860, 236, .95),
             (960, 292, .7), (1060, 250, .85), (748, 176, .6), (880, 168, .55),
             (1000, 190, .65), (1180, 320, .75), (470, 366, .7), (1290, 262, .6)]
    for x, y, s in birds:
        w = 34 * s
        h = 20 * s
        L.append(f'<path d="M {x-w} {y} Q {x-w*0.45} {y-h} {x} {y-h*0.15} '
                 f'Q {x+w*0.45} {y-h} {x+w} {y}"/>')
    L.append('</g>\n')
    L.append(tail())
    return "".join(L)


# --------------------------------------------------- P01 序章 · 西迁路线示意
def scene_p01():
    """示意路线图：只表达先后顺序与大致方位，不按地理比例绘制。"""
    FONT = "Microsoft YaHei, PingFang SC, sans-serif"
    SERIF = "'Songti SC', 'Source Han Serif SC', 'SimSun', serif"
    pts = [
        ("杭州", 1330, 520, "1937.11 出发"),
        ("建德", 1128, 452, "1937.11"),
        ("吉安", 918, 700, "1938"),
        ("泰和", 762, 772, "1938"),
        ("宜山", 476, 812, "1939"),
        ("遵义", 292, 430, "1940"),
        ("湄潭", 486, 348, "1940—1946"),
    ]
    L = [head()]
    # 淡色地形暗示
    L.append(f'<path d="M120 900 C 420 780 700 860 980 760 C 1200 682 1400 720 1520 660 '
             f'L1520 1080 L120 1080 Z" fill="{GREEN_1}" opacity=".45"/>\n')
    L.append(f'<path d="M60 980 C 380 900 660 960 940 900 C 1180 848 1400 880 1540 840 '
             f'L1540 1140 L60 1140 Z" fill="{GREEN_2}" opacity=".35"/>\n')

    # 去程实线（先画，圆点后画压在线上）
    d = "M " + " L ".join(f"{x},{y}" for _, x, y, _ in pts)
    L.append(f'<path d="{d}" fill="none" stroke="{GOLD}" stroke-width="7" '
             f'stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 16"/>\n')
    # 复员回杭（从湄潭绕上方回到杭州）
    L.append(f'<path d="M 486,348 C 780,170 1180,196 1330,470" fill="none" stroke="{GREEN_3}" '
             f'stroke-width="6" stroke-dasharray="14 12" opacity=".85"/>\n')
    L.append(f'<path d="M 1298,448 L 1334,474 L 1296,494" fill="none" stroke="{GREEN_3}" '
             f'stroke-width="6" opacity=".85"/>\n')
    L.append(f'<text x="900" y="164" font-family="{FONT}" font-size="26" fill="#6f8266" '
             f'text-anchor="middle" letter-spacing="2">1946 复员回杭州</text>\n')

    # 节点
    for name, x, y, label in pts:
        L.append(f'<circle cx="{x}" cy="{y}" r="18" fill="{PAPER}" stroke="{GOLD}" stroke-width="5"/>\n')
        L.append(f'<circle cx="{x}" cy="{y}" r="6" fill="{GOLD}"/>\n')
        L.append(f'<text x="{x}" y="{y-38}" font-family="{SERIF}" font-size="56" font-weight="700" '
                 f'fill="{INK}" text-anchor="middle" letter-spacing="3">{name}</text>\n')
        L.append(f'<text x="{x}" y="{y+62}" font-family="{FONT}" font-size="28" fill="{GOLD}" '
                 f'text-anchor="middle" letter-spacing="1">{label}</text>\n')

    # 标题与说明
    L.append(f'<text x="110" y="130" font-family="{SERIF}" font-size="58" font-weight="700" '
             f'fill="{INK}" letter-spacing="6">文军长征</text>\n')
    L.append(f'<text x="112" y="182" font-family="{FONT}" font-size="28" fill="{INK_SOFT}" '
             f'letter-spacing="2">浙江大学 1937—1946 年西迁路线示意</text>\n')
    L.append(tail())
    return "".join(L)


SCENES = {"P01": scene_p01, "N01": scene_n01, "N02": scene_n02, "N03": scene_n03,
          "N04": scene_n04, "N05": scene_n05}

if __name__ == "__main__":
    for k, fn in SCENES.items():
        p = OUT / f"{k}.svg"
        p.write_text(fn(), encoding="utf-8")
        print("wrote", p.name, p.stat().st_size, "bytes")
