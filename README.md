# 山中有路 · 北山西迁文化地图

静态互动地图，无构建步骤、无运行时第三方依赖。

[在线展示](https://aspilin0.github.io/shanzhongyoulu-map/) · [源码仓库](https://github.com/Aspilin0/shanzhongyoulu-map)

## 打开与游览

在本目录运行 `node tools/serve.mjs 8813`，打开 [本地预览](http://127.0.0.1:8813/)。也可直接打开 `index.html`。
首次访问展示序章，确认后本机记忆；章节深链保留。

- 全园地图保留景点，裁掉外围建筑；全图与缩放入口保留。
- 固定杭州起点，用下一站连续走主线，经樟树、宜山、湄潭至湄潭；费巩明灯在宜山之后自动停靠。
- 抵达湄潭后自动展示终章；返回上一站会取消待展示终章，终章后可重新游览，或进入自由探索；自由探索隐藏主线导航与当前位置，可自由点看全部内容。
- 分岔不参与下一站流程，支路内容仍可在地图上自由点看。
- 不再分景点/故事/雕塑/石刻四类，同一景观只保留一个地图入口。
- 桌面悬停、键盘聚焦显示景点名和事件；手机点击显示简介，再进入详情。
- 时间轴收在页脚资料页中，原 `#/timeline` 链接仍会打开它。
- 保留五章、六座雕塑、实拍和历史示意图；灯火与百鸟归林使用 2026-11-08 指定照片。

## 修改入口

| 文件 | 内容 |
| --- | --- |
| `tools/atlas_layout.py` | 唯一道路、广场、园区范围与树冠净空模型 |
| `tools/stone_layout.py` | 石刻顺序、四处固定交叉口与沿路均布 |
| `tools/build-atlas.py` | 景观配准、底图生成与交互坐标 |
| `js/geometry.js`、`assets/map/` | 生成结果，不手改 |
| `js/app.js` | 首次访问、路由、图层、缩放、故事卡片、探索记录 |
| `js/journey.js` | 石刻导览状态与终章时机 |
| `js/poi-content.js`、`js/preview.js` | 共用简介资料与悬停/触控交互 |
| `js/data.js`、`js/sculptures.js`、`js/timeline-data.js`、`js/data-sources.js` | 原有历史内容与出处 |
| `js/stone-content.js`、`js/place-content.js`、`js/content-sources.js` | 逐地点介绍、史实/地理背景类别和核对来源 |
| `tools/tour_layout.py` | 主线停靠顺序与景点沿路投影 |
| `DESIGN.md` | 设计规则与用户确认过的修正 |

## 生成与验证

```powershell
D:/Anaconda/python.exe tools/build-map.py
node tools/verify-all.cjs
```

浏览器与 Python 环境、逐项命令、证据目录及提交大小钩子说明见 [验收文档](docs/qa.md)。
每个新检出目录执行 `git config core.hooksPath .githooks` 启用提交检查。

参考平面为 `屏幕截图 2026-11-02 125908.png`；南图平移 `(-330,+530)` 补齐南端。
樟树、衡阳、宜山、湄潭按标注图置于交叉口，其余石刻沿路均匀示意，非精确实测坐标。
历史画面为依据史料绘制的原创示意图，来源保留在卡片中。

逐地点内容核对和原图地名纠正见 [介绍资料审核](docs/content-audit.md)。地理背景不等于学校在该地办学的证据。
