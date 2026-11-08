# 地图维护与验收

静态校园文化地图；历史内容见 `js/data.js`，设计约定只放 `DESIGN.md`，运行与验证入口见 `README.md` 和 `docs/qa.md`。

道路以 `../更新需求/更高清的地图/` 中 2026-11-02 两张清晰截图与 2026-11-01 总览为准。
旧现场手写标注只用于景观与四处石刻交叉口，不覆盖新路网；不按故事编号补连线。
道路不明时先放大原图核对分叉、广场与接入口。新增道路沿真实中心线作连续三次曲线。

## 唯一修改入口

- 道路、广场、园区范围、避树模型：`tools/atlas_layout.py`。
- 景观配准与底图绘制：`tools/build-atlas.py`。
- 石刻顺序与道路弧长均布：`tools/stone_layout.py`；樟树、衡阳、宜山、湄潭固定在参考交叉口。
- 简介读取入口：`js/poi-content.js`；资料分别在 `js/stone-content.js`、`js/place-content.js`，来源链接在 `js/content-sources.js`。
- 分支步行图与景点沿路投影：`tools/tour_layout.py`，每条前进路线不得重复经过同一节点。
- 逐站状态与终章时机：`js/journey.js`；详情渲染与弹窗状态：`js/cards.js`。

运行 `D:/Anaconda/python.exe tools/build-map.py` 同步 SVG 和坐标，不手改 `assets/map/` 或 `js/geometry.js`。
序章仅首次进入确认后记忆，资料从页脚进入，时间轴默认折叠；主导览使用道路分支，石刻和景观按沿路顺序停靠。

| 规则 | 由什么拦住 |
| --- | --- |
| 树冠、树干、描边与阴影距路外沿至少 24 个参考像素；渲染与避树共用路网 | `tools/verify-map.py`，含旧版贴路树反例 |
| 石刻在路上、四交叉口准确、其余按区间弧长均布 | `tools/verify-stones.py`，含旧版路外点反例 |
| 照片正确，悬停/触控可用，28 站移动、前后导航、自动终章正常 | `node tools/verify-all.cjs` 的真实 Chrome 场景，含错误照片/跳站反例 |
| 可见改动附桌面和手机截图，点位改动附原图叠线 | `qa/2026-11-08/` 截图和各项 `REVIEW.md` |
| 地点介绍逐条有来源、区分史实与地理背景，禁止通用句兜底；原图地名不得录错 | `node tools/verify-content.cjs`，含缺资料/通用句/错地名检查；来源审阅见 `docs/content-audit.md` |
| 字号与文案遵循 `DESIGN.md` | 真实可见 DOM 记录 + `tools/audit-small-text.mjs` |
| 暂存源码单文件不超过约 5,000 token | `.githooks/pre-commit` → `tools/check-file-size.cjs`；真实提交拦截与放行由 `tools/verify-size-hook.cjs` 验证 |

提交被钩子拒绝时，按报错按功能拆分文件，再提交；不要绕过钩子。
写新函数或新规则前，先搜索项目里有没有现成实现。
