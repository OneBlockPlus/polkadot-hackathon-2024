;(function(root){
	var reg={
		name:'rdAutobuild',
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
		controller:'ctlAutobuild',							//配置的控制器
		canvasID:'',										//2D的绘图canvas的id
		multi:window.devicePixelRatio,		//屏幕的缩放比例retian值
		pxperm:0.21,					//基础参数，像素/米,用于2D显示比例
		scale:160,							//基础参数，缩放比例
		offset:[0,0],						//基础参数，B坐标系中，canvas的定位点位于B坐标的位置
		enable:true,						//渲染使能键
		isChange:false,					//内容是否发生变化，需要重新进行渲染
		scaleLimit:{
			min:120,					//最小显示笔记里
			max:300,				//最大的放大比例
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
			show:true,		//土地网格显示
			sparse:	16,		//稀松格栅
			close:	1,			//紧密的格栅
			count:10,	
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
			start:[6,6],					//当前的绘制点
			num:0,						//世界编号
			sideLength:16,			//土地的边长(m)
			xMax:4096,				//土地X轴的最大编号
			yMax:4096,				//土地Y轴的最大编号
			blocks:{
				
			},
		}
	}
	
	var quantum={
		base:[0,0,0],			//自动计算出的偏移
		row:0,					//计算出的行数
		line:0,					//计算出的列数
		size:[0,0,0],			//量子位的尺寸
		data:[],					//保存量子位数据的节点
		chain:[],					//计算的过程链条
		select:null,				//被选中quantum的位置
	}
	
	var me=root.getConfig(); 
	var run={},pens={};
	
	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},
		//把plan里的量子位信息写入到运行数据里
		setQuantumData:function(qs,size,base){
			//console.log(qs)
			quantum.data=root.clone(qs);
			quantum.row=qs.length;
			quantum.line=qs[0].length;
			quantum.base=root.clone(base);
			quantum.size=root.clone(size);
		},
		
		//计算quantum的选择状态
		dwgActiveQuantum:function(target){
			if(quantum.select==null) return false;
			//console.log(quantum)
			var cfg={color:'#BBCCAA',anticlock:true};
			var start=run[target].world.start,x=start[0],y=start[1];
			self.dwgQuantum(x,y,cfg,[quantum.select],quantum.base,quantum.size,target);
		},
		dwgEmptyQuantum:function(target){
			var emps=[];
			for(var k in quantum.data){
				for(var kk in quantum.data[k]){
					var row=quantum.data[k][kk];
					var sum=0;
					if(row.face!=undefined){
						for(var i=0,len=row.face.length;i<len;i++)sum+=row.face[i];
					}else{
						for(var i=0,len=row.length;i<len;i++)sum+=row[i];
					}
					if(sum==0)emps.push([kk,k]);
				}
			}
			var cfg={color:'#E6E6E6',anticlock:true};
			var start=run[target].world.start,x=start[0],y=start[1];
			self.dwgQuantum(x,y,cfg,emps,quantum.base,quantum.size,target);
		},
		//设置需要在运行之前,
		map:function(target,cfg){
			self.setSize(cfg.size);
			self.setMap(cfg.cmap);
			self.setStart(cfg.start[0],cfg.start[1]);
			
			if(cfg.blocks)self.setBlocks(cfg.blocks);
			
			cfg.replace?self.setReplace():self.setAppend();
			self.autoShow(target);
			var con=root.ctlAutobuild
			con.setRender(reg.name);
			con.autoControl(target);
		},
		getSelectedQuantum:function(){
			if(quantum.select==null) return false;
			return root.clone(quantum.select);
		},
		setSelectedQuantum:function(pos){
			quantum.select=root.clone(pos);
			return true;
		},
		clearQuantumSelect:function(){
			quantum.select=null;
		},
		setBlocks:function(arr,tg){
			if(tg==undefined)config.world.blocks=arr;
			else run[tg].world.blocks=root.clone(arr);
		},
		//基本运行参数设置
		setStart:function(x,y,tg){
			if(tg==undefined)config.world.start=[x,y];
			else run[tg].world.start=[x,y];
		},
		getStart:function(tg){
			return run[tg].world.start;
		},
		
		getWorldConfig:function(tg){
			return 	root.clone(run[tg].world);
		},
		
		//预设置部分,在2D地图实例化之前对数据进行设置
		
		setReplace:function(){config.replace=true},		//生成dom时候的添加方式设置
		setAppend:function(){config.replace=false},	//生成dom时候的添加方式设置
		setSize:function(size){config.width=size.width;config.height=size.height;},		//设置绘图canvas的尺寸
		setMap:function(cmap){config.cssMap=cmap},				//设置额外的canvas样式
		setPosition:function(offset,tg){config.position=offset},	//dom的屏幕偏移
		
		setScale:function(s,tg){if(root.isType(s,'number')) run[tg].scale=s},
		setOffset:function(o,tg){if(root.isType(o,'array') && o.length==2) run[tg].offset=o},
		
		setEnable:function(tg){run[tg].enable=true},
		setDisable:function(tg){run[tg].enable=false},
		
		//canvas对象及运行状态获取
		getPen:function(tg){return pens[tg];},
		setPen:function(p,tg){pens[tg]=p},
		getRun:function(tg){return run[tg]},
		setTheme:function(name,tg){run[tg].theme=theme[name]},
		
		//3D的基础环境的初始化
		domInit:function(target){
			var id=root.hash(),env=run[target],w=env.width,h=env.height,m=env.multi
			var dom='<div id="'+id+'"><canvas  width="'+w*m+'" height="'+h*m+'" style="width:'+w+'px;height:'+h+'px" id="'+env.canvasID+'">test</canvas></div>';
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
			self.render(target);
		},
		//刷新2D视图入口
		fresh:function(target){
			self.cvsClear(target);
			self.autoShow(target);
			if(!root.empty(quantum.data)){
				var start=run[target].world.start,x=start[0],y=start[1];
				self.dwgCalcedQuantum(x,y,quantum.base,quantum.size);
				self.dwgEmptyQuantum(target);
				self.dwgActiveQuantum(target);
				self.dwgPlanGrid(x,y);			//绘制网格
				self.dwgDetail(target);                 //7.绘制block内的细节
			}
		},
		/*重新绘图的入口，从autoshow中剥离出来*/
		render:function(target,force){
			var env=run[target];
			if(!env.enable) return false;			//渲染关闭的时候，停止显示
			if(force)self.dwgInit(target)	;		//重新计算位置参数
			
			self.cvsClear(target);						//1.初始化canvas
			if(env.ax.show) self.ax();				//2.绘制坐标轴
			
			var two=root.two;						//3.设置绘图环境
			two.setRun(env);							//设置运行环境
			two.setPen(pens[target]);				//设置正在运行的画笔
			
			self.dwgActiveBlock(target);  		//6.绘制选中的格子
			self.dwgGrid(target);					//5.绘制网格
			self.dwgDetail(target);                 //7.绘制block内的细节
		},
		
		checkQuantum:function(p,x,y,target){
			var env=run[target];
			var ap=self.antiPoint(p,env.height);			//修正点的顺时针和逆时针
			var cp=root.calc.pCtoB(ap, env.scale, env.offset, env.multi, env.pxperm);
			var wd=config.world,s=wd.sideLength;
			var qx=cp[0]%s,qy=cp[1]%s;
			var size=quantum.size,base=quantum.base;
			var sx=Math.floor((qx-base[0])/size[0]),sy=Math.floor((qy-base[1])/size[1]);
			if(sx<0||sy<0||sx>=quantum.line|| sy>=quantum.row)	return false;		//满足上层要求，以后处理
			quantum.select=[sx,sy];
			return [sx,sy];
		},
		
		//显示计算过结果的quantum
		dwgCalcedQuantum:function(x,y,base,size){
			var cqs=[];
			for(var qy in quantum.data){
				for(var qx in quantum.data[qy]){
					var row=quantum.data[qy][qx],n=0;
					for(var k in row)n+=row[k];
					if(n!=0) cqs.push([qx,qy]);
				}
			}
			var cfg={color:'#E0E0E0',anticlock:true};
			self.dwgQuantum(x,y,cfg,cqs,base,size,run.active);
		},
		/*屏幕从html的顺时针换为canvas绘图的逆时针
		 * @param	p	array			//[x,y],canvas上的点击位置
		 * @param	h	number		//canvas的高度
		 * return	[x,y]					//翻转后的点
		 * */
		antiPoint:function(p,h){
			return [p[0],h-p[1]];
		},
		//临时使用，后台的绘图部分需要重整
		dwgPlanGrid:function(x,y,target){
			var dwg=root.two.dwgLine;
			var cfg={width:1,color:'#FFCCBB',anticlock:true};
			
			var env=run[target],s=config.world.sideLength;
			var base=quantum.base,line=quantum.line,row=quantum.row,size=quantum.size;
			var left=s*(x-1)+base[0],right=left+line*size[0];
			var bottom=s*(y-1)+base[1],top=bottom+row*size[1];
			for(var i=0;i<line+1;i++){
				var pa=[left+i*size[0],bottom],pb=[left+i*size[0],top];
				dwg([pa,pb],cfg);
			}
			
			for(var i=0;i<row+1;i++){
				var pa=[left,bottom+i*size[1]],pb=[right,bottom+i*size[1]];
				dwg([pa,pb],cfg);
			}
		},
		
		dwgDetail:function(target){
			var env=run[target];
			var start=env.world.start,x=start[0],y=start[1]
			var wd=env.world,s=wd.sideLength;
			
			var dwg=root.two.dwgWord;
			var ac='#CCBBAA',uc='#BBBBBB',pd=0.38,font=10;
			var bks=run[target].world.blocks;
			//1.标识当前block信息
			var bkey=x+'_'+y,bk=bks[bkey];
			var word='['+x+','+y+'],E:'+bk[0];
			
			var pos=[s*(x-1),s*(y-1)];
			var cfg={align:'start',pos:pos,color:ac,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			var pos=[s*(x-1),s*y-pd];
			var cfg={align:'start',pos:pos,color:ac,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			var pos=[s*x,s*(y-1)];
			var cfg={align:'end',pos:pos,color:ac,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			var pos=[s*x,s*y-pd];
			var cfg={align:'end',pos:pos,color:ac,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			//2.标识左侧的块
			var bkey=(x-1)+'_'+y,bk=bks[bkey];
			var word='['+(x-1)+','+y+'],E:'+bk[0];
			
			var pos=[s*(x-1),s*(y-1)];
			var cfg={align:'end',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			var pos=[s*(x-1),s*y-pd];
			var cfg={align:'end',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			//2.标识右侧的块
			var bkey=(x+1)+'_'+y,bk=bks[bkey];
			var word='['+(x+1)+','+y+'],E:'+bk[0];
			
			var pos=[s*x,s*(y-1)];
			var cfg={align:'start',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			var pos=[s*x,s*y-pd];
			var cfg={align:'start',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			//2.标识上侧的块
			var bkey=x+'_'+(y+1),bk=bks[bkey];
			var word='['+x+','+(y+1)+'],E:'+bk[0];
			
			var pos=[s*(x-1),s*y];
			var cfg={align:'start',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			var pos=[s*x,s*y];
			var cfg={align:'end',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			//2.标识下侧的块
			var bkey=x+'_'+(y-1),bk=bks[bkey];
			var word='['+x+','+(y-1)+'],E:'+bk[0];
			
			var pos=[s*(x-1),s*(y-1)-pd];
			var cfg={align:'start',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			var pos=[s*x,s*(y-1)-pd];
			var cfg={align:'end',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			//左上角的块
			var bkey=(x-1)+'_'+(y+1),bk=bks[bkey];
			var word='['+(x-1)+','+(y+1)+'],E:'+bk[0];
			var pos=[s*(x-1),s*y];
			var cfg={align:'end',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			//右上角的块
			var bkey=(x+1)+'_'+(y+1),bk=bks[bkey];
			var word='['+(x+1)+','+(y+1)+'],E:'+bk[0];
			var pos=[s*x,s*y];
			var cfg={align:'start',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			//左下角的块
			var bkey=(x-1)+'_'+(y-1),bk=bks[bkey];
			var word='['+(x-1)+','+(y-1)+'],E:'+bk[0];
			var pos=[s*(x-1),s*(y-1)-pd];
			var cfg={align:'end',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
			
			//右下角的块
			var bkey=(x+1)+'_'+(y-1),bk=bks[bkey];
			var word='['+(x+1)+','+(y-1)+'],E:'+bk[0];
			var pos=[s*x,s*(y-1)-pd];
			var cfg={align:'start',pos:pos,color:uc,size:font,anticlock:true};
			dwg(word,cfg,target);
		},
		
		dwgActiveBlock:function(target){
			var env=run[target];
			var bk=env.selected,x=bk[0],y=bk[1];
			if(x!=0 && y!=0&& self.checkXY(x,y)){	//前面的判断是防止出现未设置hash带来的报错问题
				self.dwgBlock(x,y,{width:1,color:'#00CCBB',anticlock:true},target)
			}
			var px=config.world.start[0],py=config.world.start[1];		//绘制start的block
			self.dwgBlock(px,py,{width:1,color:'#EEEEEE',anticlock:true},target)
		},
		
		dwgQuantum:function(x,y,cfg,qs,base,size,target){
			var dwg=root.two.fillPolygon;
			var s=config.world.sideLength;
			for(var k in qs){
				var pos=qs[k];	
				if(self.checkXY(x,y)){
					var left=(x-1)*s+base[0]+pos[0]*size[0],right=left+size[0];
					var bottom=(y-1)*s+base[1]+pos[1]*size[1],top=bottom+size[1];
					var ps=[[left,bottom],[right,bottom],[right,top],[left,top]];
					dwg(ps,cfg);
				}
			}
		},
		
		checkXY:function(x,y){
			var wcfg=config.world;
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
			cfg.anticlock=true;		//自动进行逆时针翻转
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
			var cfg={width:1,color:color,anticlock:false};
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
			var env=run[target],tpl=env.theme,size=env.size,m=env.multi
			//console.log(env)
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
			self.dwgInit(tg)	;			//重新计算位置参数
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
