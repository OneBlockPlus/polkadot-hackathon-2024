/****framework****/
;(function(){
	var mem={}			//统一管理的数据
	var me={					//统一管理的配置,component可以控制自己的挂载，并保存需要的值,config部分
		appName:'T',		//挂载的名称
		funKey:'funs',		//模块方法挂载的位置
		memKeys:{			//memory的基础挂载点,可以随机生成
			database:hash(),			//运行数据的根挂载点(和不同的id相关的运行数据)
			cache:hash(),					//运行时数据挂载点(和id无关的运行数据),公用部分
			component:hash(),		//组件信息的根挂载点
			timer:hash(),					//定时器的根挂载点
			queue:hash(),					//队列挂载点
			/*database:'database',			//运行数据的根挂载点(和不同的id相关的运行数据)
			cache:'cache',					//运行时数据挂载点(和id无关的运行数据),公用部分
			component:'coms',		//组件信息的根挂载点
			timer:'timer',					//定时器的根挂载点
			queue:'queue',					//队列挂载点*/
		},
		hooks:{					//基础的钩子部分,定义组件头部的基础钩子位置,可以写死,可以调用	
			root:'hooks',		//注册到根下的方法
			loop:'loops',			//加入循环的方法
			init:'init',				//初始化组件的方法
		},
		debug:{				//是否进行调试，监控整理框架的运行效率
			enable:true,
			start:0,
		},
		version:1,						//内部版本号
		nickName:'Monkey',		//内部开发代号
		delay:200,						//自动检测的时间间隔
	}
	var run={timer:null}
	
	var self={
		/*基础功能函数部分，可以对me进行操作*/
		init:function(){
			if(me.debug.enable) me.debug.start=self.stamp()
			for(k in me.memKeys) self.regMemory({},[me.memKeys[k]],true)
		},
	
		regComponent:function(r){
			if(self.type(r)!='object') return self.error()
			var fun=r[me.funKey]
			self[r.name]=fun
			
			var hks=r.hooks,lps=r.loops
			if(hks && hks.length>0)for(var i=0;i<hks.length;i++) window[me.appName][hks[i]]=fun[hks[i]]
			if(lps && lps.length>0)for(var i=0;i<lps.length;i++) window[me.appName][lps[i]]=fun[lps[i]]
			
			if(r.autoRun) fun[r.autoRun]()
			
			delete(r[me.funKey])
			if(mem[me.memKeys.component][r.name]!=undefined) console.log('module '+r.name+' is already existing..')
			mem[me.memKeys.component][r.name]=r
		},
		
		
		/*核心的数据处理部分，最基础的部分*/
		getMe:function(chain){
			if(chain===undefined) return me
			if(self.type(chain)=='array'){
				var rst=false
				for(var i=0;i<chain.length;i++)if(me[chain[i]]){rst=me[chain[i]] }else{return false} 
				return rst
			}
			return me
		},
		
		/*向me里添加配置
		 * @param	data	object	//需要写入的数据，不能使function
		 * @param	chian	array	//写入的链
		 * @param	forec	boolean	//是否强制新建链(防止复写)
		 * */
		regMe:function(data,chain,force){
			if(!chain || !self.isType(chain,'array')) return self.error('chain is not array...')
			if(self.type(data)==='function') return self.error('function can not add to me')
			force=force==undefined?false:force
			return self.extend(me,data,chain,force)
		},
		
		
		checkTimer:function(){
			//1.检测检查队列是否为空，不然就开始定时器
			//2.遍历队列，进行状态检查
			//3.杀死不运行的死队列（根据时间戳检查，主要是ajax的问题）
			if(run.timer==undefined) run.timer=window.setInterval(self.checkTimer,me.delay)
			var tms=self.getMemory([me.memKeys.timer]),after={}
			if(!self.empty(tms)) for(k in tms) if(!tms[k]()) after[k]=tms[k]
			self.regMemory(after,[me.memKeys.timer],true)
		},
		
		killTimer:function(name){		//杀掉时间检测进程
			
		},
		
		regTimer:function(name,fun){
			var chain=[me.memKeys.timer,name]
			root.regMemory(fun,chain,true)
			//1.回调的时候处理掉标志位
		},
		
		//获取memory的数据,需要拷贝的话请加clone
		getMemory:function(chain,clone){
			if(chain && self.isType(chain,'array')){
				var rst=mem
				for(var i=0;i<chain.length;i++){
					if(rst[chain[i]]==undefined) return false
					rst=rst[chain[i]]
				}
				return clone?self.clone(rst):rst		
			}
			return false
		},
		
		/*注册管理数据的方法
		 *  @param	data 	no function		//需要注册的数据
		 *	@param	chain	array			//注册的路径
		 *  @param	force	boolean			//是否强制复写,true的话原节点数据全部覆盖，false会添加节点
		 * 	return
		 * 	写好数据/false
		 * */
		regMemory:function(data,chain,force){
			if(!chain || !self.isType(chain,'array')) return self.error('memory chain is not array...')
			if(self.type(data)==='function') return self.error('function can not add to memory..')
			force=force==undefined?false:force
			return self.extend(mem,data,chain,force)
		},
		
		/*清理对应的节点及数据*/
		clearNode:function(chain){
			var len=chain.length,p=mem
			for(var i=0;i<len;i++){
				var k=chain[i]
				if(i==(len-1)){
					if(!p[k]) return false
					delete p[k]
					return true
				}else{
					if(!p[k]) return false
					else p=p[k]
				}
			}
		},
		
		memoryDump:function(){
			console.log(mem)
		},
		
		//运行加载到struct的组件程序,实现运行app
		struct:function(p){
			//console.log(p)
			var cps=mem[me.memKeys.component]
			//console.log(cps)
			for(var k in cps){
				if(!self.empty(cps[k].hooks)){
					var hks=cps[k].hooks,len=hks.length
					for(var j=0;j<len;j++) window[me.appName][hks[j]](p)
				}
			}
		},
		
		//构建完成后运行的主函数
		loop:function(p){
			self.checkTimer()
			var cps=mem[me.memKeys.component]
			for(var k in cps){
				if(!self.empty(cps[k].loops)){
					var lps=cps[k].loops,len=lps.length
					for(var j=0;j<len;j++) window[me.appName][lps[j]](p)
				}
			}
		},
		
		error:function(t){
			t=t||'function error...'
			console.log('error:'+t)
			//console.log(arguments.callee.caller)	
		},
		
		//浅复制对象,注意array的处理
		clone:function(obj,dep){
		    if(self.isType(obj,'object')) return $.extend({}, obj)
		    if(self.isType(obj,'array')) return $.extend([], obj)
		    return obj
		},
		
		//fuu,按照jquery的逻辑进行重写,提升效率
       	extend:function(target,data,chain,force){
       		var len=chain.length,p=target
			for(var i=0;i<len;i++){
				var kk=chain[i]
				if(i==len-1){
					if(p[kk]){
						if(force){
							p[kk]=data
						}else{
							if(self.isType(data,'object')) for(dk in data) p[kk][dk]=data[dk]
							else p[kk]=data
						}
					}else{
						if(force) p[kk]=data
						else return false
					}
				}else{
					if(!p[kk]){
						if(force) p=p[kk]={}
						else return false
					}else{
						p=p[kk]
					}
				}
			}
			return true
       	},
       	
       	getNode:function(path,obj){
       		var rst=obj
       		for(var i=0,len=path.length;i<len;i++){
       			var s=path[i]
       			if(rst[s]==undefined) return false
       			rst=rst[s]
       		}
       		return rst
       	},
       	
       	//队列处理部分,历史保存部分要用到
       	queueClear:function(k){
			var chain=[me.memKeys.queue,k]
			return self.regMemory([],chain,true)
		},
		
		queueAdd:function(id,k){
			var chain=[me.memKeys.queue,k],arr=self.getMemory(chain)
			if(self.empty(arr)) arr=[]
			arr.push(id)
			return self.regMemory(arr,chain,true)
		},
		
		queueRemove:function(id,k){
			var chain=[me.memKeys.queue,k],arr=self.getMemory(chain),narr=[]
			for(var i=0,len=arr.length;i<len;i++) if(arr[i]!=id) narr.push(arr[i])
			return self.regMemory(narr,chain)
		},
		
		queuePop:function(k){
			var chain=[me.memKeys.queue,k],arr=self.getMemory(chain)
			return arr.pop()
		},
       	
       	getQueue:function(k){
       		return self.getMemory([me.memKeys.queue,k])
       	},
       	
       	detect:function(){
			var ua=navigator.userAgent,platform=navigator.platform
			var os = {},browser =  {},
			webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
			android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
			osx = !!ua.match(/\(Macintosh\; Intel /),
			ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
			ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
			iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
			webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
			win = /Win\d{2}|Windows/.test(platform),
			wp = ua.match(/Windows Phone ([\d.]+)/),
			touchpad = webos && ua.match(/TouchPad/),
			kindle = ua.match(/Kindle\/([\d.]+)/),
			silk = ua.match(/Silk\/([\d._]+)/),
			blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
			bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
			rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
 			playbook = ua.match(/PlayBook/),
			chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
			firefox = ua.match(/Firefox\/([\d.]+)/),
			firefoxos = ua.match(/\((?:Mobile|Tablet); rv:([\d.]+)\).*Firefox\/[\d.]+/),
			ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
			webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
			safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

		    if (browser.webkit = !!webkit) browser.version = webkit[1]
		
		    if (android) os.android = true, os.version = android[2]
		    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
		    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
		    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
		    if (wp) os.wp = true, os.version = wp[1]
		    if (webos) os.webos = true, os.version = webos[2]
		    if (touchpad) os.touchpad = true
		    if (blackberry) os.blackberry = true, os.version = blackberry[2]
		    if (bb10) os.bb10 = true, os.version = bb10[2]
		    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
		    if (playbook) browser.playbook = true
		    if (kindle) os.kindle = true, os.version = kindle[1]
		    if (silk) browser.silk = true, browser.version = silk[1]
		    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
		    if (chrome) browser.chrome = true, browser.version = chrome[1]
		    if (firefox) browser.firefox = true, browser.version = firefox[1]
		    if (firefoxos) os.firefoxos = true, os.version = firefoxos[1]
		    if (ie) browser.ie = true, browser.version = ie[1]
		    if (safari && (osx || os.ios || win)) {
		      browser.safari = true
		      if (!os.ios) browser.version = safari[1]
		    }
		    if (webview) browser.webview = true
		
		    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
		      (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
		    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
		      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
		      (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
		   
			return os.phone?'mobile':os.tablet?'pad':'pc'
		},
		encode:function(obj,kv,cnt){
			kv=kv||':';cnt=cnt||'-'
			var arr=[]
			for(var k in obj)arr.push(k+':'+obj[k])
			return arr.join(cnt)
		},
		decode:function(str,kv,cnt){
			if(!str) return {}
			kv=kv||':';cnt=cnt||'-'
			var arr=str.split(cnt),rst={}
			if(self.empty(arr)) return rst
			for(var k in arr){
				var tmp=arr[k].split(kv)
				rst[tmp[0]]=tmp[1]
			}
			return rst
		},
		getID:function(s){var a=s.split('_');return a[a.length-1]},
       	getPath:function(){var a = document.location.toString().split('//')[1],b =a.indexOf('/'),rst = a.substring(b);if(rst.indexOf('?') != -1) rst = rst.split('?')[0];var arr=rst.split('/'),pp='';for(var i=0;i<arr.length-1;i++) pp+=arr[i]+'/';return pp},
       	getLocal:function(url,ck){$.ajax({type:"get",url:url,async:false,success:function(data){ck&&ck(data)}})},
       	hash:hash,
        stamp:function(){return new Date().getTime()},
		empty:function(o){for(var z in o){return false}return true},
		isType: function (obj, type) {return !!type ? self.type(obj) === type.toLowerCase():self.type(obj)},
		type: function (obj) {return Object.prototype.toString.call(obj).slice(8,-1).toLowerCase()},
		inArray:function(k,a){if(!a){return false};for(i=0;i<a.length;i++)if(k==a[i])return true;return false},
	}
	function hash(n){return Math.random().toString(36).substr(n!=undefined?n:6)}
	window[me.appName]=self
	self.init()
})()
/****api*****/

;(function(root,$){
	var config={
		//server:'http://localhost/test/',		//服务器地址
		//uuid:'aaa',							//用户识别号
		//token:'bbb',							//32位令牌,和salt加密后处理
		//salt:'Ab3F3[*7BB',					//加密字符串
		version:1,
	}
	
	var me=root.getMe()
	
	root.init=function(arr){
		//console.log('ok,after init')
		root.debug('init',true)
		for(var i=0;i<arr.length;i++){
			root.struct(arr[i])		//启动注册的hooks，调整 component的关系和注册数据
		}
		root.debug('init',true)
	}
	
	root.dwg =function(rooms,target){
		root.debug('dwg',true)
		if(!root.core.isStruct(target)) return	console.log(target+' is not init,please do it first...')
		root.loop({data:rooms,target:target})
		root.debug('dwg',true)
		root.debug()
	}
	
	//单一入口的自动化绘制函数
	root.auto=function(target,rooms,cfg){
		
		
	}
	
	root.report=function(target){
		var rids=root.core.getRids(target),rst={}
		for(var i=0,len=rids.length;i<len;i++) rst[rids[i]]=root.core.report(rids[i],target)
		return rst
	}
	
	//从服务器获取房间数据
	root.getRoom=function(rid){
		// 153 2763 3266
	}
	
	root.getModule=function(mid){
		var ajax={}
		
	}
	
	//保存到ios的cache操作
	root.setCache=function(k,v){
		
	}
	
	root.getCache=function(k){
		
	}
	
	root.debug=function(txt,force){
		txt=txt||''
		if(me.debug.enable){
			if(force){
				console.log(txt+' range:'+(root.stamp()-me.debug.start))
			}else{
				var end=root.stamp()
				console.log('Debug info:\ns-time:'+me.debug.start+'\ne-time:'+end+'\n'+'cost:'+(end-me.debug.start)+'ms')
			}
		}
	}
	
	root.isDulex=true
	
})(window.T,jQuery)
/****core****/
;(function(root){
	var reg={
		name:'core',
		type:'basic',
		hooks:['componentStruct','createStruct'],		//注册到fn下的方法,这样其他的组件就可以直接调用
		loops:['autoShow'],		//注册循环启动函数，framework开始启动
		autoRun:'init',
		version:1,
	}
	
	var config={
		curPath:'',				//当前的目录位置
		device:'',				//确认系统运行的设备
		os:'',					//当前运行的OS
		classHidden:'hidden',
		auth:{
			version:1,			//版本号
			subver:4,			//子版本号
			nickName:'Xiao',	//版本代号"笑"
			author:['fuu','cpm','hanhan','huan'],		//作者
		},
		/*report的数据结构*/
		report:{
			wall:0,				//墙面面积
			space:0,			//房间容积
			ground:0,			//地面面积
			ceiling:0,			//天花面积
			girth:0,			//踢脚线长度
			//raw:{},				//原始数据
		},
		/*程序数据结构部分*/
		convert:1000,		//默认的转换值
		index:'index',			//默认index的key值
		comTypes:{				//组件类型
			module:	{regKey:root.hash(),regMothod:'regModule',	data:{index:[],structs:[],items:[],connect:[]}},
			control:{regKey:root.hash(),regMothod:'regControl',	data:{index:[]}},
			render:	{regKey:root.hash(),regMothod:'regRender',	data:{index:[]}},
			plugin:	{regKey:root.hash(),regMothod:'regPlugin',	data:{index:[]}},
		},
		cache:{		//统一挂载到cache的列表
			img:			{regKey:root.hash(),data:{}},
			mesh:		{regKey:root.hash(),data:{}},
			texture:	{regKey:root.hash(),data:{}},
			material:	{regKey:root.hash(),data:{}},
			theme:		{regKey:root.hash(),data:{yhf:{},fashion:{},cad:{}}},
			target:		{regKey:root.hash(),data:''},			//当前值
			structed:	{regKey:root.hash(),data:false},	//是否被构造
			//convert:	{regKey:root.hash(),data:{}},			//转换后的convert值
			/*img:			{regKey:'imgs',data:{}},
			mesh:		{regKey:'mesh',data:{}},
			texture:	{regKey:'texture',data:{}},
			material:	{regKey:'material',data:{}},
			theme:		{regKey:'theme',data:{yhf:{},fashion:{},cad:{}}},
			target:		{regKey:'target',data:''},			//当前值
			structed:	{regKey:'structed',data:false},	//是否被构造
			//convert:	{regKey:'convert',data:{}},			//转换后的convert值*/
		},
		struct:{				//运行环境的基础数据
			rooms:	{regKey:root.hash(),data:[]},			//db节点数据列表
			history:{regKey:root.hash(),data:[]},					//历史记录数据
			runtime:{regKey:root.hash(),data:{}},		//render的数据储存节点
			active:	{regKey:root.hash(),data:{cur:{type:'',id:0,rid:0,plugin:false},pre:{type:'',id:0,rid:0,plugin:false,}}},
			change:	{regKey:root.hash(),data:[]},		//点发生变化的处理
			render:	{regKey:root.hash(),data:''},		//当前的渲染器,渲染器需要给默认值
			convert:{regKey:root.hash(),data:{}},			//图像的单位转换
			stamp:	{regKey:root.hash(),data:0},			//数据的时间戳
			mode:	{regKey:root.hash(),data:'dulex'},		//当前的运行模式
			three:	{regKey:root.hash(),data:{mesh:[],light:[],ray:[]}},			//3D基础数据的位置
			relate:	{regKey:root.hash(),data:{}},			//房间相互关系的保存位置
			/*rooms:	{regKey:'rooms',data:[]},			//db节点数据列表
			history:{regKey:'his',data:[]},					//历史记录数据
			runtime:{regKey:'runtime',data:{}},		//render的数据储存节点
			active:	{regKey:'active',data:{cur:{type:'',id:0,rid:0,plugin:false},pre:{type:'',id:0,rid:0,plugin:false,}}},
			change:	{regKey:'change',data:[]},		//点发生变化的处理
			render:	{regKey:'render',data:''},		//当前的渲染器,渲染器需要给默认值
			convert:{regKey:'convert',data:0},			//图像的单位转换
			stamp:	{regKey:'stamp',data:0},			//数据的时间戳
			mode:	{regKey:'mod',data:'dulex'},		//当前的运行模式
			three:	{regKey:'three',data:{mesh:[],light:[],ray:[]}},			//3D基础数据的位置
			relate:	{regKey:'relate',data:{}},			//房间相互关系的保存位置*/
		},	
		motherReg:'room',			//母组件,入口组件,所有的数据都放在这里
		motherAction:['add','copy','del'],	//需要整体操作的母组件
		relateReg:['wall','point'],	//依赖的组件
		sectionReg:'wall',			//分段组件的名称
		dataKeys:{
			dataKey: 	root.hash(),		//原始数据的挂载键名,以m为单位的,保留2位的值
			cvtKey: 	root.hash(),		//转换单位后的数据(和me.convert计算后的值)
			basicKey: 	root.hash(),		//房间主要数据的挂载名称
			structKey:	root.hash(),		//组件基本数据的挂载位置
			sectionKey:	root.hash(),		//分段函数挂载的位置,在basic之下的
			relateKey:	root.hash(),		//关联的房间保存位置
			/*dataKey: 	'data',		//原始数据的挂载键名,以m为单位的,保留2位的值
			cvtKey: 	'cdata',		//转换单位后的数据(和me.convert计算后的值)
			basicKey: 	'basic',		//房间主要数据的挂载名称
			structKey:	'struct',		//组件基本数据的挂载位置
			sectionKey:	'section',		//分段函数挂载的位置,在basic之下的
			relateKey:	'relate',		//关联的房间保存位置*/
		},
		pluginHooks:{
			struct:'struct',			
			show:'drawing',			//plugin的显示入口
			clear:'clear',			//清理入口
		},
		regHooks:{
			regBasic:'SB223N',				//入口组件计算basic的函数
			regStruct:'SB168NN',			//基础的构建函数
			regSection:'SB221NC',			//组件默认分段操作函数
			regConvert:'convert',			//配置convert的函数
			regFormat:'SB123N',				//组件格式化数据的函数名,在这个函数里做计量单位转换
			regExport:'toJSON',				//组件数据输出的函数名
			regCheck:'checkData',			//对元素数据的数据位和类型进行校正
			regChange:'changeData',			//关联组件的位置修正函数
			regCorrect: 'correctData',		//对组件数据按照basic的值进行修正
			regCalc:'summary',				//组件自汇报函数,报告自己的表面积,体积,表面积减损等信息,用于合并到计算协议里
			regRelate:'relate',				//关系计算，生成todo的数据结构
			regAdsorb:'adsorb',				//返回组件吸附点的函数
			regConnect:'connect',			//复制两个房间墙上的组件的操作,目前在wall里使用
			regReport:'report',				//组件的计算函数,计算自己的标准协议值
		},
		connectHooks:{
			groupType:'door',			//建立group检测的连接组件
			notConnectKey:'ndoor',		//未连接的门的在basic的挂载位置
			cntReg:'room',				//什么组件连接的时候进行检测
			cntStruct:'cntStruct',		//组件连接检测构建函数
			cntCheck:'cntCheck',		//组件做连接检测的函数名
			cntCalc:'cntCalc',			//组件连接计算函数
			cntGetPos:'getCntPos',		//获取可以连接的组件的连接位
		},
		action:{
			add:	'add',		//添加的函数名
			update:	'set',		//设置的函数名
			remove:	'del',		//删除的函数名
		},
		history:{
			localKey:root.hash(),
			step:30,
			forward:root.hash(), //保存向前的队列,注意清理
		},
	}
	var me=root.getMe()
	
	var self=reg[me.funKey]={
		init:function(){
			//console.log(root===window[me.appName])		//fuu,实质上两个变量是一致的
			//1.注册组件类型
			var ks=me.memKeys
			for(var k in config.comTypes){
				var tg=config.comTypes[k]
				root.regMemory(tg.data,[ks.cache,tg.regKey],true)
			}
			
			//2.注册cache键值
			for(var k in config.cache){
				var tg=config.cache[k]
				root.regMemory(tg.data,[ks.cache,tg.regKey],true)
			}
			
			config.curPath=root.getPath()
			config.device=root.detect()
			root.regMe(config,[reg.name],true)
		},

		
		/*组件处理区域，组织组件之间的关系,组件安装*/
		//把component进行组织的函数,在message里进行标志位设置
		componentStruct:function(p){
			var ks=me.memKeys,kc=[ks.cache,config.cache.structed.regKey]
			if(!root.getMemory(kc)){
				var coms=root.getMemory([ks.component])
				for(var k in coms){
					var cp=coms[k]
					if(config.comTypes[cp.type]){
						var type=config.comTypes[cp.type]
						self[type.regMothod](cp)
					}
				}
			}
			return root.regMemory(true,kc,true)
		},
		
		createStruct:function(cfg){
			
			//1.创建db数据
			var ks=me.memKeys,dc=[ks.database,cfg.target]
			if(!root.getMemory(dc)){
				for(var k in config.struct){
					var nod=config.struct[k]
					var chain=[ks.database,cfg.target,nod.regKey]
					root.regMemory(root.clone(nod.data),chain,true)
				}
			}
			
			//1.1	保存绘图程序的convert
			root.regMemory(cfg.convert,[ks.database,cfg.target,config.struct.convert.regKey],true)
			var data=self.structConvert(cfg.target,cfg.convert)
			
			//2.创建渲染器的初始化
		    var rds=self.getRegs('render')
		    if(rds && rds.length>0){
			    for(var i=0;i<rds.length;i++){
			    	var rd=rds[i],rcfg=me[rd]
			    	root[rd][rcfg.entryHooks.initFun](cfg)
			    }
		    }
		    
		    //3.插件的初始化
		    var pgs=self.getRegs('plugin')
		    if(pgs && pgs.length>0){
			    for(var i=0;i<pgs.length;i++){
			    	var pg=pgs[i],pcfg=me[pg]
			    	if(pcfg.entryHooks && root[pg][pcfg.entryHooks.initFun]) root[pg][pcfg.entryHooks.initFun](cfg)
			    }
		    }
		    
		},
		
		/*基础数据获取函数部分*/
		getRegs:function(type){return root.getMemory([me.memKeys.cache,config.comTypes[type].regKey,config.index])},
		getRids:function(target){
			if(target==undefined) target=self.getCurTarget()
			return root.getMemory([me.memKeys.database,target,config.struct.rooms.regKey])
		},
		getRoom:function(rid,target){return root.getMemory([me.memKeys.database,target,rid])},
		getData:function(mod,rid,target){return root.getMemory([me.memKeys.database,target,rid,mod])},
		getConvert:function(target){
			if(target==undefined) target=self.getCurTarget()
			return root.getMemory([me.memKeys.database,target,config.struct.convert.regKey]) || config.convert},
		getBasic:function(rid,target){return root.getMemory([me.memKeys.database,target,rid,config.dataKeys.basicKey])},
		getRuntime:function(rd,target){return root.getMemory([me.memKeys.database,target,config.struct.runtime.regKey,rd])},
		getCurRender:function(target){
			if(target==undefined) target=self.getCurTarget()
			return root.getMemory([me.memKeys.database,target,config.struct.render.regKey])},
		setCurRender:function(rd,target){
			var rds=root.getMemory([me.memKeys.cache,config.comTypes.render.regKey,config.index])
			return root.inArray(rd,rds)?root.regMemory(rd,[me.memKeys.database,target,config.struct.render.regKey],true):false
		},
		getActive:function(target){return root.getMemory([me.memKeys.database,target,config.struct.active.regKey])},
		setActive:function(p,target){
			var pre=root.getMemory([me.memKeys.database,target,config.struct.active.regKey,'cur'])
			var act={cur:p,pre:pre}
			var chain=[me.memKeys.database,target,config.struct.active.regKey]
			return root.regMemory(act,chain,true)
		},
		clearActive:function(target){return self.setActive({type:'',id:0,rid:0,plugin:false,debug:false},target)},
		getCurTarget:function(){return root.getMemory([me.memKeys.cache,config.cache.target.regKey])},
		setCurTarget:function(t){
		    var db=root.getMemory([me.memKeys.database])
			return db[t]!==undefined?root.regMemory(t,[me.memKeys.cache,config.cache.target.regKey],true):false
		},
		getRelate:function(target){return root.getMemory([me.memKeys.database,target,config.struct.relate.regKey])},
		setRelate:function(d,rid,target){return root.regMemory(d,[me.memKeys.database,target,config.struct.relate.regKey,rid],true)},
		clearRelate:function(rid,target){return root.regMemory({},[me.memKeys.database,target,config.struct.relate.regKey,rid],true)},
		getConnect:function(dom,rid,target){},
		setConnect:function(ra,rb,target){},
		getTheme:function(t){return root.getMemory([me.memKeys.cache,config.cache.theme.regKey,t])},
		getResource:function(id,type){return root.getMemory([me.memKeys.cache,config.cache[type].regKey,id])},
		setResource:function(data,id,type){return root.regMemory(data,[me.memKeys.cache,config.cache[type].regKey,id],true)},
		
		
		getMessage:function(target){return root.getMemory([me.memKeys.database,target,config.struct.change.regKey])},
		setMessage:function(msg,target){
			var chain=[me.memKeys.database,target,config.struct.change.regKey],arr=root.clone(self.getMessage(target))
			arr.push(msg)
			return root.regMemory(arr,chain,true)
		},
		clearMessage:function(target){
			return root.regMemory([],[me.memKeys.database,target,config.struct.change.regKey],true)
		},
		dump:function(rid,target){
			var r={}
			var mds=self.getRegs('module'),cvt=self.getConvert(target)
			var room=root.getMemory([me.memKeys.database,target,rid])
			var dk=config.dataKeys.dataKey
			for(var i=0;i<mds.length;i++){
				var mod=mds[i]
				if(room[mod] && room[mod][dk]) r[mod]=room[mod][dk]
			}
			return r
		},
		
		//报告1个房间的计算数据
		report:function(rid,target){
			//1.取出房间的数据
			var dt=self.getRoom(rid,target)
			var bkey=config.dataKeys.basicKey,cvt=self.getConvert(target)
			
			//2.遍历房间的数据获取所有组件的报告
			var rpt={}
			for( var k in dt){
				if(k!=bkey){
					var fun=root[k][config.regHooks.regReport]
					if(fun)	rpt[k]=fun(dt[k],cvt)
				}
			}
			//console.log(rpt)
			
			//3.计算所有组件的结果
			var rst=root.clone(config.report)
			rst['raw']={}
			for(var k in rpt){
				var row=rpt[k]
				if(rpt[k].raw) rst.raw[k]=rpt[k].raw
				for(var kk in config.report) if(row[kk]) rst[kk]+=row[kk]
			}
			
			return rst
		},
		
		/*绘图程序逻辑组织部分*/
		regModule:function(r){
			var cfg=me[r.name],com=config.comTypes.module
			var ks=me.memKeys
			
			//1.加入整体里列表，并进行排序
		    var chain=[ks.cache,com.regKey,config.index]
		    var mds=root.getMemory(chain)
		    if(root.empty(mds)){
		    	var data=[r.name]
		    }else{
		   	 	var data=[],inot=true
				for(var i=0;i<mds.length;i++){
					var cur=mds[i],curOrder=me[cur].order
					if(inot && cfg.order<curOrder){inot=false;data.push(r.name)}
					data.push(cur)
				}
				if(inot){data.push(r.name)}
		    }
		    root.regMemory(data,chain)
		    
		    //2.处理连接组件
		    if(cfg.isConnect){
			    var chain=[ks.cache,com.regKey,'connect']
			    var mds=root.getMemory(chain)
			    var data=root.empty(mds)?[]:mds
			    data.push(r.name)
			    root.regMemory(data,chain)
		    }
		    
		   //3.区分是不是结构组件
		   if(cfg.isStruct){
		   		var chain=[ks.cache,com.regKey,'structs']
		    	var mds=root.getMemory(chain)
			   	if(root.empty(mds)){
			    	var data=[r.name]
			    }else{
			    	var data=[],inot=true
					for(var i=0;i<mds.length;i++){
						var cur=mds[i],curOrder=me[cur].order
						if(inot && cfg.order<curOrder){inot=false;data.push(r.name)}
						data.push(cur)
					}
					if(inot){data.push(r.name)}
			    }
		   }else{
		   		var chain=[ks.cache,com.regKey,'items']
		   	 	var mds=root.getMemory(chain)
		   	 	var data=root.empty(mds)?[]:mds
		   	 	data.push(r.name)
		   }
		   root.regMemory(data,chain)
		   
		  	//4.处理theme
		  	if(me[r.name].theme) self.regTheme(me[r.name].theme,r.name)
		},
		regControl:function(r){
			var cfg=me[r.name],com=config.comTypes.control,ks=me.memKeys
		    var chain=[ks.cache,com.regKey,'index']
		    var rds=root.getMemory(chain),data=root.empty(rds)?[]:rds
		    data.push(r.name)
		    root.regMemory(data,chain,true)
		},
		regRender: function (r) {
			//1.处理渲染器的排序
		    var cfg=me[r.name],com=config.comTypes.render
		    var ks=me.memKeys,chain=[ks.cache,com.regKey,'index']
		    var rds=root.getMemory(chain),data=root.empty(rds)?[]:rds
		    data.push(r.name)
		    root.regMemory(data,chain,true)
		    
		    //注册成入口渲染器
		    if (cfg.entry) root.regMemory(r.name,[ks.cache,com.regKey,config.struct.render.regKey],true)

		    //2.处理theme
		    if(me[r.name].theme) self.regTheme(me[r.name].theme,r.name)
		},
		
		regPlugin:function(r){
			var cfg=me[r.name],com=config.comTypes.plugin
		    var ks=me.memKeys
		    var chain=[ks.cache,com.regKey,config.index]
		    var pns=root.getMemory(chain)
		    var data=root.empty(pns)?[]:root.clone(pns)
		    data.push(r.name)
		    root.regMemory(data,chain,true)
		    
		    if(me[r.name].theme) self.regTheme(me[r.name].theme,r.name)
		},
		
		regTheme:function(t,name){
			var ks=me.memKeys,tkey=config.cache.theme.regKey
			for(k in t){
				var chain=[ks.cache,tkey,k],data=root.getMemory(chain)
				if(data) root.regMemory(t[k],[ks.cache,tkey,k,name],true)
			}
		},
		
		isStruct:function(target){
			return root.getMemory([me.memKeys.database,target])?true:false
		},
		
		//组件运行函数
		autoShow:function(cfg){
			if(!cfg.target || !cfg.data) return
			var tg=cfg.target,ks=me.memKeys,dc=[ks.database,tg]
			if(!root.getMemory(dc)) root.regMemory({},dc,true)
			for(var k in cfg.data) self.autoStruct(cfg.data[k],k,tg,true)
			//self.autoConnect(tg)
			
			self.autoRender(tg)			//绘制所有的数据,包括plugin的
			self.autoControl(tg)
		},
		
		/*	组件关联建立的逻辑
		 *	1.获取计算过的relate
		 * 	2.遍历relate之间的关系，调用组件的计算函数，确认关系
		 * 	3.获取的数据推动到basic里(数据结构如下：)
		 * 	4.组件做相应的操作的时候，返回必要的todo(1.位置的同步;2.组件的添加和删除等)
		 * */
		autoConnect:function(target){
			console.log('--------autoConnect start---------')
			var rt=self.getRelate(target),cvt=self.getConvert(target)
			var rkey=config.dataKeys.relateKey,rhook=config.regHooks.regRelate
			var empty=root.empty
			var connect={}
			for(var rid in rt){
				connect[rid]=empty(connect[rid])?{}:connect[rid]
				if(!empty(rt[rid])){
					for(tid in rt[rid]){
						var dt=rt[rid][tid],ra=self.getRoom(rid,target),rb=self.getRoom(tid,target)
						for(var k in ra){
							if(rb[k] && k!=config.dataKeys.basicKey && k!=config.motherReg){
								if(root[k][rhook]){
									var rsta={rid:rid,data:ra},rstb={rid:tid,data:rb}
									rsta[rkey]=rt[rid]
									var cnt=root[k][rhook](rsta,rstb,cvt)
									if(!empty(cnt)) connect[rid][k]=cnt[rid]
								}
							}
						}
						
					}
				}
			}
			
			var rst={}
			for(var k in connect){
				rst[k]=rst[k]||{}
				for(var kk in connect[k]){
					//console.log(JSON.stringify(connect[k][kk]))
					if(!empty(connect[k][kk])){
						for(var j in connect[k][kk]){
							var data=connect[k][kk][j]
							for(var i=0,len=data.length;i<len;i++){
								var dt=data[i]
								if(!empty(dt)){
									var rid=dt[0],type=dt[1],id=dt[2],p=dt[3]
									rst[k][kk]=rst[k][kk] || {}
									rst[k][kk][j]=rst[k][kk][j]||[]
									rst[k][kk][j].push([rid,type,id,p])
									
									rst[rid]=rst[rid] || {}
									rst[rid][type]=rst[rid][type]||{}
									rst[rid][type][id]=rst[rid][type][id]||[]
									rst[rid][type][id].push([k,kk,j])
								}
							}
						}
					}
				}
			}
			
			//fuu,处理反向关系，对connect进行遍历处理
			console.log(JSON.stringify(rst))
			console.log('--------autoConnect end---------')
		},
		
		//重建数据的过程,需要进行计算返回到data里
		//fuu,暂时不用
		autoRebuild:function(target){
			//1.构建完整的关系树
			var rids=self.getRids(target),rt=self.getRelate(target)
			console.log('处理前'+JSON.stringify(rt))
			for(var i=0,len=rids.length;i<len;i++){
				var rid=rids[i],rst={}
				for(k in rt){
					//var b=self.getBasic(k,target)
					//console.log(b)
					if(k==rid){
						rst[k]=root.clone(rt[k])
					}else{
						if(!root.empty(rt[k])){
							/*for(kk in rt[k]){
								console.log(kk)
								rst[kk]=k
							}*/
							//console.log(JSON.stringify(rt[k]))
						}
					}
				}
				//console.log(JSON.stringify(rt))
			}
			console.log('处理后'+JSON.stringify(rst))
			console.log('-------------------------')
			//return rst
			
			//console.log('autoRebuild:数据构建完,调用重新计算函数,看看是不是要自动添加组件')
			//1.遍历关系数据,看是否要新添组件,push到队列里
			
			//2.判断时候需要进行autoStruct
			
			//把任务推到todo里，再进行一次auotoStruct
		},
			
		/*不同类型的component的调用方式
		 * @param	room	object		//房间的数据对象
		 * @param	rid		number	//房间号
		 * @param	target	string		//绘图区域的id
		 * @param	force	boolean	//是否强制刷新数据
		 * */
		autoStruct:function(room,rid,target,force){
			//root.debug('as:',true)
			if(!self.structCheckEntry(room,rid,target)) return
			
			//1.处理基础数据
			room = self.structCheckData(room)			//对数据进行转换
			self.structBasic(room,rid,target,force)			//同时对ps进行归零处理
			
			//2.对数据进行修正
			room=self.structChange(room,rid,target)			//处理数据修正
			room=self.structCorrectData(room,rid,target)	//根据basic对数据的正确性进行修正	
			
			//3.生成所有需要的基础数据,建立组件之间的关系
			self.structData(room,rid,target)
			self.structRelation(room,rid,target)	//初步检查房间涉及到的连接关系			
			//self.autoConnect(target)				//建立房间之间的关系,挂载到basic里
			//4.生成渲染器需要的数据
			var sroom=root.getMemory([me.memKeys.database,target,rid])
			self.structRenderData(sroom,rid,target)
			//root.debug('as:',true)
		},
		
		structConvert:function(target,cvt){
			var data={}
			var hooks=config.regHooks,mds=self.getRegs('module')
			for(var i=0;i<mds.length;i++){
				var cReg=mds[i]
				if(root[cReg][hooks.regConvert]){
					data[cReg]=root[cReg][hooks.regConvert](target,cvt)
				}
			}
			//console.log(data)
			return data
		},
		
		//计算房间组件之间的关系,仅计算房间？
		//fuu,还需要处理,可以进行双向选取,减少性能开销
		structRelation:function(room,rid,target){
			var rids=self.getRids(target),rst={}
			self.clearRelate(rid,target)
			if(rids.length>1){
				var ab=self.getBasic(rid,target),aro=ab.rotation,apos=ab.pos,psa=ab.ips
				var isIn=root.calc.isIn,toB=root.calc.pAtoB,toBs=root.calc.psAtoB

				for(var i=0,len=rids.length;i<len;i++){
					var tid=rids[i]
					if(rid!=tid){
						var troom=self.getRoom(tid,target),bb=self.getBasic(tid,target)
						var bro=bb.rotation,bpos=bb.pos,rg=bb.cps
						for(var j=0,alen=psa.length;j<alen;j++){
							if(isIn(toB(psa[j],aro,apos),toBs(rg,bro,bpos))){
								rst[tid]=rst[tid]===undefined?[]:rst[tid]
								rst[tid].push(j)
							}
						}
					}
				}
			}
			
			//每次只push一个房间的数据，autoBuilder里进行数据的处理
			if(!root.empty(rst)) self.setRelate(rst,rid,target)
			//console.log('relationship:'+JSON.stringify(root.getMemory(['db','#dwg','rlt'])))
		},
		
		//autoStruct调用的构建部分,分开写,这样方便调整
		structCheckEntry:function(data,rid,target){
			if(!data[config.motherReg]) return false
			var dd=data[config.motherReg],k=me[config.motherReg].mainKey
			if(!dd[k]) return false
			var ps=dd[k]
			if(!root.isType(ps,'array') || ps.length<3) return false
			return true
		},
		
		structCheckData:function(data){
			var hooks=config.regHooks
			var mds=self.getRegs('module')
			for(var i=0;i<mds.length;i++){
				var cReg=mds[i]
				if(data[cReg] && root[cReg][hooks.regCheck]){
					data[cReg]=root[cReg][hooks.regCheck](data[cReg])
				}
			}
			return data
		},
		
		structBasic:function(data,rid,target,force){
			var hooks=config.regHooks,keys=config.dataKeys
			var ks=me.memKeys,com=config.comTypes.module
			var cvt=self.getConvert(target)
			var chain=[ks.database,target,rid]
			if(force|| !root.getMemory(chain)){
				var bdata={}
				bdata[keys.basicKey]={}
				root.regMemory(bdata,chain,true)
			}
			
			var chain=[ks.database,target,config.struct.rooms.regKey]
			var rs=root.getMemory(chain)
			if(rs && !root.inArray(rid,rs)){
				rs.push(rid)
				root.regMemory(rs,chain,true)
			}
			
			var fun=root[config.motherReg]
			var cdata=fun[hooks.regFormat](data[config.motherReg],cvt)
			var basic=fun[hooks.regBasic](cdata,rid,target,cvt)
			var chain=[ks.database,target,rid,keys.basicKey]
			//console.log(basic)
			root.regMemory(basic,chain)
		},
		
		//处理main引发的change带来的数据修正
		structChange:function(data,rid,target){
			var msg=self.getMessage(target)
			if(root.empty(msg)) return data
			var hooks=config.regHooks
			for(mod in data){
				if(root[mod][hooks.regChange]){
					for(var i=0,len=msg.length;i<len;i++)
						data[mod]=root[mod][hooks.regChange](data[mod],msg[i])
				}
			}
			self.clearMessage(target)
			return data
		},
		
		//基础的数据修正，消除组件各自的明显数据错误
		structCorrectData:function(data,rid,target){
			var basic=self.getBasic(rid,target),cvt=self.getConvert(target)
			if(root.empty(basic)) return
			var hooks=config.regHooks,ks=me.memKeys
			var com=config.comTypes.module
			var mds=root.getMemory([ks.cache,com.regKey])
			var len=mds.structs.length
			for(var i=0;i<len;i++){
				var cReg=mds.structs[i]
				if(data[cReg] && root[cReg][hooks.regCorrect]){
					data[cReg]=root[cReg][hooks.regCorrect](data[cReg],basic,cvt)
				}
			}
			return data
		},
		
		
		//fuu,修改成按照data来进行遍历,减少循环的次数
		structData:function(data,rid,target){
			//console.log(JSON.stringify(data))
			var rlen=config.relateReg.length
			for(var i=0;i<rlen;i++) data[config.relateReg[i]]=data[config.motherReg].points
			
			var hooks=config.regHooks,keys=config.dataKeys,ckeys=config.connectHooks
			var ks=me.memKeys,com=config.comTypes.module
			var mds=self.getRegs('module'),mlen=mds.length
			var cvt=self.getConvert(target)
			for(var i=0;i<mlen;i++){
				var cReg=mds[i]
				if(data[cReg]){
					var dd=data[cReg]
					
					//1.生成基础数据节点
					var chain=[ks.database,target,rid,cReg]
					root.regMemory({},chain,true)
					
					//2.挂载基础数据
					var chain=[ks.database,target,rid,cReg,keys.dataKey]
					root.regMemory(dd,chain,true)
					
					var funs=root[cReg]
					var cdata=funs[hooks.regFormat](dd,cvt)
					var chain=[ks.database,target,rid,cReg,keys.cvtKey]
					root.regMemory(cdata,chain,true)
					
					//3.生成组件基础数据
					var chain=[ks.database,target,rid,cReg,keys.structKey]
					var dt=funs[hooks.regStruct]?funs[hooks.regStruct](cdata,basic,cvt,rid):[]
					root.regMemory(dt,chain,true)
					
					//4.处理section部分
					var basic=self.getBasic(rid,target)
					var secs=root.getMemory([ks.cache,com.regKey,'structs'])
					if(root.inArray(cReg,secs)&&funs[hooks.regSection]){
						var scts=funs[hooks.regSection](dt,basic[config.dataKeys.sectionKey])
						if(scts){
							var chain=[ks.database,target,rid,keys.basicKey,keys.sectionKey]
							root.regMemory(scts,[ks.database,target,rid,keys.basicKey,keys.sectionKey],true)
						}
					}
				}
			}
		},
		
		//fuu,这里有问题,调用了一个core不知道的值moduleHooks
		//调整到头部,可以进行正向访问
		structRenderData:function(data,rid,target){
			//console.log(JSON.stringify(data))
			var ks=me.memKeys,hooks=config.regHooks,keys=config.dataKeys,ckeys=config.connectHooks
			var cvt=self.getConvert(target),mds=self.getRegs('module')
			var basic=self.getBasic(rid,target),room=self.getRoom(rid,target)
			for(var i=0;i<mds.length;i++){
				var cReg=mds[i],dd=data[cReg]||false
				if(dd && cReg!=me.sectionReg){
					var rds=self.getRegs('render'),n=rds?rds.length:0
					for(var j=0;j<n;j++){
						var rd=rds[j]
						if(me[rd].auto || rd==self.getCurRender(target)){
							//1.按照渲染器生成数据
							var struct=me[rd].moduleHooks.struct
							if(root[cReg][struct]){
								var b=cReg==config.sectionReg?room:basic
								var rst=root[cReg][struct](dd[keys.structKey],b,rd,cvt,target)
								root.regMemory(rst,[ks.database,target,rid,cReg,me[rd].moduleHooks.dataKey],true)
							}
							//2.处理生成active绘制数据
							var active=me[rd].moduleHooks.activeStruct
							if(root[cReg][active]){
								var act=root[cReg][active](dd[keys.structKey],basic,rd,cvt,target)
								root.regMemory(act,[ks.database,target,rid,cReg,me[rd].moduleHooks.activeKey],true)
							}
						}
					}		
				}
			}
		},
		
		/*刷新一个组件的函数，用于减少autoStruct的计算量*/
		autoItem:function(data,mod,rid,target){
			if(!mod) return
			//1.构建基础数据
			//1.1 生成基础数据节点
			var hooks=config.regHooks,ks=me.memKeys,keys=config.dataKeys,ckeys=config.connectHooks
			var chain=[ks.database,target,rid,mod]
			var cvt=self.getConvert(target),basic=self.getBasic(rid,target)
			root.regMemory({},chain,true)
					
			//1.2 挂载基础数据
			var chain=[ks.database,target,rid,mod,keys.dataKey]
			root.regMemory(data,chain,true)
			var funs=root[mod]
			var cdata=funs[hooks.regFormat](data,cvt)
			var chain=[ks.database,target,rid,mod,keys.cvtKey]
			root.regMemory(cdata,chain,true)
					
			//1.3 生成组件基础数据
			var chain=[ks.database,target,rid,mod,keys.structKey]
			var dt=funs[hooks.regStruct]?funs[hooks.regStruct](cdata,basic,cvt,rid):[]
			root.regMemory(dt,chain,true)
			
			//2.构建渲染器数据
			var rds=self.getRegs('render'),n=rds?rds.length:0
			for(var j=0;j<n;j++){
				var rd=rds[j]
				if(me[rd].auto || rd==self.getCurRender(target)){
					var struct=me[rd].moduleHooks.struct
					if(root[mod][struct]){
						var rst=root[mod][struct](dt,basic,rd,cvt)
						root.regMemory(rst,[ks.database,target,rid,mod,me[rd].moduleHooks.dataKey],true)
					}
					
					var active=me[rd].moduleHooks.activeStruct
					if(root[mod][active]){
						var act=root[mod][active](dt,basic,rd,cvt)
						root.regMemory(act,[ks.database,target,rid,mod,me[rd].moduleHooks.activeKey],true)
					}
				}
			}
		},
		
		/* 检查哪个分段可以进行放置的函数
		 * @param	sct		array	//[width,type,id]类型的分段数据
		 * @param	adis	number	//组件的adis
		 * @param	scts	array	//[[width,type,id],[width,type,id],...]类型的分段数据
		 * @param	type	string	//被分段的组件类型
		 * 
		 * return
		 * false/分段的位置[id,id,...]
		 * */
		section:function(sct,adis,scts,type){
			type=type||config.sectionReg
			var rst=[],dd=0
			for(var i=0;i<scts.length;i++){
				var cur=scts[i]
				dd+=cur[0]
				if(dd>adis && (dd-cur[0])<adis+sct[0]){
					var offset=adis-dd+cur[0]
					var bdis=cur[0]-offset-sct[0]
					if(offset>0) rst.push([offset,type,cur[2]])
					rst.push(sct)
					if(bdis>0)rst.push([bdis,type,cur[2]])
				}else{
					rst.push(cur)
				}
			}
			return rst
		},
		
		
		/* 检查哪个分段可以进行放置的函数
		 * @param	sct		array	//[width,type,id]类型的分段数据
		 * @param	offset	number	//距离分段的前偏移
		 * @param	scts	array	//[[width,type,id],[width,type,id],...]类型的分段数据
		 * @param	type	string	//被分段的组件类型
		 * 
		 * return
		 * false/分段的位置[id,id,...]
		 * */
		checkSection:function(sct,offset,scts,type){
			type=type||config.sectionReg
			var rst=[]
			for(var i=0;i<scts.length;i++){
				var cur=scts[i]
				if(cur[1]==type && cur[0]>=(offset+sct[0])){
					rst.push(i)
				}
			}
			return rst
		},
		
		//fuu,需要处理todo的结构，形成array，减少其他的处理
		//setmessage会出现问题，因为一起做的todo，会被覆盖,message需要变成array的形式
		/*修改组件数据核心函数
		 *	@param	task	array	//[{mod:name,act:action,param:{name:data}},...]类型的数据
		 * 	@param	skip	boolean	//是否跳过不保存历史
		 * 	@param	rid		string	//房间号
		 * 	@param	target	string	//绘图容器号
		 *  return
		 * 	重新构建完整的绘图数据
		 * */
		//fuu,考虑统一module的输出,所有的组件都可以带message
		//fuu,message直接放在返回的itema里
		todo:function(task,skip,rid,target){
			if(root.empty(task) || !root.isType(task,'array')) return
			skip=(!!skip)||false	
			
			//1.处理历史数据
			if(!skip){self.hisSave(target)}
			
			//2.找到指定的组件进行数据处理
			var dt=self.getRoom(rid,target),room=self.dump(rid,target),arr=self.getRegs('module')
			var mds=root.getMemory([me.memKeys.cache,config.comTypes.module.regKey,'structs'])
			var len=task.length,mods=[],ndata={},ms=[]
			//console.log(JSON.stringify(task))
			for(var i=0;i<len;i++){
				var row=task[i]
				if(!row.mod) continue
				var mod=row.mod,act=row.act,p=row.param
				
				if(root.inArray(mod,arr)){
					//console.log('todo:不需要计算连接组件的同步操作,编辑是组织好todo队列')
					if(mod==config.motherReg && root.inArray(act,config.motherAction)){
						root.core.clearActive(target)
						if(act=='del'){
							//console.log('ready to remove room')
							
							self.clearRoom(rid,target)
						}else{
							//fuu,这里还有问题,两个房间的位置会相互影响
							var data=dt[mod][config.dataKeys.dataKey]
							var nroom=root.clone(room)
							nroom[mod]=root[mod][act](p,data)
							var kk=root.hash()
							self.autoStruct(nroom,kk,target,true)
						}
					}else{
						//console.log(JSON.stringify(row))
						var data=ndata[mod] ||dt[mod][config.dataKeys.dataKey]
						//fuu,这里获取计算结果的条目,所有的mod都带message回来
						var item=root[mod][act](p,data)
						if(act=='del' || act=='add') self.clearActive(target)	//去除高亮显示
						//fuu,这里以后调整可以让所有的组件都带message,通知其他的组件联动
						//可以设计好结构,联动到指定的组件,解决relate的关系
						if(root.inArray(mod,config.relateReg)){		//处理是否有通知消息的问题
							var pkey=me[config.motherReg].mainKey		//点数据的挂载位置
							//console.log(item)
							if(item.message!=undefined){
								var m=item.message
								var msg={change:true,wid:m.wid,add:m.add,rid:rid,dis:m.dis||0}
								self.setMessage(msg,target)
							}
							room[config.motherReg][pkey]=item.data
							ndata[mod]=root.clone(item.data)		//中间数据缓存
						}else{
							room[mod]=item						//写入新的数据
							ndata[mod]=root.clone(item)			//中间数据缓存
						}
					}
				}
				
				//判断更新条目是否为结构组件，提升性能
				if(!root.inArray(mod,mods) && !root.inArray(mod,mds) && !root.inArray(mod,config.relateReg)) mods.push(mod)
			}
			
			//3.重新构建数据
			if(mod==config.motherReg && root.inArray(act,config.motherAction)){
				
			}else{
				//console.log('todo items:'+JSON.stringify(mods))
				if(root.empty(mods))self.autoStruct(room,rid,target,true)
				else for(var i=0,len=mods.length;i<len;i++) self.autoItem(room[mods[i]],mods[i],rid,target)
			}
			return true
		},
		
		clearRoom:function(rid,target){
			var rs=self.getRids(target),rst=[]
			for(var i=0,len=rs.length;i<len;i++) if(rs[i]!=rid) rst.push(rs[i])
			root.regMemory(rst,[me.memKeys.database,target,config.struct.rooms.regKey],true)
			root.clearNode([me.memKeys.database,target,rid])
		},
		
		
		autoControl:function(target){
			
			var rd=root.getMemory([me.memKeys.database,target,config.struct.render.regKey])
			
			//1.直接调渲染器对应的控制器，由控制器来对设备进行处理
			var con=me[rd].controller
			var start=me[con].entryHooks.startFun
			if(root[con] && root[con][start]){
				root[con][start](target)
			}
			
			//2.按照渲染器对控制器进行绑定
			/*var cfun=me[rd].entryHooks.controlFun
			if(root[rd][cfun]){
				root[rd][cfun](target)
			}*/
		},
		
		autoRender:function(target,is){
			var ks=me.memKeys,st=config.struct
			
			//1.获取当前的渲染器,没有的话设置成默认渲染器
			var chain=[ks.database,target]
			var dd=root.getMemory(chain),crd=st.render.regKey
			if(!dd[crd]){
				//fuu,取出当前渲染器,同步用env里的,不然会出问题
				var cur=root.getMemory([ks.cache,config.comTypes.render.regKey,st.render.regKey])
				root.regMemory(cur,[ks.database,target,st.render.regKey],true)
			}else{
				var cur=dd[crd]
			}
			
			//2.关闭其他渲染器
			var rds=self.getRegs('render')
			for(var i=0;i<rds.length;i++){
				var rd=rds[i]
				if(rd!=cur)root[rd][me[rd].entryHooks.hiddenFun](target)
			}
			
			//3.处理插件数据,这个过程包括生成A，B两个坐标系的数据，这里是不一样的地方
			self.clearPlugin(target)
			self.autoPlugin(target)
			
			//4.绘制渲染器数据
			var dwg=me[cur].entryHooks.dwgFun
			if(root[cur][dwg]) root[cur][dwg](target,is)
			
			//5.绘制active数据
			root[cur][me[cur].entryHooks.activeFun](target)
		},
		
		//1.按照module进行一样处理,调用plugin里的hook
		//2.直接调用同名的hook,再按照渲染器遍历
		autoPlugin:function(target){
			var pns=self.getRegs('plugin')
			if(root.empty(pns)) return
			
			//1.构建plugin的数据
			var st=config.pluginHooks.struct
			for(var i=0;i<pns.length;i++){
				var pn=pns[i]
				if(root[pn][st]) root[pn][st](target)
			}
			
			//2.绘制plugin的数据
			var dwg=config.pluginHooks.show
			for(var i=0;i<pns.length;i++){
				var pn=pns[i]
				if(root[pn][dwg]) root[pn][dwg](target)
			}
		},
		
		//清理plugin数据的主入口
		clearPlugin:function(target){
			var pns=self.getRegs('plugin')
			var rms=self.getRids(target)
			for(var i=0;i<pns.length;i++){
				var pn=pns[i]
				if(root[pn][config.pluginHooks.clear]){
					var clear=root[pn][config.pluginHooks.clear]
					for(var j=0,rlen=rms.length;j<rlen;j++)	clear(rms[j],target)
				}
			}
		},
		
		/*	格式转换的操作
		 *	@param		data		object		//{type:name,id:id}	源组件
		 * @param		mod		string		//type目标组件
		 * @param		rid		string		//房间id
		 * @param		target	string		//绘制对象
		 * 
		 * */
		translate:function(data,mod,rid,target){
			//格式转换,切换数据的位置和节点,统一调用
		},		
		
		hisSave:function(target){		//保存一个历史数据
			
			//fuu,需要补充对历史长度的处理,保存30步
			var rids=self.getRids(target),arr=[]
			for(var i=rids.length-1;i>=0;i--) arr.push(self.dump(rids[i],target))
			return root.queueAdd(arr,target)
		},
		hisClear:function(target){		//清除历史数据
			return root.queueClear(target)
		},
		hisBack:function(target){		//历史数据倒退
			var data=root.queuePop(target)
			root.queueAdd(data,config.history.forward)
			return data
		},
		hisForward:function(target){		//历史数据前进
			return root.queuePop(config.history.forward)
		},
		
		//备份数据方法，开始绘制的时候备份一个数据出来
		backup:function(target){
			return localStorage.setItem(target,JSON.stringify(root.getQueue(target)))
		},
	}
	
	root.regComponent(reg)
})(window.T)

/****calc****/
;(function(root){
	var reg={
		name:'calc',
		type:'lib',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	var self=reg[me.funKey]={
		init:function(){},
		/*jie:function(n){
			if(n>1) return n*self.jie(n-1)
			else return 1
		},
		jieb:function(n){
			switch (n){
				case 1:
					return 1;
					break;
				default:
					return n*self.jieb(n-1)
					break;
			}
		},*/
		
		//需要复核一下，如果[0,0]正常，可以优化算法
		calcArea:function(ps){
			var len=ps.length,mj=0
			if(len<3) return false
			var pa=[0,0]
			for(var i=0;i<len;i++){
				var pb=ps[i],pc=i==(len-1)?ps[0]:ps[i+1]
				var ja=pb[0]*pc[1]-pc[0]*pb[1]
				var jb=pa[0]*pc[1]-pa[0]*pc[0]
				var jc=pa[0]*pb[1]-pa[0]*pb[1]
				mj+=(ja-jb+jc)/2
			}
			return mj
		},
		calcGirth:function(ps){
			var len=ps.length,dis=0
			if(len<3) return false
			for(var i=0;i<len;i++) dis+=self.ppDis(ps[i],i==(len-1)?ps[0]:ps[i+1])
			return dis
		},
		calcAxes: function (pa, pb, ak, bk) {
            var abk = ak - bk + Math.PI, s = Math.sin(abk), c = Math.cos(abk)
            return { rotate: abk, pos: [pa[0] - pb[0] * c + pb[1] * s, pa[1] - pb[0] * s - pb[1] * c] }
		},       
        disToAx: function (d, a) {
            return [-d * Math.sin(a), d * Math.cos(a)]
        },
        
        boxPosCalc: function (box, pos, ro) {
        		var zo=pos[2]?pos[2]:0,cen = [0, 0], start = [0 - parseInt(box[0] / 2), parseInt(box[1] / 2)]
            var np = self.pRotate(start, cen, ro), rp = self.axMove(cen, pos, np)
            return { position: [rp[0], rp[1], box[2] / 2+zo], rotation: ro }
        },
        
        extCross: function (a, b, c, d) {
            var pD_x = a[0], pD_y = a[1], pA_x = b[0], pA_y = b[1], pC_x = c[0], pC_y = c[1], pB_x = d[0], pB_y = d[1]
            var k_y = (pB_x * pC_y * pD_y - pD_x * pB_y * pC_y - pA_y * pB_x * pD_y + pD_x * pB_y * pA_y + pC_x * pA_y * pD_y - pA_x * pC_y * pD_y - pC_x * pB_y * pA_y + pA_x * pB_y * pC_y) /
		        (pD_y * pC_x - pA_x * pD_y - pB_y * pC_x + pA_x * pB_y + pB_x * pC_y - pD_x * pC_y - pA_y * pB_x + pA_y * pD_x)
            var k_x = (pD_y * (pC_x - pA_x) * (pB_x - pD_x) - pA_y * (pC_x - pA_x) * (pB_x - pD_x) + pA_x * (pC_y - pA_y) * (pB_x - pD_x) + pD_x * (pD_y - pB_y) * (pC_x - pA_x)) /
		        ((pC_y - pA_y) * (pB_x - pD_x) + (pD_y - pB_y) * (pC_x - pA_x))
            if (isFinite(k_x) && isFinite(k_y)) return [k_x, k_y]
            else return false
        },
        
        //顺时针方向，左下角开始
        offset: function (ps, d, a) {
	        var zj=Math.PI/2,ac=Math.PI/4,np=self.newPoint
	        return [np(ps[0], d, a + zj +ac),np(ps[1], d, a - zj -ac),np(ps[2], d, a - ac),np(ps[3], d, a + ac)]
        },
        
        noffset:function(ps,d,close,isin){
        	isin=isin==undefined?false:isin
        	close=close==undefined?false:close
        	var ro=[]
        	var cross=self.cross,zj=Math.PI/2,nps=[],np=self.newPoint
        	for (var i = 0,len=ps.length; i < len; i++) {
				var p1 = ps[i],p2=(i == (len - 1))?ps[0]:ps[i + 1]		
				var dx =p2[0]-p1[0],dy =p2[1]-p1[1]
				if(dx==0 && dy==0){
					ro[i]=i==0?ro[len-1]+zj:ro[i-1]+zj
				}else{
					ro[i] = Math.atan((p2[1] - p1[1]) / (p2[0] - p1[0]))		
					if (p2[0] < p1[0]) ro[i] += zj+zj
				}
			}
        	for(var i=0,len=ps.length;i<len;i++){
        		var pre=i==0?len-1:i-1,next=i==len-1?0:i+1
        		var pa=ps[i],ra=ro[i],rn=ro[next],rp=ro[pre]
        		nps[i]=(!close && i==0)?np(pa,d,ra-zj):(!close && i==len-1)?np(pa,d,ro[pre]-zj):cross(pa,rp,d,ra,d,isin)
        		//console.log('点:'+JSON.stringify(pa)+',前角度:'+rp+',当前角度:'+ra+',内偏移:'+isin+',自动闭合:'+close+',计算结果:'+JSON.stringify(nps[i]))
        	}
        	return nps
        },
        
        
        mid:function(pa,pb){return [(pa[0]+pb[0])/2,(pa[1]+pb[1])/2]},       
        cross: function (p, a, da, b, db, isin) {
        	
            var k = isin ? b - a : a - b, ba = da / Math.sin(k), bb = db / Math.sin(k)
            var pa = [p[0] - bb * Math.cos(a), p[1] - bb * Math.sin(a)]
            var pb = [p[0] + ba * Math.cos(b), p[1] + ba * Math.sin(b)]
            return k==0?self.newPoint(p, da, a + isin?Math.PI/2:-Math.PI / 2):[pa[0] + pb[0] - p[0], pa[1] + pb[1] - p[1]]
        },
        
		isIn: function (p, ps) {
            var len = ps.length, left = 0,  n = 0
            if (len < 3) return false
            if (len == 4 && self.isLine(ps[0], ps[1], ps[2])) return false
            for (var i = 0; i < len; i++) {
                var p1 = ps[i], p2 = (i == (len - 1)) ? ps[0] : ps[i + 1]
                //fuu,判断在一条线上的函数有问题
                //if (T.fn[me.funKey].isLine(p, p1, p2)) return true

                if (p1[0] < left) left = p1[0]
            }
            for (var i = 0; i < len; i++) if (self.isCross([(left - 1), p[1]], p, ps[i], (i == (len - 1)) ? ps[0] : ps[i + 1])) n++
            if (n % 2 > 0) return true
            return false
        },
        
        /* 用于检测点是否在线组上
         * @param	psa	array	//[[x,y],[x,y],...]类型的点
         *@param	psb	array	//[[x,y],[x,y],...]类型的闭合线组,线组或者[line,line,非闭合线组]
         * @param close	boolean	//是否自动将后部的点组自动变成先组	
         * return 在线上的关系
         * */
        edge:function(psa,psb,close){
        		var rst=[]
        		for(var i=psa.length-1;i>=0;i--){
        			if(close){
        				for(var j=0,len=psb.length;j<len;j++)if(self.isLine(psa[i],psb[j],psb[(j==(len-1))?0:j+1])) rst.push([i,j]) 
  				}else{ 
  					for(var j=0,len=psb.length;j<len;j++)if(self.isLine(psa[i],psb[j][0],psb[j][1])) rst.push([i,j]) 
        			}
        		}
        		return root.empty(rst)?false:rst
        },
        
        isCross: function (a, b, c, d) {
            var abc = (a[0] - c[0]) * (b[1] - c[1]) - (a[1] - c[1]) * (b[0] - c[0]), abd = (a[0] - d[0]) * (b[1] - d[1]) - (a[1] - d[1]) * (b[0] - d[0])
            if (abc * abd >= 0) return false
            var cda = (c[0] - a[0]) * (d[1] - a[1]) - (c[1] - a[1]) * (d[0] - a[0]), cdb = cda + abc - abd
            if (cda * cdb >= 0) return false
            return true
        },
        
        isLine: function (a, b, c) {return Math.round((a[1] - b[1]) * (a[0] - c[0])*100) == Math.round((a[0] - b[0]) * (a[1] - c[1]) * 100)?true:false},
        onLine:function(cp,a,b){
        	
        },
		padding:function(ps){
			var pad=[]
			for(var i=0,len=ps.length;i<len;i++){
				var p=ps[i]
				pad[0]=(pad[0]==undefined)?p[1]:(p[1]<pad[0]?pad[0]:p[1])
				pad[1]=(pad[1]==undefined)?p[0]:(p[0]>pad[1]?p[0]:pad[1])
				pad[2]=(pad[2]==undefined)?p[1]:(p[1]>pad[2]?pad[2]:p[1])
				pad[3]=(pad[3]==undefined)?p[0]:(p[0]<pad[3]?p[0]:pad[3])
			}
			return pad
		},
		
		merge:function(ps){
			var len=ps.length
			if(len<3) return
			var pad=self.padding(ps),dy=pad[2],dx=pad[3],nps=[]
			for(var i=0;i<len;i++){
				var p=ps[i]
				nps[i]=[p[0]-dx,p[1]-dy]
				if(p[2]!=undefined)nps[i][2]=p[2]
			}
			var cen = [(pad[1] - pad[3]) / 2, (pad[0] - pad[2]) / 2]
			return {points:nps,offset:[dx,dy],center:cen,pad:pad}
		},
		ppDis:function(pa,pb){ return Math.sqrt(Math.pow((pa[0] - pb[0]), 2) + Math.pow((pa[1] - pb[1]), 2))},
		
		psAngle: function (ps) {
            var x1 = ps[0][0], x2 = ps[1][0],y1 = ps[0][1],y2 = ps[1][1],dx = x2 - x1,dy = y2 - y1,ak = Math.atan(dy / dx)
            return x2<x1?ak+Math.PI:ak
		},
		
		ppAngle:function(pa,pb){
            return Math.atan((pb[1] - pa[1])/(pb[0] - pa[0]))
		},
		
		deltaAngle:function(pa,pb,cen){
			var ak=self.anClean(self.ppAngle(cen,pb)-self.ppAngle(cen,pa))
			return ak>Math.PI?ak-Math.PI:ak
		},
		
        plumb:function(p,line){
        		var pa=line[0],pb=line[1],k = ((p[0]-pa[0])*(pb[0]-pa[0])+(p[1]-pa[1])*(pb[1]-pa[1]))/((pb[0]-pa[0])*(pb[0]-pa[0]) + (pb[1]-pa[1]) * (pb[1]-pa[1]))
            return [pa[0] + k * (pb[0] - pa[0]), pa[1] + k * (pb[1] - pa[1])]
        },
        pDisLine:function(p,line){
        		var pa=line[0],pb=line[1],a = pb[1] - pa[1],b = pa[0] - pb[0],c = pb[0] * pa[1] - pa[0] * pb[1]
            return Math.abs((p[0] * a + b * p[1] + c) / Math.sqrt(a * a + b * b))
        },
        psRotate: function (ps, o) {
            var pp = self.merge(ps), c = pp.center, nps = []
            for (var i = 0; i < pp.points.length; i++) nps[i] = self.pRotate(pp.points[i], c, o)
            return self.merge(nps)
        },
        newPoint: function (p, d, a) { return [Math.round(p[0] + d * Math.cos(a)), Math.round(p[1] + d * Math.sin(a))] },
		psAtoB: function (ps, a, o) {
            var nps = []
            for (var i = 0; i < ps.length; i++) { nps[i] = self.pAtoB(ps[i], a, o) }
            return nps
        },
        pAtoB: function (p, a, o) {
            var s = Math.sin(a), c = Math.cos(a)
            return [o[0] + p[0] * c - p[1] * s, o[1] + p[0] * s + p[1] * c]
        },
        pBtoA: function (p, a, o) {
            var s = Math.sin(a), c = Math.cos(a)
            return [ (p[0]-o[0])*c+(p[1]-o[1])*s, (o[0]-p[0]) * s + (p[1]-o[1])* c]
        },
        pBtoC: function (p, s, o, px) {
            var mm = px * s
            return [Math.ceil((p[0] + o[0]) * mm), Math.ceil((p[1] + o[1]) * mm)]
        },
        pCtoB: function (p, s, o, m, px) {
            var mm = px * s / m
            return [p[0] / mm - o[0], p[1] / mm - o[1]]
        },
       	pRotate: function (p, c, a,is) {
       	 	var b=is?Math.atan((c[1]-p[1])/(c[0]-p[0])):0
        		var ss=Math.sin(a+b),cs=Math.cos(a+b)
			return [(p[0]-c[0])*cs-(p[1]-c[1])*ss+c[0],(p[0]-c[0])*ss+(p[1]-c[1])*cs+c[1]]
        },
        pMove: function (p, a, b) { return [p[0] + b[0] - a[0], p[1] + b[1] - a[1]] },
        disToDirect:function(dx,dy,a){
        	return dx*Math.cos(a)+dy*Math.sin(a)
        },
        axMove: function (p, a, b) { return [p[0] - b[0] + a[0], p[1] - b[1] + a[1]] },
        disCtoB: function (d, a, s, m, p) { if (a == undefined) { a = 0 } return m * d / (p * s)},
        disBtoC: function (d, a, s, m, p) { if (a == undefined) { a = 0 } return d * p * s / m },
        toF: function (a,fix){fix=fix||3;return parseFloat(a.toFixed(fix))},
        arrToF: function (a,fix) { fix=fix||3;var r = []; for (i = 0, x = a.length; i < x; i++) r[i] = parseFloat(a[i].toFixed(fix)); return r },
		dash:function(ps,d){
			var dis=self.ppDis(ps[0],ps[1]),ak=self.psAngle(ps),dw=d+d,n=Math.floor(dis/dw),ed=dis%dw
			var ds=[],np=self.newPoint
			for(var i=0;i<n;i++) ds.push([np(ps[0],i*dw,ak),np(ps[0],i*dw+d,ak)])
			var ep=ed>d?np(ps[0],i*dw+d,ak):ps[1]
			ds.push([np(ps[0],i*dw,ak),ep])
			return ds
		},
		approx:function(n,arr,step,dx){
			var narr=[]
			for(var i=0,len=arr.length;i<len;i++){
				var dis=arr[i]+n,d=dis%step
				if(d<dx)narr.push([d,-1])
				if(step-d<dx)narr.push([step-d,1])
			}
			
			if(narr){
				var min=step,tag=-1
				for(var i=0,nlen=narr.length;i<nlen;i++)if(narr[i][0]<min)tag=i
				if(!(tag<0))n+=narr[tag][1]*narr[tag][0]
			}
			return n
		},
		/*	点吸附操作
		 *	@param	p		array	//[[x,y],[x,y],...]点阵数组
		 * 	@param	dis		number	//吸附距离
		 * 	@param	ps		array	//[[x,y],[x,y],...]点阵数组
		 * 	@param	isPoint	boolean	//是否需要判断点吸附
		 * 	@param	isIn	boolean	//是否判断在线上
		 * 	return
		 * 	计算出吸附在线上的点相对于p的位差
		 * 	{dis:number,delta:[dx,dy],id:ps index,isPoint:true}
		 * */
		adsorb:function(arr,dis,ps,isPoint,isIn){
			var pDisLine=self.pDisLine,ppDis=self.ppDis
			for(var pi=arr.length-1;pi>=0;pi--){
				var p=arr[pi]
				if(isPoint){				
					var adis=undefined,pid=undefined
					for(var i=0,len=ps.length;i<len;i++){
						var pa=ps[i],ndis=ppDis(p,pa)
						if((adis==undefined && ndis<dis) || (ndis<dis && ndis<adis) ){
							adis=ndis
							pid=i
						}
					}
					if(adis!=undefined) return {dis:adis,delta:[ps[pid][0]-p[0],ps[pid][1]-p[1]],isPoint:true,id:pid}
				}
				
				var rst={}
				for(var i=0,len=ps.length;i<len;i++){
					var pa=ps[i],pb=i==(len-1)?ps[0]:ps[i+1],pdis=pDisLine(p,[pa,pb])
					if(pdis<dis) rst={dis:pdis,ps:[pa,pb],tag:i}
				}
				if(root.empty(rst)) return false
				
				//计算垂直点的位移
				var pp=self.plumb(p,rst.ps)
				if(isIn){
					var pa=rst.ps[0],pb=rst.ps[1]
					if((pp[0]>pa[0]&&pp[0]>pb[0])||(pp[0]<pa[0]&&pp[0]<pb[0])) return false
				}
				var rt={dis:rst.dis,delta:[pp[0]-p[0],pp[1]-p[1]],id:rst.tag}
				return rt
			}
		},
		anClean: function (a) {
            var x = Math.PI + Math.PI
            if (a < 0) return self.anClean(a + x)
            if (a >= x) return self.anClean(a - x)
            return a
       },
        akRtoN:function(n){return Math.PI*self.anClean(n)/180},
	    akNtoR:function(n){return 180*n/Math.PI},
	}
	root.regComponent(reg)
})(window.T)
/*****angular*****/

;(function(root){
	var reg={
		name:'angular',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		report:{
			length:0,			//踢脚线长度
			height:0,			//踢脚线高度
		},
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)

/*****beam******/
;(function(root){
	var reg={
		name:'beam',
		type:'module',
		category:'',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#EFEFEF',
				color: '#95C2E8',
				dash:'#778899',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#EFEFEF',
				color: '#95C2E8',
				dash:'#778899',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#EFEFEF',
				color: '#332222',
				//dash:'#778899',
				dash:'#FF8899',
				active:'',
				mask:'',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,			//是否为结构组件
		order:4,				//加载顺序
		theme:theme,
		name:'结构梁',
		relate:[['start','mp'],['end','mp'],['center','mp']], 		//参与吸附计算的节点位置
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,			//换墙的移动距离，用来体现用力拉过去
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			copy:0.1,				//复制时的位置偏移
			minWidth:0.2,			//最小开洞尺寸
		},
		//输出数据
		report:{
			surface:0,		//增删的墙面面积
			space:0,			//增删的容积
			width:0,			//洞总宽
			height:0,			//洞高
		},
		//其他配置在这里
		
		defaultData:[0,0.3,0.3,0],	//[wid,y,z,oy]注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB
			var pos=b.pos,ro=b.rotation
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false}})
					rst.line.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{dash:true,dis:50,detail:false}})
				}
			}
			return rst
		},
		
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.noffset
			var pos=b.pos,ro=b.rotation,os=config.active.offset*cvt	
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					rst.line.push({ps:offset(toB(rec,ro,pos),os,true),cfg:{dash:false}})
					
					arr[i]=rst
				}
			}
			return arr
		},
		threeStruct:function(ds,b,rd,cvt){
			var rst={}
			
			return rst
		},
		threeActive:function(ds,b,rd,cvt){
			var rst={}
			
			return rst
		},
		/*插件数据处理区*/
		
		//action的判断，如果存在动作的话，就进行help显示和check的生成
		twoSize:function(id,dt,b,cfg){
			var rst=[]
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end
			var ak=b.angle[wid],zj=Math.PI/2
			
			rst.push({ps:[st.op,st.ip],left:false,angle:ak+zj,size:dd.y,name:'wy',})
			rst.push({ps:[ed.ip,ed.op],left:false,angle:ak-zj,size:dd.y,name:'wy',})
			rst.push({ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,name:'wx',})
			rst.push({ps:[st.ip,ed.ip],left:false,angle:ak,size:dd.x,name:'wx',})
			return rst
		},
		
		/*屏幕操作方法区域*/
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return {task:[todo]}
		},
		gesturemove:function(){
			//fuu,缩放操作支持好基本就OK了
		},
		
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			var type=[
				{icon:'doorPing',		reg:'doorPing',	param:{todo:null}},
				{icon:'doorTui',		reg:'doorTui',		param:{todo:null}},
				{icon:'doorEntry',	reg:'doorEntry',	param:{todo:null}},
			]
			return [
					{type:'label',	title:'组件',		data:config.name,	action:{}},
					{type:'number',	title:'高度',		data:dt.z,			action:{'blur':function(val){return [self.ctlWz(val,id,cvt)]}}	},
					{type:'number',	title:'深度',		data:dt.y,			action:{'blur':function(val){return [self.ctlWy(val,id,cvt)]}}	},
					{type:'number',	title:'离墙距离',	data:dt.yo,			action:{'blur':function(val){return [self.ctlOy(val,id,cvt)]}}	},
					{type:'number',	title:'离地高度',	data:dt.zo,			action:{'blur':function(val){return [self.ctlOz(val,id,cvt)]}}	},
				]
		
		},
		pop:function(room,id,tg){
			var keys=me.core.dataKeys
			var b=room[keys.basicKey],sss=b[keys.sectionKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][keys.structKey],dt=ds[id],wid=dt.wid,wx=b.dis[wid]
			var check=root.core.checkSection
			
			//处理复制的位置
			var dis=config.dis.copy*cvt,dx=dt.x,len=b.ips.length
			var sct=[dx,reg.name,ds.length],scts=sss[wid]
			var arr=check(sct,dis,scts)
			if(root.empty(arr)){
				var nid=wid==(len-1)?0:wid+1,nscts=sss[nid],narr=check(sct,dis,nscts)
				if(!root.empty(narr)){
					var adis=0,sid=nid,nsn=narr[0],adis=dis
					for(var i=0;i<nsn;i++) adis+=nscts[i][0]
				}
				
				if(adis==undefined){
					var pid=wid==0?(len-1):wid-1,pscts=sss[pid],parr=check(sct,dis,pscts)
					if(!root.empty(parr)){
						var adis=0,sid=pid,psn=parr[0],adis=dis
						for(var i=0;i<psn;i++) adis+=pscts[i][0]
					}
				}
			}else{
				var adis=0,sid=wid
				var sn=arr[0],adis=dis
				for(var i=0;i<sn;i++) adis+=scts[i][0]
			}
			//处理复制的adis问题
			var sub_opt=[
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
					{title:'满铺',type:'button',close:true,name:'full',	data:wx,action:self.ctlFull},
				]
			
			if(adis!=undefined&& sid!=undefined){
				sub_opt.push({title:'复制',type:'button',close:true,name:'copy',	data:{dis:adis,x:dx,id:sid},action:self.ctlCopy})
			}
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			
			return list
		},
		
		
		/*控制区操作函数*/
		ctlNew:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{wid:id,adis:0}}
		},
		ctlFull:function(data,id,cvt){
			return {mod:reg.name,act:'set',param:{id:id,adis:0,x:data/cvt}}
		},
		ctlCopy:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{adis:data.dis/cvt,x:data.x/cvt,wid:data.id}}
		},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlAdis:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data?{mod:reg.name,act:'set',param:{id:id,adis:root.calc.toF(data/cvt)}}:false
		},
		ctlBdis:function(data,id,cvt){
			//示例代码，实现Bdis的功能，注意不要撑破
			
		},
		
		ctlThick:function(data,id,cvt){
			
		},
		ctlWx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data?{mod:reg.name,act:'set',param:{id:id,x:root.calc.toF(data/cvt)}}:false
		},
		ctlWy:function(data,id,cvt){
			
		},
		ctlWz:function(data,id,cvt){
			
		},
		
		ctlOx:function(data,id,cvt){},
		ctlOy:function(data,id,cvt){},
		ctlOz:function(data,id,cvt){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				var dd=arr[i],wid=dd[0],yw=dd[1],zw=dd[2],yo=dd[3]
				var ak=b.angle[wid],zj=Math.PI/2
				var sip=b.ips[wid],eip=np(sip,b.dis[wid],ak)
				var start={ip:np(sip,yw,ak+zj),mp:np(sip,yw/2,ak+zj),op:sip}
				var end={ip:np(eip,yw,ak+zj),mp:np(eip,yw/2,ak+zj),op:eip}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,start:start,end:end,center:cen,angle:ak,check:tap,x:b.dis[wid],y:yw,z:zw,
					adis:0,bdis:0,zo:b.height-zw,yo:yo
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt)]
			}
			return r
		},

		SB221NC:function(arr,scts){
			//console.log(JSON.stringify(arr))
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		
		relate:function(ra,rb){
			
			
		},
		
		//数据修正检测函数，对基础错误的数据进行纠正
		correctData:function(data,b,cvt){
			var rst=[],min=config.dis.minWidth
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i]
				var wid=row[0],adis=row[1],w=row[2],wallx=b.dis[wid]/cvt
				if(wallx>=adis+w){
					rst.push(row)
				}else if(wallx>w && wallx<adis+w){
					row[1]=wallx-w
					rst.push(row)
				}else if(wallx>=min && wallx<=w){
					row[1]=0
					row[2]=wallx
					rst.push(row)
				}
			}
			return rst
		},
		
		changeData:function(data,msg){
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid>=msg.wid)row[0]+=-1
					else if(wid==0)row[0]=0
				}
				rst.push(row)
			}
			return rst
		},
		
		//格式检测函数,对各个位置进行处理,注意检测关键位置，类型不对的数据可以丢弃
		checkData:function(data){
			return data
		},
		report:function(dt,cvt){
			var rst={wall:0,space:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			
			return rst
		},

		/*数据增删改区域 */
		add:function(p,dt){
			dt.push(self.data(p))
			return dt
		},		
			
		set:function(p,dt){
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},

		del:function(p,dt){
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)rst.push(dt[i])
			return rst
		},
		
		//将原始数据转换成通用数据的操作
		//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		data:function(p,data){
			var dd=data || root.clone(config.defaultData)
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			return dd
		},			
	}
	
	root.regComponent(reg)
})(window.T)

/******ceilingArchitrave*****/
;(function(root){
	var reg={
		name:'ceilingArchitrave',
		//info:'线脚吊顶',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)

/*****ceilingHang******/
;(function(root){
	var reg={
		name:'ceilingHang',
		//info:'造型吊顶',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)

/*****dong******/
;(function(root){
	var reg={
		name:'dong',
		type:'module',
		category:'door',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				dash:'#778899',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				dash:'#778899',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				//dash:'#778899',
				dash:'#FF8899',
				active:'',
				mask:'',
			},
		}
	
	var config={
		isConnect:true,			//是否参与连接检测
		isStruct:true,			//是否为结构组件
		order:3,				//加载顺序
		name:'开洞',				//组件显示名称
		theme:theme,
		relate:[['start','mp'],['end','mp'],['center','mp']], 		//参与吸附计算的节点位置
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,			//换墙的移动距离，用来体现用力拉过去
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			copy:0.1,				//复制时的位置偏移
			minWidth:0.2,			//最小开洞尺寸
		},
		//其他配置在这里
		defaultData:[0,0.1,1.2,2.4],	//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		three:{
			color:0xCCFF99,
		},
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB
			var pos=b.pos,ro=b.rotation
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false,relate:rd,detail:false}})
					rst.line.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{dash:true,dis:100,detail:false}})
				}
			}
			return rst
		},
		
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	

					rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					
					arr[i]=rst
				}
			}
			return arr
		},
		threeStruct:function(ds,b,rd,cvt){
			var rst = {meshes: [], lights: [], rays:[],show:true}
			var transA=root.calc.boxPosCalc,np=root.calc.newPoint,toB=root.calc.pAtoB
			var bpos=b.pos,bro=b.rotation
			for(var i=0,len=ds.length;i<len;i++){
				var dt=ds[i],ro=dt.angle
				var box=[dt.x,dt.y,dt.z]
				var pos=np(dt.start.ip,b.thick[dt.wid]/2,ro-Math.PI/2)
				pos[2]=b.height-dt.zo-dt.z
				var rr=transA(box,pos,ro),npos=toB([rr.position[0],rr.position[1]],bro,bpos)
				npos[2]=rr.position[2]
				rst.meshes.push({type:'box',data:box,pos:npos,rotation:rr.rotation,color:config.three.color})
			}
			return rst
		},
		threeActive:function(ds,b,rd,cvt){
			var rst={}
			
			return rst
		},
		/*插件数据处理区*/
		
		//action的判断，如果存在动作的话，就进行help显示和check的生成
		twoSize:function(id,dt,b,cfg){
			var rst=[]
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			
			rst.push({ps:[xps[wid],st.op],		left:true,angle:ak,size:dd.adis,name:'adis',title:'边距'})
			rst.push({ps:[st.op,ed.op],			left:true,angle:ak,size:dd.x,name:'width',title:'宽度'})
			rst.push({ps:[ed.op,yps[wid]],		left:true,angle:ak,size:dd.bdis,name:'bdis',title:'边距'})
			rst.push({ps:[ips[wid],ips[nwid]],	left:false,angle:ak,name:'wall',title:'墙宽',size:b.dis[wid]}	)
			
			return rst
		},
		
		/*屏幕操作方法区域*/
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			//补充处理吸附的问题，如果basic里有关联的洞在吸附范围内即吸附
			//如果有墙直接关联,在结果里生成新的洞
			
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return {task:[todo]}
		},
		gesturemove:function(){
			//fuu,缩放操作支持好基本就OK了
		},
		
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			
			var ro=[
				{icon:'door01',reg:'doorPing',param:{rotate:0}},
				{icon:'door02',reg:'doorPing',param:{rotate:1}},
				{icon:'door03',reg:'doorPing',param:{rotate:2}},
				{icon:'door04',reg:'doorPing',param:{rotate:3}},
			]
			
			var type=[
				{icon:'doorPing',		reg:'doorPing',	param:{todo:null}},
				{icon:'doorTui',		reg:'doorTui',		param:{todo:null}},
				{icon:'doorEntry',	reg:'doorEntry',	param:{todo:null}},
			]
			return [
					{type:'label',	title:'房间',	data:b.name,},
					{type:'label',	title:'组件',	data:config.name,	action:{}},
					{type:'bool',	title:'门框',	data:true,			action:{'click':function(val){console.log(val)}}	},
					{type:'number',	title:'宽度',	data:dt.x,			action:{'blur':function(val){return [self.ctlWx(val,id,cvt)] }}	},
					{type:'number',	title:'高度',	data:dt.z,			action:{'blur':function(val){return [self.ctlWz(val,id,cvt)] }}	},
					{type:'number',	title:'深度',	data:dt.y,			action:{'blur':null}	},
					{type:'number',	title:'左距',	data:dt.adis,		action:{'blur':function(val){return [self.ctlAdis(val,id,cvt)] }}	},
					{type:'number',	title:'右距',	data:dt.bdis,		action:{'blur':function(val){return [self.ctlAdis(dt.adis+dt.bdis-val,id,cvt)] }}	},
			]
		},
		pop:function(room,id,tg){
			var keys=me.core.dataKeys
			var b=room[keys.basicKey],sss=b[keys.sectionKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][keys.structKey],dt=ds[id],wid=dt.wid,wx=b.dis[wid]
			var check=root.core.checkSection
			
			//处理复制的位置
			var dis=config.dis.copy*cvt,dx=dt.x,len=b.ips.length
			var sct=[dx,reg.name,ds.length],scts=sss[wid]
			var arr=check(sct,dis,scts)
			if(root.empty(arr)){
				var nid=wid==(len-1)?0:wid+1,nscts=sss[nid],narr=check(sct,dis,nscts)
				if(!root.empty(narr)){
					var adis=0,sid=nid,nsn=narr[0],adis=dis
					for(var i=0;i<nsn;i++) adis+=nscts[i][0]
				}
				
				if(adis==undefined){
					var pid=wid==0?(len-1):wid-1,pscts=sss[pid],parr=check(sct,dis,pscts)
					if(!root.empty(parr)){
						var adis=0,sid=pid,psn=parr[0],adis=dis
						for(var i=0;i<psn;i++) adis+=pscts[i][0]
					}
				}
			}else{
				var adis=0,sid=wid
				var sn=arr[0],adis=dis
				for(var i=0;i<sn;i++) adis+=scts[i][0]
			}
			//处理复制的adis问题
			var sub_opt=[
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
					{title:'满铺',type:'button',close:true,name:'full',	data:wx,action:self.ctlFull},
				]
			
			if(adis!=undefined&& sid!=undefined){
				sub_opt.push({title:'复制',type:'button',close:true,name:'copy',	data:{dis:adis,x:dx,id:sid},action:self.ctlCopy})
			}
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			
			return list
		},
		
		
		/*控制区操作函数*/
		ctlNew:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{wid:id,adis:0}}
		},
		ctlFull:function(data,id,cvt){
			return {mod:reg.name,act:'set',param:{id:id,adis:0,x:data/cvt}}
		},
		ctlCopy:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{adis:data.dis/cvt,x:data.x/cvt,wid:data.id}}
		},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlAdis:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data?{mod:reg.name,act:'set',param:{id:id,adis:root.calc.toF(data/cvt)}}:false
		},
		ctlBdis:function(data,id,cvt){
			//示例代码，实现Bdis的功能，注意不要撑破
			
		},
		
		ctlThick:function(data,id,cvt){
			
		},
		ctlWx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,x:root.calc.toF(data/cvt)}}
		},
		ctlWy:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,y:root.calc.toF(data/cvt)}}
		},
		ctlWz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,z:root.calc.toF(data/cvt)}}
		},
		ctlOz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<0?{}:{mod:reg.name,act:'set',param:{id:id,zo:root.calc.toF(data/cvt)}}
		},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],zw=dd[3]
				var ak=b.angle[wid],yw=b.thick[wid],tk=b.thick[wid],hk=b.hthick[wid],zj=Math.PI/2
				var bdis=b.dis[wid]-adis-xw
				var sip=np(ips[wid],adis,ak),eip=np(ips[wid],adis+xw,ak)
				var start={ip:sip,mp:np(sip,hk,ak-zj),op:np(sip,tk,ak-zj)}
				var end={ip:eip,mp:np(eip,hk,ak-zj),op:np(eip,tk,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,start:start,end:end,center:cen,angle:ak,check:tap,x:xw,y:yw,z:zw,
					adis:adis,bdis:bdis,zo:0
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt)]
			}
			return r
		},

		SB221NC:function(arr,scts){
			//console.log(JSON.stringify(arr))
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		
		relate:function(ra,rb){
			
			
		},
		
		//数据修正检测函数，对基础错误的数据进行纠正
		correctData:function(data,b,cvt){
			var rst=[],min=config.dis.minWidth
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i]
				var wid=row[0],adis=row[1],w=row[2],wallx=b.dis[wid]/cvt
				if(wallx>=adis+w){
					rst.push(row)
				}else if(wallx>w && wallx<adis+w){
					row[1]=wallx-w
					rst.push(row)
				}else if(wallx>=min && wallx<=w){
					row[1]=0
					row[2]=wallx
					rst.push(row)
				}
			}
			return rst
		},
		
		changeData:function(data,msg){
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid>=msg.wid)row[0]+=-1
					else if(wid==0)row[0]=0
				}
				rst.push(row)
			}
			return rst
		},
		
		//格式检测函数,对各个位置进行处理,注意检测关键位置，类型不对的数据可以丢弃
		checkData:function(data){
			return data
		},
		report:function(dt,cvt){
			var rst={wall:0,space:0,girth:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['girth']-=row.x/cvt
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			
			return rst
		},

		/*数据增删改区域 */
		add:function(p,dt){
			dt.push(self.data(p))
			return dt
		},		
			
		set:function(p,dt){
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},

		del:function(p,dt){
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)rst.push(dt[i])
			return rst
		},
		
		//将原始数据转换成通用数据的操作
		//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		data:function(p,data){
			var dd=data || root.clone(config.defaultData)
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			return dd
		},			
	}
	
	root.regComponent(reg)
})(window.T)

/*****doorEntry******/
;(function(root){
	var reg={
		name:'doorEntry',
		type:'module',
		category:'door',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			cad:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			fashion:{
				size: 14,
				fill:'#666666',
				color:'#CCAA00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:true,				//是否为结构组件
		order:3,					//加载顺序
		theme:theme,
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,			//2D绘制激活时候的偏移
		},
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			minWidth:0.8,			//最小尺寸
		},
		
		//输出数据
		report:{
			surface:0,		//增删的墙面面积
			space:0,			//增删的容积
			width:0,			//洞总宽
			height:0,			//洞高
		},
		
		//其他配置在这里
		defaultData:[1,0.2,1,2.4,2,0.1],				//[wid,adis,x,z,ro,y]注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			if(ds){
				var toB=root.calc.psAtoB,np=root.calc.newPoint,pAtoB=root.calc.pAtoB
				var pos=b.pos,ro=b.rotation,zj=Math.PI/2,ddis=config.dis.dash*cvt
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end,ak=p.angle
					var dw=p.x-p.y,ks=ro+ ak+ p.ro*zj,ke=ks+zj,kk=ro+ak,zak=kk-zj,yak=kk+zj
					if(p.ro==0)var cen=st.mp,pa=ed.mp,pb=np(st.mp,dw,yak),ceno=np(cen,p.y,kk),pbo=np(pb,p.y,kk)
					if(p.ro==1)var cen=ed.mp,pa=st.mp,pb=np(cen,dw,yak),ceno=np(cen,-p.y,kk),pbo=np(ceno,dw,yak)
					if(p.ro==2)var cen=ed.mp,pa=st.mp,pb=np(ed.mp,dw,zak),ceno=np(cen,-p.y,kk),pbo=np(ceno,dw,zak)
					if(p.ro==3)var cen=st.mp,pa=ed.mp,pb=np(st.mp,dw,zak),ceno=np(cen,p.y,kk),pbo=np(pb,p.y,kk)
					
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false,relate:rd}})
					rst.arc.push({data:{center:pAtoB(ceno,ro,pos),r:dw,start:ks,end:ke},cfg:{}})
					rst.line.push({ps:toB([ceno,pa],ro,pos),cfg:{dash:true,dis:ddis}})
					rst.fill.push({ps:toB([cen,ceno,pbo,pb],ro,pos),cfg:{detail:false}})
				}
			}
			return rst
		},
		
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	
					rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					arr[i]=rst
				}
			}
			return arr
		},
		
		twoSize:function(id,dt,b,cfg){
			var rst=[]
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			
			rst.push({ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,action:self.ctlAdis})
			rst.push({ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,action:self.ctlWidth})
			rst.push({ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,action:self.ctlBdis})
			rst.push({ps:[ips[wid],ips[nwid]],left:false,angle:ak,size:b.dis[wid]})
			
			return rst
		},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			
			var ro=[
				{icon:'door01',reg:'doorPing',param:{rotate:0}},
				{icon:'door02',reg:'doorPing',param:{rotate:1}},
				{icon:'door03',reg:'doorPing',param:{rotate:2}},
				{icon:'door04',reg:'doorPing',param:{rotate:3}},
			]
			
			var type=[
				{icon:'doorPing',		reg:'doorPing',	param:{todo:null}},
				{icon:'doorTui',		reg:'doorTui',		param:{todo:null}},
				{icon:'doorEntry',	reg:'doorEntry',	param:{todo:null}},
			]
			return [
					{type:'label',	title:'房间',	data:b.name,},
					{type:'label',	title:'组件',	data:config.name,	action:{}},
					{type:'grid',	title:'类型',	data:type,			action:{'click':doorTrans}	},
					{type:'bool',	title:'门框',	data:true,			action:{'click':function(val){console.log(val)}}	},
					{type:'number',	title:'宽度',	data:dt.x,			action:{'blur':function(val){return [self.ctlWx(val,id,cvt)] }}	},
					{type:'number',	title:'高度',	data:dt.z,			action:{'blur':function(val){return [self.ctlWz(val,id,cvt)] }}	},
					{type:'number',	title:'深度',	data:dt.y,			action:{'blur':null}	},
					{type:'grid',			title:'旋转',	data:ro,	action:{'click':doorRotate}	},
					{type:'number',	title:'左距',	data:dt.adis,		action:{'blur':function(val){return [self.ctlAdis(val,id,cvt)] }}	},
					{type:'number',	title:'右距',	data:dt.bdis,		action:{'blur':function(val){return [self.ctlAdis(dt.adis+dt.bdis-val,id,cvt)] }}	},
			]
			
			function doorTrans(val,com){
				if(com==reg.name) return
				console.log(com)
				var nd=self[com](dt)
				console.log([self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)])
				return [self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)]
			}
			
			function doorRotate(val,com){
				return [self.ctlRotate(parseInt(val.rotate),id,cvt)]
			}
		},
		
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return {task:[todo]}
		},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],zw=dd[3],ro=dd[4],yw=dd[5]
				var ak=b.angle[wid],tk=b.thick[wid],hk=b.hthick[wid],zj=Math.PI/2
				var bdis=b.dis[wid]-adis-xw
				var sip=np(ips[wid],adis,ak),eip=np(ips[wid],adis+xw,ak)
				var start={ip:sip,mp:np(sip,hk,ak-zj),op:np(sip,tk,ak-zj)}
				var end={ip:eip,mp:np(eip,hk,ak-zj),op:np(eip,tk,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,start:start,end:end,center:cen,angle:ak,check:tap,x:xw,y:yw,z:zw,ro:ro,
					adis:adis,bdis:bdis
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt),p[4],parseInt(p[5]*cvt)]
			}
			return r
		},
		toJSON:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[],toF=env.root.toF
			for(var i=0;i<n;i++){
				var p=arr[i]
				r[i]=[toF(p[0]/cvt),toF(p[1]/cvt),p[2]?toF(p[2]/cvt):toF(config.thick/cvt),toF(p[2]/cvt),p[4],toF(p[5]/cvt)]

			}
			return r
		},
		SB221NC:function(arr,scts){
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		changeData:function(data,msg){
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid>=msg.wid)row[0]+=-1
					else if(wid==0)row[0]=0
				}
				rst.push(row)
			}
			return rst
		},
		correctData:function(data,b,cvt){
			var rst=[],min=config.dis.minWidth
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i]
				var wid=row[0],adis=row[1],w=row[2],wallx=b.dis[wid]/cvt
				if(wallx>=adis+w){
					rst.push(row)
				}else if(wallx>w && wallx<adis+w){
					row[1]=wallx-w
					rst.push(row)
				}else if(wallx>=min && wallx<=w){
					row[1]=0
					row[2]=wallx
					rst.push(row)
				}
			}
			return rst
		},
		checkData:function(data){
			return data
		},
		report:function(dt,cvt){
			var rst={wall:0,space:0,girth:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['girth']-=row.x/cvt
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			return rst
		},
		
		/*数据增删改区域 */
		/*数据增删改区域 */
		add:function(p,dt){	//添加一个组件的操作
			
		},		
		set:function(p,dt){	//调整组件参数的操作
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},		
		del:function(p,dt){},		//删除一个组件的操作
		data:function(p,data){
			var dd=data || config.defaultData
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			//dd[3]
			//dd[4]
			return dd
		},			
	}
	
	root.regComponent(reg)
})(window.T)


/*****doorPing******/
;(function(root){
	var reg={
		name:'doorPing',
		type:'module',
		category:'door',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,		
		dataVersion:2017,		//绘图数据版本号
	}
	
	var me=root.getMe()
	var theme={
			yhf:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			cad:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			fashion:{
				size: 14,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
		}
	var run={}
	var config={
		isConnect:true,			//是否参与连接检测
		isStruct:true,				//是否为结构组件
		order:13,						//加载顺序
		name:'平开门',				
		theme:theme,
		relate:[['start','mp'],['end','mp']],		//参与吸附计算的节点位置
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.10,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			dash:0.05,				//虚线的绘制间距
			copy:0.1,				//复制时的位置偏移
			minWidth:0.6,			//最小尺寸
		},
		defaultData:[1,0.2,0.9,2,0.05,1],				//[wid,adis,x,z,y,ro],y为0时用墙宽,offset是内墙偏移,可为0,最后数组为分扇,可为空
		three:{
			color:0xCCFF99,
		},
	}
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt,tg){
			
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			if(!ds) return rst
			
			var toB=root.calc.psAtoB,np=root.calc.newPoint,pAtoB=root.calc.pAtoB
			var pos=b.pos,ro=b.rotation,zj=Math.PI/2,ddis=run[tg].dis.dash
			for(var i=0;i<ds.length;i++){
				var p=ds[i],st=p.start,ed=p.end,ak=p.angle
				var dw=p.x-p.y,ks=ro+ ak+ p.ro*zj,ke=ks+zj,kk=ro+ak,zak=kk-zj,yak=kk+zj
				if(p.ro==0)var cen=st.mp,pa=ed.mp,pb=np(st.mp,dw,yak),ceno=np(cen,p.y,kk),pbo=np(pb,p.y,kk)
				if(p.ro==1)var cen=ed.mp,pa=st.mp,pb=np(cen,dw,yak),ceno=np(cen,-p.y,kk),pbo=np(ceno,dw,yak)
				if(p.ro==2)var cen=ed.mp,pa=st.mp,pb=np(ed.mp,dw,zak),ceno=np(cen,-p.y,kk),pbo=np(ceno,dw,zak)
				if(p.ro==3)var cen=st.mp,pa=ed.mp,pb=np(st.mp,dw,zak),ceno=np(cen,p.y,kk),pbo=np(pb,p.y,kk)
					
				rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false,relate:rd}})
				rst.arc.push({data:{center:pAtoB(ceno,ro,pos),r:dw,start:ks,end:ke},cfg:{}})
				rst.line.push({ps:toB([ceno,pa],ro,pos),cfg:{dash:true,dis:ddis}})
				rst.fill.push({ps:toB([cen,ceno,pbo,pb],ro,pos),cfg:{detail:false}})
			}
			return rst
		},
		twoActive:function(ds,b,rd,cvt,tg){
			var arr=[]
			if(!ds) return arr
			
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation,os=config.active.offset*cvt
			for(var i=0;i<ds.length;i++){
				var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
				var p=ds[i],ak=p.angle
				//rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
				rst.line.push({ps:toB(offset(p.check,os,ak),ro,pos),cfg:{dash:false}})
				arr[i]=rst
			}
			return arr
		},
	
		threeStruct:function(ds,b,rd,cvt){
			var rst = {meshes: [], lights: [], rays:[],show:true}
			var transA=root.calc.boxPosCalc,np=root.calc.newPoint,toB=root.calc.pAtoB
			var bpos=b.pos,bro=b.rotation
			for(var i=0,len=ds.length;i<len;i++){
				var dt=ds[i],ro=dt.angle
				var box=[dt.x,dt.y,dt.z]
				var pos=np(dt.start.ip,b.thick[dt.wid]/2,ro-Math.PI/2)
				pos[2]=b.height-dt.zo-dt.z
				var rr=transA(box,pos,ro),npos=toB([rr.position[0],rr.position[1]],bro,bpos)
				npos[2]=rr.position[2]
				rst.meshes.push({type:'box',data:box,pos:npos,rotation:rr.rotation,color:config.three.color})
			}
			return rst
		},
		
		/*插件数据处理区*/
		twoSize:function(id,dt,b,cfg){
			if(root.empty(dt)) return []
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			return [
				{ps:[xps[wid],st.op],		left:true,	angle:ak,size:dd.adis,	name:'adis',	title:'边距'},
				{ps:[st.op,ed.op],			left:true,	angle:ak,size:dd.x,			name:'width',	title:'宽度'},
				{ps:[ed.op,yps[wid]],		left:true,	angle:ak,size:dd.bdis,	name:'bdis',	title:'边距'},
				{ps:[ips[wid],ips[nwid]],	left:false,	angle:ak,size:b.dis[wid]	}
			]
			
			/*var rst=[]
			rst.push({ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,name:'adis',title:'边距',action:self.ctlAdis})
			rst.push({ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,name:'width',title:'宽度',action:self.ctlWidth})
			rst.push({ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,name:'bdis',title:'边距',action:self.ctlBdis})
			rst.push({ps:[ips[wid],ips[nwid]],left:false,angle:ak,size:b.dis[wid]})
			return rst*/
		},
		
		/*屏幕操作方法区域*/
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt,tg){
			var calc=root.calc,toF=root.calc.toF
			var cdis=run[tg].dis,step=cdis.step,redun=cdis.redun
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis
			var dis=calc.disToDirect(dt[0],dt[1],ak)
			var wg=cdis.wallChange,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){
				if(Math.abs(dis)>wg){
					var nid=wid==(len-1)?0:wid+1,nnid=nid==(len-1)?0:nid+1
					if(b.dis[nid]-b.fix[nnid]<dd.x){
						console.log('后侧的距离不够放组件')
						todo.param={id:dd.id,wid:nid,adis:0,x:b.dis[nid]-b.fix[nnid]}
						console.log(todo)
					}else{
						todo.param={id:dd.id,wid:nid,adis:0}
					}
				}else{
					todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
				} 
			}else if(dis+dd.adis<0){
				//console.log('向前移动')
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}

			return {task:[todo]}
		},
		
		gesturemove:function(){
			
		},
		
		/*控制区操作函数*/
		
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			
			var ro=[
				{icon:'door01',reg:'doorPing',param:{rotate:0}},
				{icon:'door02',reg:'doorPing',param:{rotate:1}},
				{icon:'door03',reg:'doorPing',param:{rotate:2}},
				{icon:'door04',reg:'doorPing',param:{rotate:3}},
			]
			
			var type=[
				{icon:'doorPing',		reg:'doorPing',	param:{todo:null}},
				{icon:'doorTui',		reg:'doorTui',		param:{todo:null}},
				{icon:'doorEntry',	reg:'doorEntry',	param:{todo:null}},
			]
			return [
					{type:'label',	title:'房间',	data:b.name,},
					{type:'label',			title:'组件',	data:config.name,	action:{}},
					{type:'grid',			title:'类型',	data:type,				action:{'click':doorTrans}	},
					{type:'bool',			title:'门框',	data:true,				action:{'click':function(val){console.log(val)}}	},
					{type:'number',	title:'宽度',	data:dt.x,					action:{'blur':function(val){return [self.ctlWx(val,id,cvt)] }}	},
					{type:'number',	title:'高度',	data:dt.z,					action:{'blur':function(val){return [self.ctlWz(val,id,cvt)] }}	},
					{type:'number',	title:'深度',	data:dt.y,					action:{'blur':null}	},
					{type:'grid',			title:'旋转',	data:ro,					action:{'click':doorRotate}	},
					{type:'number',	title:'左距',	data:dt.adis,			action:{'blur':function(val){return [self.ctlAdis(val,id,cvt)] }}	},
					{type:'number',	title:'右距',	data:dt.bdis,			action:{'blur':function(val){return [self.ctlAdis(dt.adis+dt.bdis-val,id,cvt)] }}	},
			]
			
			function doorTrans(val,com){
				if(com==reg.name) return
				console.log(com)
				var nd=self[com](dt)
				console.log([self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)])
				return [self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)]
			}
			
			function doorRotate(val,com){
				return [self.ctlRotate(parseInt(val.rotate),id,cvt)]
			}
		},
		
		pop:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey]
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			var wid=dt.wid,wx=b.dis[wid]
			var check=root.core.checkSection,sss=b[me.core.dataKeys.sectionKey]
			
			//处理复制的位置
			var dis=run[tg].dis.copy,dx=dt.x,len=b.ips.length
			var sct=[dx,reg.name,ds.length],scts=sss[wid]
			var arr=check(sct,dis,scts)
			if(root.empty(arr)){
				var nid=wid==(len-1)?0:wid+1,nscts=sss[nid],narr=check(sct,dis,nscts)
				if(!root.empty(narr)){
					var adis=0,sid=nid,nsn=narr[0],adis=dis
					for(var i=0;i<nsn;i++) adis+=nscts[i][0]
				}
				
				if(adis==undefined){
					var pid=wid==0?(len-1):wid-1,pscts=sss[pid],parr=check(sct,dis,pscts)
					if(!root.empty(parr)){
						var adis=0,sid=pid,psn=parr[0],adis=dis
						for(var i=0;i<psn;i++) adis+=pscts[i][0]
					}
				}
			}else{
				var adis=0,sid=wid
				var sn=arr[0],adis=dis
				for(var i=0;i<sn;i++) adis+=scts[i][0]
			}
			
			//console.log(JSON.stringify(dt))
			var sub_opt=[
					{title:'新建',type:'button',close:true,data:0,name:'add',sub:false,action:self.ctlNew},
					{title:'删除',type:'button',close:true,data:id,name:'remove',sub:false,action:self.ctlRemove},
				]
			
			if(adis!=undefined&& sid!=undefined){
				sub_opt.push({title:'复制',type:'button',close:true,name:'copy',	data:{dis:adis,x:dx,id:sid},action:self.ctlCopy})
			}
			
			var list=[
					{title:'旋转',type:'button',close:false,name:'rotate',data:dt.ro,sub:false,action:self.ctlRotate},
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,sub:false,action:self.ctlWx},
					{title:'操作',name:'more',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		ctlAdis:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,adis:root.calc.toF(data/cvt)}}
		},
		ctlRotate:function(data,id,cvt){
			data=parseInt(data)
			data=data>=3?0:data+1
			return {mod:reg.name,act:'set',param:{id:id,rotate:data}}
		},
		ctlBdis:function(data,id,cvt){
			
		},
		ctlNew:function(data,id,cvt){
			
		},
		ctlCopy:function(data,id,cvt){
			//console.log(data)
			return {mod:reg.name,act:'add',param:{adis:data.dis/cvt,x:data.x/cvt,wid:data.id}}
		},
		ctlRemove:function(data,id,cvt){
			//console.log(data)
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlThick:function(data,id,cvt){},
		ctlWx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,x:root.calc.toF(data/cvt)}}
		},
		ctlWy:function(data,id,cvt){},
		ctlWz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,z:root.calc.toF(data/cvt)}}
		},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops,dis=b.dis,aks=b.angle,tks=b.thick,hks=b.hthick
			var zj=Math.PI/2
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],zw=dd[3],yw=dd[4],ro=dd[5]
				var ak=aks[wid],yw=yw?yw:tks[wid]
				var bdis=dis[wid]-adis-xw
				var tk=tks[wid],hk=hks[wid]
				var sip=np(ips[wid],adis,ak),eip=np(ips[wid],adis+xw,ak)
				var smp=np(sip,hk,ak-zj),sop=np(sip,tk,ak-zj)
				var emp=np(eip,hk,ak-zj),eop=np(eip,tk,ak-zj)
				var start={ip:sip,mp:smp,op:sop}
				var end={ip:eip,mp:emp,op:eop}
				var cen={ip:mid(sip,eip),mp:mid(smp,emp),op:mid(sop,eop)}
				
				if(ro==0||ro==1){
					var kk=ak+zj
					var tap=[np(smp,xw,kk),sop,eop,np(emp,xw,kk)]
				}else{
					var kk=ak-zj
					var tap=[sip,np(smp,xw,kk),np(emp,xw,kk),eip]
				}
				
				rs[i]={
					id:i,wid:wid,start:start,end:end,center:cen,angle:ak,check:tap,x:xw,y:yw,z:zw,ro:ro,
					adis:adis,bdis:bdis,zo:0
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt),parseInt(p[4]*cvt),p[5]]
			}
			return r
		},
		SB221NC:function(arr,scts){
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		
		//校准房间之间的关系
		relate:function(ra,rb){
			//console.log(JSON.stringify(ra))
			//console.log('ok,ready to calc room relate')
		},
		
		adsorb:function(data){
			var ps=config.relate,arr=[]
			for(var i=0,len=ps.length;i<len;i++){
				var p=root.getNode(ps[i],data)
				if(p) arr.push(p)
			}
			return root.empty(arr)?false:arr
		},
		
		changeData:function(data,msg){
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid>=msg.wid)row[0]+=-1
					else if(wid==0)row[0]=0
				}
				rst.push(row)
			}
			return rst
		},
		
		checkData:function(data){
			//console.log(data)
			return data
		},
		
		correctData:function(data,b,cvt){
			var rst=[],min=config.dis.minWidth
			//fuu,这里需要处理fix的情况
			//console.log('处理fix的情况')
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i]
				var wid=row[0],adis=row[1],w=row[2],wallx=b.dis[wid]/cvt
				if(wallx>=adis+w){
					rst.push(row)
				}else if(wallx>w && wallx<adis+w){
					row[1]=wallx-w
					rst.push(row)
				}else if(wallx>=min && wallx<=w){
					row[1]=0
					row[2]=wallx
					rst.push(row)
				}
			}
			return rst
		},
		report:function(dt,cvt){
			var rst={wall:0,space:0,girth:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['girth']-=row.x/cvt
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			return rst
		},
		
		/*数据转换区,以目标的名称命名函数即可*/
		//dong->doorPing
		//调用的方式	root[doorPing][dong](dongdata)
		//这样可以把配置写在target里,传转换过的数据，这样方便处理
		
		doorTui:function(data){
			return {
				wid:data.wid,
				adis:data.adis,
				x:data.x,
				z:data.z,
			}
		},
		doorEntry:function(data){
			
		},
		
		/*不同数据结构版本之间的转换*/
		transport:function(verA,verB,data){
			
		},
		
		trans2016to2017:function(data){
			
		},
		trans2017to2018:function(data){
			
		},
		
		/*数据增删改区域 */
		add:function(p,dt){	//添加一个组件的操作
			dt.push(self.data(p))
			return dt
		},		
		set:function(p,dt){	//调整组件参数的操作
			//console.log(JSON.stringify(p))
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},		
		del:function(p,dt){	//删除一个组件的操作
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++){
				if(i!=p.id)rst.push(dt[i])	
			}
			return rst
		},		
		data:function(p,data){
			var dd=data || root.clone(config.defaultData)
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			dd[4]=p.y===undefined?dd[4]:p.y
			dd[5]=p.rotate===undefined?dd[5]:p.rotate
			//console.log(JSON.stringify(dd))
			return dd
		},			
	}
	
	root.regComponent(reg)
})(window.T)

/*****doorTui******/
;(function(root){
	var reg={
		name:'doorTui',
		type:'module',
		category:'door',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	var theme={
			yhf:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			cad:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			fashion:{
				size: 14,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
		}
	
	var config={
		isConnect:true,			//是否参与连接检测
		isStruct:true,				//是否为结构组件
		order:3,						//加载顺序
		name:'推拉门',
		theme:theme,
		relate:[['start','mp'],['end','mp']],
		active:{
			offset:0.10,	//2D绘制激活时候的偏移
		},
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			copy:0.1,				//复制时的位置偏移
			dash:0.1,				//虚线的绘制间距
			block:0.8,				//门的默认宽度
			minWidth:1.2,			//最小尺寸
		},
		//其他配置在这里
		defaultData:[1,0.2,1,2.4],		//[wid,adis,x,z,y,offset,[dis,dis,...]]
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			if(!ds) return rst
			var calc=root.calc,toB=calc.psAtoB,np=calc.newPoint
			var pos=b.pos,ro=b.rotation,zj=Math.PI/2,ddis=config.dis.dash*cvt
			for(var i=0;i<ds.length;i++){
				var p=ds[i],st=p.start,ed=p.end,ak=p.angle
				var blocks=self.blocks(p.x,cvt),bw=blocks.width
					
				rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false,relate:rd}})
				//rst.line.push({ps:toB([st.ip,ed.ip],ro,pos),cfg:{dash:true,dis:ddis}})
				//rst.line.push({ps:toB([st.op,ed.op],ro,pos),cfg:{dash:true,dis:ddis}})
					
				for(var j=1;j<=blocks.count;j++){
					var pa=np(st.mp,(j-1)*bw,ak)
					var pb=np(pa,p.y/2,ak+(j%2?zj:-zj))
					var pc=np(pb,bw,ak)
					var pd=np(pa,bw,ak)
					rst.line.push({ps:toB([pa,pb,pc,pd],ro,pos),cfg:{dash:false}})
				}
			}
			
			return rst
		},
		
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	
					//rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					arr[i]=rst
				}
			}
			return arr
		},
		twoSize:function(id,dt,b,cfg){
			if(root.empty(dt)) return []
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			return [
				{ps:[xps[wid],st.op],		left:true,	angle:ak,size:dd.adis,	name:'adis',	title:'边距'},
				{ps:[st.op,ed.op],			left:true,	angle:ak,size:dd.x,			name:'width',	title:'宽度'},
				{ps:[ed.op,yps[wid]],		left:true,	angle:ak,size:dd.bdis,	name:'bdis',	title:'边距'},
				{ps:[ips[wid],ips[nwid]],	left:false,	angle:ak,size:b.dis[wid]	}
			]
		},
		
		/*插件数据处理区*/
		subStruct:function(){
			
		},
		subDrawing:function(){
			
		},
		
		/*屏幕操作方法区域*/
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var calc=root.calc,toF=calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return {task:[todo]}
		},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			console.log(dt)
			var ro=[
				{icon:'door01',reg:'doorPing',param:{rotate:0}},
				{icon:'door02',reg:'doorPing',param:{rotate:1}},
				{icon:'door03',reg:'doorPing',param:{rotate:2}},
				{icon:'door04',reg:'doorPing',param:{rotate:3}},
			]
			
			var type=[
				{icon:'doorPing',		reg:'doorPing',	param:{todo:null}},
				{icon:'doorTui',		reg:'doorTui',		param:{todo:null}},
				{icon:'doorEntry',	reg:'doorEntry',	param:{todo:null}},
			]
			return [
					{type:'label',	title:'房间',	data:b.name,},
					{type:'label',	title:'组件',	data:config.name},
					{type:'label',	title:'分扇',	data:JSON.stringify(dt.block),	action:{}},
					{type:'grid',	title:'类型',	data:type,				action:{'click':doorTrans}	},
					{type:'number',	title:'宽度',	data:dt.x,					action:{'blur':function(val){return [self.ctlWx(val,id,cvt)] }}	},
					{type:'number',	title:'高度',	data:dt.z,					action:{'blur':function(val){return [self.ctlWz(val,id,cvt)] }}	},
					{type:'number',	title:'深度',	data:dt.y,					action:{'blur':null}	},
					{type:'number',	title:'左距',	data:dt.adis,			action:{'blur':function(val){return [self.ctlAdis(val,id,cvt)] }}	},
					{type:'number',	title:'右距',	data:dt.bdis,			action:{'blur':function(val){return [self.ctlAdis(dt.adis+dt.bdis-val,id,cvt)] }}	},
			]
			
			function doorTrans(val,com){
				if(com==reg.name) return
				console.log(com)
				var nd=self[com](dt)
				console.log([self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)])
				return [self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)]
			}
		},
		
		
		pop:function(room,id,tg){
			var keys=me.core.dataKeys
			var b=room[keys.basicKey],sss=b[keys.sectionKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][keys.structKey],dt=ds[id],wid=dt.wid,wx=b.dis[wid]
			var check=root.core.checkSection
			
			//处理复制的位置
			var dis=config.dis.copy*cvt,dx=dt.x,len=b.ips.length
			var sct=[dx,reg.name,ds.length],scts=sss[wid]
			var arr=check(sct,dis,scts)
			if(root.empty(arr)){
				var nid=wid==(len-1)?0:wid+1,nscts=sss[nid],narr=check(sct,dis,nscts)
				if(!root.empty(narr)){
					var adis=0,sid=nid,nsn=narr[0],adis=dis
					for(var i=0;i<nsn;i++) adis+=nscts[i][0]
				}
				
				if(adis==undefined){
					var pid=wid==0?(len-1):wid-1,pscts=sss[pid],parr=check(sct,dis,pscts)
					if(!root.empty(parr)){
						var adis=0,sid=pid,psn=parr[0],adis=dis
						for(var i=0;i<psn;i++) adis+=pscts[i][0]
					}
				}
			}else{
				var adis=0,sid=wid
				var sn=arr[0],adis=dis
				for(var i=0;i<sn;i++) adis+=scts[i][0]
			}
			
			var sub_opt=[
					//{title:'复制',type:'button',close:true,name:'copy',	data:id,action:self.ctlCopy},
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
				]
			if(adis!=undefined&& sid!=undefined){
				sub_opt.push({title:'复制',type:'button',close:true,name:'copy',	data:{dis:adis,x:dx,id:sid},action:self.ctlCopy})
			}
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,adis:root.calc.toF(data/cvt)}}
		},
		ctlBdis:function(){},
		
		ctlAdd:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{adis:data.adis/cvt,x:data.x/cvt,wid:data.wid}}
		},
		ctlCopy:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{adis:data.adis/cvt,x:data.x/cvt,wid:data.wid}}
		},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlThick:function(){},
		ctlWx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			if(!data) return
			return {mod:reg.name,act:'set',param:{id:id,x:root.calc.toF(data/cvt)}}
		},
		ctlWy:function(){},
		ctlWz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,z:root.calc.toF(data/cvt)}}
		},
		
		/*功能函数区*/
		blocks:function(w,cvt){
			var sw=config.dis.block*cvt,dw=sw/2
			if(w<sw) return w
			var n=Math.floor(w/sw),left=w-n*sw
			if(left>=dw)n++
			return {width:w/n,count:n}
		},
		
		/*基础数据处理区域 */
		//fuu,推拉门的分隔还需要处理,参数定义有问题,需要能够完整描述
		SB168NN:function(arr,b,cvt){
			//console.log(arr)
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],zw=dd[3],yw=dd[4]?dd[4]:b.hthick[wid],ember=dd[5]?dd[5]:b.hthick[wid]/2,dss=dd[6]?dd[6]:[]
				var ak=b.angle[wid],yw=yw?yw:b.thick[wid]
				var bdis=b.dis[wid]-adis-xw
				var tk=b.thick[wid],hk=b.hthick[wid],zj=Math.PI/2
				var sip=np(ips[wid],adis,ak),eip=np(ips[wid],adis+xw,ak)
				var start={ip:sip,mp:np(sip,hk,ak-zj),op:np(sip,tk,ak-zj)}
				var end={ip:eip,mp:np(eip,hk,ak-zj),op:np(eip,tk,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]	
				rs[i]={
					id:i,wid:wid,start:start,end:end,center:cen,angle:ak,check:tap,x:xw,y:yw,z:zw,block:dss,ember:ember,
					adis:adis,bdis:bdis,
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i],ds=[]
				if(p[6] && root.isType(p[6],'array'))for(var j=0;j<p[6].length;j++)ds[j]=parseInt(p[6][j]*cvt)
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt),p[4]?parseInt(p[4]*cvt):0,p[5]?parseInt(p[5]*cvt):0,ds]
			}
			return r
		},
		SB221NC:function(arr,scts){
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		
		//校准房间之间的关系
		relate:function(ra,rb){
			console.log(JSON.stringify(ra))
			//console.log('ok,ready to calc room relate')
		},
		changeData:function(data,msg){
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid>=msg.wid)row[0]+=-1
					else if(wid==0)row[0]=0
				}
				rst.push(row)
			}
			return rst
		},
		correctData:function(data,b,cvt){
			var rst=[],min=config.dis.minWidth
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i]
				var wid=row[0],adis=row[1],w=row[2],wallx=b.dis[wid]/cvt
				if(wallx>=adis+w){
					rst.push(row)
				}else if(wallx>w && wallx<adis+w){
					row[1]=wallx-w
					rst.push(row)
				}else if(wallx>=min && wallx<=w){
					row[1]=0
					row[2]=wallx
					rst.push(row)
				}
			}
			return rst
		},
		
		report:function(dt,cvt){
			var rst={wall:0,space:0,girth:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['girth']-=row.x/cvt
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			return rst
		},
		
		/*数据增删改区域 */
		add:function(p,dt){
			dt.push(self.data(p))
			return dt
		},		
			
		set:function(p,dt){
			//console.log(JSON.stringify(dt))
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},

		del:function(p,dt){
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)rst.push(dt[i])
			return rst
		},
		
		//将原始数据转换成通用数据的操作
		//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		data:function(p,data){
			var dd=data || root.clone(config.defaultData)
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			return dd
		},			
	}
	
	root.regComponent(reg)
})(window.T)


/*****electric******/
;(function(root){
	var reg={
		name:'electric',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****electronic******/
;(function(root){
	var reg={
		name:'electronic',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****floorBlock******/
;(function(root){
	var reg={
		name:'floorBlock',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:30,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		
		report:function(dt,cvt){
			var rst={wall:0,space:0,height:-0.05,raw:[]}
			var dkey=me.core.dataKeys.structKey
			
			return rst
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****floorStone******/
;(function(root){
	var reg={
		name:'floorStone',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:30,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},

		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****floorWood******/
;(function(root){
	var reg={
		name:'floorWood',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:30,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****fur******/
;(function(root){
	var reg={
		name:'fur',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				dash:'#778899',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				dash:'#778899',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				dash:'#778899',
				active:'',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:10,					//加载顺序
		name:'家具',			//组件名称
		theme:theme,
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,			//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			yoffset:0.05,			//x偏移的处理
		},
		//[wid,adis,x,y,z,yo,zo,mirro,ro,type,mid]
		defaultData:[1,0.6,1,1.5,0.4,0.3,1.6,1,30,1,0],
		three:{
			color:0xFFF000,
		},
	}
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			//console.log(JSON.stringify(ds))
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB,toF=root.calc.toF
			var pos=b.pos,ro=b.rotation
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end
					/*var edge=[]
					for(var elen=p.edge.length,j=0;j<elen;j++){
						var pp=p.edge[j]
						console.log(pp)
						edge[j]=[toF(pp[0]/cvt),toF(pp[1]/cvt)]
					}*/
					
					rst.img.push({sid:p.sid,cfg:{ps:toB(p.edge,ro,pos),mirror:false,shadow:false,center:root.calc.pAtoB(p.center,ro,pos),width:p.x,height:p.y,rotation:p.angle+b.rotation}})
					//rst.fill.push({ps:toB(p.edge,ro,pos),cfg:{detail:false}})
					//rst.line.push({ps:toB(p.edge,ro,pos),cfg:{dash:false}})
				}
			}
			return rst
		},
		
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=p.edge
					var ak=p.angle,os=config.active.offset*cvt
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					arr[i]=rst
				}
			}
			return arr
			
		},
		threeStruct:function(ds,b,rd,cvt){
			var rst = {meshes: [], lights: [], rays:[],show:true}
			var transA=root.calc.boxPosCalc,np=root.calc.newPoint,toB=root.calc.pAtoB
			var bpos=b.pos,bro=b.rotation
			for(var i=0,len=ds.length;i<len;i++){
				var dt=ds[i],ro=dt.angle+Math.PI
				var box=[dt.x,dt.y,dt.z],pos=dt.end.ip
				pos[2]=b.height-dt.zo-dt.z
				var rr=transA(box,pos,ro),npos=toB([rr.position[0],rr.position[1]],bro,bpos)
				npos[2]=rr.position[2]
				rst.meshes.push({type:'box',data:box,pos:npos,rotation:rr.rotation,color:config.three.color})
			}
			//console.log(rst)
			return rst
		},
		threeActive:function(){},
		
		twoSize:function(id,dt,b,cfg){
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var eg=dd.edge,zj=Math.PI/2
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			//rst.push({ps:[ips[wid],ips[nwid]],left:false,angle:ak,name:'wall',title:'墙宽',size:b.dis[wid]})
			var rst=[
				{ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,name:'adis',title:'边距',action:self.ctlAdis},
				{ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,name:'width',title:'宽度',action:self.ctlWidth},
				{ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,name:'bdis',title:'边距',action:self.ctlBdis},
				{ps:[ed.ip,eg[2]],left:true,angle:ak+zj,size:dd.yo,name:'wyo',title:'距墙',action:self.ctlY},
				{ps:[eg[2],eg[3]],left:true,angle:ak+zj,size:dd.y,name:'wy',title:'长度',action:self.ctlX},
				{ps:[eg[0],eg[3]],left:false,angle:ak,size:dd.x,name:'wx',title:'宽度',action:self.ctlY}
			]
			return rst
			
			
		},
	
		
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			//console.log(dd)
			var calc=root.calc,toF=calc.toF,dToD=calc.disToDirect,np=calc.newPoint
			var toB=calc.pAtoB,pstoB=calc.psAtoB,isin=calc.isIn
			var zj=Math.PI/2
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			
			var dis=dToD(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
		
			//fuu,判断点是否出了房间范围
			//06-20,测试git同步
			//var isout=false
			var check=pstoB(b.ips,b.rotation,b.pos)
			if(!isin(toB(dd.edge[0],b.rotation,b.pos),check)){
				console.log('默认左下角超出范围,计算位置')
			}
			if(!isin(toB(dd.edge[3],b.rotation,b.pos),check)){
				console.log('默认右下角超出范围,计算位置')
			} 
			
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			var rst={task:[todo]}
			
			//处理yoffset的touchmove
			var odis=dToD(dt[0],dt[1],ak+zj),ydis=config.dis.yoffset*cvt
			var yo=toF((dd.yo+odis)/cvt)
			if(dd.yo==0){
				if(odis>ydis) rst.task.push({mod:reg.name,act:'set',param:{id:dd.id,yo:yo}})
			}else{
				rst.task.push({mod:reg.name,act:'set',param:{id:dd.id,yo:yo<0?0:yo}})
			}
			
			return rst
		},
		gesturemove:function(dt,b,dd,cvt){
			
		},
		
		/*控制区操作函数*/
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
		
			return [
					{type:'label',			title:'组件',	data:config.name,	action:{}},
					{type:'number',	title:'宽度',	data:dt.x,					action:{
							'blur':function(val){return [self.ctlWx(val,id,cvt)] },
							//'input':function(val){return [self.ctlWx(val,id,cvt)]},
						}},
					{type:'number',	title:'高度',	data:dt.z,					action:{'blur':function(val){return [self.ctlWz(val,id,cvt)] }}	},
					{type:'number',	title:'长度',	data:dt.y,					action:{'blur':function(val){return [self.ctlWy(val,id,cvt)] }}	},
					{type:'number',	title:'离墙',	data:dt.yo,				action:{'blur':function(val){return [self.ctlOy(val,id,cvt)] }}	},
					{type:'number',	title:'离地',	data:dt.zo,				action:{'blur':function(val){return [self.ctlOz(val,id,cvt)] }}	},
					{type:'number',	title:'左距',	data:dt.adis,			action:{'blur':function(val){return [self.ctlAdis(val,id,cvt)] }}	},
					{type:'number',	title:'右距',	data:dt.bdis,			action:{'blur':function(val){return [self.ctlAdis(dt.adis+dt.bdis-val,id,cvt)] }}	},
			]
		},
		
		pop:function(room,id){
			var keys=me.core.dataKeys
			var b=room[keys.basicKey],dt=room[reg.name][keys.structKey][id]
			//console.log(dt)
			
			//fuu,计算adis和x,看能不能放下
			
			var sub_opt=[
					{title:'复制',type:'button',close:true,name:'copy',	data:id,action:self.ctlCopy},
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
				]
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		ctlAdis:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,adis:root.calc.toF(data/cvt)}}
		},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlCopy:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{adis:data.dis/cvt,x:data.x/cvt,wid:data.id}}
		},
		ctlThick:function(data,id,cvt){},
		ctlWx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,x:root.calc.toF(data/cvt)}}
		},
		ctlWy:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,y:root.calc.toF(data/cvt)}}
		},
		ctlWz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,z:root.calc.toF(data/cvt)}}
		},
		
		ctlOx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return !data?{}:{mod:reg.name,act:'set',param:{id:id,xo:root.calc.toF(data/cvt)}}
		},
		ctlOy:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data>=0?{mod:reg.name,act:'set',param:{id:id,yo:root.calc.toF(data/cvt)}}:{}
		},
		ctlOz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data>=0?{}:{mod:reg.name,act:'set',param:{id:id,zo:root.calc.toF(data/cvt)}}
		},
		
		/*基础数据处理区域 */
		//fuu,fur的数据构建需要仔细核实和计算,先绘制框线正确,
		SB168NN:function(arr,b,cvt){
			//console.log(arr)
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				//[wid,adis,x,y,z,yo,zo,mirro,ro,type,mid]
				//defaultData:[1,0.6,1,1.5,0.4,0.3,1.6,1,30,1,0],	
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],yw=dd[3],zw=dd[4],yo=dd[5],zo=dd[6],mirror=dd[7],ro=dd[8],type=dd[9],mdid=dd[10]
				var ak=b.angle[wid],tk=b.thick[wid],hk=b.hthick[wid],zj=Math.PI/2
				var bdis=b.dis[wid]-adis-xw
				var sip=np(ips[wid],adis,ak),eip=np(ips[wid],adis+xw,ak)
				var start={ip:sip,mp:np(sip,hk,ak-zj),op:np(sip,tk,ak-zj)}		//在墙上的投影位置
				var end={ip:eip,mp:np(eip,hk,ak-zj),op:np(eip,tk,ak-zj)}		//在墙上的投影位置
				
				//需要补充计算位置
				var sea=np(sip,yo,ak+zj),seb=np(sip,yo+yw,ak+zj)
				var eea=np(eip,yo,ak+zj),eeb=np(eip,yo+yw,ak+zj)
				
				var cen=mid(sea,eeb),tap=[seb,sea,eea,eeb]
				rs[i]={
					id:i,wid:wid,start:start,end:end,center:cen,angle:ak,check:tap,x:xw,y:yw,z:zw,xo:0,yo:yo,zo:zo,
					adis:adis,bdis:bdis,edge:tap,offset:sea,sid:mdid,
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt),parseInt(p[4]*cvt),parseInt(p[5]*cvt),parseInt(p[6]*cvt),p[7],p[8]*Math.PI/180,p[9],p[10]]
			}
			return r
		},
		SB221NC:function(rid,target){},
		correctData:function(data,rid){
			return data
		},
		changeData:function(data,msg){
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				console.log(wid+','+msg.wid)
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid==0)row[0]=0
					else if(wid>msg.wid)row[0]+=-1
				}
				rst.push(row)
			}
			console.log(JSON.stringify(rst))
			return rst
		},
		
		checkData:function(data){
			return data
		},
		report:function(dt){
			var rst={wall:0,space:0,raw:[],}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['space']-=row.x*row.z*row.y
				rst['raw'][k]={width:row.x,height:row.z,depth:row.y}
			}
			
			return rst
		},
		
		
		/*数据增删改区域 */
		add:function(p,dt){	//添加一个组件的操作
			dt.push(self.data(p))
			return dt
		},		
		set:function(p,dt){	//调整组件参数的操作
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},		
		del:function(p,dt){
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)rst.push(dt[i])
			return rst
		},		//删除一个组件的操作
		data:function(p,data){
			//[wid,adis,x,y,z,yo,zo,mirro,ro,type,mid]
			//defaultData:[1,0.6,1,1.5,0.4,0.3,1.6,1,30,1,0],	
			var dd=data || config.defaultData
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.y===undefined?dd[3]:p.y
			dd[4]=p.z===undefined?dd[4]:p.z
			dd[5]=p.yo===undefined?dd[5]:p.yo
			dd[6]=p.zo===undefined?dd[6]:p.zo
			return dd
		},			
	}
	
	root.regComponent(reg)
})(window.T)
/*****metopeBlock******/
;(function(root){
	var reg={
		name:'metopeBlock',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****metopePaint******/
;(function(root){
	var reg={
		name:'metopePaint',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****metopePaper******/
;(function(root){
	var reg={
		name:'metopePaper',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****pillar******/
;(function(root){
	var reg={
		name:'pillar',
		type:'module',
		category:'wall',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:3,						//加载顺序
		theme:theme,
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
		},
		//其他配置在这里
		defaultData:[],				//[wid,adis,x,y,yo,ro]
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		
		//校准房间之间的关系
		relate:function(ra,rb){
			console.log(JSON.stringify(ra))
			//console.log('ok,ready to calc room relate')
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,cvt){
			/*var rst={wall:0,space:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			return rst*/
			var rst={wall:0,space:0,raw:[]}
			return rst
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****point******/
;(function(root){
	var reg={
		name:'point',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	var theme={
			yhf:{
				fill:'#FF0000',
				size: 12,
				color: '#383838',
				arc:'#FF8800',
				dash:'#FF8800',
			},
			cad:{
				fill:'#FF0000',
				size: 12,
				color: '#383838',
				arc:'#FFFF00',
				dash:'#FF8800',
			},
			fashion:{
				fill:'#BBBBBB',
				size: 14,
				color: '#CC3838',
				arc:'#FF8800',
				dash:'#888800',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:3,					//加载顺序	
		theme:theme,
		//relate:[['data']], 		//点和点吸附和墙的吸附重叠
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		rotation:{
			min:Math.PI/18,			//房间夹角最小角度
			max:17*Math.PI/18,		//房间夹角最大角度
		},
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			cornor:0.5,				//转角的偏移
			relate:0.3,				//关联的距离
			ratius:0.15,			//点的选中显示
			kdiff:Math.PI/360,		//角偏差
			adsorb:0.1,				//吸附距离
		},
		three:{
			color:0xBBBBBB,
		},
	}
	
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		
		/*渲染器数据处理区域 */
		
		//1.做A坐标系到B坐标系的计算
		twoStruct:function(ds,b,rd,cvt){
			//console.log(ds)
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB
			var pos=b.pos,ro=b.rotation
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i]
					rst.line.push({ps:toB(p.check,ro,pos),cfg:{dash:false,detail:false}})
				}
			}

			//return rst
		},
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],ak=p.angle,os=config.active.offset*cvt	
					rst.arc.push({data:{center:root.calc.pAtoB(p.center,ro,pos),r:p.radius,start:0,end:2*Math.PI},cfg:{}})
					//rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					arr[i]=rst
				}
			}
			return arr
		},
		
		threeStruct:function(ds,b,rd,cvt){
			//console.log('进行角点的构建')
			var rst = {meshes: [], lights: [], rays:[],show:true}
			var ptoB=root.calc.pAtoB,pstoB=root.calc.psAtoB
			var rotation=0,pos=b.pos,ro=b.rotation
			var posa=[0,0,0]
			for(var i=0,len=b.ips.length;i<len;i++){
				var shape=[b.ips[i],b.xps[i],b.ops[i],b.yps[i==0?len-1:i-1]]
				rst.meshes.push({type:'extrude',data:pstoB(shape,ro,pos),pos:posa,rotation:rotation,color:config.three.color,amount:b.height})
			}
			return rst
		},
		
		threeActive:function(){},
		
		/*插件数据处理区*/
		twoSize:function(id,dt,b,cfg){
			var rst=[],diss=b.dis,aks=b.angle,len=b.ips.length
			var pre=id==0?len-1:id-1
			rst.push({ps:[b.xps[id],b.yps[id]],left:true,angle:aks[id],size:diss[id]})
			rst.push({ps:[b.xps[pre],b.yps[pre]],left:true,angle:aks[pre],size:diss[pre]})
			return rst
		},
		 
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		
		touchmove:function(dt,b,dd,cvt,tg){
			//头部的数据获取需要放到上部去处理，module仅仅处理数据，不获取整体状态
			var tg=root.core.getCurTarget(),rids=root.core.getRids(tg)
			var act=root.core.getActive(tg),rid=act.cur.rid
			var len=b.ips.length
			var wid=dd.id,pid=wid==0?len-1:wid-1,nid=wid==(len-1)?0:wid+1
			
			if(wid==0){
				var ppid=len-2
			}else if(wid==1){
				var ppid=len-1
			}else{
				var ppid=wid-2
			}
			
			if(wid==(len-1)){
				var nnid=1
			}else if(wid==(len-2)){
				var nnid=0
			}else{
				var nnid=wid+2
			}
			
			
			var pt=dd.data
			
			var dks=me.core.dataKeys,hooks=me.core.regHooks
			var calc=root.calc,toF=calc.toF,pAtoB=calc.pAtoB,psAtoB=calc.psAtoB,isin=calc.isIn
			var psAngle=calc.psAngle,ppAngle=calc.ppAngle
			var sdis=run[tg].dis.adsorb
			var dx=dt[0],dy=dt[1]
			
			var cp=pAtoB(dd.data,b.rotation,b.pos)
			cp[0]+=dx
			cp[1]+=dy
			
			//console.log('当前墙号:'+wid+',前堵墙号:'+pid+',再前1堵墙号:'+ppid)
			
			//fuu,这里对点的位置进行限定
			
			var akp=pAtoB(b.ips[wid],b.rotation,b.pos)
			akp[0]+=dx
			akp[1]+=dy
			
			var ips=psAtoB(b.ips,b.rotation,b.pos)
			//console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
			//console.log('dx:'+dx+',dy:'+dy)
			//console.log('所有B坐标系点是:'+JSON.stringify(ips))
			//console.log('移动前点坐标是:'+JSON.stringify(ips[wid]))
			//console.log('移动后点坐标是:'+JSON.stringify(akp))
			//console.log('前点是:'+ips[pid])
			
			//var ak=ppAngle(ips[pid],akp),bk=ppAngle(ips[pid],ips[ppid])
			
			//console.log('角度的值是:'+JSON.stringify(b.angle))
			//console.log('点的值是:'+JSON.stringify(b.ips))
			//console.log('当前角度是:'+b.angle[pid]+',移动后的角度是:'+ak)
			
			var pak=calc.deltaAngle(akp,ips[ppid],ips[pid])
			if(pak<=config.rotation.min){
				console.log('和前线的角度小于预设了')
				
				
			}
			
			if(pak>=config.rotation.max){
				console.log('和前线的角度大于预设了')
			}
			
			var nak=calc.deltaAngle(ips[nnid],akp,ips[nid])
			if(nak<=config.rotation.min){
				console.log('和后线的角度小于预设了')
			}
			
			if(nak>=config.rotation.max){
				console.log('和后线的角度大于预设了')
			}
			
			//0.单个房间,自由移动（对角度进行判断，不能拉破）
			if(rids.length<2){
				
				var ap=calc.pBtoA(cp,b.rotation,b.pos)
				var todo={mod:reg.name,act:'set',param:{id:wid,data:[toF(ap[0]/cvt),toF(ap[1]/cvt),toF(pt[2]/cvt)]}}
				return {task:[todo]}
			}
			
			//测试点坐标，因为点定义在ip上，所以可以选用不同的测试点，但计算结果保存到ip上
			var tp=pAtoB(dd.center,b.rotation,b.pos)
			tp[0]+=dx
			tp[1]+=dy
			
			
			//1.判断是否直接吸附room的点
			var abArr=[]
			for(var i=0,rlen=rids.length;i<rlen;i++){
				if(rids[i]==rid) continue
				
				var troom=root.core.getBasic(rids[i],tg),cps=psAtoB(troom.cps,troom.rotation,troom.pos)
				if(!isin(tp,cps)) continue				

				var ps=psAtoB(troom.mps,troom.rotation,troom.pos)
				var pp=calc.adsorb([tp],sdis,ps,true,true)
				if(!pp) continue
				
				pp['me']={type:reg.name,id:wid}
				abArr.push(pp)
				
				//如果存在吸附，多进行一次section部分的判断
				
				var secs=troom[dks.sectionKey][pp.id]
				var rps=[]
				for(var j=0,slen=secs.length;j<slen;j++){
					var ss=secs[j],type=ss[1],did=ss[2]
					if(type!=me.core.sectionReg){
						var data=root.core.getData(type,rids[i],tg)
						if(!root[type][hooks.regAdsorb]) continue
						
						var pps=root[type][hooks.regAdsorb](data[dks.structKey][did])
						if(pps) for(var jj=0,plen=pps.length;jj<plen;jj++) rps.push(pps[jj])
					}
				}
								
				if(!root.empty(rps)){
					var nps=psAtoB(rps,troom.rotation,troom.pos)
					var npp=calc.adsorb([tp],sdis,nps,true,true)
					if(npp) abArr.push(npp)
				}
			}	
			
			//2.自由移动的代码
			if(root.empty(abArr)){
				/******垂直水平吸附开始******/
				var aap=pAtoB(b.ips[wid],b.rotation,b.pos)
				var ipa=pAtoB(b.ips[pid],b.rotation,b.pos),ipb=pAtoB(b.ips[nid],b.rotation,b.pos)
				var pa=pAtoB(b.mps[pid],b.rotation,b.pos),pb=pAtoB(b.mps[nid],b.rotation,b.pos)
				
				var fix=[0,0,0,0]		//[px,py,nx,ny]
				if(Math.abs(cp[1]-pa[1])<sdis){fix[0]=1}
				if(Math.abs(cp[0]-pa[0])<sdis){fix[1]=1}
				if(Math.abs(cp[1]-pb[1])<sdis){fix[2]=1}
				if(Math.abs(cp[0]-pb[0])<sdis){fix[3]=1}
				//console.log('运动后和前后点的捕捉关系是:'+JSON.stringify(fix))
				if(fix[1] && fix[2]){
					aap=[ipa[0],ipb[1]]
				}else if(fix[0] && fix[3]){
					aap=[ipb[0],ipa[1]]
				}else{
					if(fix[0]) aap=[aap[0]+dx,ipa[1]]
					else if(fix[1]) aap=[ipa[0],aap[1]+dy]
					else if(fix[2]) aap=[aap[0]+dx,ipb[1]]
					else if(fix[3]) aap=[ipb[0],aap[1]+dy]
					else aap=[aap[0]+dx,aap[1]+dy]
				}
				/******垂直水平吸附结束******/
				
				var ap=calc.pBtoA(aap,b.rotation,b.pos)
				var todo={mod:reg.name,act:'set',param:{id:wid,data:[toF(ap[0]/cvt),toF(ap[1]/cvt),toF(pt[2]/cvt)]}}
				return {task:[todo]}
			}
			
			//3.吸附的处理
			var ab=null
			for(var i=0,len=abArr.length;i<len;i++){
				var pp=abArr[i]
				if(pp.isPoint){
					cp[0]+=pp.delta[0]
					cp[1]+=pp.delta[1]
					cp=calc.pBtoA(cp,b.rotation,b.pos)
					var ap=[toF(cp[0]/cvt),toF(cp[1]/cvt),toF(b.thick[wid]/cvt)]
					var todo={mod:reg.name,act:'set',param:{id:wid,data:ap}}
					return {task:[todo]}
				}
					
				if(root.empty(ab))	ab=root.clone(pp)
				if(ab.dis>pp.dis)	ab=root.clone(pp)
			}
				
			//处理线吸附，这里需要优化，找出最小的那个
			if(!root.empty(ab)){
				cp[0]+=ab.delta[0]
				cp[1]+=ab.delta[1]
				cp=calc.pBtoA(cp,b.rotation,b.pos)
				var ap=[toF(cp[0]/cvt),toF(cp[1]/cvt),toF(b.thick[wid]/cvt)]
				var todo={mod:reg.name,act:'set',param:{id:wid,data:ap}}
				return {task:[todo]}
			}
		},
		
		gesturemove:function(){
			
		},
		
		/*控制区操作函数*/
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey]
			console.log(id)
			return [
				{type:'label',title:'房间',data:b.name,},
				{type:'label',title:'组件',data:'角点['+id+']'},
			]
		},
		
		pop:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var dt=room[reg.name][me.core.dataKeys.structKey],len=b.ips.length
			var skey=me.core.dataKeys.sectionKey
			var cdis=config.dis.cornor,dis=config.dis.cornor*cvt
			var pre=id==0?len-1:id-1
			
			var sc_a=b[skey][pre],sc_b=b[skey][id],sa=sc_a[sc_a.length-1],sb=sc_b[0]
			
			var list=[
					{name:'remove',title:'删除',close:true,sub:false,type:'button',data:id,action:self.ctlRemove},
				]
			
			if(sa[1]==me.core.sectionReg&&sb[1]==me.core.sectionReg && sa[0]>dis && sb[0]>dis){
					var wak=b.angle[id],pak=b.angle[pre],zj=Math.PI/2
					var np=root.calc.newPoint,toF=root.calc.toF
					var pa=np(b.ips[id],-dis,pak),pb=np(pa,dis,wak),pc=np(pb,dis,pak)
					list.push({name:'cornor',title:'拐角',close:true,sub:false,type:'button',data:{pa:pa,pb:pb,pc:pc,dis:cdis},action:self.ctlCornor})
			}
			return list
		},
		
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		
		ctlCornor:function(data,id,cvt){
			var toF=root.calc.arrToF
			var dis=data.dis,name=reg.name
			var pa=toF([data.pa[0]/cvt,data.pa[1]/cvt]),pb=toF([data.pb[0]/cvt,data.pb[1]/cvt]),pc=toF([data.pc[0]/cvt,data.pc[1]/cvt])
			
			var rst=[]
			rst.push({mod:name,act:'add',param:{id:id,point:pa}})
			rst.push({mod:name,act:'del',param:{id:id}})
			rst.push({mod:name,act:'add',param:{id:id,point:pb,dis:dis}})
			rst.push({mod:name,act:'add',param:{id:id+1,point:pc}})
			return rst
		},
		
		SB168NN:function(arr,b,cvt){
			var rs=[],offset=root.calc.offset
			var radius=config.dis.ratius*cvt
			for(var i=0,len=arr.length;i<len;i++){
				var p=arr[i]
				var hk=b.hthick[i],ak=b.angle[i],cen=b.mps[i],thick=b.thick[i]
				var tap=offset([cen,cen,cen,cen],hk,ak)
				rs[i]={
					id:i,data:p,angle:ak,center:cen,radius:radius,check:tap,thick:thick
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		//fuu,这里需要把room的数据取出来，并转换
		SB123N:function(arr,cvt){
			//console.log(arr)
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),parseInt(p[2]*cvt)]
			}
			return r
		},
		//校准房间之间的关系
		relate:function(ra,rb,cvt){
			//console.log('交给点计算的关系是:'+JSON.stringify(ra.relate))
			var keys=me.core.dataKeys,bkey=keys.basicKey,rkey=keys.relateKey,skey=keys.structKey
			var calc=root.calc,toB=calc.pAtoB,toBs=calc.psAtoB,dis=calc.ppDis
			
			var rid=ra.rid,tid=rb.rid,ps=ra[rkey][tid]
			var rma=ra.data,rmb=rb.data,ba=rma[bkey],bb=rmb[bkey]
			var aro=ba.rotation,apos=ba.pos,bro=bb.rotation,bpos=bb.pos
			var rdis=config.dis.relate*cvt
			
			var rst={}
			
			//console.log('进入检测区域的点是房间'+rid+':'+JSON.stringify(ps))
			for(var i=0,len=ps.length;i<len;i++){
				//1.计算需要吸附的点，供touchmove的时候用
				var wid=ps[i]
				var p=toB(ba.mps[wid],aro,apos)
				var tps=toBs(bb.mps,bro,bpos)
				//2.垂足点，中点，边界点，关联的wall的所有的节点
				for(var k in rmb){
					//console.log(k)
					if(me[k]!=undefined && me[k][rkey]!=undefined){
						var dps=me[k][rkey]
						//console.log(JSON.stringify(dps))
						for(var j=0,dlen=dps.length;j<dlen;j++){
							var tp=dps[j]
							//console.log(k+':'+JSON.stringify(tp))
							var dt=rmb[k][skey]
							//console.log(JSON.stringify(dt))
							for(var jj=0,tlen=dt.length;jj<tlen;jj++){
								var pt=dt[jj]
								if(root.isType(tp,'array'))for(var x=0,xlen=tp.length;x<xlen;x++)pt=pt[tp[x]]
								else pt=pt[tp]
								
								pt=toB(pt,bro,bpos)
								var chk=dis(p,pt)
								if(chk<rdis){
									rst[rid]=root.empty(rst[rid])?{}:rst[rid]
									rst[rid][wid]=root.empty(rst[rid][wid])?[]:rst[rid][wid]
									rst[rid][wid].push([tid,k,jj,pt])
								}
							}
						}
					}
				}
			}
			return rst
		},
		
		changeData:function(data){
			return data
		},
		checkData:function(data){
			return data
		},
		
		correctData:function(data,rid){
			return data
		},
		report:function(dt,cvt){
			var rst={}
			/*var dkey=me.core.dataKeys.cvtKey
			var data=dt[dkey]
			rst['girth']=root.calc.calcGirth(data)/cvt
			rst['area']=root.calc.calcArea(data)/(cvt*cvt)*/
			return rst
		},
		
		/*数据增删改区域 */
		//point是派生出来的组件，返回的数据是特殊的，当心处理
		add:function(p,dt){ 	//添加一个组件的操作
			if(p.id===undefined) return
			var nps=[]
			for(var i=0,len=dt.length;i<len;i++){
				nps.push(dt[i])
				if(p.id==i) nps.push(p[reg.name])
			}
			var dis=p.dis===undefined?0:p.dis
			return {data:nps,message:{wid:p.id,add:true,dis:dis}}
		},		
		set:function(p,dt){
			if(p.id===undefined) return
			var nps=[]
			for(var i=0,len=dt.length;i<len;i++) nps.push(p.id==i?p.data:dt[i])
			return {data:nps}
		},
		del:function(p,dt){	//删除一个组件的操作
			if(p.id===undefined) return
			var arr=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)arr.push(dt[i])
			return {data:arr,message:{wid:p.id,add:false}}
		},		
		data:function(){},			
	}
	root.regComponent(reg)
})(window.T)
/*****room******/
;(function(root){
	var reg={
		name:'room',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	
	var theme={
			yhf:{
				size: 12,
				color: '#383838',
			},
			cad:{
				size: 12,
				color: '#383838',
			},
			fashion:{
				size: 14,
				color: '#000000',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:true,				//是否为结构组件
		order:1,						//加载顺序
		theme:theme,
		name:'房间',
		mainKey:'points',		//点数据挂载位置
	    acitve:{
	    	
	    },
	    dis:{
	    	adsorb:0.1,
	    	active:0.6,			//默认影响线的偏移
	    	//halfThick:0.1,	//默认的半墙厚度
			thick:0.2,			//默认的墙的厚度
			//adsorptionDis: 0.1,
	    	//pointAdsorptionDis:0.1,
	    },
	    
	    copy:{
	    	pre:'new_',
	    	pos:[1.5,1.5],
	    },

	    //默认数据结构
	    defaultData:{height:2.8,under:0,pos:[0,0],rotation:0,name:"新房间",info:{},type:1,lock:0,remove:false,points:[[0,0,0.2],[2.7,0,0.2],[2.7,3.1,0.2],[0,3.1,0.2]]},
	    three:{
			color:0xBBBBBB,
		},
	}

	var run={}
	var self=reg[me.funKey]={
		init:function(){
			console.log('room init')
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var txt=b.name+'['+b.rid+']'
			var rst={line:[],fill:[],img:[],ease:[],arc:[],txt:[],show:true}
			var calc=root.calc,toB=calc.pAtoB,pos=b.pos,ro=b.rotation
			rst.txt.push({txt:txt,cfg:{angle:ro,pos:toB(b.mid,ro,pos),help:false}})
			
			//绘制边界线
			//rst.line.push({ps:calc.psAtoB(b.cps,ro,pos),cfg:{dash:false}})
			
			return rst
		},
		
		
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,pos=b.pos,ro=b.rotation
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			rst.fill.push({ps:toB(b.ips,ro,pos),cfg:{}})
			return [rst]
		},
		threeStruct:function(ds,b,rd,cvt){
			//console.log('这里进行地面和顶面的构建')
			var rst = {meshes: [], lights: [], rays:[],show:true}
			var ptoB=root.calc.pAtoB,pstoB=root.calc.psAtoB
			var rotation=0
			
			//屋顶板
			var posa=[0,0,-ds.ceiling]
			rst.meshes.push({type:'extrude',data:pstoB(b.ops,b.rotation,b.pos),pos:posa,rotation:rotation,color:config.three.color,amount:ds.ceiling})
			
			//地面板
			var posb=[0,0,b.height]
			rst.meshes.push({type:'extrude',data:pstoB(b.ops,b.rotation,b.pos),pos:posb,rotation:rotation,color:config.three.color,amount:ds.ground})

			return rst
		},
		threeActive:function(){},
		
		/*插件数据处理区*/
		twoSize:function(id,dt,b,cfg){
			var rst=[],diss=b.dis,aks=b.angle
			for(var i=0,len=b.ips.length;i<len;i++){
				rst.push({ps:[b.xps[i],b.yps[i]],left:true,angle:aks[i],size:diss[i]})
			}
			return rst
		},
		
		
		/*屏幕操作方法区域*/
		touchmove:function(dt,b,dd,cvt,tg){
			var tg=root.core.getCurTarget(),rids=root.core.getRids(tg)
			var act=root.core.getActive(tg),rid=act.cur.rid
			
			var calc=root.calc,toF=calc.toF,pAtoB=calc.pAtoB,psAtoB=calc.psAtoB,isin=calc.isIn
			var disToDirect=calc.disToDirect,cross=calc.cross,adsorb=calc.adsorb
			
			var sdis=run[tg].dis.adsorb,dx=dt[0],dy=dt[1]
			
			//console.log('delta position:'+JSON.stringify(dt))
			if(rids.length<2){
				var todo={mod:reg.name,act:'set',param:{dx:dt[0]/cvt,dy:dt[1]/cvt}}
				return {task:[todo]}
			}
			
			//1.判断哪个点进入的了(中点和端点)
			var abArr=[]
			var mps=psAtoB(b.mps,b.rotation,b.pos)		//把需要检测的点转换好

			for(var i=0,rlen=rids.length;i<rlen;i++){
				if(rids[i]==rid) continue
				
				var troom=root.core.getBasic(rids[i],tg),cps=psAtoB(troom.cps,troom.rotation,troom.pos)
				for(var j=mps.length-1;j>=0;j--){
					var tp=[mps[j][0]+dx,mps[j][1]+dy]
					if(!isin(tp,cps)) continue		
					
					//console.log('-------计算mps的吸附值,补充tid和dis,isPoint--------')
					var ps=psAtoB(troom.mps,troom.rotation,troom.pos)
					var pp=calc.adsorb([tp],sdis,ps,true,true)
					if(!pp) continue
					pp['target']=rids[i]
					pp['wid']=j
					pp['type']='mps'
					abArr.push(pp)
					
				}
				
				//中点检测
				if(!root.empty(abArr)) continue
				for(var j=b.mids.length-1;j>=0;j--){
					var mp=pAtoB(b.mids[j],b.rotation,b.pos)
					var tp=[mp[0]+dx,mp[1]+dy]
					if(!isin(tp,cps)) continue		
					
					var ps=psAtoB(troom.mps,troom.rotation,troom.pos)
					var pp=calc.adsorb([tp],sdis,ps,true,true)
					if(!pp) continue
					pp['target']=rids[i]
					pp['wid']=j
					pp['type']='mps'
					abArr.push(pp)
				}
			}
			
			//3.自由移动的代码
			if(root.empty(abArr)){
				var todo={mod:reg.name,act:'set',param:{dx:dt[0]/cvt,dy:dt[1]/cvt}}
				return {task:[todo]}
			}
			
			//4.取最小的吸附进行处理,并计算是否要带message
			var adt=[],min=0
			for(var i=abArr.length-1;i>=0;i--){
				var row=abArr[i]
				if(min==0){
					adt=row.delta
					min=row.dis
				}
				if(row.dis<min) adt=row.delta
			}
			
			//console.log('这里需要带连接信息')
			
			var todo={mod:reg.name,act:'set',param:{dx:(adt[0]+dx)/cvt,dy:(adt[1]+dy)/cvt}}
			return {task:[todo]}
		},
		gesturemove:function(){},
		
		
		
		/*控制区操作函数*/
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var dt=room[reg.name][me.core.dataKeys.structKey]
			//console.log(dt)
			var grid=[
				{icon:'bed',reg:'fur',param:{type:'bed'}},
				{icon:'gui',reg:'fur',param:{type:'bed'}},
				{icon:'chuangtougui',reg:'fur',param:{type:'bed'}},
				{icon:'tiaozhuo',reg:'fur',param:{type:'bed'}},
			]
			
			return [
					{type:'label',			title:'组件',	data:config.name+'['+dt.rid+']',	action:{}},
					{type:'label',			title:'旋转',	data:dt.rotation,		action:{}},
					{type:'label',			title:'楼层',	data:dt.storey,		action:{}},
					{type:'text',			title:'名称',	data:dt.name,			action:{'blur':function(val){return [self.ctlName(val,id,cvt)]}}	},
					
					{type:'number',	title:'高度',	data:dt.height,		action:{'blur':function(val){return [self.ctlHeight(val,id,cvt)]}}	},
					{type:'grid',			title:'添加',	data:grid,					action:{'click':addFur}	},
			]
			
			function addFur(val,reg){
				console.log(val)
				return {}
			}
		},
		
		
		pop:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey]
			var dt=room[reg.name][me.core.dataKeys.structKey]
			var sub_a=[
					{name:'copy',	title:'复制',close:true,sub:false,type:'button',data:id,action:self.ctlCopy},
					{name:'remove',	title:'删除',close:true,sub:false,type:'button',data:id,action:self.ctlRemove},
				]
			
			var sub_b=[
					{name:'rfur',title:'家具',close:true,sub:false,	type:'text',data:dt.name,action:self.ctlName},
					//{name:'rfura',title:'家具a',close:true,sub:false,	type:'text',data:dt.name,action:self.ctlName},
					{name:'rwall',title:'墙体',close:true,sub:false,type:'number',data:dt.height,action:self.ctlHeight},
				]
			
			var sub_c=[
					{name:'height',title:'层高',close:true,sub:false,	type:'number',data:dt.height,action:self.ctlHeight},
					{name:'storey',title:'楼层',close:true,sub:false,type:'number',data:dt.storey,action:self.ctlStorey},
					{name:'type',title:'类型',close:true,sub:false,type:'select',data:dt.height,action:self.ctlType},
				]
			
			var list=[
					{name:'label',title:'房间'},
					{name:'name',title:'名称',close:true,sub:false,	type:'text',data:dt.name,action:self.ctlName},
					
					{name:'attr',title:'属性',close:false,sub:true,	type:'more',data:sub_c},
					{name:'opt',title:'操作',close:false,sub:true,	type:'more',data:sub_a},
					{name:'add',title:'添加',close:false,sub:true,	type:'more',data:sub_b},
				]
			return list
		},
		
		ctlName:function(data,id,cvt){
			if(!root.isType(data,'string')) return
			return {mod:reg.name,act:'set',param:{name:data}}
		},
		ctlStorey:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			if(!root.isType(data,'number')) return
			return {mod:reg.name,act:'set',param:{storey:data}}
		},
		ctlHeight:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			//console.log(data)
			return root.isType(data,'number')?{mod:reg.name,act:'set',param:{height:root.calc.toF(data/cvt)}}:{}
		},
		ctlRemove:function(data,id,cvt){
			if(!root.isType(data,'string')) return
			return {mod:reg.name,act:'del',param:{rid:data}}
		},
		
		ctlAdd:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{rid:root.hash(),data:data}}
		},
		ctlCopy:function(hash,id,cvt){
			//console.log(data+','+id+','+cvt)
			if(!root.isType(hash,'string')) return
			return {mod:reg.name,act:'copy',param:{rid:hash}}
		},
		
		ctlType:function(data,id,cvt){
			if(!root.isType(data,'number')) return
			return {mod:reg.name,act:'set',param:{type:data}}
		},
		
		SB223N:function(room,rid,target,cvt){
			var ps=room[config.mainKey],len=ps.length
			var zx=[0,0],dis=[],angle=[],zj=Math.PI/2,thick=[],hthick=[]
			var cdis=run[target].dis
			for (var i = 0; i < len; i++) {
				var p1 = ps[i],p2=(i == (len - 1))?ps[0]:ps[i + 1]		
				var dx =p2[0]-p1[0],dy =p2[1]-p1[1]
				zx[0]+=p1[0],zx[1]+=p1[1]
				
				thick[i]=ps[i][2]
				hthick[i]=parseInt(ps[i][2]/2)
				if(dx==0 && dy==0){
					dis[i]=0,angle[i]= (i==0)?angle[len-1]+zj:angle[i-1]+zj
				}else{
					if (dx == 0) dis[i] = Math.abs(dy)
					else if (dy == 0)dis[i] = Math.abs(dx)
					else dis[i] = Math.round(Math.pow(dx * dx + dy * dy, 1 / 2))
					angle[i] = Math.atan((p2[1] - p1[1]) / (p2[0] - p1[0]))		
					if (p2[0] < p1[0]) angle[i] += zj+zj						//象限修正,不修正会出偏移出去的问题
				}
			}
			var calc=root.calc,cross=calc.cross,np=calc.newPoint
			var pad=calc.padding(ps)
			zx[0]=zx[0]/len,zx[1]=zx[1]/len
			var mid=[pad[1]/2,pad[0]/2]
			/*墙线及内外点的计算	*/
			var ips=[],mps=[],ops=[],cps=[],xps=[],yps=[],section=[]
			var fix=[],mids=[]		//修正到边界的变量
			for (var i = 0; i < len; i++) {
			    var pre = i - 1 < 0 ? len - 1 : i - 1
			    var bk = angle[i], ak = (i == 0) ? angle[len - 1] : angle[i - 1], ck = (i == (len - 1)) ? angle[0] : angle[i + 1]
				var pa=ps[i],pb=(i==(len-1))?ps[0]:ps[i+1]
				//console.log('i:'+i+'--'+thick[pre]+','+thick[i])
				section[i] = [[dis[i], me.core.sectionReg, i]]
				ips[i] = [ps[i][0], ps[i][1]]
				mps[i] = cross(ps[i], ak, hthick[pre], bk, hthick[i])
				ops[i] = cross(ps[i], ak, thick[pre], bk, thick[i])
				cps[i] = cross(ps[i], ak, cdis.active, bk,cdis.active)
				xps[i] = np(ips[i],thick[i],bk-zj)		//起点的垂直点
				yps[i] = np(xps[i],dis[i],bk)				//终点的垂直点
				mids[i] = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
				
				//1.角度的旋转量,明确是否为内凹的点关系
				var ank=calc.anClean(bk-ak)
				if(ank>Math.PI){
					//内凹的处理
					var pp=np(ops[i],thick[i],bk+zj)
					var dx=pp[0]-ops[i][0],dy=pp[1]-ops[i][1]
					fix[i]=Math.round(Math.pow(dx * dx + dy * dy, 1 / 2))
				}else{
					//非内凹的处理
					fix[i]=0
				}
			}
			var keys=me.core.dataKeys
			var obj={rid:rid,dis:dis,angle:angle,mid:mid,
				ips:ips,mps:mps,ops:ops,cps:cps,xps:xps,yps:yps,fix:fix,mids:mids,pad:pad,
				thick:thick,hthick:hthick,zx:zx,wlen:len,check:cps,}
			
			obj[keys.sectionKey]=section		//返回墙的section,整体的长度
			return $.extend(false,room,obj)		//fuu,需要把jquery的移植过来，保持独立的兼容性
		},
		
		
		SB168NN:function(cdata,basic,cvt,rid){
			//arr['rid']=rid
			//console.log(cdata)
			cdata['rid']=rid
			return cdata
		},
		
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		
		SB123N:function(room,cvt){
			var arr=room[config.mainKey]
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),parseInt(p[2]*cvt)]
			}
			var nroom={
				ground:room.ground*cvt,
				ceiling:room.ceiling*cvt,
				height:room.height*cvt,
				pos:[room.pos[0]*cvt,room.pos[1]*cvt],
				info: room.info || {},		//tag就放在这里面，用子组件的方式进行放置
				name: room.name || '',
				lock:room.lock||false,
				rotation:0,
				roomClass:room.roomClass,
				storey:1,
				remove:room.remove || false,
			}
			nroom[config.mainKey]=r
			return nroom
		},
		
		//处理房间是不是group的问题
		relate:function(ra,rb){
			
		},
		
		
		//point进行校验
		checkData:function(data){
			var ps=data[config.mainKey],len=ps.length
			var rst = root.calc.merge(ps)
			if (rst.offset[0] != 0 || rst.offset[1] != 0){
				data[config.mainKey]=root.clone(rst.points)
				data.pos=[data.pos[0]+ rst.offset[0],data.pos[1]+ rst.offset[1]]
			}
			for(var i=0;i<len;i++){
				data[config.mainKey][i][2]=data[config.mainKey][i][2]||config.dis.thick
			}
			return data
		},
		
		correctData:function(data,b){
			return data
		},
		
		report:function(dt,cvt){
			var rst={}
			var dkey=me.core.dataKeys.structKey
			var data=dt[dkey]
			rst['height']=data.height/cvt
			rst['girth']=root.calc.calcGirth(data[config.mainKey])/cvt
			rst['ground']=root.calc.calcArea(data[config.mainKey])/(cvt*cvt)
			rst['space']=rst['ground']*rst['height']
			rst['ceiling']=rst['ground']
			//console.log(rst)
			return rst
		},
		
		
		/*数据增删改区域 */
		add:function(p,dt){			//直接操作根
			return root.clone(config.defaultData)
		},
		copy:function(p,dt){
			var cp=root.clone(config.copy),rst=root.clone(dt)
			rst.pos=root.clone(dt.pos)		//需要修改clone为深复制
			rst.name=cp.pre+rst.name
			rst.pos[0]+=cp.pos[0]
			rst.pos[1]+=cp.pos[1]
			return rst
		},
		set:function(p,dt){			//调整组件参数的操作
			return self.data(p,dt)
		},
		del:function(p,dt){			//直接操作根
			
		},		
		data:function(p,data){		//将原始数据转换成通用数据的操作
			//console.log(data)
			var dd=data || config.defaultData
			dd.pos=[dd.pos[0]+(p.dx==undefined?0:p.dx),dd.pos[1]+(p.dy==undefined?0:p.dy)]
			dd.copy=p.copy || false
			dd.name=p.name==undefined?dd.name:p.name
			dd.height=p.height==undefined?dd.height:p.height
			return dd
		},			
	}
	root.regComponent(reg)
})(window.T)
/*****socket******/
;(function(root){
	var reg={
		name:'socket',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****switch******/
;(function(root){
	var reg={
		name:'switch',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//其他配置在这里
		defaultData:[],				//注册的数据格式,可以和这个进行格式的比对
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				rs[i]={
					
				}
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				var hh=p[2]?parseInt(p[2]*cvt):config.thick
				r[i]=[parseInt(p[0]*cvt),parseInt(p[1]*cvt),hh]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****wall******/
;(function(root){
	var reg={
		name:'wall',
		type:'module',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	var theme={
			yhf:{
				fill:'#FF0000',
				size: 12,
				color: '#383838',
				arc:'#FF8800',
				dash:'#FF8800',
			},
			cad:{
				fill:'#FF0000',
				size: 12,
				color: '#383838',
				arc:'#FFFF00',
				dash:'#FF8800',
			},
			fashion:{
				fill:'#BBBBBB',
				size: 14,
				color: '#003838',
				arc:'#FF8800',
				dash:'#888800',
			},
		}
	
	var config={
		isConnect:false,		//是否参与连接检测
		isStruct:true,			//是否为结构组件
		order:2,				//加载顺序	
		name:'墙体',
		theme:theme,
		relate:[['start','mp'],['center','mp'],['end','mp']], 		//参与吸附计算的节点位置
		active:{
			offset:0.1,			//2D绘制激活时候的偏移
		},
		dis:{
			adsorb:0.1,				//吸附距离
			minWidth:0.3,			//墙的最小距离
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			cornor:0.5,				//转角的偏移
		},
	}
	
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		
		/*渲染器数据处理区域 */
		
		//1.做A坐标系到B坐标系的计算
		twoStruct:function(ds,room,rd,cvt){
			var b=room[me.core.dataKeys.basicKey]
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB
			var rs=ds[me.core.dataKeys.structKey]
			//console.log(rs)
			if(rs){
				for(var i=0;i<rs.length;i++){
					var p=rs[i]
					
				}
			}
			var pos=b.pos,ro=b.rotation
			//line结构
			
			//绘制虚线
			rst.line.push({ps:toB(b.mps,ro,pos),cfg:{dash:true,dis:100}})
			
			//fill结构,先进先出,填充墙体
			rst.fill.push({ps:toB(b.ops,ro,pos),cfg:{detail:false,relate:false}})
			rst.fill.push({ps:toB(b.ips,ro,pos),cfg:{detail:false,relate:rd}})

			return rst
		},
		
		
		//1.做A坐标内部转换，做A坐标系到B坐标系的转换
		threeStruct:function(ds,room,rd,cvt){
			var rst = {meshes: [], lights: [], rays:[],show:true}		//输出3D的对象
			var dks=me.core.dataKeys
			var transA=root.calc.boxPosCalc,np=root.calc.newPoint,toB=root.calc.pAtoB
			
			for(var i=0,len=ds.length;i<len;i++){
				var b=room[dks.basicKey],bpos=b.pos,bro=b.rotation
				var dt=ds[i],box=[dt.x,dt.y,dt.z],st=dt.start.ip,ro=dt.angle
				//var rr=transA(box,st,ro),ss=b[me.core.dataKeys.sectionKey][i]
				
				var adis=0
				var ss=b[dks.sectionKey][i],slen=ss.length
				for(var j=0;j<slen;j++){
					var sec=ss[j],w=sec[0],type=sec[1],id=sec[2]
					//console.log('当前数据是:'+type)
					if(type==reg.name){
						var box=[w,dt.y,dt.z],pos=np(st,adis,ro)
						var rr=transA(box,pos,ro),npos=toB([rr.position[0],rr.position[1]],bro,bpos)
						npos[2]=rr.position[2]
						//console.log(rr)
						rst.meshes.push({type:'box',data:box,pos:npos,rotation:rr.rotation})
					}else{
						var rdata=room[type][dks.structKey][id]
						//console.log(type)
						//console.log(rdata)
						if(rdata.zo==0){
							//1.组件不离地
							var box=[w,dt.y,b.height-rdata.z],pos=np(st,adis,ro)
							var rr=transA(box,pos,ro),npos=toB([rr.position[0],rr.position[1]],bro,bpos)
							npos[2]=rr.position[2]
							
							//console.log(dt.z)
							rst.meshes.push({type:'box',data:box,pos:npos,rotation:rr.rotation})
						}else{
							//2.组件离地，需要构建上下两个box
							//底部的盒子
							if(rdata.zo>0){
								var box=[w,dt.y,rdata.zo],pos=np(st,adis,ro)
								//console.log(type)
								//console.log(box)
								pos[2]=b.height-rdata.zo
								var rr=transA(box,pos,ro),npos=toB([rr.position[0],rr.position[1]],bro,bpos)
								npos[2]=rr.position[2]
								rst.meshes.push({type:'box',data:box,pos:npos,rotation:rr.rotation})
							}
							
							//上部的盒子
							var zw=b.height-rdata.zo-rdata.z
							if(zw>0){
								var box=[w,dt.y,zw],pos=np(st,adis,ro)
								pos[2]=0
								var rr=transA(box,pos,ro),npos=toB([rr.position[0],rr.position[1]],bro,bpos)
								npos[2]=rr.position[2]
								rst.meshes.push({type:'box',data:box,pos:npos,rotation:rr.rotation})
							}
						}
					}
					adis+=w
				}
			}
			//console.log('wall structed')
			return rst
		},
		twoActive:function(ds,b,rd,cvt){
			var arr=[]
			if(ds){
				var toB=root.calc.psAtoB,offset=root.calc.offset
				var pos=b.pos,ro=b.rotation,os=config.active.offset*cvt
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle
					
					rst.line.push({ps:toB(offset(p.check,os,ak),ro,pos),cfg:{dash:false}})
					arr[i]=rst
				}
			}
			return arr
		},
		
		threeActive:function(ds,b,rd,cvt){
			var rst = {meshes: [], lights: [], rays:[],show:true}
			var transA=root.calc.boxPosCalc,np=root.calc.newPoint
			var len=ds.length
			for(var i=0;i<len;i++){
				var dt=ds[i],box=[dt.x,dt.y,dt.z],st=dt.start.ip,ro=dt.angle
				var rr=transA(box,st,ro)
				rst.meshes.push({box:box,pos:rr.position,rotation:rr.rotation})
			}
			return rst
		},
		
		/*插件数据处理区*/
		twoSize:function(id,dt,b,cfg){
			var rst=[],dis=b.dis,aks=b.angle,ak=aks[id]
			var len=b.ips.length
			var nid=id==(len-1)?0:id+1,pid=id==0?(len-1):id-1
			
			rst.push({ps:[b.xps[id],b.yps[id]],left:true,angle:aks[id],size:dis[id]})
			rst.push({ps:[b.xps[nid],b.yps[nid]],left:true,angle:aks[nid],size:dis[nid]})
			rst.push({ps:[b.xps[pid],b.yps[pid]],left:true,angle:aks[pid],size:dis[pid]})
			
			var ss=b[me.core.dataKeys.sectionKey][id],cdis=0
			for(var i=0,len=ss.length;i<len;i++) cdis+=ss[i][0]
			if(cdis==dis[id]){
				var np=root.calc.newPoint
				var pa=[],pb=[],ddis=0
				for(var i=0,len=ss.length;i<len;i++){
					ddis+=ss[i][0]
					var sp=b.ips[id]
					pa=i==0?sp:pb
					pb=np(sp,ddis,ak)
					rst.push({ps:[pa,pb],left:false,angle:ak,size:ss[i][0]})	
				}
			}
			return rst
		},
		
		
		/*屏幕操作方法区域*/
		
		touchmove:function(dt,b,dd,cvt){
			var tg=root.core.getCurTarget(),rids=root.core.getRids(tg)
			var act=root.core.getActive(tg),rid=act.cur.rid

			var dx=dt[0],dy=dt[1]
			var cdis=config.dis,sdis=cdis.adsorb*cvt,mdis=cdis.minWidth*cvt
			var redun=cdis.redun*cvt,step=cdis.step*cvt
			
			var ags=b.angle,ips=b.ips,ro=b.rotation,pos=b.pos
			var len=ips.length,wid=dd.id,pid=wid==0?len-1:wid-1,nid=wid==(len-1)?0:wid+1
			
			var calc=root.calc,toF=calc.toF,pAtoB=calc.pAtoB,psAtoB=calc.psAtoB,isin=calc.isIn
			var disToDirect=calc.disToDirect,cross=calc.cross,adsorb=calc.adsorb,newP=calc.newPoint

			//1.最小距离判断,是否会拉破
			var pdis=b.dis[pid],ndis=b.dis[nid]
			var dis_p=disToDirect(dx,dy,ags[pid])
			var dis_n=disToDirect(dx,dy,ags[nid]-Math.PI)
			var ndis_p=pdis+dis_p,ndis_n=ndis+dis_n
			
			//2.防止墙拉破
			if(ndis_p<mdis){
				var bp=pAtoB(newP(ips[pid],mdis,ags[pid]),ro,pos),ap=pAtoB(ips[wid],ro,pos)
				dx=bp[0]-ap[0]
				dy=bp[1]-ap[1]
			}
			
			if(ndis_n<mdis && len>2){
				if(wid==(len-2)) var nnid=0
				else if(wid==(len-1)) var nnid=1
				else var nnid=wid+2
				var bp=pAtoB(newP(ips[nnid],mdis,ags[nid]-Math.PI),ro,pos),ap=pAtoB(ips[nid],ro,pos)
				dx=bp[0]-ap[0]
				dy=bp[1]-ap[1]
			}
			
			//2.吸附计算,看是否有吸附存在
			var abArr=[]
			var mps=psAtoB([b.mps[wid],b.mps[nid]],ro,pos)		//把需要检测的点转换好
			
			for(var i=0,rlen=rids.length;i<rlen;i++){
				if(rids[i]==rid) continue
				var tid=rids[i]
				var troom=root.core.getBasic(tid,tg),cps=psAtoB(troom.cps,troom.rotation,troom.pos)
				for(var j=mps.length-1;j>=0;j--){
					var tp=[mps[j][0]+dx,mps[j][1]+dy]
					if(!isin(tp,cps)) continue		
					
					//console.log('-------计算mps的吸附值,补充tid和dis,isPoint--------')
					var ps=psAtoB(troom.mps,troom.rotation,troom.pos)
					var pp=calc.adsorb([tp],sdis,ps,true,true)
					if(!pp) continue
					pp['target']=tid
					pp['wid']=j
					pp['type']='mps'
					abArr.push(pp)
				}
			}
			
			//根据吸附对值偏移进行修正
			var adt=[0,0],min=0
			if(!root.empty(abArr)){
				//console.log('吸附的数据是:'+JSON.stringify(abArr))
				for(var i=abArr.length-1;i>=0;i--){
					var row=abArr[i]
					if(min==0){
						adt=row.delta
						min=row.dis
					}
					if(row.dis<min) adt=row.delta
				}
			}
			
			//3.对位移距离进行整数位吸附处理，前后都需要
			
			
			//4.计算墙的移动,吸附也计算进去
			var todo=[]
			if(adt[0]==0 && adt[1]==0){
				//对整数进行吸附
				var dis=disToDirect(dx,dy,ags[wid]-Math.PI/2)
				dis+=calc.approx(dis,[ndis_p,ndis_p],step,redun)
			}else{
				var dis=disToDirect(dx+adt[0],dy+adt[1],ags[wid]-Math.PI/2)
			}
			
			var np_w=cross(ips[wid],ags[pid],0,ags[wid],dis,false)
			var np_n=cross(ips[nid],ags[wid],dis,ags[nid],0,false)
			
			var wp=[toF(np_w[0]/cvt),toF(np_w[1]/cvt),toF(b.thick[wid]/cvt)]
			var np=[toF(np_n[0]/cvt),toF(np_n[1]/cvt),toF(b.thick[nid]/cvt)]
			
			todo.push({mod:'point',act:'set',param:{id:wid,data:wp}})
			todo.push({mod:'point',act:'set',param:{id:nid,data:np}})
			
			return {task:todo}
		},
		gesturemove:function(dt,b,dd,cvt){
			
		},
		
		/*控制区操作函数*/
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			var grid=[
				{icon:'',reg:'doorPing',param:{}},
				{icon:'',reg:'doorTui',param:{}},
				{icon:'',reg:'winPing',param:{}},
				{icon:'',reg:'winTui',param:{}},
				{icon:'',reg:'winTu',param:{}},
			]
			
			return [
					{type:'label',	title:'房间',	data:b.name,},
					{type:'label',	title:'组件',	data:config.name+'['+id+']'},
					{type:'label',	title:'长度',	data:dt.x,		action:{'blur':function(val){return self.ctlWx(val,id,cvt)}}	},
					{type:'number',	title:'厚度',	data:dt.y,		action:{'blur':function(val){return self.ctlWy(val,id,cvt)}}	},
					{type:'number',	title:'高度',	data:dt.z,		action:{'blur':function(val){return self.ctlWz(val,id,cvt)}}	},
					{type:'grid',	title:'添加',	data:grid,		action:{'click':addRegs}	},
			]
			
			function addRegs(val){
				
			}
		},
		
		pop:function(room,id,tg){
			var ks=me.core.dataKeys
			var b=room[ks.basicKey],dt=room[reg.name][ks.structKey][id],wx=b.dis[id]
			var cvt=root.core.getConvert(tg)
			var len=b.ips.length,next=id==(len-1)?0:id+1
			var cen=root.calc.mid(b.ips[id],b.ips[next])
			cen[2]=b.thick[id]
			var mdis=wx/2
			
			var sub_opt=[
					//{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
					{title:'清理',type:'button',close:true,name:'remove',data:id,action:self.ctlClear},
				]
			
			var sub_add=[
					//{title:'开洞a',type:'button',close:true,name:'donga',data:wx,action:self.ctlDong},
					{title:'中点',type:'button',close:true,name:'mid',data:{mid:cen,dis:mdis},action:self.ctlMid},
					{title:'开洞',type:'button',close:true,name:'dong',data:id,action:root.dong.ctlNew},
					{title:'门',type:'select',close:true,name:'door',data:[
						
					],action:self.ctlDoor},
					{title:'窗',type:'select',close:true,name:'win',data:[
							{active:false,data:1,name:'平开窗',action:function(){
								var todo=root['dong'].ctlNew({},id)
								config.log(todo)
								root.core.todo(todo, true, rs.rid, tg)
							}},
							{active:true,data:2,name:'推拉窗',action:function(){}},
						],action:self.ctlWin},
					{title:'结构',type:'select',close:true,name:'wall',data:[],action:self.ctlStruct},
				]
			
			var sub_cornor=[],ptKey='point'
			var skey=me.core.dataKeys.sectionKey
			var cdis=config.dis.cornor,dis=config.dis.cornor*cvt
			var pre=id==0?len-1:id-1
			var sc_a=b[skey][pre],sc_b=b[skey][id],sa=sc_a[sc_a.length-1],sb=sc_b[0]
			if(sa[1]==me.core.sectionReg&&sb[1]==me.core.sectionReg && sa[0]>dis && sb[0]>dis){
				var wak=b.angle[id],pak=b.angle[pre],zj=Math.PI/2
				var np=root.calc.newPoint,toF=root.calc.toF
				var pa=np(b.ips[id],-dis,pak),pb=np(pa,dis,wak),pc=np(pb,dis,pak)
				var param={pa:pa,pb:pb,pc:pc,dis:cdis}
				sub_cornor.push({name:'cornor',title:'左拐',close:true,sub:false,type:'button',data:param,action:root[ptKey].ctlCornor})
			}
			
			var sc_a=b[skey][id],sc_b=b[skey][next],sa=sc_a[sc_a.length-1],sb=sc_b[0]
			if(sa[1]==me.core.sectionReg&&sb[1]==me.core.sectionReg && sa[0]>dis && sb[0]>dis){
				var wak=b.angle[next],pak=b.angle[id],zj=Math.PI/2
				var np=root.calc.newPoint,toF=root.calc.toF
				var pa=np(b.ips[next],-dis,pak),pb=np(pa,dis,wak),pc=np(pb,dis,pak)
				var param={pa:pa,pb:pb,pc:pc,dis:cdis,id:next}	//fuu,注意!非活动的id需要主动传入
				sub_cornor.push({name:'cornor',title:'右拐',close:true,sub:false,type:'button',data:param,action:root[ptKey].ctlCornor})
			}
			
			
			var pops=[
					{title:'墙厚',type:'number',close:true,name:'width',data:dt.y,sub:false,action:self.ctlWy}
				]
			if(!root.empty(sub_cornor)) pops.push({title:'拐角',name:'cornor',close:true,sub:true,data:sub_cornor})
			pops.push({title:'添加',name:'add',close:false,sub:true,data:sub_add})
			pops.push({title:'操作',name:'opt',close:false,sub:true,data:sub_opt})
			
			return pops
		},
		
		ctlMid:function(data,id,cvt){
			var toF=root.calc.toF,p=data.mid
			//console.log(JSON.stringify(data))
			var pp=[toF(p[0]/cvt),toF(p[1]/cvt),toF(p[2]/cvt)]
			var dis=toF(data.dis/cvt)
			return [{mod:'point',act:'add',param:{id:id,point:pp,dis:dis}}]
		},
		ctlAdis:function(data,id,cvt){},
		ctlBdis:function(data,id,cvt){},
		ctlRemove:function(data,id,cvt){},
		ctlThick:function(data,id,cvt){},
		ctlWx:function(data,id,cvt){},
		ctlWy:function(data,id,cvt){},
		ctlWz:function(data,id,cvt){},
		
		ctlDong:function(data,id,cvt){
			//fuu,分两步操作存在问题：
			//1.无法获取新建的组件的id
			console.log(data)
			var arr=[]
			arr.push(root.dong.ctlNew(data,id,cvt))
			arr.push(root.dong.ctlWx(data,id,cvt))
			return arr
		},
		ctlDoor:function(data,id,cvt){},
		ctlWin:function(data,id,cvt){},
		ctlStruct:function(data,id,cvt){},
		ctlClear:function(data,id,cvt){},
		
		
		SB168NN:function(arr,b,cvt){
			//console.log(arr)
			var mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops,xps=b.xps,yps=b.yps
			//console.log(xps)
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				var n=(i==len-1)?0:i+1,pre=i==0?len-1:i-1
				var pa=ips[i],pb=ips[n],pc=ips[pre]
				var fpa=[pa[0],pa[1],arr[i]],fpb=[pb[0],pb[1],arr[n]],fpc=[pc[0],pc[1],arr[pre]]
				var start={ip:ips[i],mp:mps[i],op:ops[i]}
				var end={ip:ips[n],mp:mps[n],op:ops[n]}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var ak=b.angle[i],xw=b.dis[i],yw=b.thick[i],zw=b.height
				var tap=[start.ip,xps[i],yps[i],end.ip]
				rs[i]={
					id:i,wid:i,start:start,end:end,center:cen,angle:ak,check:tap,x:xw,y:yw,z:zw,
					data:fpa,pre:fpc,next:fpb,
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++) r[i]=parseInt(arr[i][2]*cvt)
			return r
		},
		
		relate:function(ra,rb){
			
			return false
		},
		
		changeData:function(){
			//console.log('ok')
		},
		checkData:function(data){
			//console.log('check point data')
			return data
		},
		
		correctData:function(data,rid){
			
			return data
		},
		
		report:function(dt,cvt){
			//console.log(dt)
			var rst={wall:0,struct:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['wall']+=row.x*row.z/(cvt*cvt)
				rst['struct']+=row.x*row.z*row.y/(2*cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			
			return rst
		},
		
		connect:function(ra,ba,rb,bb){
			var task=[]
			
			return task
		},
		
		
		/*数据增删改区域 */
		//直接用point的数据？
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	root.regComponent(reg)
})(window.T)
/*****wallAdd******/
;(function(root){
	var reg={
		name:'wallAdd',
		type:'module',
		category:'wall',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:11,						//加载顺序
		theme:theme,
		
		//[wid,adis,x,yoffset,z,zoffset,thick,rotation,type]
		defaultData:[1,0.4,0.9,0,2.7,0.1,0.1,45,0],		
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,rid,render){},
		twoDrawing:function(){},
		dwgActive:function(){},
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		showAttr:function(){},
		showPop:function(){},
		touchmove:function(){},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(){},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		
		//[wid,adis,x,yoffset,z,zoffset,thick,rotation,type]
		//defaultData:[1,0.4,0.9,0,2.7,0.1,0.1,45,0],		
		//fuu,计算部分要重写
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],yo=dd[3],zw=dd[4],zo=dd[5],thick=dd[6],ro=dd[7],type=dd[8]
				var ak=b.angle[wid],yw=yw?yw:b.thick[wid]
				
				/*var start={ip:np(ips[wid],adis,ak),mp:np(mps[wid],adis,ak),op:np(ops[wid],adis,ak)}
				var end={ip:np(ips[wid],adis+xw,ak),mp:np(mps[wid],adis+xw,ak),op:np(ops[wid],adis+xw,ak)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]	
				rs[i]={
					start:start,end:end,center:cen,angle:ak,check:tap,x:xw,y:yw,z:zw
				}*/
			}
			return rs
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i]
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt),parseInt(p[4]*cvt),parseInt(p[5]*cvt),parseInt(p[6]*cvt),p[7]*Math.PI/180,p[8]]
			}
			return r
		},
		SB221NC:function(rid,target){
			
		},
		
		checkData:function(data){
			return data
		},
		
		correctData:function(data,rid){
			return data
		},
		
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,rid){},		//添加一个组件的操作
		set:function(p,rid){},		//调整组件参数的操作
		del:function(p,rid){},		//删除一个组件的操作
		data:function(){},			//将原始数据转换成通用数据的操作
	}
	
	root.regComponent(reg)
})(window.T)
/*****wallLow******/
;(function(root){
	var reg={
		name:'wallLow',
		type:'module',
		category:'wall',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#888888',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:false,				//是否为结构组件
		order:30,					//加载顺序
		theme:theme,
		name:'矮墙',					//主要阳台和露台的矮墙
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			copy:0.1,				//复制时的位置偏移
		},
		//[wid,adis,x]
		defaultData:[1,0.3,0.9],				
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB
			var pos=b.pos,ro=b.rotation
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false}})
					//rst.line.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{dash:false}})
				}
			}
			return rst
		},
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	

					//rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					
					arr[i]=rst
				}
			}
			return arr
		},
		twoSize:function(id,dt,b,cfg){
			var rst=[]
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			
			rst.push({ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,action:self.ctlAdis})
			rst.push({ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,action:self.ctlWidth})
			rst.push({ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,action:self.ctlBdis})
			rst.push({ps:[ips[wid],ips[nwid]],left:false,angle:ak,size:b.dis[wid]})
			
			return rst
		},
		
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return [todo]
		},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		//把需要的数据返回出去，就这个作用
		pop:function(room,id,tg){
			var keys=me.core.dataKeys
			var b=room[keys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][keys.structKey],dt=ds[id]
			var wid=dt.wid,wx=b.dis[wid]
			var check=root.core.checkSection,sss=b[keys.sectionKey]
			
			//处理复制的位置
			var dis=config.dis.copy*cvt,dx=dt.x,len=b.ips.length
			var sct=[dx,reg.name,ds.length],scts=sss[wid]
			var arr=check(sct,dis,scts)
			if(root.empty(arr)){
				var nid=wid==(len-1)?0:wid+1,nscts=sss[nid],narr=check(sct,dis,nscts)
				if(!root.empty(narr)){
					var adis=0,sid=nid,nsn=narr[0],adis=dis
					for(var i=0;i<nsn;i++) adis+=nscts[i][0]
				}
				
				if(adis==undefined){
					var pid=wid==0?(len-1):wid-1,pscts=sss[pid],parr=check(sct,dis,pscts)
					if(!root.empty(parr)){
						var adis=0,sid=pid,psn=parr[0],adis=dis
						for(var i=0;i<psn;i++) adis+=pscts[i][0]
					}
				}
			}else{
				var adis=0,sid=wid
				var sn=arr[0],adis=dis
				for(var i=0;i<sn;i++) adis+=scts[i][0]
			}
			
			
			var sub_opt=[
					//{title:'复制',type:'button',close:true,name:'copy',	data:id,action:self.ctlCopy},
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
				]
			
			if(adis!=undefined&& sid!=undefined){
				sub_opt.push({title:'复制',type:'button',close:true,name:'copy',	data:{dis:adis,x:dx,id:sid},action:self.ctlCopy})
			}
		
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlCopy:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{adis:data.dis/cvt,x:data.x/cvt,wid:data.id}}
		},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				//[wid,adis,x]	
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2]
				var ak=b.angle[wid],zj=Math.PI/2
				var yw=b.thick[wid],zw=b.height,hf=b.hthick[wid]
				var bdis=b.dis[wid]-adis-xw
				var xo=adis,yo=0,zo=0,ro=0
				var ip=np(ips[wid],adis,ak),op=np(ips[wid],adis+xw,ak)
				var start={ip:ip,mp:np(ip,hf,ak-zj),op:np(ip,yw,ak-zj)}
				var end={ip:op,mp:np(op,hf,ak-zj),op:np(op,yw,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,x:xw,y:yw,z:zw,xo:xo,yo:yo,zo:zo,rotation:ro,angle:ak,
					start:start,end:end,center:cen,check:tap,adis:adis,bdis:bdis,
				}
			}
			return rs
		},
		
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var w=arr[i]
				r[i]=[w[0],parseInt(w[1]*cvt),parseInt(w[2]*cvt)]
			}
			return r
		},
		SB221NC:function(arr,scts){
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		//校准房间之间的关系
		relate:function(ra,rb,cvt){
			//console.log(JSON.stringify(ra))
			//console.log('ok,ready to calc room relate')
		},
		changeData:function(data,msg){
			//console.log(JSON.stringify(msg))
			console.log('需要处理adis和dis的关系')
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid>=msg.wid)row[0]+=-1
					else if(wid==0)row[0]=0
				}
				rst.push(row)
			}
			return rst
		},
		
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,dt){
			dt.push(self.data(p))
			return dt
		},		
			
		set:function(p,dt){
			//console.log(JSON.stringify(dt))
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},

		del:function(p,dt){
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)rst.push(dt[i])
			return rst
			
		},
		
		//将原始数据转换成通用数据的操作
		//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		data:function(p,data){
			var dd=data || root.clone(config.defaultData)
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			return dd
		},		
	}
	
	root.regComponent(reg)
})(window.T)
/*****wallRemove******/
;(function(root){
	var reg={
		name:'wallRemove',
		type:'module',
		category:'wall',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				//active:'#00FF00',
				dash:'#FF8800',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:true,				//是否为结构组件
		order:9,						//加载顺序
		theme:theme,
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,			//换墙的移动距离，用来体现用力拉过去
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			copy:0.1,					//拷贝的A偏移
			dash:0.1,				//虚线数
			minWidth:0.3,			//最小尺寸
		},
		//[wid,adis,x,zoffset,z]
		defaultData:[0,0.1,0.6,0.1,2.6],				
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB
			var pos=b.pos,ro=b.rotation,zj=Math.PI/2,ddis=config.dis.dash*cvt
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false,relate:rd}})
					//rst.line.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{dash:false}})
					
					rst.line.push({ps:toB([st.ip,ed.ip],ro,pos),cfg:{dash:true,dis:ddis}})
					rst.line.push({ps:toB([st.op,ed.op],ro,pos),cfg:{dash:true,dis:ddis}})
				}
			}
			return rst
		},
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					arr[i]=rst
				}
			}
			return arr
		},
		
		twoSize:function(id,dt,b,cfg){
			var rst=[]
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			
			rst.push({ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,action:self.ctlAdis})
			rst.push({ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,action:self.ctlWidth})
			rst.push({ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,action:self.ctlBdis})
			rst.push({ps:[ips[wid],ips[nwid]],left:false,angle:ak,size:b.dis[wid]})
			
			return rst
		},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return {task:[todo]}
		},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		//把需要的数据返回出去，就这个作用
		pop:function(room,id,tg){
			var keys=me.core.dataKeys
			var b=room[keys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][keys.structKey],dt=ds[id],wid=dt.wid,wx=b.dis[wid]
			var check=root.core.checkSection,sss=b[keys.sectionKey]
			
			//处理复制的位置
			var dis=config.dis.copy*cvt,dx=dt.x,len=b.ips.length
			var sct=[dx,reg.name,ds.length],scts=sss[wid]
			var arr=check(sct,dis,scts)
			if(root.empty(arr)){
				var nid=wid==(len-1)?0:wid+1,nscts=sss[nid],narr=check(sct,dis,nscts)
				if(!root.empty(narr)){
					var adis=0,sid=nid,nsn=narr[0],adis=dis
					for(var i=0;i<nsn;i++) adis+=nscts[i][0]
				}
				
				if(adis==undefined){
					var pid=wid==0?(len-1):wid-1,pscts=sss[pid],parr=check(sct,dis,pscts)
					if(!root.empty(parr)){
						var adis=0,sid=pid,psn=parr[0],adis=dis
						for(var i=0;i<psn;i++) adis+=pscts[i][0]
					}
				}
			}else{
				var adis=0,sid=wid
				var sn=arr[0],adis=dis
				for(var i=0;i<sn;i++) adis+=scts[i][0]
			}
			
			var sub_opt=[
					//{title:'复制',type:'button',close:true,name:'copy',	data:id,action:self.ctlCopy},
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
				]
			if(adis!=undefined&& sid!=undefined){
				sub_opt.push({title:'复制',type:'button',close:true,name:'copy',	data:{dis:adis,x:dx,id:sid},action:self.ctlCopy})
			}
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlCopy:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{adis:data.dis/cvt,x:data.x/cvt,wid:data.id}}
		},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			
			var ips=b.ips,mps=b.mps,ops=b.ops,zj=Math.PI/2
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				//[wid,adis,x,zoffset,z]
				//defaultData:[0,0.1,0.6,0.1,2.6],		
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],zo=dd[3],zw=dd[4]
				var ak=b.angle[wid],yw=b.thick[wid],hf=b.hthick[wid]
				var bdis=b.dis[wid]-adis-xw
				var ip=np(ips[wid],adis,ak),op=np(ips[wid],adis+xw,ak)
				var start={ip:ip,mp:np(ip,hf,ak-zj),op:np(ip,yw,ak-zj)}
				var end={ip:op,mp:np(op,hf,ak-zj),op:np(op,yw,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,start:start,end:end,center:cen,angle:ak,check:tap,
					x:xw,y:yw,z:zw,zo:zo,xo:adis,yo:0,
					adis:adis,bdis:bdis,
				}
			}
			return rs
		},
		
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var w=arr[i]
				r[i]=[w[0],parseInt(w[1]*cvt),parseInt(w[2]*cvt),parseInt(w[3]*cvt),parseInt(w[4]*cvt)]
			}
			return r
		},
		SB221NC:function(arr,scts){
			//console.log('分段原始数据'+JSON.stringify(scts))
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				//console.log(reg.name+'的id '+i+' 数据是:'+ JSON.stringify([cur.x,reg.name,cur.id]))
				//console.log('分段的adis是：'+cur.adis+',分段对象是:'+JSON.stringify(scts[cur.wid]))
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		
		//校准房间之间的关系
		relate:function(ra,rb,cvt){
			//console.log(JSON.stringify(ra))
			//console.log('ok,ready to calc room relate')
		},
		changeData:function(data,msg){
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid>=msg.wid)row[0]+=-1
					else if(wid==0)row[0]=0
				}
				rst.push(row)
			}
			return rst
		},
		correctData:function(data,b,cvt){
			var rst=[],min=config.dis.minWidth
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i]
				var wid=row[0],adis=row[1],w=row[2],wallx=b.dis[wid]/cvt
				if(wallx>=adis+w){
					rst.push(row)
				}else if(wallx>w && wallx<adis+w){
					row[1]=wallx-w
					rst.push(row)
				}else if(wallx>=min && wallx<=w){
					row[1]=0
					row[2]=wallx
					rst.push(row)
				}
			}
			return rst
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		
		/*数据增删改区域 */
		add:function(p,dt){
			dt.push(self.data(p))
			return dt
		},		
			
		set:function(p,dt){
			//console.log(JSON.stringify(dt))
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},

		del:function(p,dt){
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)rst.push(dt[i])
			return rst
		},
		
		//将原始数据转换成通用数据的操作
		//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		data:function(p,data){
			var dd=data || root.clone(config.defaultData)
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			return dd
		},		
	}
	
	root.regComponent(reg)
})(window.T)
/*****wallStruct******/
;(function(root){
	var reg={
		name:'wallStruct',
		type:'module',
		category:'wall',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#888888',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:true,				//是否为结构组件
		order:10,						//加载顺序
		theme:theme,
		
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			copy:0.1,				//复制时的位置偏移
		},
		//[wid,adis,x]
		defaultData:[1,0.3,0.9],				
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB
			var pos=b.pos,ro=b.rotation
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false}})
					//rst.line.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{dash:false}})
				}
			}
			return rst
		},
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	

					//rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					
					arr[i]=rst
				}
			}
			return arr
		},
		twoSize:function(id,dt,b,cfg){
			var rst=[]
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			
			rst.push({ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,action:self.ctlAdis})
			rst.push({ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,action:self.ctlWidth})
			rst.push({ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,action:self.ctlBdis})
			rst.push({ps:[ips[wid],ips[nwid]],left:false,angle:ak,size:b.dis[wid]})
			
			return rst
		},
		
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return [todo]
		},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		//把需要的数据返回出去，就这个作用
		pop:function(room,id,tg){
			var keys=me.core.dataKeys
			var b=room[keys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][keys.structKey],dt=ds[id]
			var wid=dt.wid,wx=b.dis[wid]
			var check=root.core.checkSection,sss=b[keys.sectionKey]
			
			//处理复制的位置
			var dis=config.dis.copy*cvt,dx=dt.x,len=b.ips.length
			var sct=[dx,reg.name,ds.length],scts=sss[wid]
			var arr=check(sct,dis,scts)
			if(root.empty(arr)){
				var nid=wid==(len-1)?0:wid+1,nscts=sss[nid],narr=check(sct,dis,nscts)
				if(!root.empty(narr)){
					var adis=0,sid=nid,nsn=narr[0],adis=dis
					for(var i=0;i<nsn;i++) adis+=nscts[i][0]
				}
				
				if(adis==undefined){
					var pid=wid==0?(len-1):wid-1,pscts=sss[pid],parr=check(sct,dis,pscts)
					if(!root.empty(parr)){
						var adis=0,sid=pid,psn=parr[0],adis=dis
						for(var i=0;i<psn;i++) adis+=pscts[i][0]
					}
				}
			}else{
				var adis=0,sid=wid
				var sn=arr[0],adis=dis
				for(var i=0;i<sn;i++) adis+=scts[i][0]
			}
			
			
			var sub_opt=[
					//{title:'复制',type:'button',close:true,name:'copy',	data:id,action:self.ctlCopy},
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
				]
			
			if(adis!=undefined&& sid!=undefined){
				sub_opt.push({title:'复制',type:'button',close:true,name:'copy',	data:{dis:adis,x:dx,id:sid},action:self.ctlCopy})
			}
		
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlCopy:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{adis:data.dis/cvt,x:data.x/cvt,wid:data.id}}
		},
		ctlThick:function(){},
		ctlWx:function(){},
		ctlWy:function(){},
		ctlWz:function(){},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				//[wid,adis,x]	
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2]
				var ak=b.angle[wid],zj=Math.PI/2
				var yw=b.thick[wid],zw=b.height,hf=b.hthick[wid]
				var bdis=b.dis[wid]-adis-xw
				var xo=adis,yo=0,zo=0,ro=0
				var ip=np(ips[wid],adis,ak),op=np(ips[wid],adis+xw,ak)
				var start={ip:ip,mp:np(ip,hf,ak-zj),op:np(ip,yw,ak-zj)}
				var end={ip:op,mp:np(op,hf,ak-zj),op:np(op,yw,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,x:xw,y:yw,z:zw,xo:xo,yo:yo,zo:zo,rotation:ro,angle:ak,
					start:start,end:end,center:cen,check:tap,adis:adis,bdis:bdis,
				}
			}
			return rs
		},
		
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var w=arr[i]
				r[i]=[w[0],parseInt(w[1]*cvt),parseInt(w[2]*cvt)]
			}
			return r
		},
		SB221NC:function(arr,scts){
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		//校准房间之间的关系
		relate:function(ra,rb,cvt){
			//console.log(JSON.stringify(ra))
			//console.log('ok,ready to calc room relate')
		},
		changeData:function(data,msg){
			//console.log(JSON.stringify(msg))
			console.log('需要处理adis和dis的关系')
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid>=msg.wid)row[0]+=-1
					else if(wid==0)row[0]=0
				}
				rst.push(row)
			}
			return rst
		},
		
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,rid,target){
			return dt
		},
		
		/*数据增删改区域 */
		add:function(p,dt){
			dt.push(self.data(p))
			return dt
		},		
			
		set:function(p,dt){
			//console.log(JSON.stringify(dt))
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},

		del:function(p,dt){
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)rst.push(dt[i])
			return rst
			
		},
		
		//将原始数据转换成通用数据的操作
		//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		data:function(p,data){
			var dd=data || root.clone(config.defaultData)
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			return dd
		},		
	}
	
	root.regComponent(reg)
})(window.T)
/*****winFull******/
;(function(root){
	var reg={
		name:'winFull',
		type:'module',
		category:'win',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,		//是否参与连接检测
		isStruct:true,			//是否为结构组件
		order:11,				//加载顺序
		name:'封阳台窗',			//封阳台的窗，和矮墙配合使用
		theme:theme,
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			block:0.6,				//窗的默认宽度
		},
		//[wid,adis,x,z,zoffset,y,offset,[dis,dis,...],[ro,ro,...]]
		defaultData:[1,0.2,1.8,1.2,0.9,0.1,0.05,[0.4,0.8],[1,1]],				
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB
			var pos=b.pos,ro=b.rotation
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false,relate:rd}})
					rst.line.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{dash:false}})
				}
			}
			return rst
		},
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	

					//rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					
					arr[i]=rst
				}
			}
			return arr
		},
		twoSize:function(id,dt,b,cfg){
			var rst=[]
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			
			rst.push({ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,action:self.ctlAdis})
			rst.push({ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,action:self.ctlWidth})
			rst.push({ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,action:self.ctlBdis})
			rst.push({ps:[ips[wid],ips[nwid]],left:false,angle:ak,size:b.dis[wid]})
			
			return rst
		},
		
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return {task:[todo]}
		},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			var type=[
				{icon:'doorPing',		reg:'doorPing',	param:{todo:null}},
				{icon:'doorTui',		reg:'doorTui',		param:{todo:null}},
				{icon:'doorEntry',	reg:'doorEntry',	param:{todo:null}},
			]
			console.log(dt)
			return [
					{type:'label',			title:'组件',		data:config.name,	action:{}},
					{type:'label',			title:'分扇',		data:'未开发',	action:{}},
					{type:'grid',			title:'类型',		data:type,				action:{'click':winTrans}	},
					{type:'number',	title:'宽度',		data:dt.x,					action:{'blur':function(val){return [self.ctlWx(val,id,cvt)]}}	},
					{type:'number',	title:'高度',		data:dt.z,					action:{'blur':function(val){return [self.ctlWz(val,id,cvt)]}}	},
					{type:'number',	title:'深度',		data:dt.y,					action:{'blur':function(val){return [self.ctlWy(val,id,cvt)]}}	},
					{type:'number',	title:'离地高度',	data:dt.zo,				action:{'blur':function(val){return [self.ctlOz(val,id,cvt)]}}	},
					{type:'number',	title:'左距',		data:dt.adis,			action:{'blur':function(val){return [self.ctlAdis(val,id,cvt)] }}	},
					{type:'number',	title:'右距',		data:dt.bdis,			action:{'blur':function(val){return [self.ctlAdis(dt.adis+dt.bdis-val,id,cvt)] }}	},
				]
			
			function winTrans(val,com){
				if(com==reg.name) return
				console.log(com)
				var nd=self[com](dt)
				console.log([self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)])
				return [self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)]
			}
		
		},
		pop:function(room,id){
			var b=room[me.core.dataKeys.basicKey],dt=room[reg.name][me.core.dataKeys.structKey][id]
			var sub_opt=[
					{title:'复制',type:'button',close:true,name:'copy',	data:id,action:self.ctlCopy},
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
				]
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlThick:function(){},
		ctlWx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,x:root.calc.toF(data/cvt)}}
		},
		ctlWy:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,y:root.calc.toF(data/cvt)}}
		},
		ctlWz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,z:root.calc.toF(data/cvt)}}
		},
		ctlOz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<0?{}:{mod:reg.name,act:'set',param:{id:id,zo:root.calc.toF(data/cvt)}}
		},
		/*功能函数区*/
		blocks:function(w,cvt){
			var sw=config.dis.block*cvt,dw=sw/2
			if(w<sw) return w
			var n=Math.floor(w/sw),left=w-n*sw
			if(left>=dw)n++
			return {width:w/n,count:n}
		},
		
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				//[wid,adis,x,z,zo,y,offset,[dis,dis,...],[ro,ro,...]]
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],zw=dd[3],zo=dd[4],yw=dd[5]?dd[5]:b.thick[wid],offset=dd[6],dss=dd[7],ros=dd[8]
				var ak=b.angle[wid],zj=Math.PI/2,hf=b.hthick[wid]
				var bdis=b.dis[wid]-adis-xw
				var xo=adis,yo=0,ro=0
				var ip=np(ips[wid],adis,ak),op=np(ips[wid],adis+xw,ak)
				var start={ip:ip,mp:np(ip,hf,ak-zj),op:np(ip,yw,ak-zj)}
				var end={ip:op,mp:np(op,hf,ak-zj),op:np(op,yw,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,x:xw,y:yw,z:zw,xo:xo,yo:yo,zo:zo,rotation:ro,angle:ak,
					start:start,end:end,center:cen,check:tap,block:dss,direction:ros,
					adis:adis,bdis:bdis,
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i],ds=[]
				if(p[7] && root.isType(p[7],'array'))for(var j=0;j<p[7].length;j++)ds[j]=parseInt(p[7][j]*cvt)
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt),parseInt(p[4]*cvt),p[5]?parseInt(p[5]*cvt):0,p[6]?parseInt(p[6]*cvt):0,ds,p[8]?p[8]:[]]
			}
			return r
		},
		SB221NC:function(arr,scts){
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,cvt){
			var rst={wall:0,space:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			return rst
		},
		
		
		/*数据转换区域*/
		toWinTu:function(data){
			return data
		},
		
		toWinPing:function(data){
			return data
		},
		
		
		/*数据增删改区域 */
		add:function(p,dt){
			if(p.id===undefined) return
			
		},		
			
		set:function(p,dt){
			//console.log(JSON.stringify(dt))
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},

		del:function(p,dt){
			if(p.id===undefined) return
			
		},
		
		//将原始数据转换成通用数据的操作
		//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		data:function(p,data){
			var dd=data || config.defaultData
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			dd[4]=p.zo===undefined?dd[4]:p.zo
			return dd
		},	
	}
	
	root.regComponent(reg)
})(window.T)
/*****winPing******/
;(function(root){
	var reg={
		name:'winPing',
		type:'module',
		category:'win',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			cad:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			fashion:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:true,				//是否为结构组件
		order:11,						//加载顺序
		name:'平开窗',
		theme:theme,
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,		//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			copy:0.1,		
			yoffset:0.035,			//中线偏移
			dash:0.1,				//虚线数
		},
		//[wid,adis,x,z,zoffset,y,offset,[dis,dis,...]]
		//defaultData:[1,0.2,1.8,1.2,0.9,0.1,0.05,[0.4,0.8]],
		defaultData:[1,0.2,1.8,1.2,0.9],	//目前支持简单版本参数
		three:{
			color:0xCC9966,
		},
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var calc=root.calc,toB=calc.psAtoB,np=calc.newPoint
			var pos=b.pos,ro=b.rotation,dis=config.dis.yoffset*cvt,zj=Math.PI/2,ddis=config.dis.dash*cvt
			if(ds){
				for(var i=0;i<ds.length;i++){
					
					var p=ds[i],st=p.start,ed=p.end,ak=p.angle
					
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false,relate:rd}})
					
					//墙看线
					rst.line.push({ps:toB([st.ip,ed.ip],ro,pos),cfg:{dash:false}})
					rst.line.push({ps:toB([st.op,ed.op],ro,pos),cfg:{dash:false}})
					
					//线剖切线
					rst.line.push({ps:toB([np(st.mp,dis,ak+zj),np(ed.mp,dis,ak+zj)],ro,pos),cfg:{dash:false}})
					rst.line.push({ps:toB([np(st.mp,dis,ak-zj),np(ed.mp,dis,ak-zj)],ro,pos),cfg:{dash:false,color:'#FF00CC'}})
				}
			}
			return rst
		},
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	

					//rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					
					arr[i]=rst
				}
			}
			return arr
		},
		threeStruct:function(ds,b,rd,cvt){
			var rst = {meshes: [], lights: [], rays:[],show:true}
			var transA=root.calc.boxPosCalc,np=root.calc.newPoint,toB=root.calc.pAtoB
			var bpos=b.pos,bro=b.rotation
			for(var i=0,len=ds.length;i<len;i++){
				var dt=ds[i],ro=dt.angle
				var box=[dt.x,dt.y,dt.z],pos=dt.start.ip
				pos[2]=b.height-dt.zo-dt.z
				var rr=transA(box,pos,ro),npos=toB([rr.position[0],rr.position[1]],bro,bpos)
				npos[2]=rr.position[2]
				rst.meshes.push({type:'box',data:box,pos:npos,rotation:rr.rotation,color:config.three.color})
			}
			return rst
		},
		threeActive:function(){},
		
		
		twoSize:function(id,dt,b,cfg){
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			
			/*rst.push({ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,name:'adis',title:'边距',action:self.ctlAdis})
			rst.push({ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,name:'width',title:'宽度',action:self.ctlWidth})
			rst.push({ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,name:'bdis',title:'边距',action:self.ctlBdis})
			rst.push({ps:[ips[wid],ips[nwid]],left:false,angle:ak,name:'wall',title:'墙宽',size:b.dis[wid]})*/
			var rst=[
				{ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,name:'adis',	title:'边距'},
				{ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,name:'width',		title:'宽度'},
				{ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,name:'bdis',	title:'边距'},
				{ps:[ips[wid],ips[nwid]],left:false,angle:ak,size:b.dis[wid]},
			]
			return rst
		},
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			//console.log(JSON.stringify(dis))
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return {task:[todo]}
		},
		gesturemove:function(){},
		
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			var type=[
				{icon:'doorPing',		reg:'doorPing',	param:{todo:null}},
				{icon:'doorTui',		reg:'doorTui',		param:{todo:null}},
				{icon:'doorEntry',	reg:'doorEntry',	param:{todo:null}},
			]
			console.log(dt)
			return [
					{type:'label',	title:'房间',		data:b.name,},
					{type:'label',	title:'组件',		data:config.name},
					{type:'label',	title:'分扇',		data:'未开发',},
					{type:'grid',	title:'类型',		data:type,		action:{'click':winTrans}	},
					{type:'number',	title:'宽度',		data:dt.x,		action:{'blur':function(val){return [self.ctlWx(val,id,cvt)]}}	},
					{type:'number',	title:'高度',		data:dt.z,		action:{'blur':function(val){return [self.ctlWz(val,id,cvt)]}}	},
					{type:'number',	title:'深度',		data:dt.y,		action:{'blur':function(val){return [self.ctlWy(val,id,cvt)]}}	},
					{type:'number',	title:'离地高度',	data:dt.zo,		action:{'blur':function(val){return [self.ctlOz(val,id,cvt)]}}	},
					{type:'number',	title:'左距',		data:dt.adis,	action:{'blur':function(val){return [self.ctlAdis(val,id,cvt)] }}	},
					{type:'number',	title:'右距',		data:dt.bdis,	action:{'blur':function(val){return [self.ctlAdis(dt.adis+dt.bdis-val,id,cvt)] }}	},
				]
			
			function winTrans(val,com){
				if(com==reg.name) return
				console.log(com)
				var nd=self[com](dt)
				console.log([self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)])
				return [self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)]
			}
		
		},
		pop:function(room,id,tg){
			var keys=me.core.dataKeys
			var b=room[keys.basicKey],sss=b[keys.sectionKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][keys.structKey],dt=ds[id],wid=dt.wid,wx=b.dis[wid]
			var check=root.core.checkSection
			
			//处理复制的位置
			var dis=config.dis.copy*cvt,dx=dt.x,len=b.ips.length
			var sct=[dx,reg.name,ds.length],scts=sss[wid]
			var arr=check(sct,dis,scts)
			if(root.empty(arr)){
				var nid=wid==(len-1)?0:wid+1,nscts=sss[nid],narr=check(sct,dis,nscts)
				if(!root.empty(narr)){
					var adis=0,sid=nid,nsn=narr[0],adis=dis
					for(var i=0;i<nsn;i++) adis+=nscts[i][0]
				}
				
				if(adis==undefined){
					var pid=wid==0?(len-1):wid-1,pscts=sss[pid],parr=check(sct,dis,pscts)
					if(!root.empty(parr)){
						var adis=0,sid=pid,psn=parr[0],adis=dis
						for(var i=0;i<psn;i++) adis+=pscts[i][0]
					}
				}
			}else{
				var adis=0,sid=wid
				var sn=arr[0],adis=dis
				for(var i=0;i<sn;i++) adis+=scts[i][0]
			}
			var sub_opt=[
					//{title:'复制',type:'button',close:true,name:'copy',	data:id,action:self.ctlCopy},
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
				]
			if(adis!=undefined&& sid!=undefined){
				sub_opt.push({title:'复制',type:'button',close:true,name:'copy',	data:{dis:adis,x:dx,id:sid},action:self.ctlCopy})
			}
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data?{mod:reg.name,act:'set',param:{id:id,adis:root.calc.toF(data/cvt)}}:false
		},
		ctlBdis:function(){},
		ctlCopy:function(data,id,cvt){
			return {mod:reg.name,act:'add',param:{adis:data.dis/cvt,x:data.x/cvt,wid:data.id}}
		},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlThick:function(){},
		ctlWx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,x:root.calc.toF(data/cvt)}}
		},
		ctlWy:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,y:root.calc.toF(data/cvt)}}
		},
		ctlWz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,z:root.calc.toF(data/cvt)}}
		},
		ctlOz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<0?{}:{mod:reg.name,act:'set',param:{id:id,zo:root.calc.toF(data/cvt)}}
		},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				//[wid,adis,x,z,zo,y,offset,[dis,dis,...]]
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],zw=dd[3],zo=dd[4],yw=dd[5]?dd[5]:b.thick[wid],offset=dd[6],dss=dd[7]
				var ak=b.angle[wid],zj=Math.PI/2,hf=b.hthick[wid]
				var bdis=b.dis[wid]-adis-xw
				var xo=adis,yo=0,ro=0
				var ip=np(ips[wid],adis,ak),op=np(ips[wid],adis+xw,ak)
				var start={ip:ip,mp:np(ip,hf,ak-zj),op:np(ip,yw,ak-zj)}
				var end={ip:op,mp:np(op,hf,ak-zj),op:np(op,yw,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,x:xw,y:yw,z:zw,xo:xo,yo:yo,zo:zo,rotation:ro,angle:ak,
					start:start,end:end,center:cen,check:tap,block:dss,
					adis:adis,bdis:bdis,
				}
			}
			return rs
		},
		
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i],ds=[]
				if(p[7] && root.isType(p[7],'array'))for(var j=0;j<p[7].length;j++)ds[j]=parseInt(p[7][j]*cvt)
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt),parseInt(p[4]*cvt),p[5]?parseInt(p[5]*cvt):0,p[6]?parseInt(p[6]*cvt):0,ds]
			}
			return r
		},
		SB221NC:function(arr,scts){
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		correctData:function(data,rid){
			return data
		},
		changeData:function(data,msg){
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				console.log(wid+','+msg.wid)
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid==0)row[0]=0
					else if(wid>msg.wid)row[0]+=-1
				}
				rst.push(row)
			}
			return rst
		},
		checkData:function(data){
			return data
		},
		report:function(dt,cvt){
			var rst={wall:0,space:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			return rst
		},
		
		
		/*数据转换区域*/
		toWinTu:function(data){
			return data
		},
		
		toWinTui:function(data){
			return data
		},
		
		/*数据增删改区域 */
		add:function(p,dt){	//添加一个组件的操作
			dt.push(self.data(p))
			return dt
		},
		set:function(p,dt){	//调整组件参数的操作
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},	
		del:function(p,dt){	//删除一个组件的操作
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)rst.push(dt[i])
			return rst
		},	
		data:function(p,data){	//将原始数据转换成通用数据的操作
			var dd=data || root.clone(config.defaultData)
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			dd[4]=p.zo===undefined?dd[4]:p.zo
			return dd
		},			
	}
	
	root.regComponent(reg)
})(window.T)
/*****winTu******/
;(function(root){
	var reg={
		name:'winTu',
		type:'module',
		category:'win',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			cad:{
				size: 12,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
			fashion:{
				size: 14,
				fill:'#CCAA00',
				color:'#CCAA00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:true,				//是否为结构组件
		order:11,						//加载顺序
		name:'凸窗',
		theme:theme,
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			yoffset:0.05,			//中线偏移
			minWidth:0.6,			//最小宽度
		},
		
		//[wid,adis,x,z,zoffset,y,offset,[dis,width,isWall],[dis,width,isWall],[dis,dis,...],[ro,ro,...]]
		defaultData:[0,0.6,1.5,1.5,0.6,0.15,0.05,[0.6,0.1,1],[0.6,0.1,0],[0.6,0.9],[1,8]],
		three:{
			color:0xCC2266,
		},
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var calc=root.calc,toB=calc.psAtoB,np=calc.newPoint
			var pos=b.pos,ro=b.rotation,zj=Math.PI/2
			var offset=config.dis.yoffset*cvt,tof=offset+offset
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false,relate:rd}})		//填充切割的墙体

					//切除墙边的3根线
					rst.line.push({ps:toB([st.ip,ed.ip],ro,pos),cfg:{dash:false}})
					//rst.line.push({ps:toB([st.ip,st.op],ro,pos),cfg:{dash:false}})
					//rst.line.push({ps:toB([ed.ip,ed.op],ro,pos),cfg:{dash:false}})
					
					//最外圈3根线
					var ca=np(st.op,tof,p.angle-zj-zj),cb=np(ca,p.left[0]+tof,p.angle-zj)
					var cd=np(ed.op,tof,p.angle),cc=np(cd,p.right[0]+tof,p.angle-zj)
					rst.fill.push({ps:toB([ca,cb,cc,cd],ro,pos),cfg:{detail:false,relate:rd}})	//填充凸窗外面积
					rst.line.push({ps:toB([ca,cb],ro,pos),cfg:{dash:false}})
					rst.line.push({ps:toB([cb,cc],ro,pos),cfg:{dash:false}})
					rst.line.push({ps:toB([cc,cd],ro,pos),cfg:{dash:false}})
					
					//console.log('外部4个点'+JSON.stringify(toB([ca,cb,cc,cd],ro,pos)))
					//最内圈3根线
					var aa=st.op,ab=np(aa,p.left[0],p.angle-zj),ad=ed.op,ac=np(ad,p.right[0],p.angle-zj)
					rst.line.push({ps:toB([aa,ab],ro,pos),cfg:{dash:true,dis:100}})
					rst.line.push({ps:toB([ab,ac],ro,pos),cfg:{dash:false}})
					rst.line.push({ps:toB([ac,ad],ro,pos),cfg:{dash:false}})
					//console.log('内部4个点:'+JSON.stringify([aa,ab,ac,ad]))
					//console.log('新算法外部4个点:'+JSON.stringify(root.calc.noffset(toB([aa,ab,ac,ad],ro,pos),tof,false,false)))
					
					//中间3根线
					var ba=np(st.op,offset,p.angle-zj-zj),bb=np(ba,p.left[0]+offset,p.angle-zj)
					var bd=np(ed.op,offset,p.angle),bc=np(bd,p.right[0]+offset,p.angle-zj)
					rst.line.push({ps:toB([ba,bb],ro,pos),cfg:{dash:false}})
					rst.line.push({ps:toB([bb,bc],ro,pos),cfg:{dash:false}})
					rst.line.push({ps:toB([bc,bd],ro,pos),cfg:{dash:false}})
				}
			}
			return rst
		},
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	

					//rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					
					arr[i]=rst
				}
			}
			return arr
		},
		
		twoSize:function(id,dt,b,cfg){
			var rst=[]
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1,ak=b.angle[wid]
			rst=[
				{ps:[xps[wid],st.op],		left:true,	angle:ak,size:dd.adis,},
				{ps:[st.op,ed.op],			left:true,	angle:ak,size:dd.x},
				{ps:[ed.op,yps[wid]],		left:true,	angle:ak,size:dd.bdis},
				{ps:[ips[wid],ips[nwid]],	left:false,	angle:ak,size:b.dis[wid]}
			]
			return rst
		},
		threeStruct:function(ds,b,rd,cvt){
			var rst = {meshes: [], lights: [], rays:[],show:true}
			var transA=root.calc.boxPosCalc,np=root.calc.newPoint,toB=root.calc.pAtoB
			var bpos=b.pos,bro=b.rotation
			for(var i=0,len=ds.length;i<len;i++){
				var dt=ds[i],ro=dt.angle
				console.log(dt)
				
				/*var box=[dt.x,dt.y,dt.z],pos=dt.start.ip
				pos[2]=b.height-dt.zo-dt.z
				var rr=transA(box,pos,ro),npos=toB([rr.position[0],rr.position[1]],bro,bpos)
				npos[2]=rr.position[2]
				rst.meshes.push({type:'box',data:box,pos:npos,rotation:rr.rotation,color:config.three.color})*/
			
			}
			return rst
		},
		threeActive:function(){},
		
		/*屏幕操作方法区域*/
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return {task:[todo]}
		},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		attribute:function(room,id,tg){
			console.log(room)
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			var type=[
				{icon:'doorPing',		reg:'doorPing',	param:{todo:null}},
				{icon:'doorTui',		reg:'doorTui',		param:{todo:null}},
				{icon:'doorEntry',	reg:'doorEntry',	param:{todo:null}},
			]
			console.log(dt)
			return [
					{type:'label',			title:'房间',		data:b.name,},
					{type:'label',			title:'组件',		data:config.name,},
					{type:'label',			title:'分扇',		data:'未开发',	action:{}},
					{type:'grid',			title:'类型',		data:type,		action:{'click':winTrans}	},
					{type:'number',	title:'宽度',		data:dt.x,				action:{'blur':function(val){return [self.ctlWx(val,id,cvt)]}}	},
					{type:'number',	title:'高度',		data:dt.z,				action:{'blur':function(val){return [self.ctlWz(val,id,cvt)]}}	},
					{type:'number',	title:'深度',		data:dt.y,				action:{'blur':function(val){return [self.ctlWy(val,id,cvt)]}}	},
					{type:'number',	title:'离地高度',	data:dt.zo,				action:{'blur':function(val){return [self.ctlOz(val,id,cvt)]}}	},
					{type:'number',	title:'左距',		data:dt.adis,			action:{'blur':function(val){return [self.ctlAdis(val,id,cvt)] }}	},
					{type:'number',	title:'右距',		data:dt.bdis,			action:{'blur':function(val){return [self.ctlAdis(dt.adis+dt.bdis-val,id,cvt)] }}	},
				]
			
			function winTrans(val,com){
				if(com==reg.name) return
				console.log(com)
				var nd=self[com](dt)
				console.log([self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)])
				return [self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)]
			}
		
		},
		pop:function(room,id){
			var keys=me.core.dataKeys
			var b=room[keys.basicKey],dt=room[reg.name][keys.structKey][id]
			var sub_opt=[
					{title:'复制',type:'button',close:true,name:'copy',	data:id,action:self.ctlCopy},
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
				]
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlThick:function(){},
		ctlWx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,x:root.calc.toF(data/cvt)}}
		},
		ctlWy:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,y:root.calc.toF(data/cvt)}}
		},
		ctlWz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,z:root.calc.toF(data/cvt)}}
		},
		ctlOz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<0?{}:{mod:reg.name,act:'set',param:{id:id,zo:root.calc.toF(data/cvt)}}
		},
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				//[wid,adis,x,z,zo,y,offset,[dis,isWall],[dis,isWall],[dis,dis,...],[ro,ro,...]]
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],zw=dd[3],zo=dd[4],yw=dd[5]?dd[5]:b.thick[wid],offset=dd[6],left=dd[7],right=dd[8],dss=dd[9],ros=dd[10]
				var ak=b.angle[wid],zj=Math.PI/2,hf=b.hthick[wid]
				var bdis=b.dis[wid]-adis-xw
				var xo=adis,yo=0,ro=0
				var ip=np(ips[wid],adis,ak),op=np(ips[wid],adis+xw,ak)
				
				//console.log('这里生成ap和bp')
				
				var start={ip:ip,mp:np(ip,hf,ak-zj),op:np(ip,yw,ak-zj)}
				var end={ip:op,mp:np(op,hf,ak-zj),op:np(op,yw,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,x:xw,y:yw,z:zw,xo:xo,yo:yo,zo:zo,rotation:ro,angle:ak,left:left,right:right,
					start:start,end:end,center:cen,check:tap,block:dss,direction:ros,
					adis:adis,bdis:bdis,
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i],ds=[]
				//[wid,adis,x,z,zoffset,y,offset,[dis,isWall],[dis,isWall],[dis,dis,...],[ro,ro,...]]
				if(p[9] && root.isType(p[9],'array'))for(var j=0;j<p[9].length;j++)ds[j]=parseInt(p[9][j]*cvt)
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt),parseInt(p[4]*cvt),p[5]?parseInt(p[5]*cvt):0,p[6]?parseInt(p[6]*cvt):0,[parseInt(p[7][0]*cvt),parseInt(p[7][1])*cvt,p[7][2]],[parseInt(p[8][0]*cvt),parseInt(p[8][1]*cvt),p[8][2]],ds,p[10]?p[10]:[]]
			}
			return r
		},
		SB221NC:function(arr,scts){
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		relate:function(ra,rb){
			//console.log(JSON.stringify(ra))
			//console.log('ok,ready to calc room relate')
		},
		changeData:function(data,msg){
			var rst=[]
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i],wid=row[0]
				if(msg.dis && wid==msg.wid) row[1]-=msg.dis
				if(msg.add && wid>=msg.wid){
					row[0]+=1
				}else{
					if(wid>=msg.wid)row[0]+=-1
					else if(wid==0)row[0]=0
				}
				rst.push(row)
			}
			return rst
		},
		
		correctData:function(data,b,cvt){
			var rst=[],min=config.dis.minWidth
			for(var i=0,len=data.length;i<len;i++){
				var row=data[i]
				var wid=row[0],adis=row[1],w=row[2],wallx=b.dis[wid]/cvt
				if(wallx>=adis+w){
					rst.push(row)
				}else if(wallx>w && wallx<adis+w){
					row[1]=wallx-w
					rst.push(row)
				}else if(wallx>=min && wallx<=w){
					row[1]=0
					row[2]=wallx
					rst.push(row)
				}
			}
			return rst
		},
		
		checkData:function(data){
			return data
		},
		report:function(dt,cvt){
			var rst={wall:0,space:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				console.log('这里需要重新计算')
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			return rst
		},
		
		roChange:function(){},
		/*数据转换区域*/
		toWinPing:function(data){
			return data
		},
		
		toWinTui:function(data){
			return data
		},
		
		/*数据增删改区域 */
		add:function(p,dt){
			dt.push(self.data(p))
			return dt
		},		
			
		set:function(p,dt){
			//console.log(JSON.stringify(dt))
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},

		del:function(p,dt){
			if(p.id===undefined) return
			var rst=[]
			for(var i=0,len=dt.length;i<len;i++)if(i!=p.id)rst.push(dt[i])
			return rst
		},
		
		//将原始数据转换成通用数据的操作
		//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		//[wid,adis,x,z,zoffset,y,offset,[dis,isWall],[dis,isWall],[dis,dis,...],[ro,ro,...]]
		//defaultData:[0,0.6,1.5,1.5,0.6,0.15,0.05,[0.6,0.1,1],[0.6,0.1,0],[0.6,0.9],[1,8]],
		data:function(p,data){
			var dd=data || config.defaultData
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			dd[4]=p.zo===undefined?dd[4]:p.zo
			return dd
		},	
	}
	
	root.regComponent(reg)
})(window.T)
/*****winTui******/

;(function(root){
	var reg={
		name:'winTui',
		type:'module',
		category:'win',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()

	var theme={
			yhf:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			cad:{
				width: 1,
				fill: '#999999',
				color: '#95C2E8',
				active:'',
			},
			fashion:{
				width: 1,
				fill: '#AAAAAA',
				color: '#332222',
				active:'#00FF00',
			},
		}
	
	var config={
		isConnect:false,			//是否参与连接检测
		isStruct:true,				//是否为结构组件
		order:11,						//加载顺序
		name:'推拉窗',	
		theme:theme,
		plugin:{
			rdTwo:'twoSize',
			rdThree:'',
		},
		active:{
			offset:0.15,	//2D绘制激活时候的偏移
		},
		
		dis:{
			wallChange:0.1,
			redun:0.015,			//小于15mm时候吸附
			step:0.05,				//每50mm吸附
			block:0.6,				//窗的默认宽度
		},
		//[wid,adis,x,z,zoffset,y,offset,[dis,dis,...],[ro,ro,...]]
		defaultData:[1,0.2,1.8,1.2,0.9,0.1,0.05,[0.4,0.8],[1,1]],				
	}
	
	//注意:
	//1.调整后的mod的方法都只处理数据输出,去掉render和control的操作
	//2.module的数据结构尽量定位相同,把相同的放在前面
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		/*渲染器数据处理区域 */
		twoStruct:function(ds,b,rd,cvt){
			var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
			var toB=root.calc.psAtoB
			var pos=b.pos,ro=b.rotation
			if(ds){
				for(var i=0;i<ds.length;i++){
					var p=ds[i],st=p.start,ed=p.end
					rst.fill.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{detail:false,relate:rd}})
					rst.line.push({ps:toB([st.ip,ed.ip,ed.op,st.op],ro,pos),cfg:{dash:false}})
				}
			}
			return rst
		},
		twoActive:function(ds,b,rd,cvt){
			var toB=root.calc.psAtoB,offset=root.calc.offset
			var pos=b.pos,ro=b.rotation
			var arr=[]
			if(ds){
				for(var i=0;i<ds.length;i++){
					var rst={line:[],fill:[],img:[],ease:[],arc:[],show:true}
					var p=ds[i],st=p.start,ed=p.end
					var rec=[st.ip,st.op,ed.op,ed.ip]
					var ak=p.angle,os=config.active.offset*cvt	

					//rst.fill.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{}})
					rst.line.push({ps:toB(offset(rec,os,ak),ro,pos),cfg:{dash:false}})
					
					arr[i]=rst
				}
			}
			return arr
		},
		twoSize:function(id,dt,b,cfg){
			var rst=[]
			var dd=dt[id],wid=dd.wid,st=dd.start,ed=dd.end,xps=b.xps,yps=b.yps,ips=b.ips
			var nwid=wid==(ips.length-1)?0:wid+1
			var ak=b.angle[wid]
			
			rst.push({ps:[xps[wid],st.op],left:true,angle:ak,size:dd.adis,action:self.ctlAdis})
			rst.push({ps:[st.op,ed.op],left:true,angle:ak,size:dd.x,action:self.ctlWidth})
			rst.push({ps:[ed.op,yps[wid]],left:true,angle:ak,size:dd.bdis,action:self.ctlBdis})
			rst.push({ps:[ips[wid],ips[nwid]],left:false,angle:ak,size:b.dis[wid]})
			
			return rst
		},
		
		threeStruct:function(){},
		threeDrawing:function(){},
		threeActive:function(){},
		
		/*插件数据处理区*/
		subStruct:function(){},
		subDrawing:function(){},
		
		/*屏幕操作方法区域*/
		
		/* @param	dt		array	//[dx,dy]类型的数组
		 * @param	b		object	//basic数据
		 * @param	dd		object	//目标组件的pub数据
		 * @param	cvt		number	//单位转换值
		 * */
		touchmove:function(dt,b,dd,cvt){
			var toF=root.calc.toF
			var wid=dd.wid,ak=b.angle[wid]+b.rotation
			var adis=dd.adis,bdis=dd.bdis,step=config.dis.step*cvt,redun=config.dis.redun*cvt
			var dis=root.calc.disToDirect(dt[0],dt[1],ak)
			var wg=config.dis.wallChange*cvt,len=b.ips.length
			var todo={mod:reg.name,act:'set',param:{}}
			if(dis>dd.bdis){				
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:wid==(len-1)?0:wid+1,adis:0}
				else todo.param={id:dd.id,adis:toF((b.dis[wid]-dd.x)/cvt,2)}
			}else if(dis+dd.adis<0){
				if(Math.abs(dis)>wg) todo.param={id:dd.id,wid:(wid==0?len-1:wid-1),adis:toF((b.dis[(wid==0?len-1:wid-1)]-dd.x)/cvt,2)}
				else todo.param={id:dd.id,adis:0}
			}else{
				if((adis%step==0||bdis%step==0)&&Math.abs(dis)<redun) adis+=dis
				else adis+=root.calc.approx(dis,[adis,bdis],step,redun)
				todo.param={id:dd.id,adis:toF(adis/cvt)}
			}
			return {task:[todo]}
		},
		gesturemove:function(){},
		
		/*控制区操作函数*/
		attribute:function(room,id,tg){
			var b=room[me.core.dataKeys.basicKey],cvt=root.core.getConvert(tg)
			var ds=room[reg.name][me.core.dataKeys.structKey],dt=ds[id]
			var type=[
				{icon:'doorPing',		reg:'doorPing',	param:{todo:null}},
				{icon:'doorTui',		reg:'doorTui',		param:{todo:null}},
				{icon:'doorEntry',	reg:'doorEntry',	param:{todo:null}},
			]
			return [
					{type:'label',	title:'房间',	data:b.name,},
					{type:'label',	title:'组件',		data:config.name,},
					{type:'label',	title:'分扇',		data:'未开发',},
					{type:'grid',	title:'类型',		data:type,		action:{'click':winTrans}	},
					{type:'number',	title:'宽度',		data:dt.x,		action:{'blur':function(val){return [self.ctlWx(val,id,cvt)]}}	},
					{type:'number',	title:'高度',		data:dt.z,		action:{'blur':function(val){return [self.ctlWz(val,id,cvt)]}}	},
					{type:'number',	title:'深度',		data:dt.y,		action:{'blur':function(val){return [self.ctlWy(val,id,cvt)]}}	},
					{type:'number',	title:'离地高度',	data:dt.zo,		action:{'blur':function(val){return [self.ctlOz(val,id,cvt)]}}	},
					{type:'number',	title:'左距',		data:dt.adis,	action:{'blur':function(val){return [self.ctlAdis(val,id,cvt)] }}	},
					{type:'number',	title:'右距',		data:dt.bdis,	action:{'blur':function(val){return [self.ctlAdis(dt.adis+dt.bdis-val,id,cvt)] }}	},
				]
			
			function winTrans(val,com){
				if(com==reg.name) return
				console.log(com)
				var nd=self[com](dt)
				console.log([self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)])
				return [self.ctlRemove([],id,cvt),root[com].ctlCopy(nd,id,cvt)]
			}
		
		},
		pop:function(room,id){
			var b=room[me.core.dataKeys.basicKey],dt=room[reg.name][me.core.dataKeys.structKey][id]
			var sub_opt=[
					{title:'复制',type:'button',close:true,name:'copy',	data:id,action:self.ctlCopy},
					{title:'删除',type:'button',close:true,name:'remove',data:id,action:self.ctlRemove},
				]
			var list=[
					{title:'宽度',type:'number',close:true,name:'width',data:dt.x,	sub:false,action:self.ctlWx},
					{title:'A边距',type:'number',close:true,name:'adis',data:dt.adis,sub:false,action:self.ctlAdis},
					{title:'操作',name:'opt',close:false,sub:true,data:sub_opt},
				]
			return list
		},
		
		/*控制区操作函数*/
		ctlWidth:function(){},
		ctlAdis:function(){},
		ctlBdis:function(){},
		ctlRemove:function(data,id,cvt){
			return {mod:reg.name,act:'del',param:{id:id}}
		},
		ctlThick:function(){},
		ctlWx:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,x:root.calc.toF(data/cvt)}}
		},
		ctlWy:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,y:root.calc.toF(data/cvt)}}
		},
		ctlWz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<=0?{}:{mod:reg.name,act:'set',param:{id:id,z:root.calc.toF(data/cvt)}}
		},
		ctlOz:function(data,id,cvt){
			data=parseFloat(data)||parseInt(data)
			return data<0?{}:{mod:reg.name,act:'set',param:{id:id,zo:root.calc.toF(data/cvt)}}
		},
		/*功能函数区*/
		blocks:function(w,cvt){
			var sw=config.dis.block*cvt,dw=sw/2
			if(w<sw) return w
			var n=Math.floor(w/sw),left=w-n*sw
			if(left>=dw)n++
			return {width:w/n,count:n}
		},
		
		
		/*基础数据处理区域 */
		SB168NN:function(arr,b,cvt){
			var np=root.calc.newPoint,mid=root.calc.mid
			var ips=b.ips,mps=b.mps,ops=b.ops
			var rs=[],len=arr.length
			for(var i=0;i<len;i++){
				//[wid,adis,x,z,zo,y,offset,[dis,dis,...],[ro,ro,...]]
				var dd=arr[i],wid=dd[0],adis=dd[1],xw=dd[2],zw=dd[3],zo=dd[4],yw=dd[5]?dd[5]:b.thick[wid],offset=dd[6],dss=dd[7],ros=dd[8]
				var ak=b.angle[wid],zj=Math.PI/2,hf=b.hthick[wid]
				var bdis=b.dis[wid]-adis-xw
				var xo=adis,yo=0,ro=0
				var ip=np(ips[wid],adis,ak),op=np(ips[wid],adis+xw,ak)
				var start={ip:ip,mp:np(ip,hf,ak-zj),op:np(ip,yw,ak-zj)}
				var end={ip:op,mp:np(op,hf,ak-zj),op:np(op,yw,ak-zj)}
				var cen={ip:mid(start.ip,end.ip),mp:mid(start.mp,end.mp),op:mid(start.op,end.op)}
				var tap=[start.ip,end.ip,end.op,start.op]
				rs[i]={
					id:i,wid:wid,x:xw,y:yw,z:zw,xo:xo,yo:yo,zo:zo,rotation:ro,angle:ak,
					start:start,end:end,center:cen,check:tap,block:dss,direction:ros,
					adis:adis,bdis:bdis,
				}
			}
			return rs
		},
		convert:function(tg,cvt){
			var rst={active:{},dis:{}}
			var active=config.active,dis=config.dis
			for(var k in active) rst['active'][k]=active[k]*cvt
			for(var k in dis) rst['dis'][k]=dis[k]*cvt
			run[tg]=rst
			return rst
		},
		
		SB123N:function(arr,cvt){
			if(arr==undefined) return []
			var n=arr.length,r=[]
			for(var i=0;i<n;i++){
				var p=arr[i],ds=[]
				if(p[7] && root.isType(p[7],'array'))for(var j=0;j<p[7].length;j++)ds[j]=parseInt(p[7][j]*cvt)
				r[i]=[p[0],parseInt(p[1]*cvt),parseInt(p[2]*cvt),parseInt(p[3]*cvt),parseInt(p[4]*cvt),p[5]?parseInt(p[5]*cvt):0,p[6]?parseInt(p[6]*cvt):0,ds,p[8]?p[8]:[]]
			}
			return r
		},
		SB221NC:function(arr,scts){
			if(root.empty(arr)) return false
			for(var i=0;i<arr.length;i++){
				var cur=arr[i]
				scts[cur.wid]=root.core.section([cur.x,reg.name,cur.id],cur.adis,scts[cur.wid])
			}
			return scts
		},
		correctData:function(data,rid){
			return data
		},
		checkData:function(data){
			return data
		},
		report:function(dt,cvt){
			var rst={wall:0,space:0,raw:[]}
			var dkey=me.core.dataKeys.structKey
			var arr=dt[dkey]
			for(var k in arr){
				var row=arr[k]
				rst['wall']-=row.x*row.z/(cvt*cvt)
				rst['space']+=row.x*row.z*row.y/(cvt*cvt*cvt)
				rst['raw'][k]={width:row.x/cvt,height:row.z/cvt}
			}
			return rst
		},
		
		
		/*数据转换区域*/
		toWinTu:function(data){
			return data
		},
		
		toWinPing:function(data){
			return data
		},
		
		
		/*数据增删改区域 */
		add:function(p,dt){
			if(p.id===undefined) return
			
		},		
			
		set:function(p,dt){
			//console.log(JSON.stringify(dt))
			if(p.id===undefined) return
			dt[p.id]=self.data(p,dt[p.id])
			return dt
		},

		del:function(p,dt){
			if(p.id===undefined) return
			
		},
		
		//将原始数据转换成通用数据的操作
		//[wid,adis,x,z]注册的数据格式,可以和这个进行格式的比对
		data:function(p,data){
			var dd=data || config.defaultData
			dd[0]=p.wid===undefined?dd[0]:p.wid
			dd[1]=p.adis===undefined?dd[1]:p.adis
			dd[2]=p.x===undefined?dd[2]:p.x
			dd[3]=p.z===undefined?dd[3]:p.z
			dd[4]=p.zo===undefined?dd[4]:p.zo
			return dd
		},	
	}
	
	root.regComponent(reg)
})(window.T)

/***********ui*********/
;(function(root){
	var reg={
		name:'ui',
		type:'plugin',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	var theme={
		yhf:{},
		cad:{},
		fashion:{},
	}
	var config={
		container:'ui_con',		//menu的总容器
		clsForm:'fuu_form',
		entryHooks:{
			initFun:'initDom',
		},
		struct:{		//根据id可以切换不同的样式
			info: 		{cls:'ui_info',		cmap:{'z-index':905}},
			attribute:	{cls:'ui_attr',		cmap:{'z-index':800}},
			
			mask:		{cls:'ui_mask',	cmap:{'z-index':900}},
			pop:			{cls:'ui_pop',		cmap:{'z-index':901}},
			sub:			{cls:'ui_sub',  	cmap:{'z-index':902}},
			dialog:		{cls:'ui_dialog',	cmap:{'z-index':800}},
			footer:		{cls:'ui_foot',		cmap:{'z-index':907}},
		},
	}
	
	//挂定位组件的选择器和form对象
	var run={
		
	}
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		
		/***************dom基础处理部分***************/
		initDom: function (cfg) {
			//1.创建整体的容器
			var txt='<div class="'+config.container+'"></div>',stxt=''
			$(cfg.target).append(txt)
			
			//2.计算主容器的位移并保存到run
			var tg=cfg.target
			var offset=$(tg).find('.'+config.container).offset()
			run[tg]={
				width:cfg.conWidth,
				height:cfg.conHeight,
				left:offset.left,
				top:offset.top,
			}
			
			//3.创建所有ui的容器
			var st = config.struct, hd = me.core.classHidden
	        for (var k in st) stxt += '<div class="'  + st[k]['cls'] + ' '+ hd + '"></div>'
	        $(cfg.target).find('.'+config.container).html(stxt)
	        
	        //var cmap={'margin-top':(-cfg.conHeight)+'px'}
	        //$(cfg.target).find('.'+config.container).html(stxt).css(cmap)
	        
	        for (var k in st){
	        		$(cfg.target).find('.'+config.container+' .'+st[k]['cls']).css(st[k].cmap)
	        		self[k].init(tg)
	        } 
		},
		
		/*******************定位UI容器部分*********************/
		show:function(type,dom,cfg,tg){self[type].show(dom,cfg,tg)},
		hidden:function(type,tg){self[type].hidden(tg)},
		clean:function(type,tg){self[type].clean(tg)},
		
		info:{
			init:function(tg){
				var st=config.struct['info'],env=run[tg]
				var cmap={top:env.top+'px',left:env.left+'px',width:env.width+'px'}
				$(tg).find('.'+st.cls).css(cmap)
			},
			show:function(dom,cfg,tg){
				var st=config.struct['info']
				$(tg).find('.'+st.cls).html(dom).removeClass(me.core.classHidden)
				
				if(!cfg.time) return
				setTimeout(function(){
					self.info.hidden(tg)
				},cfg.time)
			},
			hidden:function(tg){
				var st=config.struct['info']
				$(tg).find('.'+st.cls).addClass(me.core.classHidden)
			},
			clean:function(tg){
				var st=config.struct['info']
				$(tg).find('.'+st.cls).html('')
			},
			struct:function(cfg){
				return '这里是info的信息'
			},
			closed:function(tg){
				var st=config.struct['info']
				$(tg).find('.'+st.cls).hasClass(me.core.classHidden)
			},
		},
		
		attribute:{
			init:function(tg){
				var st=config.struct['attribute'],env=run[tg]
				var w=env.width/3<250?250:env.width/3,h=2*env.height/3
				var left=env.left,top=env.top+env.height/6
				run[tg]['attribute']={width:w,height:h,left:left,top:top}
				var cmap={top:top+'px',left:left+'px',width:w+'px',height:h+'px'}
				$(tg).find('.'+st.cls).css(cmap)
				//console.log(env)
			},
			show:function(dom,cfg,tg){
				var st=config.struct['attribute']
				var head='<h5>参数配置器</h5>',footer='<h6>属性编辑器: 版本'+reg.version+'</h6>'
				
				if(cfg.head)dom=head+dom
				if(cfg.footer)dom=dom+footer
				
				$(tg).find('.'+st.cls).attr('draggable','true').html(dom).removeClass(me.core.classHidden)
				$(tg).find('.'+st.cls).off('dragend').on('dragend',function(ev){self.attribute.dragend(ev,tg)})
			},
			unhidden:function(tg){
				var st=config.struct['attribute']
				$(tg).find('.'+st.cls).removeClass(me.core.classHidden)
			},
			hidden:function(tg){
				var st=config.struct['attribute']
				$(tg).find('.'+st.cls).addClass(me.core.classHidden)
			},
			clean:function(tg){
				var st=config.struct['attribute']
				$(tg).find('.'+st.cls).html('')
			},
			dragend:function(ev,tg){
				//console.log(tg)
				if(!ev.offsetX || !ev.offsetY) return
				var env=run[tg],me=run[tg]['attribute']
				var st=config.struct['attribute']
				var left=ev.offsetX+me.left,top=ev.offsetY-me.height+me.top
				var cmap={left:left+'px',top:top+'px'}
				$(tg).find('.'+st.cls).css(cmap)
				me.left=left
				me.top=top
			},
			closed:function(tg){
				var st=config.struct['attribute']
				return $(tg).find('.'+st.cls).hasClass(me.core.classHidden)
			},
		},
		
		pop:{
			init:function(tg){
				//console.log(run[tg])
			},
			show:function(dom,tg){
				$(tg).find('.'+st.cls).html(dom).removeClass(me.core.classHidden)
			},
			hidden:function(tg){},
			clean:function(tg){},
		},
		sub:{
			init:function(tg){
				//console.log(run[tg])
			},
			show:function(cfg,tg){},
			hidden:function(tg){},
			clean:function(tg){},
		},
		footer:{
			init:function(tg){
				//console.log(run[tg])
			},
			show:function(cfg){},
			hidden:function(){},
			clean:function(tg){},
		},
		mask:{
			init:function(tg){
				//console.log(run[tg])
			},
			show:function(cfg){},
			hidden:function(){},
			clean:function(tg){},
		},
		
		dialog:{
			init:function(tg){
				//console.log(run[tg])
			},
			show:function(cfg){},
			hidden:function(){},
			clean:function(tg){},
		},
		
		/*******************通用form部分*********************/
		/*form的基础部分
		 * 设计逻辑
		 * 	1.form只处理表单 ，向指定的容器里填充
		 * 2.定位及不同设备的适配放到上一层的容器里进行
		 * */
		
		/*	form填充主函数，把生成的form填充到指定的位置去
		 *	@param		rows		array		//输出的数据输入条目
		 * @param		cfg			object		//form配置对象
		 * @param		dev			string		//显示设备，用来区分生成不同的dom
		 * return
		 * 	1.	把生成dom填充好
		 * 2.	自动绑定rows里带的方法
		 * */
		form:function(rows,cfg,dev){
			var id=root.hash(),coms=[],acts={}
			var dom='<table id="'+id+'" class="'+config.clsForm+'">'
			
			
			for(var i=0,len=rows.length;i<len;i++){
				var row=rows[i]
				var rst=self[row.type+'Struct'](row,dev)
				dom+='<tr><td>'+row.title+'</td>'
				dom+='<td>'+rst['dom']+'</td></tr>'
				coms.push(rst)
			}
			dom+='</table>'
			
			acts['save']=function(){
				self.save(coms)
			}
			
			var agent={
				onAction:null,
			}
			
			return {id:id,dom:dom,funs:acts,auto:auto,agent:agent}
			function auto(){
				for(var i=0,len=coms.length;i<len;i++){
					if(coms[i].auto)coms[i].auto(agent)	
				}
			}
		},
		save:function(arr){
			for(var i=0,len=arr.length;i<len;i++){
				var row=arr[i]
				var rst=self[row.type+'Save'](row)
			}
		},
		
		//grid,用来展示room能添加的家具，wall能添加的组件
		gridStruct:function(row,dev){
			var id=root.hash(),grid=row.data
			var dom='<ul id="'+id+'" class="grid">'
			
			for(var k in grid){
				var col=grid[k]
				dom+='<li class="li-'+col.icon+'" reg="'+col.reg+'" data="'+root.encode(col.param)+'"></li>'
			}
			dom+='</ul>'
			
			return {dom:dom,id:id,auto:auto}
			function auto(agent){
				for(var k  in row.action){
					$("#"+id+' li').off(k).on(k,function(){
						//console.log(k)
						if(!row.action[k]) return 
						var reg=$(this).attr('reg'),param=root.decode($(this).attr('data'))
						//console.log(param)
						var todo=row.action[k](param,reg)
						//console.log(agent)
						for(var kk in agent) if(agent[kk])agent[kk](todo)
					})
				}
			}
		},
		
		//{type:'bool',title:'title',data:120,action:fun}
		rotateStruct:function(row,dev){
			
		},
		//{type:'bool',title:'title',data:true,action:fun}
		boolStruct:function(row,dev){
			var id=root.hash()
			var yes=row.data?'class="active"':'',no=!row.data?'class="active"':''
			var dom='<div id="'+id+'"><ul class="bool"><li '+yes+'>是</li><li '+no+'>否</li></ul></div>'
			return {dom:dom,id:id,auto:auto}
			
			//@param	agent	function	//form的dom构建后处理好的agent
			function auto(agent){
				for(var k  in row.action){
					$("#"+id).find('li').off(k).on(k,function(){
						if(!row.action[k]) return 
						var bool=$(this).hasClass('active')?true:false
						
						var todo=row.action[k](bool)
						for(var kk in agent) if(agent[kk])agent[kk](todo)
					})
				}
			}
		},
		
		//{type:'label',title:'title',data:'number/string',action:fun}
		labelStruct:function(row,dev){
			var id=root.hash()
			var dom='<span class="label">'+row.data+'</span>'
			return {dom:dom,id:id,auto:auto}
			function auto(agent){
			
			}
		},
		labelSave:function(){},
		
	
		//{type:'number',title:'title',data:true,action:fun}
		/*构建number的输入基础部分
		 * @param	row	object			//数据条目
		 * @param	dev	string			//设备名
		 * @param	agent	function	//form被加载的触发agent
		 * 
		 * */
		numberStruct:function(row,dev){
			var id=root.hash()
			var dom='<input type="number" value="'+row.data+'" id="'+id+'">'
			return {dom:dom,id:id,auto:auto}
			
			//@param	agent	function	//form的dom构建后处理好的agent
			function auto(agent){
				for(var k  in row.action){
					$("#"+id).off(k).on(k,function(){
						if(!row.action[k]) return 
						var todo=row.action[k]($(this).val())
						for(var kk in agent) if(agent[kk])agent[kk](todo)
					})
				}
			}
		},
		numberSave:function(id){
			
		},
		
		//{type:'number',title:'title',data:true,action:fun}
		textStruct:function(row,dev){
			var id=root.hash()
			var dom='<input type="text" value="'+row.data+'" id="'+id+'">'
			return {dom:dom,id:id,auto:auto}
			function auto(agent){
				for(var k  in row.action){
					$("#"+id).off(k).on(k,function(){
						var todo=row.action[k]($(this).val())
						for(var kk in agent) if(agent[kk])agent[kk](todo)
					})
				}
			}
		},
		textSave:function(id){
			
		},
		
		//{type:'number',title:'title',data:{k:v},action:{k:fun}}
		selectStruct:function(row,dev){
			var id=root.hash()
			var dom='select'
			
			return {dom:dom,id:id,auto:auto}
			function auto(){
				
			}
		},
		selectSave:function(id){
			
		},
	}
	root.regComponent(reg)
})(window.T)

/***********size*********/
;(function(root){
	var reg={
		name:'size',
		type:'plugin',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	
	var theme={
		yhf:{
			width: 1,
			fill: '#999999',
			color: '#95C2E8',
			font:'#FF0000',
			size:12,
		},
		cad:{
			width: 1,
			fill: '#999999',
			color: '#95C2E8',
			font:'#FF0000',
			size:12,
		},
		fashion:{
			width: 1,
			fill: '#999999',
			color: '#555555',
			font:'#FF0000',
			size:10,
		},
	}
	
	var config={
		theme:theme,
		struct:{
			'rdTwo':'twoSize'	,		//渲染器对应的module的构建方法
			'rdThree':'threeSize',		//3D渲染器构建标注的方式
		},
		check:30,				//size的检测的block的大小
		show:{
			'rdTwo':'twoShow'	,		//渲染器对应的module的构建方法
			'rdThree':'threeShow',		//3D渲染器构建标注的方式
		},
		dis:{
			extion:0.1,				//标注尾线的长度
			offset:0.3,				//标注点的偏移
			txtOffset:0.1,			//文字标注的偏移
			mini:0.1,					//显示的最小距离
		},
		//entryHooks:{},
	}
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		
		//构建的主入口,对不同的渲染器有不同的实现
		//生成A坐标数据
		struct:function(tg){
			var act=root.core.getActive(tg)
			if(!act.cur.type || act.cur.plugin) return
			
			var cur=act.cur
			
			//1.构建对应的组件的数据
			var pdd=[]
			var rd=root.core.getCurRender(tg),fun=config.struct[rd]
			var room=root.core.getRoom(cur.rid,tg),b=root.core.getBasic(cur.rid,tg)
			var cvt=root.core.getConvert(tg),cfg=root.clone(config.dis)
			for(k in cfg) cfg[k]=cfg[k]*cvt
			
			var data=room[cur.type][me.core.dataKeys.structKey]
			if(root[cur.type][fun]) pdd=root[cur.type][fun](cur.id,data,b,cfg)
			
			//2.推送到tg上去,供下一次检测touchstart用,check和action在一起
			//console.log(pdd)
			var chain=[me.memKeys.database,tg,cur.rid,reg.name,me.core.dataKeys.structKey]
			root.regMemory(pdd,chain,true)
			
			//3.推送到绘制数据
			//target下的对应键值的数据
			//var chain=[me.memKeys.database,tg,me.core.struct.plugin.regKey,reg.name]
			//root.regMemory('hello world',chain,true)
		},
		
		drawing:function(tg){
			//console.log(tg)
			var rd=root.core.getCurRender(tg)
			self[config.show[rd]](rd,tg)
		},
		
		//生成B坐标系的数据
		//调render的方法，实现绘制C坐标
		twoShow:function(rd,tg){
			var act=root.core.getActive(tg)
			if(!act.cur.type) return
			var cur=act.cur,rid=cur.rid
			
			//1.生成B坐标系的数据
			var data=root.core.getData(reg.name,rid,tg)
			var zs=data[me.core.dataKeys.structKey]
			if(root.empty(zs)) return 
			var cvt=root.core.getConvert(tg)
			var dis=config.dis,ext=dis.extion*cvt,ost=dis.offset*cvt,tost=dis.txtOffset*cvt
			var np=root.calc.newPoint,toB=root.calc.psAtoB
			var disCtoB=root.calc.disCtoB,offset=root.calc.offset
			var mid=root.calc.mid,offset=root.calc.offset,zj=Math.PI/2
			
			var b=root.core.getBasic(rid,tg)
			var pos=b.pos,ro=b.rotation
			
			var rst={line:[],fill:[],img:[],ease:[],arc:[],txt:[],show:true}
			var ks=me.memKeys
			var env=root.core.getRuntime(rd,tg)
			for(var i=0;i<zs.length;i++){
				var dt=zs[i]
				if(dt.size>=dis.mini*cvt){
					//a.生成需要的绘制点
					var pa=dt.ps[0],pb=dt.ps[1],ak=dt.left?dt.angle-zj:dt.angle+zj
					var aa=np(pa,ost,ak),ab=np(aa,ext,ak),ac=np(ab,ext,ak),ad=np(ab,ext,dt.left?ak-zj:ak+zj)
					var ba=np(pb,ost,ak),bb=np(ba,ext,ak),bc=np(bb,ext,ak),bd=np(bb,ext,dt.left?ak+zj:ak-zj)
					var cen=mid(ab,bb),tt=np(cen,tost,ak)
					
					//b.绘制标注线
					rst.line.push({ps:toB([aa,ac],ro,pos),cfg:{dash:false}})
					rst.line.push({ps:toB([ba,bc],ro,pos),cfg:{dash:false}})
					rst.line.push({ps:toB([ad,bd],ro,pos),cfg:{dash:false}})
					
					//c.绘制标注尺寸
					//处理angle,反转,加上pi
					var hp=dt.action?true:false
					rst.txt.push({txt:dt.size,cfg:{angle:dt.angle,pos:root.calc.pAtoB(tt,ro,pos),help:hp}})
					
					//d.计算check
					if(hp){
						var cdis=disCtoB(config.check,env.rotation,env.scale,env.multi,env.pxperm)
						var check=offset([tt,tt,tt,tt],cdis,ak)
						//rst.line.push({ps:toB(check,ro,pos),cfg:{dash:false}})	//绘制检测范围
						
						var chain=[ks.database,tg,rid,reg.name,me.core.dataKeys.structKey,i,env.checkKey]
						root.regMemory(check,chain,true)
					}
				}
			}
			
			//2.推送到绘制结构里，可以进行正常的绘制
			var chain=[me.memKeys.database,tg,cur.rid,reg.name,me[rd].moduleHooks.dataKey]
			root.regMemory(rst,chain,true)
		},
		
		threeShow:function(rd,tg){
			
			
		},
		
		clear:function(rid,tg){
			var chain=[me.memKeys.database,tg,rid,reg.name]
			return root.clearNode(chain)
		},
		
	}
	
	root.regComponent(reg)
})(window.T)


/***********dom*********/
;(function(root){
	var reg={
		name:'dom',
		type:'plugin',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	var theme={
		yhf:{},
		cad:{},
		fashion:{},
	}
	var config={
		menuCon:'menu_con',		//menu的总容器
		theme:theme,
		struct:{		//根据id可以切换不同的样式
			info: 		{cls:'fuu_t_info',	cmap:{'z-index':905}},
			footer:		{cls:'fuu_t_foot',	cmap:{'z-index':907}},
			mask:		{cls:'fuu_t_mask',	cmap:{'z-index':900}},
			pop:		{cls:'fuu_t_pop',	cmap:{'z-index':901}},
			sub:		{cls:'fuu_t_sub',  	cmap:{'z-index':902}},
			form:		{cls:'fuu_t_form',	cmap:{'z-index':903}},
			attribute:	{cls:'fuu_t_attr',	cmap:{'z-index':800}},
		},
		iconPath:me.curPath+'dwg/icon/',		//图标目录位置
		classHidden:'hidden',				//css里隐藏的类名
		entryHooks:{
			initFun:'initDom',
		},
	}
	
	var run={
		pop:{
			width:0
		},
	}
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		
		/*dom基础处理部分*/
		initDom: function (cfg) {
			var txt='<div class="'+config.menuCon+'"></div>'
			$(cfg.target).append(txt)
			
			var st = config.struct, hd = me.core.classHidden
			var txt=''
	        for (k in st) txt += '<div class="'  + st[k]['cls'] + ' '+ hd + '"></div>'
	        $(cfg.target).find('.'+config.menuCon).html(txt)
	        
	        for (k in st){
	        	$(cfg.target).find('.'+st[k]['cls']).css(st[k].cmap)
	        	if(self[k] && self[k].init)self[k].init(k,cfg,cfg.target)
	        }
		},
		//多callback的实现
		//show:function(tag,param,cks){
		show:function(tag,param,ck,ckMask){
	    	if(!tag || !self[tag]) return
	    	self[tag].show(param,ck,ckMask)
	    },
	    hidden:function(tg,tag){
	    	if(tag && self[tag]){
	    		self[tag].hidden(tg)
	    	}else{
	    		for (k in config.struct) if(self[k] && self[k].hidden)	self[k].hidden(tg)
	    	}
	    },
	    
	    /*info弹出框实现部分*/
	    info:{
		    sel:{},
		    cfg:{
		    	close:'info_close',
		    	line:'info_line',
		    	closeIcon:'close.png',
		    	title:'info_title',
		    	con:'info_con',
		    	width:0.6,		//info容器的宽度
		    	top:30,				//距离顶部的高度
		    },
		    init:function(tag,cfg,tg){
		    	var dd=config.struct[tag]
		    	this.sel[tg]=$(tg).find('.'+dd.cls)
		    },
		    show:function(tg,ck){},
		    hidden:function(tg,ck){},
	    },
	    footer:{
	    	sel:{},
	    	init:function(tg,cfg){},
	    	show:function(tg,ck){},
	    	hidden:function(tg,ck){},
	    },
	    
	    /*弹出菜单实现部分*/
	    pop:{
	    	sel:{},
	    	cfg:{
	    		pre:'pop_',
	    		sub:'sub_',
	    		arrow:'arrow',
	   		width:56,			//按钮的宽度
	   		border:2,			//分割线宽度
	   		height:28,			//按钮的高度
	   		awidth:20,
	   		fix:15,
	    		padding:10,
	    	},
	    	init:function(tag,cfg,tg){
		    	var tg=cfg.target
		    	this.sel[tg]=$(tg).find('.'+config.struct[tag].cls)
	    	},
	    	show:function(param,tg,cks){
	    		var con=root.core.getRuntime(param.render,tg),act=root.core.getActive(tg),cvt=root.core.getConvert(tg)
	    		var psel=this.sel[tg],cfg=this.cfg
	    		
	    		//1.显示菜单
	    		var txt=''
		    	if(param.list){
		    		var list=param.list,len=list.length,acts=[],sub={}
		    		var ww=len*cfg.width+(len-1)*cfg.border
		    		run.pop[tg]={width:ww}		//输出pop的宽度，供其他的dom组件定位
		    		txt+='<ul>'
		    		for(var i=0;i<len;i++){
		    			var btn=list[i],id=cfg.pre+i
		    			var arrow=btn.sub?'<span>...</span>':''
		    			txt+='<li id="'+id+'">'+btn.title+arrow+'</li>'
		    			if(btn.action) acts.push({id:id,action:btn.action,cfg:btn})
		    			if(btn.sub) sub[id]=btn
		    		}
		    		txt+='</ul>'
		    		txt+='<div id="'+cfg.arrow+'" class="arrow"></div>'
		    	}
		    	//2.计算pop的位置,上下左右的边界判断
		    	var w=con.width,h=con.height,pos=param.pos,cpos=param.cpos,hw=ww/2
		    	var htop=cfg.fix+cfg.height,pleft=pos[0]-hw,ptop=pos[1]+cpos[1]-htop,aleft=hw-cfg.awidth
		    	if(hw>pos[0]){
		    		pleft=0
		    		aleft=pos[0]-cfg.awidth
		    	}
		    	
		    	if(htop>pos[1]){
		    		ptop=cfg.height
		    	}
		    	
		    	if(w-hw<pos[0]){
		    		pleft=w-ww
		    		aleft=pos[0]-w+ww-cfg.awidth
		    	}
		    	
		    	var pmap={'margin-left':pleft+'px','margin-top':ptop+'px'}
		    	var amap={'margin-left':aleft+'px'}
	    		psel.html(txt).css(pmap).removeClass(config.classHidden).find('#'+cfg.arrow).css(amap)
	    		
	    		//4.绑定按钮操作
	    		for(var i=0,alen=acts.length;i<alen;i++){
	    			var btn=acts[i],btnSel=psel.find('#'+btn.id)
	    			;(function(btn,sel,tg){
	    				touch.off(sel).on(sel,"click",function(ev){
	    					if(btn.cfg.type!='button') {
	    						cks['main'] && cks['main']([btn.id])
	    					}else{
	    						var rst=btn.action(btn.cfg.data,act.cur.id||0,cvt)
	    						if(rst) cks['sub']&&cks['sub'](rst)
	    					} 
		    			})
	    			})(btn,btnSel,tg)
	    			
	    			
	    			if(btn.cfg.close) touch.on(btnSel,'click',function(){
	    				self.pop.hidden(tg)
	    				self.sub.hidden(tg)
	    			})
	    		}
	    		
	    		//5.绑定sub操作
	    		if(root.empty(sub)) return

	    		for(var k in sub){
	    			var param=sub[k]
	    			var subSel=this.sel[tg].find('#'+k)
	    			;(function(p,sel,pid,tg){
	    				touch.off(sel).on(sel,"click",function(ev){
	    					var pid=sel.attr('id'),txt=p.title
	    					var scks={
	    							'form':function(id){cks['main'] && cks['main']([pid,id])},
	    							'button':function(todo){cks['sub']&&cks['sub'](todo)}
	    						}
	    					self.sub.show({parent:pid,data:p.data},tg,scks)
	    				})
	    			})(param,subSel,k,tg)
	    		}
	    	},

	   	 	hidden:function(tg,ck){
	   	 		//console.log(this.sel[tg])
	   	 		this.sel[tg].addClass(config.classHidden)
	   	 		ck&&ck()
	   	 	},
	    },
	    
	    sub:{
	    	sel:{},
	    	cfg:{
	    		pre:'sub_',
	    	},
	    	init:function(tag,cfg,tg){
	    		var tg=cfg.target
		    	this.sel[tg]=$(tg).find('.'+config.struct[tag].cls)
	    	},
	    	//show:function(param,tg,ck,bck){
	    	show:function(param,tg,cks){
	    		//console.log(JSON.stringify(param))
	    		var cfg=this.cfg
	    		var psel=$(tg).find('#'+param.parent)
	    		var act=root.core.getActive(tg),cvt=root.core.getConvert(tg)
	    		var txt=''
	    		if(param['data']){
	    			var list=param['data'],len=list.length,acts=[]
	    			txt+='<ul>'
	    			for(var i=0;i<len;i++){
	    				var btn=list[i],id=cfg.pre+i
		    			txt+='<li id="'+id+'">'+btn.title+'</li>'
		    			if(btn.action) acts.push({id:id,action:btn.action,cfg:btn})
	    			}
	    			txt+='</ul>'
	    			
	    			var pmap={'left':psel.offset().left+'px','top':(psel.offset().top+40)+'px'}
	    			this.sel[tg].html(txt).css(pmap).removeClass(config.classHidden)
	    		}
	    		
	    		for(var i=0,alen=acts.length;i<alen;i++){
	    			var btn=acts[i],btnSel=this.sel[tg].find('#'+btn.id)
	    			;(function(btn,sel,tg){
	    				touch.off(sel).on(sel,"click",function(ev){
	    					if(btn.cfg.type!='button'){
	    						self.pop.hidden(tg)
	    						cks['form']&&cks['form'](btn.id)
	    					}else{
	    						//fuu,这里存在设计问题，隐式传递了id过来
	    						var doid=btn.cfg.data.id==undefined?act.cur.id:btn.cfg.data.id
	    						cks['button']&& cks['button'](btn.action(btn.cfg.data,doid,cvt))
	    					} 
		    			})
	    				
	    				if(btn.cfg.close){
	    					touch.on(sel,"click",function(ev){
	    						self.sub.hidden(tg)
	    					})
	    				}
	    			})(btn,btnSel,tg)
	    		}
	    	},
	    	
	    	hidden:function(tg,ck){
	    		this.sel[tg].addClass(config.classHidden)
	   	 		ck&&ck()
	    	},
	    },
	    
	    form:{
	    	sel:{},
	    	cfg:{
	    		header:'form_header',
	    		footer:'form_footer',
	    		btnSave:'form_save',
	    		wrapper:'input_wrapper',
	    		clsActive:'active',
	    		height:{		//计算窗体的高度,每个组件的高度
	    			header:20,
	    			row:20,
	    			footer:20,
	    		},
	    		pre:{
	    			select:'sel_',
	    			block:'blk_',
	    			action:'act_',
	    			value:'val_',
	    		},
	    		block:{
	    			row:3,			//默认的每行数量
	    		},
	    	},
	    	init:function(tag,cfg,tg){
	    		var tg=cfg.target
		    	this.sel[tg]=$(tg).find('.'+config.struct[tag].cls)
	    	},
	    	
	    	show:function(param,tg,ck){
	    		//console.log('form param:'+JSON.stringify(param))
	    		var cfg=this.cfg
	    		
	    		
	    		//1.显示form的头部
	    		var txt=''
	    		if(param.title) txt='<div class="'+cfg.header+'"><h2>'+param.title+'</h2></div>'
	    		
	    		//2.遍历生成选项
	    		txt+='<table>'
	    		if(param['list']){
	    			for(var i=0,len=param.list.length;i<len;i++){
	    				var row=param.list[i]
	    				if(row.type){
	    					if(this[row.type])txt+=this[row.type](row)
	    				}
	    			}
	    		}
	    		txt+='</table>'
	    		
	    		if(param.btnSave) txt+='<div class="'+cfg.footer+'"><button class="'+cfg.btnSave+'">'+param.titleSave+'</button></div>'
	    		
	    		//3.计算显示的位置
	    		var tsel=$(tg),otg=tsel.offset(),left=otg.left,top=otg.top
	    		var cmap={left:'0px',top:'0px'}
	    		//console.log(me)
	    		if(param.align=='center' || param.position==undefined){
	    			//console.log('ready to set center')
	    			var ww=tsel.width(),wh=tsel.height()
	    			var pw=run.pop[tg].width
	    			
	    			var pos=[ww/2-pw/2,wh/2]
	    			cmap.left=(left+pos[0])+'px'
	    			cmap.top=(top+pos[1])+'px'
	    			
	    		}else{
	    			var pos=param.position
	    			cmap.left=(left+pos[0])+'px'
	    			cmap.top=(top+pos[1])+'px'
	    		}
	    		
	    		console.log(txt)
	    		this.sel[tg].html(txt).css(cmap).removeClass(config.classHidden)
	    		
	    		//3.1显示mask
	    		if(param.mask) self.mask.show(tg)
	    	
	    		//4.绑定数据带操作
	    		if(param['list']){
	    			for(var i=0,len=param.list.length;i<len;i++){
	    				var row=param.list[i],type=cfg.pre.action+row.type
	    				//console.log(type)
	    				if(this[type])this[type](row,tg)
	    			}
	    		}
	    		
	    		//5.绑定保存操作
	    		var sel=this.sel[tg].find('.'+cfg.btnSave)
	    		touch.off(sel)
	    		touch.on(sel,'click',function(){
	    			ck&&ck(self.form.save(param,tg))
	    		})
	    		
	    		return true
	    	},
	    	save:function(param,tg){
	    		var cfg=this.cfg
	    		var rst={}
	    		for(var i=0,len=param.list.length;i<len;i++){
	    			var row=param.list[i]
	    			//console.log(JSON.stringify(row))
	    			rst[row.name]=this[cfg.pre.value+row.type](row,tg)
	    		}
	    		return rst
	    	},
	    	
	    	select:function(p){
	    		if(!p.data.length) return
	    		var scts='<ul>'
	    		for(var i=0,len=p.data.length;i<len;i++){
	    			var ss=p.data[i],act=ss.active?'active':'',id=this.cfg.pre.select+ss.data
	    			scts+='<li id="'+id+'" data="'+ss.data+'" class="'+act+'">'+ss.name+'</li>'
	    		}
	    		scts+='</ul>'
	    		var txt='<tr><td>'+p.label+'</td><td>'+scts+'</td></tr>'
	    		return txt
	    	},
	    	number:function(p){
	    		//console.log(JSON.stringify(p))
	    		var txt='<tr><td>'+p.label+'</td><td><div class="'+this.cfg.wrapper+'"><input type="number" name="'+p.name+'"  id= "'+p.name+'" value="'+p.data+'"></div></td></tr>'
	    		return txt
	    	},
	    	text:function(p){
	    		var txt='<tr><td>'+p.label+'</td><td><div class="'+this.cfg.wrapper+'"><input type="text" name="'+p.name+'" id= "'+p.name+'" value="'+p.data+'"></div></td></tr>'
	    		return txt
	    	},
	    	
	    	bool:function(p){
	    		//boolean类型的数据
	    	},
	    	
	    	//fuu,放到后面写,可以支持更多的功能
	    	block:function(p){
	    		if(!p.data.length) return
	    		var cfg=this.cfg,row=p.config.row||cfg.block.row
	    		var wp= (100/row)+'%'
	    		var list='<dt>'
	    		for(var i=0,len=p.data.length;i<len;i++){
	    			var ss=p.data[i]
	    			list+='<dl width="'+wp+'"><img src="">'+ss.name+'</dl>'
	    		}
	    		
	    		var txt='<tr><td colspan=2>'+list+'</td></tr>'
	    		return txt
	    	},
	    	
	    	act_select:function(p,tg){
	    		if(!p.data.length) return
	    		var sel=this.sel[tg]
	    		for(var i=0,len=p.data.length;i<len;i++){
	    			var ss=p.data[i],id=this.cfg.pre.select+ss.data
	    			var ssel=sel.find('#'+id)
	    			//console.log(ssel)
	    			touch.off(ssel)
	    			touch.on(ssel,'click',function(){
	    				$(this).addClass('active').siblings().removeClass('active')
	    			})
		    		touch.on(ssel,'click',ss.action)
	    		}
	    	},
	    	act_number:function(p,tg){
	    		console.log('number act:'+JSON.stringify(p))
	    	},
	    	act_text:function(p,tg){
	    		console.log('text act:'+JSON.stringify(p))
	    	},
	    	act_block:function(p,tg){
	    		console.log('block act:'+JSON.stringify(p))
	    	},
	    	
	    	val_select:function(p,tg){
	    		console.log(p)
	    	},
	    	val_number:function(p,tg){
	    		return $(tg).find('#'+p.name).val()
	    	},
	    	val_text:function(p,tg){
	    		return $(tg).find('#'+p.name).val()
	    	},
	    	val_block:function(p,tg){
	    		
	    	},
	    	
	    	hidden:function(tg,ck){
	    		this.sel[tg].addClass(config.classHidden)
	   	 		ck&&ck()
	    	},
	    },
	    page:{
	    	sel:{},
	    	init:function(tg,cfg){},
	    	show:function(tg,ck){},
	    	hidden:function(tg,ck){},
	    },
	    status:	{
	    	sel:{},
	    	init:function(tg,cfg){},
	    	show:function(tg,ck){},
	    	hidden:function(tg,ck){},
	    },
		attribute:{
	    	sel:{},
	    	init:function(tag,cfg,tg){
	    		//console.log(tag)
	    		//console.log(cfg)
	    		//console.log(tg)
	    	},
	    	show:function(tg,ck){
	    		
	    		
	    	},
	    	hidden:function(tg,ck){
	    		
	    	},
	    },
	    
	    mask:{
	    	sel:{},
	    	init:function(tag,cfg,tg){
	    		var tg=cfg.target
		    	this.sel[tg]=$(tg).find('.'+config.struct[tag].cls)
		    	var cmap={ "width":cfg.conWidth,"height":cfg.conHeight }
	    		this.sel[tg].css(cmap)
	    	},
	    	show:function(tg,ck){
	    		var sel=this.sel[tg]
	    		 
	    		touch.off(sel).on(sel,"click",function(){
	    			self.hidden(tg)
	    			ck&&ck()
	    		})
	    		var left=$(tg).offset().left,top=$(tg).offset().top
	    		var cmap={'margin-left':left+'px','margin-top':top+'px'}
	    		sel.css(cmap).removeClass(config.classHidden)
	    	},
	    	hidden:function(tg,ck){
	    		this.sel[tg].addClass(config.classHidden)
	    		ck&&ck()
	    	},
	    },
	}
	
	root.regComponent(reg)
})(window.T)
/***********tag*********/

/********two*********/
;(function(root){
	var reg={
		name:'rdTwo',
		type:'render',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	var me=root.getMe()
	
	var theme={
			yhf:{
				ground:'#CCFFCC',
				grid:{
					light:'#DDDDDD',
					normal:'#999999',
					dark:'#555555',
				},
				shadow:{
					offsetX:3,
					offsetY:3,
					color:'rgba(256,0,0,0.75)',
					blur:10,
				},
				active:"#009900",
				width:1,
				color:'#FF6699',
				fill:'#000000',
				mask:'rgba(230,70,70,0.7)',
				font:'SimHei',
				axColor:'#000000',
				axWidth:2,
				axSize:24,
			},
			cad:{
				ground:'#F8F8FF',
				grid:{
					light:'#DDDDDD',
					normal:'#999999',
					dark:'#555555',
				},
				shadow:{
					offsetX:3,
					offsetY:3,
					color:'rgba(256,0,0,0.75)',
					blur:10,
				},
				active:"#009900",
				width:1,
				color:'#FF6699',
				fill:'#000000',
				mask:'rgba(230,70,70,0.7)',
				font:'SimHei',
				axColor:'#000000',
				axWidth:2,
				axSize:24,
			},
			fashion:{
				ground:'#F8F8FF',
				grid:{
					light:'#EFEFEF',
					normal:'#DDDDDD',
					dark:'#B0B0B0',
				},
				shadow:{
					offsetX:3,
					offsetY:3,
					color:'rgba(256,0,0,0.75)',
					blur:10,
				},
				active:"#0099FF",
				width:1,
				color:'#FF6699',
				fill:'#F8F8FF',
				mask:'rgba(230,70,70,0.7)',
				font:'SimHei',
				axColor:'#000000',
				axWidth:2,
				axSize:24,
			},
		}
	
	var config={
		controller:'ctlTwo',		//配置的控制器
		/*自定义的渲染器注册部分*/
		intro:'2D图形绘制渲染器,用canvas实现绘图',
		renderTarget:'fuu_t_2Drender',		//包裹渲染器的div名称
		entry:true,							//是否为主显示
		auto:true,							//是否自动计算数据结构
		theme:theme,

		/*渲染器需要调用的自动方法,渲染器注册到core之后可以进行调用*/
		
		inputPos:{
			inputPos:230,					//弹出对话框的高度位置
			selectPos:70,					//选择对话框的位置
			animateFrame:20,				//动画帧数
		},
		
		entryHooks:{
			initFun:'domInit',			//渲染器的初始化方式
			structFun:'struct',			//构建渲染器数据的主入口
			dwgFun:'drawing',			//渲染器的自动显示方法,被core调用
			activeFun:'active',			//绘制active的入口
			showFun:'showMe',
			hiddenFun:'hiddenMe',		//停止渲染器方法
			//controlFun:'startControl',	//控制器的入口
		},
		
		moduleHooks:{
			struct:'twoStruct',				//自动调用组件进行3D构建函数
			dataKey:'two',					//挂载在threeRoom[rid]下的名称
			activeStruct:'twoActive',		//活动组件数据构建方法
			activeKey:'twoact',				//活动数据挂载的位置
		},
		
		subHooks:{
			subStruct:'twoSubStruct',		//自动调用的sub组件的方法名
			subShow:'twoSubShow',			//自动调用的2D的sub组件渲染方法
		},
		
		env:{
			canvasID:'two_canvas',		//2D的绘图canvas的id
			width:0,									//必须，容器宽度
			height:0,									//必须，容器高度
			multi:window.devicePixelRatio,		//屏幕的缩放比例retian值
			pxperm:0.03,				//像素/米,用于2D显示比例
			defaultWidth:375,			//缩放比例的配置参数
			
			domCheckScale:1,			//显示检查dom的比例
			checkKey:'check',			//组件检测活动的键值
			position:{left:0,top:0},	//dom的left和top的位移
			scrollY:0,					//canvas滚动的位置
			imgWidth:400,
			imgHeight:400,
			grid:true,
			gridConfg:{					//网格运行参数
				count:5,	
				sparse:0.2,
				close:0.1,
			},
			image:true,
			help:false,
			helpConfig:{				//help运行参数
				extend:8,
				offset:10,	
			},
			ax:false,
			axConfig:{},
			roomFirst:true,
			pen:null,
			theme:'fashion',	//默认的主题
			selector:null,		//2D的选择器，controller用
			/*2D渲染器运行时参数*/
			rotation:0,		//2D画布的旋转
			scale:4,			//2D渲染器的缩放比例
			offset:[1,1],		//2D渲染器的坐标位移
			detailScale:5,			//显示细节的缩放比例
			maxScale:10,			//最大缩放比例,限制无穷放大带来的问题,初始化时会计算
			minScale:2,				//最小缩放比例,限制无穷缩小带来的问题,初始化时会计算
		},
	}
	
	//var env=root.clone(config.env)		//取出对应的env,临时缓存,提升渲染器的效率
	
	var run={}
	
	var self=reg[me.funKey]={
		init:function(){root.regMe(config,[reg.name],true)},
		domInit:function(cfg){
			if(run[cfg.target]!=undefined || !root.isType(cfg,'object')) return
			if(config.isEntry) root.core.setCurRender(reg.name,cfg.target)
			
			var env=root.clone(config.env)
			//if(devicePixelRatio%1>0)	env.multi=1
			run[cfg.target]=env			//保存本地运行环境
			
			//1.初始化合并参数,设置theme都可以完成
			env.width=cfg.conWidth?cfg.conWidth:env.width
			env.height=cfg.conHeight?cfg.conHeight:env.height
			var cid=cfg.target+env.canvasID
			var cls=me.core.classHidden+' '+config.renderTarget
			//var cls=config.renderTarget
			var txt='<div class="'+cls+' "><canvas id="'+cid+'" width="'+env.multi*cfg.conWidth+'" height="'+env.multi*cfg.conHeight+'" '
			txt+='style="width:'+cfg.conWidth+'px;height:'+cfg.conHeight+'px" ></canvas></div>'
			$(cfg.target).append(txt).css({width:cfg.conWidth+'px',height:cfg.conHeight+'px'})
			
			var cvs=document.getElementById(cid)
			env.pen=cvs.getContext("2d")
			
			//2.把运行环境放到DB下
			var chain=[me.memKeys.database,cfg.target,me.core.struct.runtime.regKey,reg.name]
			root.regMemory(env,chain,true)
			
			//fuu,临时加载绘图资源
			var url='dulex/res/fashion_fur_1.json'
			root.getLocal(url,function(data){
				root.core.setResource(data,1,'img')
			})
			
			//setResource:function(data,id,type){},
		},

		setScale:function(s,tg){if(root.isType(s,'number')) run[tg].scale=s},
		setOffset:function(o,tg){if(root.isType(o,'array') && o.length==2) run[tg].offset=o},
		showGrid:function(tg){run[tg].grid=true},
		hiddenGrid:function(tg){run[tg].grid=false},
		showImage(tg){run[tg].image=true},
		hiddenImage(tg){run[tg].image=false},
		getRuntime:function(k,tg){return root.getMemory([me.memKeys.database,tg,me.core.struct.runtime.regKey,reg.name,k])},
		setRuntime:function(k,v,tg){root.regMemory(v,[me.memKeys.database,tg,me.core.struct.runtime.regKey,reg.name,k])},
		//getTheme:function(t){return root.getMemory([me.memKeys.cache,me.core.themeKey,t])},
		
		clear:function(tg){
			var env=run[tg],pen=env.pen
			pen.fillStyle=theme[env.theme].ground
			pen.fillRect(0,0,env.multi*env.width,env.multi*env.height)
		},
		
		//fuu,绘制都在这里实现,直接调用绘图数据显示即可
		//1.sub也在这里进行显示clear
		//2.sub的数据也挂载到rid下
		/*
		 * @param		tg		string		//绘图容器的id
		 * @param		is		boolean		//不刷线运行状态
		 * */
		drawing:function(tg,is){
			var env=run[tg]
			if(!is){
				var rst=self.zoom(tg,[])
				self.setScale(rst.scale,tg)
				self.setOffset(root.clone(rst.offset),tg)
			}
			self.clear(tg)
			
			if(env.grid)	self.dwgGrid(tg)
			if(env.ax)		self.dwgAx(tg)
			self.dwgRooms(tg)
			root.core.setCurTarget(tg)			//激活当前
			self.showMe(tg)								//显示对象
		},
		
		active:function(tg){
			//这里对active进行判断
			var act=root.core.getActive(tg)
			if(!act.cur.type || act.cur.plugin) return
			var cur=act.cur,chain=[me.memKeys.database,tg,cur.rid,cur.type,config.moduleHooks.activeKey]
			var dd=root.getMemory(chain)
			self.dwgStruct(cur.type,dd[cur.id],tg,true)
		},
		
		check:function(p,tg){
			//1.先判断room,如果有,继续检测module和plugin
			//2.如果没有,继续检测plugin
			var rst={type:'',id:0,rid:0,plugin:false,debug:true}
			var rid=self.checkRoom(p,tg)
			if(rid){
				var dom=self.checkModule(p,rid,tg)
				var pg=self.checkPlugin(p,rid,tg)
				if(pg.type) return pg
				if(dom.type) return dom
				rst.type=me.core.motherReg
				rst.rid=rid
				return rst
			}else{
				var pg=self.checkPlugin(p,rid,tg)
				if(pg.type) return pg
				return rst
			}
			//下面以之前的逻辑
			/*if(!rid) return rst
			rst.rid=rid
			
			var dom=self.checkModule(p,rid,tg)
			if(!dom.type){
				rst.type=me.core.motherReg
				return rst
			}
			return dom*/
		},
		
		/*检测有几个房间被选中的函数
		 *@param	p	array	//[x,y]类型的C坐标系的点
		 * 
		 * */
		checkRoom:function(p,tg){
			var rid=0
			var env=run[tg],isIn=root.calc.isIn,CtoB=root.calc.pCtoB,AtoB=root.calc.psAtoB
			var pb=CtoB(p,env.scale,env.offset,env.multi,env.pxperm)
			//1.循环遍历房间，找到rid
			var rs=root.getMemory([me.memKeys.database,tg,me.core.struct.rooms.regKey])
			if(root.empty(rs)) return rid
			for(var i=0;i<rs.length;i++){
				var b=root.core.getBasic(rs[i],tg)
				var chk=b[run[tg].checkKey]
				var ps=AtoB(chk,b.rotation,b.pos)
				if(isIn(pb,ps)) rid=rs[i]
			}
			return rid
		},
		
		//fuu,逻辑重写,对数据进行遍历,提升效率
		checkModule:function(p,rid,tg){
			var rst={type:'',id:0,rid:rid,plugin:false}
			var ks=me.memKeys
			//var ds=root.getMemory([ks.database,tg,rid])
			var room=root.core.getRoom(rid,tg)
			var env=run[tg],isIn=root.calc.isIn,CtoB=root.calc.pCtoB,AtoB=root.calc.psAtoB
			var pb=CtoB(p,env.scale,env.offset,env.multi,env.pxperm)
			var b=root.core.getBasic(rid,tg),ro=b.rotation,pos=b.pos
			
			for(var k in room){
				if(k!=me.core.dataKeys.basicKey){
					var dom=room[k][me.core.dataKeys.structKey]
					if(!root.empty(dom)){
						for(var i=0;i<dom.length;i++){
							var chk=dom[i][run[tg].checkKey]
							if(chk){
								if(isIn(pb,AtoB(chk,ro,pos))){
									rst.type=k
									rst.id=i
								}
							}
						}	
					}
				}
			}
			return rst
		},
		
		//检测plugin的方法
		checkPlugin:function(p,rid,tg){
			var pgs=root.core.getRegs('plugin'),act=root.core.getActive(tg),cur=act.cur
			rid=rid||cur.rid
			var rst={type:'',id:undefined,rid:rid,plugin:true}
			if(!rid) return rst
			
			var env=run[tg],room=root.core.getRoom(rid,tg),b=root.core.getBasic(rid,tg),ckey=env.checkKey
			var isIn=root.calc.isIn,AtoB=root.calc.psAtoB,ro=b.rotation,pos=b.pos
			var pb=root.calc.pCtoB(p,env.scale,env.offset,env.multi,env.pxperm)
			for(var i=0,len=pgs.length;i<len;i++){
				var pg=pgs[i]
				if(room[pg]){
					var cks=room[pg][me.core.dataKeys.structKey]
					if(!root.empty(cks)){
						for(var j=0,clen=cks.length;j<clen;j++){
							var dt=cks[j][ckey]
							if(dt){
								if(isIn(pb,AtoB(dt,ro,pos))){
									rst.type=pg
									rst.id=j
								}
							}
						}
					}
				}
			}
			return rst
		},
		
		showMe:function(tg){$(tg).find('.'+config.renderTarget).removeClass(me.core.classHidden)},
		hiddenMe:function(tg){$(tg).find('.'+config.renderTarget).addClass(me.core.classHidden)},
		
		dwgRooms:function(tg){
			var rms=root.getMemory([me.memKeys.database,tg,me.core.struct.rooms.regKey])
			if(!rms) return
			
			var act=root.core.getActive(tg),aid=act.cur.type?act.cur.rid:0
			var mk=me.core.motherReg
			
			//1.绘制所有房间
			for(var i=0;i<rms.length;i++){
				var rid=rms[i]
				if(aid!=rid){
					var room=root.core.getRoom(rid,tg)
					for(k in room){
						var dk=config.moduleHooks.dataKey
						if(k!=mk && room[k][dk] && room[k][dk].show){
							var dd=room[k][dk]
							self.dwgStruct(k,dd,tg)
						}else{
							self.dwgStruct(mk,room[mk][dk],tg)
						}
					}
				}
			}
			//2.绘制活动房间
			if(!aid)	return 
			var room=root.core.getRoom(aid,tg)
			for(k in room){
				var dk=config.moduleHooks.dataKey
				if(k!=mk && room[k][dk] && room[k][dk].show){
					var dd=room[k][dk]
					self.dwgStruct(k,dd,tg)
				}else{
					self.dwgStruct(mk,room[mk][dk],tg)
				}
			}
		},
		
		
		/* 绘制结构化数据的入口
		 * @param	is	boolean		//是否为active状况，选择不同的模板
		 * */
		dwgStruct:function(mod,dd,tg,is){
			var t=self.getRuntime('theme',tg),tpl=root.core.getTheme(t)
			var fill=self.fillPolygon,line=self.dwgLine,dash=self.dwgDash
			var arc=self.dwgArc,img=self.dwgImage,txt=self.dwgTxt
			if(dd.fill) {
				var arr = dd.fill
				for(var j = 0; j < arr.length; j++) {
					var cfg = arr[j].cfg
					if(is) cfg.color = tpl[mod].mask?tpl[mod].mask:theme[t].mask
					else cfg.color = cfg.relate ? tpl[cfg.relate].fill : tpl[mod].fill
					
					//这里开始处理是否绘制detail
					fill(arr[j].ps, cfg, tg)
				}
			}

			if(dd.line) {
				var arr = dd.line
				for(var j = 0; j < arr.length; j++) {
					var cfg = arr[j].cfg
					//console.log('line:'+ JSON.stringify(arr[j]))
					if(cfg.dash) {
						if(is) cfg.color=tpl[mod].active?tpl[mod].active:theme[t].active
						else cfg.color = tpl[mod].dash
						
						//处理是否绘制detail
						dash(arr[j].ps, cfg, tg)
					} else {
						if(is) cfg.color=tpl[mod].active?tpl[mod].active:theme[t].active
						else cfg.color = tpl[mod].color
						
						//处理是否绘制detail
						line(arr[j].ps, cfg, tg)
					}
				}
			}

			if(dd.arc) {
				var arr = dd.arc
				for(var j = 0; j < arr.length; j++) {
					var cfg = arr[j].cfg
					if(is) cfg.color=tpl[mod].active?tpl[mod].active:theme[t].active
					else cfg.color = tpl[k].arc
					arc(arr[j].data, cfg, tg)
				}
			}
			
			if(dd.img) {
				var arr = dd.img
				for(var j = 0; j < arr.length; j++) {
					var cfg=arr[j].cfg
					if(run[tg].image){
						var res=self.getImage(arr[j].sid)
						cfg.shadow=tpl[mod].shadow?tpl[mod].shadow:theme[t].shadow
						
						if(root.empty(res))fill(cfg.ps, cfg, tg)
						else img(res, cfg, tg)
					}else{
						fill(cfg.ps, cfg, tg)	
					}
				}	
			}
			
			if(dd.txt){
				//console.log(dd.txt)
				var arr = dd.txt
				for(var j = 0; j < arr.length; j++) {
					var cfg = arr[j].cfg
					cfg.color = tpl[mod].color
					cfg.size=tpl[mod].size
					txt(arr[j].txt,cfg,tg)
				}
			}
		},

		dwgGrid:function(tg){
			var env=run[tg],tpl=theme[env.theme]
			var disCtoB=root.calc.disCtoB
			
			var cvt=root.core.getConvert(tg)
			var s=env.scale,m=env.multi,pm=env.pxperm
			var sparse=env.gridConfg.sparse*cvt,close=env.gridConfg.close*cvt,count=env.gridConfg.count
			var step=s<4?sparse:close
			
			var x=disCtoB(env.width,1,s,m,pm),y=disCtoB(env.height,1,s,m,pm)
			var xs=env.offset[0]%step-env.offset[0],xn=Math.ceil(x/step)
			var ys=env.offset[1]%step-env.offset[1],yn=Math.ceil(y/step)
			
			var ga=close*count,gb=sparse*count
			var offset=s>4?ga:gb
			var ca=tpl.grid.light,cb=tpl.grid.normal,cc=tpl.grid.dark
			
			for(var i=0;i<yn;i++){
				var pa=[-env.offset[0],ys],pb=[x-env.offset[0],ys]
				var color=ys%offset?ca:(ys%gb?cb:(s>4?cc:cb))
				self.dwgLine([pa,pb],{color:color},tg)
				ys+=step
			}
			
			for(var i=0;i<xn;i++){
				var pa=[xs,-env.offset[1]],pb=[xs,y-env.offset[1]]
				var color=xs%offset?ca:(xs%gb?cb:(s>4?cc:cb))
				self.dwgLine([pa,pb],{color:color},tg)
				xs+=step
			}
		},
		
		fillPolygon:function(ps,cfg,tg){
			var cfg=cfg||{}
			var env=run[tg],pen=env.pen,tpl=theme[env.theme]
			var pBtoC=root.calc.pBtoC
			var c=cfg.mask?cfg.mask:(cfg.color||tpl.fill)
			pen.fillStyle=c
			pen.beginPath()
			for (var i=0,len=ps.length;i<len;i++) {
				var p=pBtoC(ps[i],env.scale,env.offset,env.pxperm)
				if(i==0)pen.moveTo(p[0]-0.5,p[1]);
				if(i>0 && i<len)pen.lineTo(p[0],p[1])
			}
			pen.closePath()
			pen.fill()
		},
		
		dwgLine:function(ps,cfg,tg){
			var cfg=cfg||{}
			var env=run[tg],pen=env.pen,tpl=theme[env.theme]
			var pBtoC=root.calc.pBtoC
			pen.lineWidth = cfg.width || tpl.width
			pen.strokeStyle = cfg.color || tpl.color
			pen.beginPath()
			for (var i=0,len=ps.length;i<len;i++){
				var p=pBtoC(ps[i],env.scale,env.offset,env.pxperm)
				if(i==0)pen.moveTo(p[0]+0.5,p[1]+0.5)
				if(i>0 && i<len)pen.lineTo(p[0]+0.5,p[1]+0.5)
			}
			pen.closePath()
			pen.stroke()
		},
		
		dwgDash:function(ps,cfg,tg){
			if(ps.length<2)	return
			var len=ps.length,tools=root.calc,dash=tools.dash
			for(var i=0;i<len;i++){
				var pa=ps[i],pb=i==len-1?ps[0]:ps[i+1]
				var ds=dash([pa,pb],cfg.dis),dlen=ds.length
				for(var j=0;j<dlen;j++){
					self.dwgLine(ds[j],cfg,tg)
				}
			}
		},
		
		dwgArc:function(d,cfg,tg){
			var env=run[tg],pen=env.pen,tpl=theme[env.theme]
			var cc=root.calc.pBtoC(d.center,env.scale,env.offset,env.pxperm)
			var rr=root.calc.disBtoC(d.r,0,env.scale,1,env.pxperm)
			pen.beginPath()
			pen.strokeStyle=cfg.color
			pen.arc( Math.round(cc[0]) + 0.5, Math.round(cc[1]) + 0.5,rr,d.start,d.end);	
			pen.stroke()
		},
		
		dwgTxt:function(txt,cfg,tg){
			var env=run[tg],pen=env.pen,tpl=theme[env.theme]
			var align=cfg.align?cfg.align:'center'
			var zj=Math.PI/2,qj=zj/2,kk=cfg.angle
			//console.log(txt+','+kk)
			var ak=(kk==Math.PI)?cfg.angle+Math.PI:cfg.angle
			is=cfg.help||false
			var m=root.calc.pBtoC(cfg.pos,env.scale,env.offset,env.pxperm)
			pen.save()
			pen.translate(m[0],m[1])
			pen.rotate(ak)
			pen.fillStyle = cfg.color
			pen.font = cfg.size*env.multi+'px SimHei'
			pen.textAlign=align
			pen.fillText(txt,0,0)
			
			if(cfg.help){
				var pw=pen.measureText(txt),w=pw.width
				var h=cfg.size*env.multi
				self.dwgHelp({width:w,height:h},tg)
			}
			pen.restore()
		},
		
		dwgImage:function(img,cfg,tg){
			//dwgImg:function(img,cen,width,height,rotate,mirror){
			//console.log(JSON.stringify(cfg))
			var env=run[tg],pen=env.pen,sd=cfg.shadow
			var pBtoC=root.calc.pBtoC,disBtoC=root.calc.disBtoC
			var s=env.scale,o=env.offset,m=env.multi,pp=env.pxperm
			var cvt=root.core.getConvert(tg)
			var mm=new Image()
			mm.src=img.src
			var ncen=pBtoC(cfg.center,s,o,pp)
			var w=disBtoC(cfg.width*m,0,s,m,pp),h=disBtoC(cfg.height*m,0,s,m,pp)
			
			pen.save()
			pen.translate(ncen[0],ncen[1])
			pen.rotate(cfg.rotation)
			pen.shadowOffSetX = sd.offsetX
			pen.shadowOffsetY = sd.offsetY
			pen.shadowColor=sd.color
			pen.shadowBlur = sd.blur
			if (cfg.mirror) pen.scale(-1, 1)
			//console.log(w+','+h)
			//console.log(mm.width*cvt+','+mm.height*cvt)
			pen.drawImage(mm,0,0,mm.width,mm.height,-w/2,-h/2 ,w,h)
			pen.restore()
		},
		
		dwgAx:function(w,cfg,tg){
		//dwgAx:function(w){
			w=w||1*me.convert
			v=w+0.1*me.convert
			var tpl=env.root.getTpl(env.root.getCurTheme())
			var color=tpl.axColor,size=tpl.axSize,pw=tpl.axWidth
			self.dwgPoint([[0,0]],color,5)
			self.dwgLine([[0,0],[w,0]],color,pw)
			self.dwgTxt([v,env.tools.disBtoC(w,0,env.scale,config.multi,config.pxperm)],'x',size,color)
			self.dwgLine([[0,0],[0,w]],color,pw)
			self.dwgTxt([0,v],'y',size,color)
		},
		
		
		
		dwgHelp:function(cfg,tg){
			var env=run[tg],pen=env.pen,tpl=theme[env.theme]
			var w=cfg.width,h=cfg.height,hw=w/2,hh=h/2,d=hh/2
			var psa=[[-hw,-h-d],[-w,-h-d],[-w,-hh-d]]
			var psb=[[-w,hh-d],[-w,h-d],[-hw,h-d]]
			var psc=[[hw,h-d],[w,h-d],[w,hh-d]]
			var psd=[[w,-hh-d],[w,-h-d],[hw,-h-d]]
			var ps=[psa,psb,psc,psd]
			for(var j=0;j<ps.length;j++){
				var nps=ps[j],len=nps.length
				pen.beginPath()
				for (var i=0;i<len;i++){
					var p=nps[i]
					if(i==0)pen.moveTo(p[0]+0.5,p[1]+0.5)
					if(i>0 && i<len)pen.lineTo(p[0]+0.5,p[1]+0.5)
				}
				pen.stroke()
			}
		},
		
		getImage:function(mid){
			//1.添加到队列获取资源的方法
			var res=root.core.getResource(mid,'img')
			if(!root.empty(res)) return res
			
			//2.如果获取失败，启动获取队列
			
			
		},
		
		thumb:function(w,h,target){
			yhfTwo.twoInit(true,w,h)
			var ax=config.axShow,gx=config.showGrid
			config.axShow=false
			config.showGrid=false
			
			env.root.cleanActive()
			self.drawing(target)
			
			config.axShow=ax
			config.showGrid=gx
			var image = new Image()
			image.src = env.pen.canvas.toDataURL("image/png")
			return image
		},
		
		zoom:function(tg,rids){
			var rst={offset:[0,0],scale:1}
			var padding=root.calc.padding,pAtoB=root.calc.pAtoB
			var ps=[]
			if(!root.isType(rids,'array')) return rst
			rids=root.empty(rids)?root.getMemory([me.memKeys.database,tg,me.core.struct.rooms.regKey]):rids
			if(root.empty(rids)) return rst
			for(var i=0;i<rids.length;i++){
				var b=root.core.getBasic(rids[i],tg)
				for(var j=0;j<b.ips.length;j++){
					ps.push(pAtoB(b.cps[j],b.rotation,b.pos))
				}
			}
			var pad=padding(ps)
			var env=run[tg],pp=env.pxperm,m=env.multi,w=env.width,h=env.height
			var aw=w/pp,ah=h/pp,dw=pad[1]-pad[3],dh=pad[0]-pad[2],sw=aw/dw,sh=ah/dh,sc=sw>sh?sh:sw,os=[0,0]
			os[0]=sw>sh?(aw/sc-dw)/2:0,os[1]=sw>sh?0:(ah/sc-dh)/2
			rst.scale=sc*m
			rst.offset=[os[0]-pad[3],os[1]-pad[2]]
			return rst
		},
		
		cvsAnimate:function(tg,cfg,ck){
			//console.log(JSON.stringify(cfg))
			/*var cfg={
				time:800,				//运行时间
				frame:40,				//运动帧数
				start:{scale:3,offset:[0,0]},			//缩放比例和中点位置
				end:{scale:3,offset:[2000,2000]},		//缩放比例和中点位置
			}*/
			
			var at=cfg.time/cfg.frame,n=cfg.time*cfg.frame/1000
			var end=cfg.end,start=cfg.start
			var ds=(end.scale-start.scale)/n
			var dx=(end.offset[0]-start.offset[0])/n,dy=(end.offset[1]-start.offset[1])/n
			
			self.setOffset(start.offset,tg)
			self.setScale(start.scale,tg)
			
			var count=0
			var tm=setInterval(function(){
				if(count>=n) {
					clearInterval(tm)
					ck&&ck()
				}
				count++
				self.cvsMove(dx,dy,tg)
				self.cvsZoom(ds,tg)
				self.drawing(tg,true)
			},at)
		},
		
		cvsMove:function(dx,dy,tg){
			run[tg].offset[0]+=dx
			run[tg].offset[1]+=dy
		},
		
		cvsZoom:function(ds,tg){
			run[tg].scale+=ds
		},
		
		calcMaxMin:function(tg){
			var env=run[tg]
			//fuu,下面的计算有问题
			if((!env.minScale) && (!env.maxScale)){
				var s=me.conWidth/config.defaultWidth
				env.maxScale=config.maxScale*s
				env.minScale=config.minScale
			}
		},
	}
	
	root.regComponent(reg)
})(window.T)

/********three*********/

;(function(root){
	var reg={
		name:'rdThree',
		type:'render',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	var me=root.getMe()
	var theme={
		box:{
			color:'#EEEEEE',
		}
	}
	var config={
		controller:'ctlThree',		//配置的控制器
		/*自定义的渲染器注册部分*/
		intro:'3D图形绘制渲染器,用canvas实现绘图',
		renderTarget:'fuu_t_3Drender',		//包裹渲染器的div名称
		statsTarget:'fuu_t_stats',		//stats的容器
		entry:false,						//是否为主显示
		auto:true,						//是否自动计算数据结构
		
		/*渲染器需要调用的自动方法,渲染器注册到core之后可以进行调用*/
		entryHooks:{
			initFun:'domInit',			//渲染器的初始化方式
			dwgFun:'drawing',			//渲染器的自动显示方法,被core调用
			activeFun:'active',			//激活组件绘制方法
			showFun:'showMe',			//显示绘图环境的方法
			hiddenFun:'hiddenMe',		//停止渲染器方法
			//startFun:'drawing',		//开始渲染器方法
			//stopFun:'stopShow',		//停止渲染器方法
		},
		
		moduleHooks:{
			struct:'threeStruct',			//自动调用组件进行3D构建函数
			dataKey:'three',				//挂载在threeRoom[rid]下的名称
			activeStruct:'threeActive',		//活动组件数据构建方法
			activeKey:'threeact',			//活动数据挂载的位置
		},
		//fix:[Math.PI/2,Math.PI,Math.PI],	//矫正视觉到正常人高度
		
		fix:[Math.PI/2,Math.PI,Math.PI],	//矫正视觉到正常人高度
		env:{
			three:{
				scene:null,			//场景对象
				renderer:null,		//渲染对象
				camScale:0,			//相机的显示比例
				pCamera:null,		//透视相机对象
				cCamera:null,		//45度相机
				skyCamera:null,		//全景相机
				raycaster:null,		//触控检测对象
				mouse:null,			//输入位置对象
				stats:null,			//帧数显示对象,正式版关闭
				request:null,		//动画的指针,用来停止动画
				projector:null,		//3D屏幕坐标选择器
				textureLoader:null,	//纹理加载器对象
				sky:null,			//天空的数据，标准显示结构，初始化时候计算1次即可
				ground:null,		//地面的数据，标准显示结构，初始化时候计算1次即可
			},
			defaultRender:'webGL',	//默认的3D渲染器
			defaultCamera:1,		//默认的相机类型[1.透视相机,2.轴测相机]
			request:null,			//动画定时器
		
			/*相机的基础设置*/
			fov:100,				//相机的基本配置,视角
			near:0.001,				//相机的基本配置,近观察面
			far:20,					//相机的基本配置,远观察面
			box:20,					//计算出的3D范围的盒子宽度
			offset:[0,0],			//中轴所在的位置 (需要计算获取,所有房间的中轴位置,旋转之类的在这里获取)
			position:[0,0,0],		//[x,y,z],人的位置,3D的显示就直接调这里的数据
			rotation:[0,0,Math.PI],		//[rx,ry,rz],人的旋转,默认值为校准视角
			rid:0,					//是否在当前的某个房间内,
			show:false,				//是否进行显示的标志,在递归调用中判断该标志位
			cube:false,				//是否使用cube相机
			ax:true,				//是否显示ax
			axWidth:2,				//轴的距离
			status:true,			//显示帧数的标志
			lock:false,				//动画锁,放到startshow和stopshow里,关闭屏幕操作
			check:true,				//是否开启3D物体检查
		},
		
		pre:{				//本地获取texture资源的文件前缀
			texture:'textture_',
			material:'mt_',
		},
		box:{
			color:0xEEEEEE,
		}
	}
	var run={}
	var self=reg[me.funKey]={
		
		//渲染器注册到框架的初始化
		init:function(){root.regMe(config,[reg.name],true)},
		
		/*	3D的绘制逻辑及资源管理
		 *	1.初始化时构建基本的场景(1.地面;2.天空;3.环境光)
		 * 	2.根据需求构建房间场景()
		 * 	3.统一管理3D的基础构成(1.模型;2.色彩材质;3.模型;4.加载缓冲)
		 * 	4.统一位置转换函数(1.A坐标内切换;2.A坐标到B坐标;3.视觉的修正-反看及转轴)
		 * 	5.统一第一人称位置转换
		 * */
		
		//3D的基础环境的初始化
		domInit:function(cfg){
			//console.log(cfg)
			if(run[cfg.target]!=undefined || !root.isType(cfg,'object')) return
			if(config.isEntry) root.core.setCurRender(reg.name,cfg.target)
			
			if(!config.auto && (reg.name!=root.core.getCurRender(cfg.target))) return
			
			var env=root.clone(config.env)
			run[cfg.target]=env			//保存本地运行环境
			
			//1.构建dom环境
			env.show=false
			var rd = new THREE.WebGLRenderer({ antialias: true })
			rd.setPixelRatio(window.devicePixelRatio)		//支持retain屏幕的配置
			rd.setSize(cfg.conWidth, cfg.conHeight)			//设置显示尺寸
			var cls=me.core.classHidden+' '+config.renderTarget
			
			//var cls=config.renderTarget
			var txt='<div class="'+cls+'"></div>'
			if(env.status)txt+='<div class="'+config.statsTarget+'"></div>'
			
			$(cfg.target).append(txt).find('.'+config.renderTarget).append(rd.domElement)
			
			var cvt=root.core.getConvert(cfg.target)
			env.near=env.near*cvt
			env.far=env.far*cvt
			env.box=env.box*cvt
			
			env.three.renderer = rd
			env.three.scene = new THREE.Scene()
			env.three.camScale = cfg.conWidth / cfg.conHeight
			env.three.pCamera = new THREE.PerspectiveCamera(env.fov, env.three.camScale, env.near, env.far)
			env.three.cCamera = new THREE.CubeCamera(env.near, env.fov, cfg.conWidth)
			env.three.textureLoader = new THREE.TextureLoader()
			if(env.check){
				env.three.raycaster = new THREE.Raycaster()		//检查3D点击的对象
				env.three.mouse = new THREE.Vector2()			//鼠标的触控点
			}
			//2.把运行环境放到DB下
			var chain=[me.memKeys.database,cfg.target,me.core.struct.runtime.regKey,reg.name]
			root.regMemory(env,chain,true)
		},
		
		/*渲染器的渲染控制*/
		//显示和隐藏dom
		showMe:function(tg){$(tg).find('.'+config.renderTarget).removeClass(me.core.classHidden)},
		hiddenMe:function(tg){$(tg).find('.'+config.renderTarget).addClass(me.core.classHidden)},
		
		//暂停和开始渲染器操作
		stop:function(tg){
			run[tg].show=false
			window.cancelAnimationFrame(run[tg].request)
			return true
		},
		start:function(tg){
			if(run[tg].show) return 
			run[tg].show=true
			self.animate(tg)
		},
		clear:function(tg){
			var env=run[tg],three=env.three
			window.cancelAnimationFrame(env.request)		//退出动画，防止重复渲染
			three.scene.children=[]		//清空scene的物体
		},
		
		//渲染的入口函数，调用即进行重构和显示
		drawing:function(tg){
			self.showMe(tg)
			self.clear(tg)
			
			//1.处理基础部分的显示
			self.setBasic(tg)				//显示3D基础环境,fuu,和basic冲突，需要减少
			self.showBasic(tg)

			//2.显示所有的房间
			var rids=root.core.getRids(tg)
			if(!root.empty(rids)) for(var len=rids.length,i=0;i<len;i++) self.showRoom(rids[i],tg)
			
			//3.启动THREE的渲染器，进行显示
			run[tg].show=true
			var th=run[tg].three
			
			//debug物体,在[0,0,0]的位置,animate中旋转该物体
			if(me.debug.enable){
				var tt = new THREE.TextureLoader().load( 'dulex/res/debug/crate.gif' )
				var gg = new THREE.BoxBufferGeometry( 200, 200, 200 )
				var mm = new THREE.MeshBasicMaterial( { map: tt } )
				var mesh = new THREE.Mesh( gg, mm )
				th.mm=mesh
				th.scene.add(mesh)
				//self.setLocation([4000,2000,800],[0,0,0],false,tg)
			}
			
			//var b=root.core.getBasic()
			self.setLocation([5000,2000,1000],[0,0.4,0],false,tg)
			
			//self.threeRooms(tg)
			self.animate(tg)
		},
		
		active:function(tg){
			//这里对active进行判断
			var act=root.core.getActive(tg)
			if(!act.cur.type) return
			var cur=act.cur
			
			/*var chain=[me.memKeys.database,tg,cur.rid,cur.type,config.moduleHooks.activeKey]
			var dd=root.getMemory(chain)
			self.dwgStruct(cur.type,dd[cur.id],tg,true)*/
		},
		
		showRoom:function(rid,tg){
			var r=root.core.getRoom(rid,tg),bkey=me.core.dataKeys.basicKey
			var tkey=config.moduleHooks.dataKey		//three的数据入口key
			for(var k in r){
				if(k!=bkey){
					var dt=r[k][tkey]
					//console.log(dt)
					if(dt!=undefined && !root.empty(dt.meshes))self.showStruct(dt.meshes,tg)
				}
			}
		},
		
		showStruct:function(arr,tg){
			//console.log(arr)
			var scene=run[tg].three.scene
			for(var i=0,len=arr.length;i<len;i++){
				var dt=arr[i],cfg={color:dt.color?dt.color:config.box.color,opacity:1}
				switch (dt.type){
					case 'box':
						scene.add(self.box(dt,cfg))
						break;
					case 'extrude':
						scene.add(self.extrude(dt,cfg))
						break;
					default:
						break;
				}
				
				
			}
		},
		
		setBasic:function(tg){
			self.setLights(self.sunlight(tg),tg)
			self.setMeshes(self.ground(tg),tg)
			self.setMeshes(self.sky(tg),tg)
			self.ax(tg)
			self.stats(tg)
		},
		
		showBasic:function(tg){
			//1.添加需要显示的物体到场景
			var data=root.getMemory([me.memKeys.database,tg,me.core.struct.three.regKey])
			var scene=run[tg].three.scene
			for(k in data){
				var arr=data[k]
				//console.log(arr)
				for(var i=0,len=arr.length;i<len;i++){
					scene.add(arr[i])
				}
			}
		},
		
		sunlight:function(tg){
			var env=run[tg],cvt=root.core.getConvert(tg)
			var arr=[]
			
			var pos=[1000,1000,1000],ro=[1,1,1]
			var sun=self.light('sun',{color:0xC8C8C8,intensity:1.2,radius:20*cvt,position:pos,rotation:ro})
			arr.push(sun)
			
			var pos=[-2000,-2000,1000],ro=[0,0,0]
			var sun=self.light('sun',{color:0xFF0000,intensity:1.2,radius:20*cvt,position:pos,rotation:ro})
			arr.push(sun)
			
			return arr
		},
		

		sky:function(tg){
			//放到runtime里，显示的时候更新一下
			return []
		},
		
		ground:function(tg){
			var mm=self.box({type:'box',data:[1000,1000,10],pos:[0,0,0],rotation:0},{color:0xFFFFFF,opacity:1})
			//console.log(mm)
			mm.position.x=100
			mm.position.y=200
			mm.position.z=-300
			/*var rst=[]
			for(var i=0;i<15;i++){
				rst.push(root.clone(mm))
			}
			return rst	*/
			return [mm]
		},
		
		
		//基础设置部分添加灯和mesh
		setLights:function(arr,tg){
			var len=arr.length,obj=root.getMemory([me.memKeys.database,tg,me.core.struct.three.regKey,'light'])
			for(var i=0;i<len;i++)obj.push(arr[i])
			return true
		},
		setMeshes:function(arr,tg){
			var len=arr.length,obj=root.getMemory([me.memKeys.database,tg,me.core.struct.three.regKey,'mesh'])
			for(var i=0;i<len;i++)obj.push(arr[i])
			return true
		},
		
		//获取人视觉的位置
		getLocation:function(tg){
			var env=run[tg]
			return {rotation:env.rotation,position:env.position}
		},
		//在现有数据上添加相应的旋转和移动,或者直接设置位置
		setLocation:function(pos,ro,add,tg){
			//var env=run[tg],th=env.three
			var  env=run[tg],th=env.three,fix=config.fix

			th.pCamera.rotation.set(ro[0]+fix[0],ro[1]+fix[1],ro[2]+fix[2])
			th.pCamera.position.set(pos[0],pos[1],pos[2])
			
			th.cCamera.rotation.set(ro[0]+fix[0],ro[1]+fix[1],ro[2]+fix[2])
			th.cCamera.position.set(pos[0],pos[1],pos[2])
		},
	
		//动画函数，可以进行房间的动态显示
		carton:function(tg){},
		
		//循环显示模块
		animate:function(tg){
			if(!run[tg].show) return console.log('[function]animat:render three is config to stop')
			//这里进行视觉同步和坐标轴转换
			var env=run[tg],th=env.three
		
			if(me.debug.enable){
				th.mm.rotation.x += 0.005
				th.mm.rotation.y += 0.01
			}
			
			//按照配置进行相机的处理
			if(config.env.defaultCamera==1){
				th.renderer.render(th.scene,th.pCamera)
			}else if(config.defaultCamera==2){
				th.renderer.render(th.scene,th.cCamera)
			}
			
			env.request=window.requestAnimationFrame(function(){
				self.animate(tg)
			})
			if(env.status) th.stats.update()
		},
		
		/*three.js的控制部分，控制3D场景的选中等功能*/
		check:function(p,tg){
			
		},
		/*结合three的基础函数部分，所有的box和light都通过统一的入口获取*/
		/*three.js统一资源控制部分*/
		box:function(b,cfg){
			//console.log(b)
			var bs=b.data,pos=b.pos
			var mm = new THREE.LineBasicMaterial({color:cfg.color,opacity:cfg.opacity})
			var gg = new THREE.BoxBufferGeometry(bs[0], bs[1], bs[2])
			var xx = new THREE.Mesh(gg, mm)
			xx.position.x=pos[0]
			xx.position.y=pos[1]
			xx.position.z=pos[2]		//fuu:z轴转换,但这里会有问题,需要和层高进行计算,下一版处理
			//xx.position.z=fix-pos[2]		//fuu:z轴转换,但这里会有问题,需要和层高进行计算,下一版处理
			
			xx.rotation.z=b.rotation
			
			return xx
		},
		extrude:function(b,cfg){
			var bs=b.data,pos=b.pos
			var shape = new THREE.Shape()
			for(var i=0,len=bs.length;i<len;i++){
				if(i==0)	shape.moveTo(bs[0][0],bs[0][1])
				shape.lineTo(bs[i][0],bs[i][1])
			}
			
			var setting = {steps: 1,amount: b.amount}
			
			var gg = new THREE.ExtrudeGeometry( shape, setting );
			var mm = new THREE.LineBasicMaterial({color:cfg.color,opacity:cfg.opacity})
			var xx = new THREE.Mesh(gg, mm)
			xx.position.x=pos[0]
			xx.position.y=pos[1]
			xx.position.z=pos[2]	
			xx.rotation.z=b.rotation
			
			return xx
		},
		
		light:function(type,cfg){
			if(!type) return
			var light=null
			switch (type){
				case 'sun':
					//console.log('这个是测试用的，看看是不是很舒服的打字')
					var pos=cfg.position
					var light = new THREE.DirectionalLight(cfg.color)
					light.position.set(pos[0],pos[1],pos[2])
					break;
					
				case 'point':
					var pos=cfg.position,ro=cfg.rotation
					light=new THREE.PointLight(cfg.color,cfg.intensity,cfg.radius)
					light.position.set(pos[0],pos[1],pos[2])
					//light.rotation.set(ro[0],ro[1],ro[2])
					break;
					
				case 'direct':
					var pos=cfg.position
					light = new THREE.DirectionalLight(cfg.color, cfg.intensity, 0);//设置平行光源
                	light.position.set(pos[0],pos[1],pos[2]);//设置光源向量
					break;
					
				case 'spot':
				
					break;
				default:
					break;
			}
			return light
		},
		
		
		
		getMaterial:function(type,cfg){
			
		},
		
		
		colorMaterial:function(color){
			/*if(!env.source.materials[color]){
				env.source.materials[color]=new THREE.MeshPhongMaterial({color:color,opacity:0.3,shininess:0,})
			}
			return env.source.materials[color]*/
		},
		
		getTexture: function (type, id) {
		    /*var tag = type + '_' + id
		    if (env.source.textures[type + '_' + id]) {
		        return env.source.textures[tag]
		    } else {
		        var img = 'img/dwg/three/' + tag + '.jpg'
		        env.three.textureLoader.load(img, function (t) {
		            env.source.textures[tag] = t
		            return env.source.textures[tag]
		        })
		    }*/
		},
		
		getMesh:function(mid){},		//根据模型id获取模型数据，ajax的
		
		normalMaterial:function(type,tid){
			/*var tag=type+'_'+tid
			if(!env.source.materials[tag]){
				var param={map:env.root[reg.name].getTexture(type,tid),opacity:0.3,shininess:0,}
				env.source.materials[tag]=new THREE.MeshPhongMaterial(param)
			}
			return env.source.materials[tag]*/
		},
		
		
		/*辅助插件部分*/
		stats:function(tg){
			var env=run[tg]
			var stats=env.stats||new Stats()
			
			//fuu,这里的定位代码进行重新计算
			var cmap={position:'absolute',top:'50px',left:'5px','z-index':999}
			$(tg+' .'+config.statsTarget).html(stats.domElement).css(cmap)
			
			env.three.stats=stats
		},
		
		ax:function(tg){
			if(run[tg].ax){
				var cvt=root.core.getConvert(tg)
				run[tg].three.scene.add(new THREE.AxisHelper(config.axWidth*cvt))
			}
		},
		
		/*场景控制部分*/
		sceneRotate:function(ro,cen){	//环绕模式下，相对于cen的旋转
			
		},		
		
		/*运动控制部分*/
		personRotate:function(ak,tg){		//向前直视，水平转动
			run[tg].three.pCamera.rotation.y+=ak
		},
		personHeader:function(ak,tg){		//站立不动，垂直转动
			//run[tg].rotation[1]+=ak
			run[tg].three.pCamera.rotation.y+=ak
		},
		personMove:function(dis,ak,tg){		//高度不变，向前移动
			run[tg].three.pCamera.position.y+=dis*Math.cos(ak)
		},		
		personRise:function(dis,tg){		//垂直高度变动
			run[tg].three.pCamera.position.z+=dis
		},
		
	}
	root.regComponent(reg)
})(window.T)


/***con_two**/
;(function(root){
	var reg={
		name:'ctlTwo',
		type:'control',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	
	var config={
		render:'rdTwo',				//适配的渲染器
		checkFun:'check',			//依赖的渲染器的调用方式

		wheelScale:0.1,			//fuu,需要根据设备进行调整的鼠标速度
		overBounce:1.3,				//最大放大的比例扩展
		bounce:10,					//缩放到上下限的反弹速度
		gestureInterval:200,		//手势间隔
		regPopMenu: 'showPop',		//组件显示底部操作菜单的函数名
		subFn:'sub',
		moduleHooks:{
			pop:'pop',			//控制器定义的模型输出函数
			attribute:'attribute',		//自动属性输出
		},
		entryHooks:{
			startFun:'start',
		},
		formPosition:{
			top:60,			//默认的对话框位置
		},
	}
	var run={}
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		
		start:function(tg){
			var rd=config.render
			var env=root.getMemory([me.memKeys.database,tg,me.core.struct.runtime.regKey,rd])
			run[tg]=env
			
			//1.设置dom的偏移,设置scrollY的值
			var sel=$(tg).find('.'+me[rd].renderTarget)
			env.selector=sel
			env.position={left:sel.offset().left,top:sel.offset().top}
			env.scrollY=0		
			
			//2.目标开始绑定控制器操作
			touch.off(sel)
			touch.on(sel,'touchstart',function(ev){self.touchstart(ev,tg)})		//传递target和ev的方式
			//touch.on(sel,'doubletap',function(ev){self.doubleTap(ev,tg)})
			touch.on(sel,'dblclick',function(ev){self.tap(ev,tg)})
			//touch.on(sel,'tap',function(ev){self.tap(ev,tg)})
			
			//3.按照不同的设备绑定其他操作
			var dv=me.core.device
			if(dv=='pc'){
				sel.off('mousewheel').on('mousewheel',function(ev,dt){self.mouseover(ev,dt,tg)})
				$(document).off('keypress').on('keypress',function(ev){
		        	self.keypress(ev.which,tg)
		        })
				self.attrDialog(tg)
			}else{
				
			}
		
			root.core.setCurTarget(tg)
		},
		
		attrDialog:function(tg){
			var act=root.core.getActive(tg)
			var rows=[],cfg={title:'显示表格',cvt:root.core.getConvert(tg),id:0}
			if(act.cur.type){
				cfg['id']=act.cur.id
				var room=root.core.getRoom(act.cur.rid,tg)
				if(root[act.cur.type][config.moduleHooks.attribute]){
					rows=root[act.cur.type][config.moduleHooks.attribute](room,act.cur.id,tg)
				}
			}else{
				var grid=[
					{icon:'',reg:'room',param:{type:1}},
					{icon:'',reg:'room',param:{type:2}},
					{icon:'',reg:'room',param:{type:3}},
					{icon:'',reg:'room',param:{type:4}},
					{icon:'',reg:'room',param:{type:5}},
					{icon:'',reg:'room',param:{type:6}},
					{icon:'',reg:'room',param:{type:7}},
					{icon:'',reg:'room',param:{type:8}},
					{icon:'',reg:'room',param:{type:9}}
				]
				
				var rpt=root.report(tg)
				var area=0,count=0
				for(var k in rpt){
					area+=rpt[k].ground
					count++
				}
				
				rows=[
					{type:'label',title:'使用面积',data:area},
					{type:'label',title:'房间数量',data:count},
					{type:'text',title:'图纸名称',data:'住友家园',action:{'blur':function(val){console.log('ready to do something:'+val)}}},
					{type:'grid',title:'插入房间',data:grid,action:{'click':addRoom}},
				]
				
				function addRoom(val,reg){
					console.log(val)
					//return root[reg].ctlAdd()
					return {}
				}
			}

			var fm=root.ui.form(rows,cfg,me.core.device)
			fm.agent.onAction=function(todo){
				//console.log(todo)
				root.core.todo(todo, true, act.cur.rid, tg)
				root.core.autoRender(tg,true)
				self.attrDialog(tg)
			}
			
			root.ui.attribute.show(fm.dom,{},tg)
			fm.auto()
		},
		
		/*基本控制操作区域,可以从mod获取数据*/
		keypress:function(code,tg){
			console.log(code)
	  		switch (code){
	  			case 98:	//b
	  				//显示和隐藏属性框
	  				root.ui.attribute.closed(tg)?root.ui.attribute.unhidden(tg):root.ui.attribute.hidden(tg)
	  				break;
	  			case 99:		// C
	  				var rd=root.core.getCurRender(tg)
	  				if(rd=='rdTwo') root.core.setCurRender('rdThree',tg)
	  				else root.core.setCurRender('rdTwo',tg)
					root.core.autoRender(tg,true)
					root.core.autoControl(tg)
					break;
				case 114:		// R
					break;
	    	}
	  	},
	  	
	  	doubleTap:function(ev,tg){
	  		console.log('double tap...')
	  	},
	  	
		tap:function(ev,tg){
			var act=root.core.getActive(tg),cvt=root.core.getConvert(tg)
			var pos=run[tg].touchPoint,list=[]
			
			//1.获取组件的操作菜单
			if(act.cur.type){
				var type=act.cur.type
				var room=root.core.getRoom(act.cur.rid,tg)
				var id=act.cur.type==me.core.motherReg?act.cur.rid:act.cur.id
				//list=root[type][config.moduleHooks.pop]?root[type][config.moduleHooks.pop](act.cur):[]
				list=root[type][config.moduleHooks.pop]?root[type][config.moduleHooks.pop](room,id,tg):[]
			}else{
				list=[
					{title:'全屏',close:true,type:'button',data:[],sub:false,action:function(){self.zoom(tg)}},
					{title:'保存',close:true,type:'button',data:[],sub:false,action:function(){self.save(tg)}},
					{title:'新建房间',close:true,type:'button',data:[],sub:false,action:function(){self.newroom(tg)}},
				]
			}
			
			var csel=$(tg),cpos=[csel.offset().left,csel.offset().top]
			//fuu,这里还要加入滚动的距离,进行消除
			var pcfg={list:list,pos:pos,cpos:cpos,render:config.render}
			root.dom.pop.show(pcfg,tg,{main:ack,sub:bck})
			
			function bck(todo){
				//console.log(todo)
				root.core.todo(root.isType(todo,'array')?todo:[todo],true,act.cur.rid,tg)
				root.dom.hidden(tg)
				root.core.autoRender(tg,true)
			}
			
			function ack(ids){
				if(!ids)  return
				var len = ids.length
				if(len == 1) {
					var fm = list[root.getID(ids[0])]
				} else if(len == 2) {
					var fm = list[root.getID(ids[0])].data[root.getID(ids[1])]
					list = list[root.getID(ids[0])].data
				}
				
				var psel = $(tg).find('#' + ids[len - 1])
				var os = psel.offset(),left = os.left,top = os.top
				
				//var nos=$(tg).offset()
				
				var fcfg = {
					btnSave: true,
					titleSave: '保存',
					mask: true,
					align:'center',
					position: [left, top],
					list: [
						{ label: fm.title, name: fm.name, data: fm.data, type: fm.type, close: false, config: {} },
					],
				}
				
				root.dom.form.show(fcfg, tg, function(data) {
					var todo = []
					for(var k in data) {
						for(var i = 0, len = list.length; i < len; i++) {
							var row = list[i]
							if(row.name == k && data[k] != row.data) {
								todo.push(row.action(data[k], act.cur.id, cvt))
							}
						}
					}
					root.core.todo(todo, true, act.cur.rid, tg)
					root.dom.hidden(tg)
					root.core.autoRender(tg,true)
				})
			}
		},
		
		newroom:function(tg){
			root.core.clearActive(tg)
			root.core.autoStruct({room:root.room.add()},root.hash(),tg,true)
			root.core.autoRender(tg,true)
		},
		
		save:function(tg){
			console.log('ready to save data of '+tg)
		},
		
		zoom:function(tg){
			root[config.render].zoom(tg,[])
			root.core.autoRender(tg)
			root.dom.hidden(tg)		//需要完整设计dom的结构,可以一起隐藏
		},
		
		opt:function(){
			console.log('ok,pop click')
		},
		mouseover:function(ev,dt,tg){
			var toB=root.calc.disCtoB,CtoB=root.calc.pCtoB,BtoC=root.calc.pBtoC
			var p=[ev.offsetX, ev.offsetY]		//鼠标位置点
			var env=run[tg],rd=root[config.render]
			
			//console.log(env)
			//fuu,这里处理缩放到最大和最小的动画
			var sc=config.wheelScale*ev.deltaY+env.scale
			if(sc>=env.minScale && sc<=env.maxScale){
				var pb=CtoB(p,env.scale,env.offset,env.multi,env.pxperm)
				rd.setScale(sc,tg)

				var pc=CtoB(p,env.scale,env.offset,env.multi,env.pxperm)
				var dx=pc[0]-pb[0],dy=pc[1]-pb[1]
				var os=[env.offset[0]+dx,env.offset[1]+dy]
				rd.setOffset(os,tg)
				
				root.core.autoRender(tg,true)
			}
		},
		touchstart:function(ev,tg){
			ev.preventDefault()
			var tp=self.getTouchPoint(ev,tg)
			run[tg].touchPoint=tp
			
			var rs=root[config.render][config.checkFun](tp,tg)
			if(rs.plugin){
				var pns=root.core.getData(rs.type,rs.rid,tg),cvt=root.core.getConvert(tg)
				var dt=pns[me.core.dataKeys.structKey][rs.id]
				
				var row={label: dt.title, name: dt.name, data: dt.size, type: 'number', close: false, action:dt.action }
				//var row={label: dt.title, name: 'bbb', data: dt.size, type: 'number', close: false, action:dt.action }
				var form = {title:'编辑组件',align:'center',position:[100,100],btnSave: true,titleSave: '保存',mask: true,position: tp,list:[row]}
				
				var rd=root[config.render]
				var start={scale:3,offset:[0,0]},end={scale:3,offset:[1000,1000]}
				
				rd.cvsAnimate(tg,{time:500,frame:40,	start:start,end:end},function(){
					root.dom.form.show(form, tg, update)
				})
				
				//把更新及动画独立出来写,方便复用
				function update(data){
					var todo = []
					for(var k in data) {
						if(row.name == k && data[k] != row.data){
							todo.push(row.action(data[k],rs.id, cvt))
						}
					}
					//console.log(todo)
					root.core.todo(todo, true, rs.rid, tg)
					root.dom.hidden(tg)
					root.core.autoRender(tg,true)
					
					rd.cvsAnimate(tg,{time:400,frame:40,	start:end,end:start})
				}
				
			}
			
			root.core.setActive(rs,tg)
			self.attrDialog(tg)		//刷新属性对话框
			//注意,这里对plugin进行统一的清理数据,之前做完点击检测
			var pact = root.core.getActive(tg)
			
			//fuu,这里写统一的插件数据清理入口
			if(pact.cur.type) root.size.clear(pact.cur.rid,tg)
	        
	        var env=run[tg]
	        if(me.core.mode!='view'){
				var sel=env.selector
				touch.off(sel,"touchmove").on(sel, "touchmove", function(ev){self.touchmove(ev,tg)})
		        touch.off(sel,"touchend").on(sel, "touchend", function(ev){self.touchend(ev,tg)})
			}
	        root.dom.hidden(tg)
			root.core.autoRender(tg,true)
		},
		touchmove:function(ev,tg){
			var env=run[tg],rd=root[config.render]
			var s=env.scale,m=env.multi,px=env.pxperm,tp=env.touchPoint,cp=self.getTouchPoint(ev,tg)
			var toB=root.calc.disCtoB
			var delta=[toB(cp[0] - tp[0], 0, s, m, px),toB(cp[1] - tp[1], 0, s, m, px)]
			env.touchPoint=cp
			
			//rd.hiddenImage(tg)		//关闭图像显示，提升性能
			
			var act=root.core.getActive(tg)
	        var cur=act.cur,pre=act.pre
	        
	        //fuu,这里对room的关联情况进行处理
	        self.roomRelate(tg)
	        
	        //fuu，这里处理plugin的关系
	        /*if(cur.plugin){
	        	console.log(JSON.stringify(cur))
	        	return
	        }*/
	        
	        if (!cur.type && !pre.type) {
	        	rd.cvsMove(delta[0],delta[1],tg)
				return root.core.autoRender(tg,true)
	        }
	        
	        //这里实现之前选中的被移动，PC版本可以去掉
			if(!cur.type || cur.plugin){
				cur = root.clone(pre)
				root.core.setActive(pre,tg)
			}
			
			
			if(cur.type){
				var id=cur.id,rid=cur.rid,mod=cur.type
				var dKey=me.memKeys.database,pKey=me.core.dataKeys.structKey
				var dd=root.getMemory([dKey,tg,rid,mod,pKey,id]),cvt=root.core.getConvert(tg)
				var dt=root[mod].touchmove(delta,root.core.getBasic(rid,tg),dd,cvt,tg)
				
				if(!root.empty(dt.message)){
					console.log(dt.message)
					console.log('ready to set more to do')
				}
				if(!root.empty(dt.task)) root.core.todo(dt.task,true,rid,tg)
			}
			
			root.core.autoRender(tg,true)
		},
		touchend:function(ev,tg){
			root[config.render].showImage(tg)
			
			var sel=run[tg].selector
			touch.off(sel,"touchmove")
		    touch.off(sel,"touchend")
		    root.core.autoRender(tg,true)
		    	self.attrDialog(tg)
		},
		gesturestart:function(ev,tg){},
		gesturemove:function(ev,tg){},
		gestureend:function(ev,tg){},
		
		getTouchPoint:function(ev,tg){
	    	ev = window.event && window.event.touches ? event.touches[0] : ev
	    	var env=run[tg],pos=env.position
	    	return [ev.clientX-pos.left,ev.clientY-pos.top]
	    },
	    
	    roomRelate:function(tg){
	    	//1.遍历房间,计算当前房间和其他房间的关系
	    	
	    	//2.将生成的关系保存到数据结构中去
	    	
	    },
	    
	    getDirectionByAngle: function (angle) {
            var _fortyFive = Math.PI / 4,
                _angle = self.anClean(angle);
            if (_angle > _fortyFive && _angle < 3 * _fortyFive) {
                return ["上", "下"];
            } else if (_angle >= 3 * _fortyFive && _angle <= 5 * _fortyFive) {
                return ["右", "左"];
            } else if (_angle > 5 * _fortyFive && _angle < 7 * _fortyFive) {
                return ["下", "上"];
            } else {
                return ["左", "右"];
            }
        },
	}
	
	root.regComponent(reg)
})(window.T)

/***con_three**/

;(function(root){
	var reg={
		name:'ctlThree',
		type:'control',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	}
	
	var me=root.getMe()
	
	var config={
		render:'rdThree',		//对应的3D渲染器的名称
		entryHooks:{
			startFun:'start',
		},
		dis:{
			move:0.1,			//每次前移的米数
			rise:0.1,			//每次上升的米数
			angle:Math.PI/30,	//每次旋转的度数
		},
	}
	
	var self=reg[me.funKey]={
		init:function(){
			root.regMe(config,[reg.name],true)
		},
		
		start:function(tg){
			//console.log(tg)
			//fuu,这里开始绑定对应的操作
			//1.屏幕平移的操作
			//2.抬头的操作
			//3.低头的操作
			//4.双指缩放的操作
			
			//fuu,增加控制盘操作，和游戏一致
			
			$(document).off('keypress').on('keypress',function(ev){
		        self.keypress(ev.which,tg)
		    })
		},
		
		keypress:function(code,tg){
			console.log('Key pressing code:'+code)
			var rd=root[config.render]
			//console.log(config.render)
			var zj=Math.PI/2,cvt=root.core.getConvert(tg)
			var dis=config.dis.move*cvt,rise=config.dis.rise*cvt
			var ak=config.dis.angle
			
	  		switch (code){
	  			case 98:	//b
	  				//显示和隐藏属性框
	  				root.ui.attribute.closed(tg)?root.ui.attribute.unhidden(tg):root.ui.attribute.hidden(tg)
	  				break;
	  			case 99:		// C
	  				var rd=root.core.getCurRender(tg)
	  				
	  				if(rd=='rdThree') root.core.setCurRender('rdTwo',tg)
	  				else root.core.setCurRender('rdThree',tg)
	  				
	  				root.rdThree.stop(tg)
					root.core.autoRender(tg,true)
					root.core.autoControl(tg)
					break;
				case 97:	//a,左移动
					rd.personMove(dis,-zj,tg)
					
					break;
				case 115:	//s,后移动
					rd.personMove(dis,-zj-zj,tg)
					
					break;
				case 100:	//d,右移动
					rd.personMove(dis,zj,tg)
					
					break;
				case 119:	//w,前移动
					rd.personMove(dis,0,tg)
					break;
				case 120:	//x,向上升
					rd.personRise(rise,tg)
					break;
				case 122:	//z,向下蹲
					rd.personRise(-rise,tg)
					break;
				case 114:	//R,恢复渲染
					rd.start(tg)
					break;
				case 116:	//T,停止渲染
					rd.stop(tg)
					break;
				case 112:	//p,暂停刷新
					break;
				case 111:	//o,开始刷新
					break;
				case 102:	//F,向上抬头
					rd.personHeader(ak,tg)
					break;
				case 103:	//G,向下低头
					rd.personHeader(-ak,tg)
					//console.log('turn left')
					break;
				case 44:	//<,向左旋转
					console.log(ak)
					rd.personRotate(ak,tg)
					//console.log('turn left')
					break;
				case 46:	//>,向右旋转
					//console.log(ak)
					rd.personRotate(-ak,tg)
					//console.log('turn right')
					break;
	    	}
	  	},
	}
	
	root.regComponent(reg)
})(window.T)