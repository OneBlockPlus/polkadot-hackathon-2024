;(function(root){
	var reg={
		name:'rdTwo',
		type:'render',
		hooks:[],		//注册到fn下的方法,这样其他的组件就可以直接调用
		loops:[],		//注册循环启动函数，framework开始启动
		autoRun:'init',
		version:1,
		auth:['fuu'],
	};
	var theme = {
		fashion: {
			ground: '#F8F8F8',
			grid_dark: '#555555',
			grid_mid: '#999999',
			grid_light: '#DDDDDD',
			active: "#009900",
			width: 1,
			color: '#FF6699',
			mask: 'rgba(230,70,70,0.7)',
			font: 'SimHei',
			shadow: 'rgba(0,0,0,0.75)',
			axColor: '#000000',
			axWidth: 2,
			axSize: 24,
		},
	}
	
	var hash=root.hash;		//随机key,需要多次使用
	var config={
		intro:'2D小地图',								//渲染器说明
		controller:'ctlTwo',							//配置的控制器
		canvasID:'',										//2D的绘图canvas的id
		multi:window.devicePixelRatio,		//屏幕的缩放比例retian值
		pxperm:0.21,					//基础参数，像素/米,用于2D显示比例
		scale:10,							//基础参数，缩放比例
		offset:[0,0],						//基础参数，B坐标系中，canvas的定位点位于B坐标的位置
		enable:true,						//渲染使能键
		isChange:false,					//内容是否发生变化，需要重新进行渲染
		scaleLimit:{
			min:3,					//最小显示笔记里
			status:5,				//最小显示地块土地性质的比例
			detail:20,				//发到到显示地块附属物细节的比例
			max:80,				//最大的放大比例
		},
		selected:[0,0],				//当前选中的block
		defaultWidth:375,			//缩放比例的配置参数
		domCheckScale:1,			//显示检查dom的比例
		width:0,							//实例的宽度
		height:0,							//实例的高度
		axShow:true,					//是否显示坐标轴
		replace:false,					//dom的覆盖方式
		position:{left:0,top:0},		//dom的位置
		size:[0,0],							//B坐标系下屏幕的尺寸
		ax:{
			show:true,		//土地坐标轴显示
			x:30,					//坐标轴长度(px)
			y:30,					//坐标轴长度(px)
		},
		grid:{
			show:	true,		//土地网格显示
			sparse:	16,		//稀松格栅
			close:	1,			//紧密的格栅
			count:	10,	
			detail:	0.1,		//紧密格栅			
		},
		//阴影的配置
		shadow:{
			offSetX:10,								//fuu,写到头部配置里
			offsetY:10,								//fuu,写到头部配置里
			color:"rgba(256,0,0,0.75)", 		//fuu,写到头部配置里
			blur: 20,
		},
		cssMap:{},
		block:{
			trigger:true,
			stop:true,
			light:true,
			adjunct:true,
		},
		tpl:'fashion',		//默认模板
		world:{
			start:[1989,520],				//地图的起点
			num:0,								//世界编号
			sideLength:16,					//土地的边长(m)
			xMax:4096,						//土地X轴的最大编号
			yMax:4096,						//土地Y轴的最大编号
		},
		hot:{
			start:[0,0],
			data:[],
			gradual:[],
		},
		blocks:null,					//block数据挂载点
		detail:null,					//detail的绘制配置
		detailEnable:false,		//是否进行detail的绘制
		range:{x:0,y:0,ex:0,ey:0},		//当前绘图空间的范围
	}
	
	var me=root.getConfig(); 
	var run={},pens={};
	
	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},
		
		//2D绘制的主入口
		map:function(target,cfg,ck){
			self.setSize(cfg.size);
			self.setMap(cfg.cmap);
			cfg.replace?self.setReplace():self.setAppend();
			self.autoShow(target);
			
			var con=root.ctlTwo
			con.setRender('rdTwo');
			con.autoControl(target);
			ck && ck();
		},
		/*********处理block的数据部分**********/
		saveBlocks:function(bks,keys,tg){
			for(var k in bks){
				var row=bks[k],grid={};
				for(var i in keys){
					var ky=keys[i];
					if(ky=='extra' || ky=='trigger' || ky=='light' || ky=='stop' || ky=='coin'){
						grid[keys[i]]=JSON.parse(row[i]);
					}else if(ky=='adjunct'){
						var arr=JSON.parse(row[i]);
						for(var kk in arr)	grid[kk]=arr[kk];
					}else{
						grid[keys[i]]=row[i];
					}
				}
				var x=row[0],y=row[1];
				if(run[tg].blocks==null)run[tg].blocks={};
				if(!run[tg].blocks[x])run[tg].blocks[x]={};
				run[tg].blocks[x][y]=grid;
			}
			return true;
		},
		saveDetailConfig:function(cfg,tg){
			run[tg].detail=root.clone(cfg);
		},
		checkBlocks:function(x,y,ex,ey,tg){
			var bks=run[tg].blocks;
			if(bks==null) return false;
			if(bks[x] && bks[x][y] && bks[x+ex] && bks[x+ex][y+ey]) return true;
			return false;
		},
		
		setHot:function(start,dt,gradual,target){
			var env=run[target];
			if(!env) return false;
			env.hot.start=start;
			env.hot.data=dt;
			env.hot.gradual=gradual;
			
			return true;
		},
		//预设置部分,在2D地图实例化之前对数据进行设置
		setReplace:function(){config.replace=true},
		setAppend:function(){config.replace=false},
		setSize:function(size){config.width=size.width;config.height=size.height;},
		setMap:function(cmap){config.cssMap=cmap},
		setPosition:function(offset,tg){config.position=root.clone(offset)},
		setScale:function(s,tg){
			if(root.isType(s,'number')){
				if(tg){
					run[tg].scale=s;
				}else{
					config.scale=s;
				}
			}
		},
		setOffset:function(o,tg){
			if(root.isType(o,'array') && o.length==2){
				run[tg].offset=root.clone(o);
			}
		},
		setStart:function(start,tg){
			if(tg!=undefined){
				run[tg].world.start=root.clone(start);
			}else{
				config.world.start=root.clone(start);
			}
		},
		setEnable:function(tg){run[tg].enable=true},
		setDisable:function(tg){run[tg].enable=false},
		setRange:function(range,tg){run[tg].range=range},
		
		getPen:function(tg){return pens[tg];},
		setPen:function(p,tg){pens[tg]=p},
		getRun:function(tg){return run[tg]},
		setTheme:function(name,tg){run[tg].theme=theme[name]},
		
		enableDetail:function(tg){run[tg].detailEnable=true},
		disableDetail:function(tg){run[tg].detailEnable=false},
		getStatus:function(tg){
			var env=run[tg];
			return {position:root.clone(env.position),scale:env.scale};
		},
		//3D的基础环境的初始化
		domInit:function(target){
			var id=root.hash(),env=run[target],w=env.width,h=env.height,m=env.multi
			var dom='<div id="'+id+'"><canvas  width="'+w*m+'" height="'+h*m+'" style="width:'+w+'px;height:'+h+'px" id="'+env.canvasID+'"></canvas></div>';
			var cmap={'width':w+'px','height':h+'px',},vmap={'margin':'0 auto','padding':'0px 0px 0px 0px'}
			var sel=$(target)
			env.replace?sel.html(dom):sel.append(dom);
			sel.find('#'+id).css(cmap).css(env.cssMap).find('canvas').css(vmap);

			var cvs=document.getElementById(env.canvasID);		//1.创建好canvas并返回画笔
			pen=cvs.getContext("2d");
			self.setPen(pen,target);
		},
	
		
		/**Grid显示3D显示入口方法部分**/
		autoShow:function(target,skip){
			var skip=skip?true:false;
			if(!run[target]){				//1.初始化运行环境
				run[target]=root.clone(config);					//复制备份
				run[target].canvasID=hash();						//设置构建dom用的canvas的id
				self.setTheme(run[target].tpl,target);			//设置主题
			}
			
			if(!pens[target] || $(target).find('#'+run[target].canvasID).length==0) self.domInit(target);		//2.检查dom环境		
			if(!skip) self.dwgInit(target);			//计算绘图参数
			self.render(target,true);
		},
		

		
		/*重新绘图的入口，从autoshow中剥离出来*/
		render:function(target,force){
			//console.log('--------------------start-------------------------')
			var env=run[target];
			if(!env.enable) return false;			//渲染关闭的时候，停止显示
			//console.log('render_01-正在渲染'+target+',画布Scale是:'+env.scale)
			if(force){
				var two=root.two;						//3.设置绘图环境
				two.setRun(env);							//设置运行环境
				two.setPen(pens[target]);				//设置正在运行的画笔
			}
			//console.log('render_02-正在渲染'+target+',画布偏移是:'+env.scale)
			self.calcSize(target);
			self.cvsClear(target);						//1.初始化canvas
			if(env.ax.show) self.ax();				//2.绘制坐标轴
			//console.log('render_03-正在渲染'+target+',画布偏移是:'+env.scale)
			
			self.dwgHot(target);							//5.绘制网格
			self.dwgActive(target);  					//6.绘制选中的格子
			self.dwgGrid(target);						//5.绘制网格
			self.dwgDetail(target);                  	 //6.绘制block内的细节
		},
		
		calcSize:function(target){
			var wd=config.world,side=wd.sideLength,env=run[target];
			var calc=root.calc,disCtoB=calc.disCtoB;
			var bx=disCtoB(env.width,0,env.scale,env.multi,env.pxperm),by=disCtoB(env.height,0,env.scale,env.multi,env.pxperm);
			env.size=[bx,by];
			return true;
		},
		
		dwgHot:function(target){
			var env=run[target];
			if(!env || !env.hot || root.empty(env.hot.data) || root.empty(env.hot.gradual)) return false;
			var dwg=self.dwgBlock;
			var sx=env.hot.start[0],sy=env.hot.start[1],gradual=env.hot.gradual,dt=env.hot.data;
			var dcfg={width:1,color:'#EEEEEE',anticlock:true};
			for(var i in dt){
				for(var j in dt[i]){
					dcfg.color=gradual[dt[i][j]];
					dwg(sx+parseInt(i),sy+parseInt(j),dcfg,target);
				}
			}
		},
		//detail绘制原理，后端提供需要绘制的组件的颜色
		//遍历数据的时候看存不存在指定的值，有的话就绘制
		dwgDetail:function(target){
			if(!run[target].detailEnable) return false;			//总开关
			var env=run[target],rg=env.range,x=rg.x,y=rg.y,ex=rg.ex,ey=rg.ey
			if(env.blocks==null || env.detail==null) return false;
			var bks=env.blocks,detail=env.detail
			var empty=root.empty,dwg=self.dwgBox;
			for(var i=0;i<=ex;i++){
				for(var j=0;j<=ey;j++){
					var nx=x+i,ny=y+j;
					if(!bks[nx] || !bks[nx][ny]) continue;
					var bk=bks[nx][ny];
					
					for(var k in detail){
						if(bk[k]!=undefined && !empty(bk[k])){
							for(var si=0,len=bk[k].length;si<len;si++){
								var row=bk[k][si];
								dwg(nx,ny,row[0],row[1],row[2],{color:detail[k]},target);			//绘制指定的box
							}
						}
					}
				}
			}
			return true;
		},
		
		dwgBox:function(x,y,size,pos,ro,cfg,target){
			//console.log('box['+x+','+y+']:'+JSON.stringify(size)+',position:'+JSON.stringify(pos)+',rotation:'+JSON.stringify(ro)+',config:'+JSON.stringify(cfg))		
			var wd=config.world,s=wd.sideLength;
			var start =[(x-1)*s+pos[0]-size[0]*0.5,(y-1)*s+pos[1]-size[1]*0.5]
			var end  =[(x-1)*s+pos[0]+size[0]*0.5,(y-1)*s+pos[1]+size[1]*0.5];
			self.dwgRectangle(start,end,cfg.color,target);
		},
		getPointsArray:function(pa,pb){
			return [pa,[pb[0],pa[1]],pb,[pa[0],pb[1]]];
		},
		
		dwgActive:function(target){
			var env=run[target];
			var bk=env.selected,x=bk[0],y=bk[1];
			if(x!=0 && y!=0&& self.checkXY(x,y)){	//前面的判断是防止出现未设置hash带来的报错问题
				self.dwgBlock(x,y,{width:1,color:'#00CCBB',anticlock:true},target);
			}else{
				var start=env.world.start;
				self.dwgBlock(start[0],start[1],{width:1,color:'#00CCBB',anticlock:true},target);
			}
		},
		
		checkXY:function(x,y){
			var wcfg=me.rdTwo.world;
			if(x>wcfg.xMax || x<1 || y>wcfg.yMax || y<1) return root.error('wrong axis value');
			return true;
		},
		/*计算绘图基本参数的方法
		 *
		 * 
		 * */
		dwgInit:function(target){
			var wd=config.world,x=wd.start[0],y=wd.start[1];
			var side=wd.sideLength,env=run[target];
			var calc=root.calc,disCtoB=calc.disCtoB;
			var bx=disCtoB(env.width,0,env.scale,env.multi,env.pxperm),by=disCtoB(env.height,0,env.scale,env.multi,env.pxperm);
			var ax=(x-0.5)*side,ay=(y-0.5)*side;
			env.offset=self.calcOffset(ax,ay,bx,by);
			env.size=[bx,by];
			//console.log('canvas的位移:'+JSON.stringify(env.offset)+',小地图的B坐标系尺寸:'+JSON.stringify(env.size))
			return true;
		},
		
		calcOffset:function(ax,ay,bx,by){
        	return [ax-0.5*bx,ay-0.5*by];
		},
		
		/*canvas的初始化工作,绘制成底色
		 * */
		cvsClear:function(target){
			var env=run[target],pen=self.getPen(target);
			var m=env.multi
			pen.fillStyle=env.theme.ground;
			pen.fillRect(0,0,env.width*m,env.height*m);
		},
		
		/*区域填充block的方法*/
		fillBlock:function(start,cx,cy,target){
			var rst=[]
			var b=player.block,x=b[0],y=b[1];
			/*self.dwgBlock(x,y,{width:1,color:'#FFCC00',anticlock:true},target)
			
			self.dwgBlock(x+1,y+1,{width:1,color:'#00CC00',anticlock:true},target)
			self.dwgBlock(x+1,y,{width:1,color:'#00CC00',anticlock:true},target)
			
			self.dwgBlock(x-1,y+1,{width:1,color:'#00CCBB',anticlock:true},target)
			self.dwgBlock(x-1,y,{width:1,color:'#00CCBB',anticlock:true},target)*/
		},
		
		fillBlocks:function(start,end,cfg,target){
			//console.log('strart block:'+JSON.stringify(start)+',end block:'+JSON.stringify(end))
			cfg.anticlock=true;		//自动进行逆时针翻转
			//console.log(cfg)
			var cx=end[0]-start[0],cy=end[1]-start[1];
			var fill=self.dwgBlock;
			for(var i=start[0];cx>0?i<=end[0]:i>=end[0];cx>0?i++:i--){
				for(var j=start[1];cy>0?j<=end[1]:j>=end[1];cy>0?j++:j--){
					fill(i,j,cfg,target);
				}
			}
		},
		
		//绘制矩形边框
		dwgRectangle:function(pa,pb,color,target){
			var dwg=root.two.dwgLine;
			var cfg={width:1,color:color,anticlock:true};
			dwg([pa,[pa[0],pb[1]]],cfg);
			dwg([[pa[0],pb[1]],pb],cfg);
			dwg([pb,[pb[0],pa[1]]],cfg);
			dwg([[pb[0],pa[1]],pa],cfg);
		},
		
		dwgBlock:function(x,y,cfg,target){
			var wd=config.world,s=wd.sideLength,env=run[target];
			var ps=[[(x-1)*s,(y-1)*s],[(x-1)*s,y*s],[x*s,y*s],[x*s,(y-1)*s]];
			root.two.fillPolygon(ps,cfg)
		},
		
		dwgGrid:function(target){
			//console.log('drawing...')
			var env=run[target],tpl=env.theme,size=env.size,m=env.multi;
			//var env=root.two.getRun(),tpl=env.theme,size=env.size,m=env.multi;
			var wd=config.world,s=wd.sideLength,mx=wd.xMax*s,my=wd.yMax*s
			var x=env.offset[0],y=env.offset[1],xw=size[0],yw=size[1];
			
			var xs=x<0?0:(x-x%s);
			var ys=y<0?0:(y-y%s);					//开始坐标位置
			var xe=x+xw>mx?mx:x+xw;
			var ye=y+yw>my?my:y+yw;			//结束坐标位置
			var xn=(x+xw)>mx?Math.ceil((mx-xs)/s+1):Math.ceil((x+xw-xs)/s);		//竖线条数
			var yn=(y+yw)>my?Math.ceil((my-ys)/s+1):Math.ceil((y+yw-ys)/s);		//横线条数
			
			var dwg=root.two.dwgLine;
			var cfg={width:1,color:tpl.grid_light,anticlock:true}
			
			var ystep=ys
			for(var i=0;i<yn;i++){		//绘制横线
				var pa=[xs,ystep],pb=[xe,ystep];
				dwg([pa,pb],cfg);
				ystep+=s;
			}
			
			var xstep=xs
			for(var i=0;i<xn;i++){		//绘制竖线
				var pa=[xstep,ys],pb=[xstep,ye];
				dwg([pa,pb],cfg);
				xstep+=s;
			}
		},
		
		/*坐标轴绘制方法，C坐标进行绘制
		 *
		 * 
		 * */
		ax:function(dx,dy){
			
		},
		
		/*画布的移动,需要重新计算边界
		 *
		 * 
		 * */
		cvsMove:function(dx,dy,tg){
			run[tg].offset[0]-=dx;
			run[tg].offset[1]+=dy;
		},
		
		/*画布的缩放，需要重新计算边界条件
		 *
		 * 
		 * */
		cvsZoom:function(ds,tg){
			run[tg].scale+=ds;
		},
		
		setChange:function(target){
			run[target].isChange=true;
		},
		clearChange:function(target){
			run[target].isChange=false;
		},
		/*自动更新的情况,3D渲染的时候调用这个方法来实现player数据同步显示
		 *
		 * 
		 * */
		update:function(target){
			if(run[target].isChange){
				self.render(target);
				self.clearChange(target);
			}
		},
	}
	
	root.regComponent(reg);
})(window.T)
