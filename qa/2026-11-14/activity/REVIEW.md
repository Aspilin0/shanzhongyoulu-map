# 2026-11-14 活动主题微调

序章替换原有引导语，点明求是精神；进入按钮旁复用终章书灯图案。资料页开头用同一段正文交代从石刻、实拍和史料对照出发的创作过程。费巩明灯与发电亮灯仅调整已有事实的叙述重点，保留出处。

地图几何、点位、页面栏目、导航、26 站导览与终章均未调整。桌面与手机的改前、改后主页面 DOM 标签和 ID 序列完全一致；书灯采用 CSS 装饰，不增加交互或朗读内容。

## 前后对照

| 页面 | 改前 | 改后 |
| --- | --- | --- |
| 桌面序章 | [截图](before/comparison/1440-intro.png) | [截图](after/comparison/1440-intro.png) |
| 手机序章 | [截图](before/comparison/390-intro.png) | [截图](after/comparison/390-intro.png) |
| 手机资料 | [截图](before/comparison/390-about.png) | [截图](after/comparison/390-about.png) |
| 手机费巩明灯 | [截图](before/comparison/390-N03.png) | [截图](after/comparison/390-N03.png) |
| 手机发电亮灯 | [截图](before/comparison/390-N04.png) | [截图](after/comparison/390-N04.png) |

## de-slop 复查

- 原句替换原句、原段替换原段，没有新增栏目、说明小字、眉标、标签或感悟段落。
- 沿用已有字体、配色、按钮与书灯图案；无新动画、卡片、渐变或光效。
- 序章删短一次，解决“精神”落入第二行的孤字问题；手机和桌面均保持完整一句。
- 书灯与按钮不重叠，不挡点击，不进入朗读顺序。
- 用户本次“少说明、不改结构”的要求已记入 DESIGN.md。

## 验证

- `node tools/verify-editorial.cjs`：桌面/手机 2 组通过，失败 0。既有检查此前把终章两行排版的换行当成文字变化，已改为忽略空白后核对完整原句；终章保持原样。
- `node tools/verify-about.cjs`：桌面/手机 2 组通过，失败 0，资料页返回保留探索模式。
- `node tools/verify-journey.cjs`：桌面/手机 2 组通过，失败 0，连续经过 26 站抵达湄潭并自动进入终章。
- `node tools/verify-content.cjs`：28 个石刻、11 个景观通过，保留已有待考标记。
- `node tools/audit-small-text.mjs --report <各套件的 font-audit.json>`：editorial 32、about-return 6、mainline-journey 62，共 100 组可见文字记录，无字号违规。
- `node qa/2026-11-14/activity/capture.cjs`：保存 24 张同条件前后截图，两个宽度的主页面结构一致，控制台错误 0，无横向溢出。改前版本由 Git HEAD 响应拦截还原，没有回写源码。
- 修改的 JS 语法与 `git diff --check` 通过。另用 CUA 实际检查资料页新文案与手机返回地图。

未做真机触控测试；未重跑地图几何与提交钩子检查，这次未修改相关内容。改动保存在本地工作区。
