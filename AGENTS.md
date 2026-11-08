# 地图维护与验收

道路布局以 `../更新需求/更高清的地图/` 下 2026-11-02 的两张清晰截图及 2026-11-01 总览为准。
旧的现场手写标注图仅用于景观点位配准，不再覆盖新路网。
路线不清楚时先放大原图核对分叉、广场与接入口，不能按故事编号补连线。

| 规则 | 由什么拦住 |
| --- | --- |
| 整个树冠、树干和阴影不得压路或贴路，距道路外沿至少 24 个参考图像素 | `tools/atlas_layout.py` 统一净空检查；`python tools/verify-map.py` 检查实际生成的 SVG，并验证旧版贴路树会被拒绝 |
| 道路绘制与避树检查必须使用同一份几何，不能手改生成的 SVG | `tools/atlas_layout.py` 共用路网；`verify-map.py` 检查生成结果与净空模型一致 |
| 可见改动交差前附桌面、手机截图，路线修改附原图叠线核对图 | CUA 浏览器验收及 `../tmp/qa/routes/` 截图 |
| 全站可见文字不小于 12px，也不要再加回说明自己的小字 | CUA 读取真实可见 DOM 后运行 `node tools/audit-small-text.mjs --report <记录.json>`；只允许 12/14/20/32px。文案规则见 `DESIGN.md` |

道路与广场在 `tools/atlas_layout.py` 修改；景观点位与绘图样式在
`tools/build-atlas.py` 修改。运行 `python tools/build-map.py` 同步底图与点位。

新增道路必须使用沿真实中心线延伸的三次曲线；不要恢复仅在折角加圆角的旧生成方式。
序章首次进入并确认后记忆于本机；不得加回常驻序章导航。项目说明只放在页脚。

照片替换验证：`node tools/verify-photos.cjs`（需可解析本机 Playwright，使用 Chrome）；检查照片内容哈希、卡片图注、桌面与手机截图和控制台错误。

石刻的唯一顺序与布点规则在 `tools/stone_layout.py`；修改后生成地图并运行 `D:/Anaconda/python.exe tools/verify-stones.py`。四处交叉口按参考图，其余点位按道路弧长均布。
