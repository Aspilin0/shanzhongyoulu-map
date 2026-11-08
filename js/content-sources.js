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
    R11: ['丝路明珠 大余','赣州市民政局','https://mzw.ganzhou.gov.cn/gzsmzjy/slmz/common_tt.shtml'],
    R22: ['浙大西迁办学纪念碑亭落成','浙江大学','https://www.zju.edu.cn/2013/0521/c32862a63115/pagem.htm'],
    R23: ['木构营造 小型构筑物求是巢','浙江大学建筑与城规技术科学实验中心','http://ccealab.zju.edu.cn/index.php/a/list/893.html'],
    R24: ['一批紫金港校区新地标落成','浙江大学','https://www.zju.edu.cn/2017/0521/c41533a510453/pagem.htm'],
    R25: ['图书仪器运输近讯（1938-12-05）','国立浙江大学校刊复刊','https://zdjy.zju.edu.cn/review/toReview?dbID=23&dbName=ZHEJIANGDAXUEBAO&sysID=13454'],
    R27: ['离乱中毕业：于同隐专题','中国科学家博物馆','https://www.mmcs.org.cn/kxjfc/kxjfc/yty/cj8080/art/2023/art_a82e4cc60d134e03bbe6bb92f1424f25.html'],
    R28: ['浙江大学：烽火炼就求是魂','中国教育报（抗日战争纪念网转载）','https://m.krzzjn.com/show-945-61217.html'],
    R29: ['程开甲病逝，但他与宜州的情缘永存人间','河池日报客户端（广西新闻网转载）','https://gxxwfb.gxnews.com.cn/article.v2019.php?id=17820078'],
    R30: ['千年沧桑话宜州：话说龙江','宜州地方文史回顾（搜狐转载）','https://www.sohu.com/a/472803160_121123770'],
    R31: ['竺可桢在广西的艰难岁月（2020-03-18 第7版）','桂林日报','https://epaper.guilinlife.com/glrb/images/2020-03/18/07/RB07.pdf'],
    R32: ['胡刚复：浙大西迁总参谋长','人民网教育频道','https://edu.people.com.cn/n/2015/0811/c1053-27442435.html']
  };
  Object.keys(refs).forEach(function (id) {
    var r = refs[id];
    window.SITE.sources[id] = { t:r[0], o:r[1], d:'核对于 2026-11-08', local:id === 'R00', lv:id === 'R00' ? '现场标注' : 'A', u:r[2] || undefined };
  });
})();
