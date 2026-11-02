# 山中有路 · 北山西迁文化地图

静态互动地图，无构建步骤、无运行时第三方依赖。

在线展示：https://aspilin0.github.io/shanzhongyoulu-map/  
源码仓库：https://github.com/Aspilin0/shanzhongyoulu-map

## 打开

双击 `index.html`，或在本目录运行：

```powershell
node tools/serve.mjs 8812
```

浏览器打开 http://127.0.0.1:8812/ 。首次访问展示序章；点击「进入地图」后在本机记忆，刷新和后续访问直接进入地图。章节深链会在序章结束后继续打开原章节。

## 2026-11-02 更新

- 使用 `../更新需求/更高清的地图/` 的两张新图和总览重描路网，连续三次曲线替代折线加圆角。
- 地图色块、植被与建筑体块参考 https://yun.chinasinew.com/mob/html/schoolmap.html 的新版手绘校园图。
- 删除重复标题、口号、侧栏年份、英文眉标、底部清单与说明性小字。主画面只保留景点、图层、缩放、探索状态。
- 序章只在首次进入时显示；常驻导航保留地图、时间轴、终章。资料说明位于页脚。
- 保留五章、六座雕塑、现代实拍与历史示意图；来源放在卡片可展开区域。
- 全站使用 12 / 14 / 20 / 32px 四级字号。
- 全部树木按完整树冠、树干、描边和阴影避让道路外沿至少 24 个参考图像素。

## 修改入口

| 文件 | 内容 |
| --- | --- |
| `tools/atlas_layout.py` | 唯一的道路、广场、植被区域、河岸与树冠净空模型 |
| `tools/build-atlas.py` | 地标配准、树木和建筑绘制；生成底图和交互坐标 |
| `assets/map/beishan-map.svg`、`js/geometry.js` | 生成结果，不要手改 |
| `js/app.js` | 首次访问、路由、图层、缩放、故事卡片、本地进度 |
| `js/data.js` | 原有历史内容、图像说明与来源 |
| `css/atlas.css` | 本次地图与界面样式 |
| `DESIGN.md` | 用户确认过的设计约定 |

新参考平面以 `屏幕截图 2026-11-02 125908.png` 为基准；南图平移 `(-330,+530)` 对齐后补充南端，总览用于核对拓扑。新图直接标明了求是巢与碑亭；其余景观点位由旧手写标注配准转绘，仍待实地校正。石刻名称与点位对应未最终核实。

## 生成与检查

本机 `python` 别名无法执行，可使用已有的 Anaconda Python：

```powershell
D:/Anaconda/python.exe tools/build-map.py
D:/Anaconda/python.exe tools/verify-map.py
node --check js/app.js
node --check js/data.js
node --check js/geometry.js
```

字号验收使用真实浏览器的可见 DOM 记录：

```powershell
node tools/audit-small-text.mjs --report ../tmp/qa/nov02/font-audit.json
```

该模式只检查记录，不另启浏览器。实际浏览器截图、首次访问与深链验证、原图叠线、字号与树冠反例，保存于 `../tmp/qa/nov02/`。

地图仍为导览示意；历史画面为原创示意图，继续保留原有来源标注。

