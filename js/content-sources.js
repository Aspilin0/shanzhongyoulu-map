(function () {
  'use strict';
  var refs = {
    R00: ['园区现场手写标注图','用户提供的地图参考',''],
    R01: ['为心仪的西迁故事雕塑方案点赞','浙江大学','https://www.zju.edu.cn/2016/0523/c33439a1519579/pagem.htm'],
    R02: ['竺可桢三请马一浮','浙江大学','https://www.zju.edu.cn/2017/1207/c33161a1514407/pagem.htm'],
    R03: ['西迁岁月 一路走来','浙江大学','https://www.zju.edu.cn/2016/1202/c33355a1517446/pagem.htm'],
    R04: ['流亡路上求是人','浙江大学报','https://zdjy.zju.edu.cn/review/toReview?dbID=23&dbName=ZHEJIANGDAXUEBAO&sysID=39887'],
    R05: ['追溯传承求是魂 参观广西宜州西迁文化广场','浙江大学材料科学与工程学院','https://mse.zju.edu.cn/2014/0729/c38956a1634940/pagem.htm'],
    R06: ['浙江大学西迁文化园迎来首批客人','浙江大学','https://www.zju.edu.cn/2017/0531/c33246a1515824/pagem.htm'],
    R07: ['去北山校友林看西迁文化图片展','浙江大学','https://www.zju.edu.cn/2016/0521/c32859a93172/pagem.htm'],
    R08: ['Lanxi 区位介绍','浙江省政府英文网','https://www.ezhejiang.gov.cn/jinhua/2021-07/14/c_642297.htm'],
    R09: ['地理资源','南昌市人民政府','https://www.nc.gov.cn/ncszf/dlzy/2021_nav_wztt.shtml'],
    R10: ['自然地理','赣州市文化广电旅游局','https://wlj.ganzhou.gov.cn/whgdxwcblyj/c102810/202012/2b6345827bc147339b337df5f99492a6.shtml'],
    R11: ['丝路明珠 大余','赣州市民政局','https://mzw.ganzhou.gov.cn/gzsmzjy/slmz/common_tt.shtml'],
    R12: ['南雄概况','南雄市人民政府','https://www.gdnx.gov.cn/zjnx/nxgk/content/post_2827128.html'],
    R13: ['曲江概况','韶关市曲江区人民政府','https://www.qujiang.gov.cn/sgqjbgs/gkmlpt/content/2/2763/mpost_2763054.html'],
    R14: ['三水西南 以水兴产','武汉市水务局','https://swj.wuhan.gov.cn/tzdt/hykd/202512/t20251225_2702127.html'],
    R15: ['荔浦自然地理背景 环境影响报告','广西壮族自治区生态环境厅','https://sthjt.gxzf.gov.cn/zfxxgk/zfxxgkgl/fdzdgknr/hjjccf/xzxk/hjyxslgk/W020160622523625146643.pdf'],
    R16: ['广西桂林湿地生态保护见成效','国家林业和草原局','https://www.forestry.gov.cn/c/www/sddfdt/566920.jhtml'],
    R17: ['衡山位置面积','衡山县人民政府','https://www.hengshan.gov.cn/zjhs/zrdl/20200206/i683458.html'],
    R18: ['攸县区位介绍','湖南省民政厅','https://mzt.hunan.gov.cn/xxgk/mt/201506/t20150601_3716202.html'],
    R19: ['耒阳概况','耒阳市人民政府','https://www.leiyang.gov.cn/xxgk/bmxxgkml/szfgzbm/stjj/gzjg/jgxx/20200214/i1080368.html'],
    R20: ['茶陵 湘赣边界的罗霄山脉西麓','湖南省人民政府','https://www.hunan.gov.cn/topic/fdbnlqhxzc/hsxx/202106/t20210616_19571307.html'],
    R21: ['江西永丰县介绍','上海市农业农村委员会','https://nyncw.sh.gov.cn/xyyw/20230619/cf3fba8bf7a64ab1b299bf7b9f64a7ed.html'],
    R22: ['浙大西迁办学纪念碑亭落成','浙江大学','https://www.zju.edu.cn/2013/0521/c32862a63115/pagem.htm'],
    R23: ['木构营造 小型构筑物求是巢','浙江大学建筑与城规技术科学实验中心','http://ccealab.zju.edu.cn/index.php/a/list/893.html'],
    R24: ['一批紫金港校区新地标落成','浙江大学','https://www.zju.edu.cn/2017/0521/c41533a510453/pagem.htm']
  };
  Object.keys(refs).forEach(function (id) {
    var r = refs[id];
    window.SITE.sources[id] = { t:r[0], o:r[1], d:'核对于 2026-11-08', local:id === 'R00', lv:id === 'R00' ? '现场标注' : 'A', u:r[2] || undefined };
  });
})();
