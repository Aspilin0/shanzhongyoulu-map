# 2026-11-08 修改验收

按桌面《修改建议.md》逐项实施，采用 de-slop、tidy、prove-it。每项先验证、保存证据，再独立提交，最后运行完整验收。

| 问题 | 提交 | 审核与截图 |
| --- | --- | --- |
| 灯火与百鸟归林实拍 | `700e95f` | [照片](photos/REVIEW.md) |
| 聚焦整个园区、裁掉外围建筑 | `6aad805` | [地图范围](map-view/REVIEW.md) |
| 石刻在路上、四交叉口准确 | `2998828` | [点位及原图叠线](stones/REVIEW.md) |
| 悬停、触控和键盘简介 | `9de03de` | [标签简介](preview/REVIEW.md) |
| 石刻逐站移动、自动终章、收纳时间轴 | `c4f96ad` | [逐站流程](journey/REVIEW.md) |
| 已获同意的清理和提交大小钩子 | tidy 提交（见 Git 日志） | [最终检查](tidy/REVIEW.md) |

最终 `node tools/verify-all.cjs`：几何 10 项、浏览器场景 20 项、钩子提交检查 2 项通过，失败 0；6 个 JS 文件语法通过，84 个字号场景零违规。浏览器控制台零错误。

[完整测试输出](tidy/all-checks.txt) · [手机最终界面](tidy/390-after.png) · [桌面最终界面](tidy/1440-after.png)

[地图裁切前](map-view/1440-before.png) / [裁切后](map-view/1440-after.png)；[清理前石刻卡片](tidy/1440-stone-before.png) / [清理后](tidy/1440-stone-after.png)。其余各项的前后证据均在对应目录。

未发布线上；均布石刻是导览示意，未声称实测坐标。自动终章展示原有文本，无新增视频或配音。
