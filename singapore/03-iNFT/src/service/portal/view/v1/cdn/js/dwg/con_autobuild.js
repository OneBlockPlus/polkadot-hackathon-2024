;(function(root){
	var reg={
		name:'ctlAutobuild',
		type:'controller',
		hooks:[],		//注册到fn下的方法,这样其他的组件就可以直接调用
		loops:[],		//注册循环启动函数，framework开始启动
		autoRun:'init',
		version:1,
		auth:['fuu'],
	};
	
	var config={
		intro:'2D地图的控制器',
		//render:'rdAutobuild',
		scaleRate:0.1,			//同比缩放比例
		keys:{
			SELECT:	17,			//control键
			TREE:			84,			//T,自动种树快捷键
			STONE:		83,			//S,自动布景快捷键
			PASTE:		86,			//V,复制目标块
		},
	}
	var me=root.getConfig();
	var run={
		render:'',						//控制对应的渲染器
		pre:[0,0],						//触控点的前点
		active:'',							//当前正在控制的canvas的父容器
		dragEnable:false,			//是否可以进行平移的使能位
		touched:false,				//定时返回中心使用的检测位
		stamp:0,						//定时返回的时间戳比较位
		keyQueue:root.hash(),	//键盘队列
		copyBlock:[0,0],				//被拷贝的块
		info:null,						//信息容器
		infoTimer:0,					//信息计数器
		status:null,					//状态容器
		quantum:{						//2D显示需要的量子计算的参数
			start:[0,0],					//计算开始点
			size:[2,2],					//量子尺寸
			format:[1,1,1,0,0,0],	//量子模式数据
			sum:10,						//生成量子的总数
			grid:0.5,						//格栅吸附尺寸
		},
		mouseStatus:{				//鼠标的状态
			left:false,					//鼠标左键的状态
			middle:false,				//鼠标中键的状态
			right:false,				//鼠标右键的状态
		},	
		mouseStart:{					//鼠标开始点的位置,用于画选择框
			left:{			//鼠标左键点击开始的数据
				touchpoint:[0,0],
				block:[0,0],
			},
			middle:{
				touchpoint:[0,0],
				block:[0,0],
			},
		},
		mouseEnd:{
			left:{			//鼠标左键点击结束的数据
				touchpoint:[0,0],
				block:[0,0],
			},
			middle:{
				touchpoint:[0,0],
				block:[0,0],
			},
		},
		selectRange:{		//保存上一次的选择区域
			start:null,
			end:null,
		},				
		locker:false,			//区域选择锁
		selectQuantum:false,		//是否进行block选择使能位
	};
	
	var agent={
		onMousedown:null,			//鼠标按下后的回调操作
		onGridcreate:null,			//格栅生成回调操作
	}
	
	var quantum={
		select:null,			//被选中quantum的位置
	}
	
	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},
		
		//通过agent的方式提供给外部直接的响应
		on:function(tag,fun){
			if(root.isType(fun,'function') && agent['on'+tag]!==undefined)	agent['on'+tag]=fun;
			return false;
		},
		
		//量子选择部分的配置
		isQuantumSelect:function(){return run.selectQuantum},
		enableQuantumSelect:function(){run.selectQuantum=true;},
		disableQuantumSelect:function(){run.selectQuantum=false;},
		//返回和框选结构有关的所有结果，这里的参数是进行量子计算的
		getQuantumEnv:function(){
			var qc=run.quantum;
			return {base:root.clone(quantum.base),line:quantum.line,row:quantum.row,size:root.clone(qc.size)};
		},
		
		//自动设置参数
		setQuantumConfig:function(p){
			//console.log('需要设置的参数是:'+JSON.stringify(p));
			for(var k in p)if(undefined!==run.quantum[k])run.quantum[k]=root.clone(p[k]);
		},
		
		setLocker:function(val){
			console.log('range start:'+JSON.stringify(run.mouseStart.left)+',end:'+JSON.stringify(run.mouseEnd.left))
			if(val){
				run.selectRange.start=root.clone(run.mouseStart.left);
				run.selectRange.end=root.clone(run.mouseEnd.left);
			}else{
				run.selectRange.start=null;
				run.selectRange.end=null;
			}
			run.locker=val;
		},
		
		getSelectRange:function(){
			if(run.selectRange.start===null || run.selectRange.end===null)return false;
			return root.clone(run.selectRange);
		},
		setActive:function(tg){run.active=tg},
		setRender:function(rd){run.render=rd},
		//setTouched:function(){},
		getSelected:function(tg){return run[tg].selected},
		getSelectBlock:function(){return run[run.active].selected;},
		getCopyBlock:function(){return run[run.active].copyBlock;},
		
		//控制器的主入口
		autoControl:function(target){
			if(!run[target]){
				run[target]=root[run.render].getRun(target);
				self.setActive(target);
			}
			var env=run[target];
			$(target).find('#'+env.canvasID).off('mousedown','mousemove','mouseup')
			.on('mousedown',self.mousedown).on('mousemove',self.mousemove).on('mouseup',self.mouseup);
		},
		
		/*鼠标按下操作，类似于touchstart*/
		mousedown:function(ev){
			self.setMouseStatus(ev.button)		//更新鼠标状态
			
			var env=run[run.active];
			env.position=$('#'+env.canvasID).offset();		//计算dom的位置
			var p=self.getTouchPoint(ev);
			
			var bk=self.calcSelectBlock(p);					//获取鼠标按下的block坐标
			self.setMouseStart(ev.button,p,bk);

			//处理是选中区域还是进行框选
			if(run.selectQuantum){
				
			}else{
				var rg=self.getSelectRange(),start=rg.start,end=rg.end;
				if(start!=null && end!=null) self.showMouseSelect(start.touchpoint,end.touchpoint,start.block,end.block);
			}
			
			if(run.mouseStatus.middle)run.dragEnable=true;
			run.pre=p;
		},
		
		/*鼠标移动操作，类似于touchmove*/
		mousemove:function(ev){
			//return false;
			var p=self.getTouchPoint(ev);
			if(run.dragEnable){				//平移的操作
				var tg=run.active;
				var env=run[tg],toB=root.calc.disCtoB;
				var s=env.scale,m=env.multi,px=env.pxperm,r=0;
				var cx=p[0]-run.pre[0],cy=p[1]-run.pre[1];
				var dx=toB(cx,r,s,m,px),dy=toB(cy,r,s,m,px)
				run.pre=p;
				var rd=root[run.render];
				rd.cvsMove(dx,dy,tg);
				rd.render(tg);
			}
			
			if(run.selectQuantum){
				
			}else{
				if(run.mouseStatus.left){		//框选的操作
					var bk=self.calcSelectBlock(p);		//获取鼠标按下的block坐标
					var left=run.mouseStart.left
					self.showMouseSelect(left.touchpoint,p,left.block,bk);
				}
			}

			run.pre=p;			//保存上一个点击点的位置
		},
		
		/*鼠标按键操作，类似于touchend*/
		mouseup:function(ev){
			//console.log('mouse up');
			self.setMouseStatus(ev.button,true);		//更新鼠标状态
			run.dragEnable=false;
			var p=self.getTouchPoint(ev);
			var bk=self.calcSelectBlock(p);					//获取鼠标按下的block坐标
			self.setMouseEnd(ev.button,p,bk);
			
			if(run.selectQuantum){
				//计算是那个quantum被选中
				var mstatus=run.mouseEnd.left;
				var block=root.rdAutobuild.getStart(run.active);
				
				if(block[0]==mstatus.block[0] && block[1]==mstatus.block[1]){
					root[run.render].checkQuantum(p,block[0],block[1],run.active);
					root[run.render].fresh(run.active);
				}
			}else{
				self.calcQuantumGrid(run.mouseStart.left.touchpoint,p);			//未锁选择区域的情况下，计算格栅
			}
		},
		
		showRange:function(){
			var rg=self.getSelectRange(),start=rg.start,end=rg.end;
			self.showMouseSelect(start.touchpoint,end.touchpoint,start.block,end.block);
		},
	
		calcQuantumGrid:function(start,end){
			//console.log('开始触控的点是:'+JSON.stringify(start.touchpoint)+',结束的点是:'+JSON.stringify(end.touchpoint))
			var cfg=run.quantum;
			var pCtoB=root.calc.pCtoB;		//p, s, o, m, px
			var env=run[run.active];
			var pa=pCtoB(self.antiPoint(start,env.height),env.scale,env.offset,env.multi,env.pxperm);
			var pb=pCtoB(self.antiPoint(end,env.height),env.scale,env.offset,env.multi,env.pxperm);
			var bpa=self.pointToBlock(pa),bpb=self.pointToBlock(pb);
			//console.log('计算出对应的B坐标系的点:'+JSON.stringify([bpa,bpb]))
			
			var res=self.calcRowAndLine(bpa,bpb,cfg.size,cfg.grid);
			//console.log('计算出的分格情况是:'+JSON.stringify(res))
			
			var row=res.row,line=res.line,base=res.base;
			if(res.row>=1 && res.line>=1){
				self.saveQuantum(base,row,line)
				
				var block=env.world.start;
				self.dwgQuantumGrid(block[0],block[1],env.world.sideLength,cfg.size,base,row,line);
			}
			
			//输出给委托事件进行处理
			if(agent.onGridcreate!=null){
				var dt={line:line,row:row}
				agent.onGridcreate(dt);
			}
			
		},
		
		
		//保存前端的量子位计算
		saveQuantum:function(base,row,line){
			quantum.base=root.clone(base);
			quantum.line=line;
			quantum.row=row;
		},
		

		clearBlock:function(x,y){
			root.rdAutobuild.cvsClear(run.active);
			root.rdAutobuild.autoShow(run.active);
		},
		//绘制量子位的格栅
		dwgQuantumGrid:function(x,y,s,size,base,row,line){
			var dwg=root.two.dwgLine;
			var cfg={width:1,color:'#FFCCBB',anticlock:true};
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
		
		calcRowAndLine:function(start,end,size,grid){
			//1.计算选择框的边界
			var rec={left:0,right:0,top:0,bottom:0};
			rec.left=start[0]<end[0]?start[0]:end[0];
			rec.right=start[0]<end[0]?end[0]:start[0];
			rec.top=start[1]>end[1]?start[1]:end[1];
			rec.bottom=start[1]>end[1]?end[1]:start[1];
			
			//2.计算符合到grid的数据
			var lo=rec.left%grid,ro=rec.right%grid,bo=rec.bottom%grid,to=rec.top%grid;
			var left=lo==0?rec.left:rec.left-lo+grid;
			var right=rec.right-ro;
			var bottom=bo==0?rec.bottom:rec.bottom-bo+grid;
			var top=rec.top-to;
			
			//3.根据量子位的尺寸,计算边界位置
			//console.log('left:'+left+',right:'+right+',bottom:'+bottom+',top:'+top);
			var orow=(top-bottom)%size[1],oline=(right-left)%size[0];
			var line=Math.floor((right-left)/size[0]),row=Math.floor((top-bottom)/size[1]);
			var base=[rec.left-lo+oline*0.5,rec.bottom-bo+orow*0.5];
			
			return {base:base,line:line,row:row};
		},
		
		//世界坐标系的点转换到block里
		pointToBlock:function(p){
			var st=root[run.render].getWorldConfig(run.active);
			var s=st.sideLength,x=st.start[0],y=st.start[1];
			return self.filterBlockPoint([p[0]-s*x+s,p[1]-s*y+s],s)
		},
		
		//把block的外的点收缩到block里
		filterBlockPoint:function(p,s){
			var x=p[0],y=p[1];
			return [x<0?0:x>s?s:x,y<0?0:y>s?s:y];
		},
		
		/*显示被框选的block的状态
		 * @param	pa		array		//[x,y]开始的触控点
		 * @param	pb		array		//[x,y]结束的触控点
		 * @param	ba		array		//[x,y]开始的Block
		 * @param	bb		array		//[x,y]结束的Block
		 * 
		 * */
		showMouseSelect:function(pa,pb,ba,bb){
			if(run.locker){
				//console.log('show data:'+JSON.stringify(pa)+',end:'+JSON.stringify(pb))
			}
			var pCtoB=root.calc.pCtoB;		//p, s, o, m, px
			var env=run[run.active],rd=root[run.render];
			
			var cpa=pCtoB(pa,env.scale,env.offset,env.multi,env.pxperm);
			var cpb=pCtoB(pb,env.scale,env.offset,env.multi,env.pxperm);
			rd.render(run.active);
			//rd.fillBlocks(ba,bb,{color:'#BBBBEE',alpha:0.3},run.active);		//填充选中的块
			rd.dwgRectangle(cpa,cpb,'#EE3300',run.active);							//绘制选择框
		},
		
		/*设置鼠标状态的方法
		 * @param	code		number		//[left,middle,right],鼠标按钮代码
		 * @param	release	boolean	//是否是释放鼠标
		 * 
		 * */
		setMouseStatus:function(code,release){
			switch (code){
				case 0:
					run.mouseStatus.left=release?false:true;
					break;
				case 1:
					run.mouseStatus.middle=release?false:true;
					break;
				case 2:
					run.mouseStatus.right=release?false:true;
					break;
				default:
					break;
			}
		},
		
		setMouseStart:function(code,p,bk){
			//console.log('mouse code:'+code+',touch point:'+JSON.stringify(p)+',selected block:'+JSON.stringify(bk));
			switch (code){
				case 0:
					run.mouseStart.left.touchpoint=root.clone(p);
					run.mouseStart.left.block=root.clone(bk);
					break;
				case 1:
					run.mouseStart.middle.touchpoint=root.clone(p);
					run.mouseStart.middle.block=root.clone(bk);
					break;
				case 2:
					break;
				default:
					break;
			}
			
		},
		setMouseEnd:function(code,p,bk){
			//console.log('mouse code:'+code+',touch point:'+JSON.stringify(p)+',selected block:'+JSON.stringify(bk));
			switch (code){
				case 0:
					run.mouseEnd.left.touchpoint=root.clone(p);
					run.mouseEnd.left.block=root.clone(bk);
					break;
				case 1:
					run.mouseEnd.middle.touchpoint=root.clone(p);
					run.mouseEnd.middle.block=root.clone(bk);
					break;
				case 2:
					break;
				default:
					break;
			}
			
		},
		
		/***********************************************************************/
		/******************************计算方法区域****************************/
		/***********************************************************************/
		
		/*根据canvas的点击点，计算绘图空间block的选中状况
		 * @param	p		array		//[x,y]canvas上的选中点，未做逆时针处理
		 * return	[x,y]					//选中的block的坐标
		 * */
		calcSelectBlock:function(p){
			var env=run[run.active];
			var ap=self.antiPoint(p,env.height);			//修正点的顺时针和逆时针
			var cp=root.calc.pCtoB(ap, env.scale, env.offset, env.multi, env.pxperm);
			var bk=self.getTouchedBlock(cp);
			if(bk==false) return true;
			return bk;
		},
		
		//获取点击到canvas上的点
		getTouchPoint:function(ev){
			ev = window.event && window.event.touches ? event.touches[0] : ev;
			var env=run[run.active],pos=env.position,m=env.multi;
	   	 	return [ev.clientX-pos.left,ev.clientY-pos.top];
		},
		
		/*屏幕从html的顺时针换为canvas绘图的逆时针
		 * @param	p	array			//[x,y],canvas上的点击位置
		 * @param	h	number		//canvas的高度
		 * return	[x,y]					//翻转后的点
		 * */
		antiPoint:function(p,h){
			return [p[0],h-p[1]];
		},
		
		/*计算点击的block的方法
		 *@param		cp		array		//[x,y],B坐标系的坐标点位置
		 * 
		 * return	[x,y]					//选中的block的
		 * */
		getTouchedBlock:function(cp){
			//console.log(cp);
			var wd=me[run.render].world,s=wd.sideLength;
			var x=Math.ceil(cp[0]/s),y=Math.ceil(cp[1]/s);
			if(x<1 || y<1 || x>wd.xMax || y>wd.yMax) return false;
			return [x,y];
		}
	}
	
	root.regComponent(reg);
})(window.T)
