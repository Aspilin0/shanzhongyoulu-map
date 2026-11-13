# 2026-11-13 页头与终章验收

改动：共用页头将“西迁文化园”固定在“山中有路”下方；地图标题使用“北山 · 校友林”。终章保留“山中有路，山外，也有”一句，错落两行，按钮置于下方。自行绘制山线、园路、书本与灯，作为无文字、无动画、不会拦截点击的背景插画。

对照：[改前桌面](before-desktop.png)、[改前手机](before-mobile.png)；[改后桌面](after-desktop.png)、[改后手机](after-mobile.png)。

## 检查结果

- 实际浏览器（CUA / Playwright）：1440 × 1000 与 390 × 844 检查终章；地图、资料页与终章页头可见，副标题位于标题下方，页面无横向溢出。真实视口内容截图裁去浏览器滚动条。
- 终章的自由探索、重新游览主线、资料来源均已点击。资料页滚动到底部后共用页头仍可见，返回地图栏紧接其下，不重叠。
- 手机从杭州连续点击 26 站到湄潭，包含费巩明灯，自动进入新版终章；每一步检查下一站按钮在视口内。具体站名见 browser-checks.json，终点截图见 arrival-mobile.png。
- 浏览器 error 日志为空。装饰 SVG 正常加载，空 alt / aria-hidden 不进入阅读顺序。
- 字号：node tools/audit-small-text.mjs --report qa/2026-11-13/ending/font-audit.json → 5 组通过，失败 0；仅 12 / 14 / 20 / 32px。
- 几何：verify-map.py 6、verify-stones.py 4、verify-tour.py 5 → 合计 15 项通过，失败 0。
- 内容：node tools/verify-content.cjs → 28 个石刻介绍、11 个景观通过；node --check js/app.js 与 git diff --check 通过。

这次没有改地图几何或史料。未重跑全部旧版浏览器脚本，使用 CUA 完成本次受影响的布局与真实导航流程；未验证真机触摸。
