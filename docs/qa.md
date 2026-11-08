# 本地验收

页面运行时无第三方依赖。浏览器验收使用本机 Chrome 与开发环境中的 Playwright。
若 `require('playwright')` 找不到，请把 `NODE_PATH` 指向已有 Playwright 所在的 `node_modules`。

启动预览，再在另一个终端运行：

```powershell
node tools/serve.mjs 8813
$env:BASE_URL='http://127.0.0.1:8813'
node tools/verify-all.cjs
```

Python 默认优先使用 `D:/Anaconda/python.exe`，可用 `PYTHON` 环境变量覆盖。
完整验收执行 15 个地图/石刻/主线几何测试、8 套桌面/手机浏览器流程、2 个真实提交钩子检查、JS 语法和四级字号检查。
浏览器场景包含全部 28 个石刻的点击与主线从杭州到永兴的连续前后导航，包含费巩明灯，且不出现分支选择；遇到控制台错误、图片内容不符、横向溢出或按钮不可用即失败。

证据存于 `qa/2026-11-08/mainline/`，每项有 `REVIEW.md`、桌面与手机前后截图。
`mainline-journey/` 按站保存镜头截图；`qa/2026-11-08/revision/sources/road-and-stops-overlay.png` 对照参考图中的道路和四个交叉口。
照片错误、旧版路外点、导览跳站和超标文件提交均有失败反例。

## 提交大小钩子

每个新检出目录执行一次：

```powershell
git config core.hooksPath .githooks
```

钩子读取暂存区内容，单文件超过 20,000 字节（约 5,000 token）拒绝提交。
图片、字体等二进制资源、lockfile、生成地图和 `qa/` 证据豁免。
历史超标源码不顺手拆分；修改并提交这些文件时，应先按功能拆到限额以内。
`node tools/verify-size-hook.cjs` 在独立临时仓库验证真实提交被拒与拆分后通过，不修改当前仓库暂存区。

地点资料检查：`node tools/verify-content.cjs`；来源审核见 `docs/content-audit.md`。主线检查：`D:/Anaconda/python.exe tools/verify-tour.py`。
