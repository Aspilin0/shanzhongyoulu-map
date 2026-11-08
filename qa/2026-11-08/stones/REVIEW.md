# 石刻点位审核

做了什么：补齐衡阳，28 个石刻全部沿实际园路中心线布点；樟树、衡阳、宜山、湄潭固定在参考图交叉口，其余按区间弧长均布。
测试：`D:/Anaconda/python.exe tools/verify-stones.py` → 通过 4，失败 0；现有地图检查通过 6；`node tools/verify-stones.cjs` → 桌面/手机两项通过；字号 4 场景零违规。
反例：旧杭州点距道路中心线超出容差，被检查拒绝。
截图：1440/390-before、after、hengyang-card；reference-overlay.png 为清晰参考图叠线和点位，reference-north-detail.png 为原现场标注局部。已查看道路叠线、四交叉口和桌面石刻分布。
de-slop：删除每个地名后的重复“待复核”，全园点位依据统一放资料页；避免给均布点声称实地坐标。
没验证到的：其余石刻的精确实地位置，按用户允许的均布方案示意。
