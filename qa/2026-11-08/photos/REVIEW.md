# 照片替换审核

做了什么：替换灯火与百鸟归林实拍，同步章节和雕塑图注；桐油灯明确标注借图。
测试：`node tools/verify-photos.cjs` → 通过 10，失败 0；`D:/Anaconda/python.exe tools/verify-map.py` → 通过 6，失败 0。
反例：把 N03 临时换成百鸟归林照片，照片哈希断言失败；恢复后 10 项通过。见 negative.txt。
截图：本目录 desktop/mobile-N03/N05.png 为修改前；after-*.png 为修改后。已人工查看桌面百鸟归林和手机灯火，照片完整、无横向溢出。
没验证到的：桐油灯独立照片尚未提供，保留借图并明确图注；无线上发布验证。

Playwright 使用本机安装：通过 NODE_PATH 指向运行时的 dependencies/node/node_modules；Chrome channel。
