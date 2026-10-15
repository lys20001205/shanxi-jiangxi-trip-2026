'use strict';
// 景点池。静态旅行建议，不包含实时交通时刻、票价或道路状态。
SPOTS.push(
 {id:'wugong',province:'江西 · 萍乡',name:'武功山',date:'可选',stay:'整天游览，另留转场时间',search:'萍乡武功山风景区',description:'高山草甸、山脊、云海与金顶。广州坐高铁到萍乡北后转景区班车，是江西自然线较顺路的入口。',risk:'11月底山顶风大、低温，可能结霜或结冰；索道运营及登山步道开放状况必须临行确认。照片拍于其他季节。',photos:[
  ['Wugong Mountains, 17 June 2018, Picture1.jpg','山脊与草甸（夏季资料）','Huangdan2060','CC0'],
  ['Wugong Mountains, 17 June 2018, Picture2.jpg','武功山步道（夏季资料）','Huangdan2060','CC0'],
  ['Wugong Mountains, 17 June 2018, Picture7.jpg','山地景观（夏季资料）','Huangdan2060','CC0']
 ]},
 {id:'hengshan',province:'山西 · 浑源',name:'北岳恒山',date:'可选',stay:'约3—5小时',search:'恒山风景名胜区 浑源',description:'北岳山脊、险峻峡谷与远眺景色；与悬空寺同在浑源方向。',risk:'11月底山顶低温、积冰和大风风险较高；仅在景区明确开放且路况适合时安排。',photos:[
  ['Heng Shan Summit View.jpg','恒山山顶视野','Terence7','CC BY-SA 3.0'],
  ['Hunyuan Hengshan 2013.08.30 11-27-32.jpg','浑源远眺恒山','Zhangzhugang','CC BY-SA 3.0'],
  ['Mountheng-Shanxi2019.jpg','北岳山势','Wikimedia Commons 作者见源页','见原图']
 ]},
 {id:'guifeng',province:'江西 · 弋阳',name:'龟峰丹霞',date:'可选',stay:'约4—6小时',search:'弋阳龟峰风景名胜区',description:'成组的红色丹霞石峰、湖面、栈道。可从上饶乘高铁至弋阳，再换乘当地交通。',risk:'通常需要步行爬坡，景区船班、开放时间及雨天步道需临行核实。',photos:[
  ['Yiyang Guifeng 2015.07.18 12-35-12.jpg','丹霞群峰全景','Zhangzhugang','CC BY-SA 4.0'],
  ['Yiyang Guifeng 2015.07.18 12-58-22.jpg','山体与谷地','Zhangzhugang','CC BY-SA 4.0'],
  ['Yiyang Guifeng 2015.07.18 12-50-27.jpg','岩壁与摩崖石刻','Zhangzhugang','CC BY-SA 4.0']
 ]},
 {id:'longhu',province:'江西 · 鹰潭',name:'龙虎山',date:'可选',stay:'约5—7小时',search:'鹰潭龙虎山风景名胜区',description:'泸溪河竹筏、丹霞峭壁和悬棺景观。高铁到鹰潭北后需汽车接驳。',risk:'漂流是否运行取决于天气、水位与现场安排，不以竹筏为必选项目。',photos:[
  ['Longhushan 9263.jpg','仙水岩崖壁','Zhangzhugang','CC BY-SA 4.0'],
  ['Longhushan - panoramio.jpg','龙虎山河谷','Anders Johnson','CC BY 3.0'],
  ['Longhushan - panoramio (1).jpg','沿河丹霞地貌','Anders Johnson','CC BY 3.0']
 ]},
 {id:'huangling',province:'江西 · 婺源',name:'篁岭古村与秋景',date:'可选',stay:'约3—5小时',search:'婺源篁岭景区',description:'依坡而建的村落、观景台和晒秋场景；比石城更商业化。',risk:'晒秋为经营展示项目，11月底实际展示内容有差异；与石城不在同一条村落路线上。',photos:[
  ['Autumn sun drying at Huangling.jpg','篁岭晒秋场景','Leungcwd','CC BY-SA 4.0'],
  ['Huangling Village 12.jpg','篁岭村落','EditQ','CC BY-SA 4.0'],
  ['Wuyuan huangling scenery.jpg','篁岭春季资料照（非11月）','Maisie008','CC BY-SA 4.0']
 ]},
 {id:'wucheng',province:'江西 · 鄱阳湖',name:'吴城候鸟湿地',date:'可选',stay:'需预留1—2天',search:'永修吴城候鸟小镇',description:'越冬白鹤、天鹅、雁鸭和枯水期湿地。11月至次年3月是适宜观鸟季。',risk:'需要从上饶绕行南昌、永修方向；鸟群位置随水位变化，适合长焦摄影，不适合赶路打卡。',photos:[
  ['Siberian Crane (15852227496).jpg','鄱阳湖白鹤','Alastair Rae','CC BY-SA 2.0'],
  ['Birds on Poyang Lake (15273717673).jpg','鄱阳湖越冬鸟群','Alastair Rae','CC BY-SA 2.0'],
  ['Poyang Lake ESA364932.jpg','鄱阳湖卫星影像（非地面实拍）','European Space Agency','见原图']
 ]},
 {id:'pingyao',province:'山西 · 晋中',name:'平遥古城',date:'可选',stay:'约半天',search:'平遥古城',description:'城墙、老街与票号建筑。以建筑、人文摄影为主，非自然景观。',risk:'太原与大同之间加入平遥需另占约半天至一天，北部景点可能因此被挤掉。',photos:[
  ['Pingyao-oldtown.jpg','古城街巷','Benzh','Public domain'],
  ['Pingyao Old City Wall.jpg','平遥城墙','AkakiBalanchivadze','CC BY 4.0'],
  ['Pingyao Old City at Night.jpg','平遥夜景','AkakiBalanchivadze','CC BY 4.0']
 ]}
);
const POOL_INFO={
 wugong:{kind:'nature',zone:'pingxiang',scenic:5,transport:'萍乡北站至景区班车，历史参考约80分钟',time:'整天徒步＋索道',season:'草甸偏金黄；云海不保证，防风防冰',access:2},
 jinci:{kind:'human',zone:'taiyuan',scenic:2,transport:'市区打车/公交',time:'约3小时',season:'全年',access:1},
 yungang:{kind:'human',zone:'datong',scenic:3,transport:'大同市区往返',time:'约3—4小时',season:'全年，冬季日短',access:2},
 datong:{kind:'human',zone:'datong',scenic:1,transport:'市内步行/打车',time:'约2小时',season:'全年',access:1},
 hanging:{kind:'both',zone:'hunyuan',scenic:4,transport:'大同出发包车',time:'约1—2小时',season:'冬季受大风影响',access:3},
 hengshan:{kind:'nature',zone:'hunyuan',scenic:5,transport:'大同/浑源包车',time:'约3—5小时',season:'可能结冰、封闭',access:3},
 pagoda:{kind:'human',zone:'hunyuan',scenic:2,transport:'与悬空寺组合包车',time:'约1—2小时',season:'全年',access:3},
 pingyao:{kind:'human',zone:'taiyuan',scenic:2,transport:'太原南高铁约40分钟＋接驳',time:'约半天',season:'全年',access:2},
 shicheng:{kind:'both',zone:'wuyuan',scenic:5,transport:'婺源站后北线包车',time:'前晚入住＋次晨',season:'11月下旬—12月初',access:3},
 jujing:{kind:'human',zone:'wuyuan',scenic:3,transport:'与石城北线顺路',time:'约30—60分钟',season:'全年',access:3},
 huangling:{kind:'both',zone:'wuyuan',scenic:3,transport:'婺源县城换乘景区接驳',time:'约3—5小时',season:'晒秋内容不保证',access:2},
 sanqing:{kind:'nature',zone:'sanqing',scenic:5,transport:'上饶/玉山至山脚接驳',time:'整天步行＋山脚住宿',season:'云海依天气；索道可能检修',access:3},
 guifeng:{kind:'nature',zone:'yiyang',scenic:4,transport:'弋阳站转车约半小时',time:'约4—6小时',season:'全年，雨天防滑',access:2},
 longhu:{kind:'nature',zone:'yingtan',scenic:4,transport:'鹰潭北站转车约40—60分钟',time:'约5—7小时',season:'冬季竹筏需核实',access:2},
 wucheng:{kind:'nature',zone:'wucheng',scenic:5,transport:'南昌/永修转车，较远',time:'建议2天',season:'11月—次年3月观鸟',access:4}
};
const POOL_PRESETS={
 nature:{label:'江西自然线',ids:['wugong','sanqing','guifeng','longhu'],skewer:false},
 mixed:{label:'山西自然＋江西',ids:['hengshan','hanging','sanqing','guifeng'],skewer:true},
 datong:{label:'山西自然线',ids:['hengshan','hanging'],skewer:true}
};
