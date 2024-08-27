;(function(root){
	var reg={
		name:'ctlTwo',
		type:'controller',
		hooks:[],		//注册到fn下的方法,这样其他的组件就可以直接调用
		loops:[],		//注册循环启动函数，framework开始启动
		autoRun:'init',
		version:1,
		auth:['fuu'],
	};
	
	var config={
		intro:'2D地图的控制器',
		scaleRate:0.05,			//同比缩放比例
		keys:{
			SELECT:	17,			//control键
			TREE:		84,			//T,自动种树快捷键
			STONE:		83,			//S,自动布景快捷键
			PASTE:		86,			//V,复制目标块
		},
		render:'rdTwo',				//对应的render
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
		mouseStatus:{				//鼠标的状态		
			left:false,					//鼠标左键的状态
			middle:false,				//鼠标中键的状态
			right:false,					//鼠标右键的状态
		},	
		mouseStart:{					//鼠标开始点的位置,用于画选择框
			left:{
				touchpoint:[0,0],
				startblock:[0,0],
			},
			middle:{
				touchpoint:[0,0],
				startblock:[0,0],
			},
		},
		fixPosition:500,			//信息显示条的修正位置
	};
	var agents={
		selectEnd:null,
		dragEnd:null,
		scrollEnd:null,
	};
	
	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},

		
		setAgent:function(ev,fun){
			if(agents[ev]!==undefined)agents[ev]=fun;
		},
		setInfoPostion:function(n){run.fixPosition=n},
		setActive:function(tg){run.active=tg},
		setRender:function(rd){run.render=rd},
		getSelected:function(tg){return run[tg].selected},
		getSelectBlock:function(){return run[run.active].selected;},
		getCopyBlock:function(){return run[run.active].copyBlock;},
		getRun:function(tg){return run[tg]},
	
		//控制器的主入口
		autoControl:function(target){
			if(!run[target]){
				run[target]=root[run.render].getRun(target);
				self.setActive(target);
			}
			var env=run[target];
			if(run.status==null)self.setStatus(target);
			if(run.info==null)self.setInfo(target);
			

			$(target).find('#'+env.canvasID).off('mousedown','mousemove','mouseup')
			.on('mousedown',self.mousedown).on('mousemove',self.mousemove).on('mouseup',self.mouseup)
			.on('mousewheel',self.mousewheel).on('dblclick',self.doubleTap)
			
			$(document).off('keydown','keyup').on('keydown',function(evt){
				var code=evt.which,queue=root.getQueue(config.keyQueue);
				if(!root.inArray(code,queue)) root.queueAdd(code,config.keyQueue);
				//console.log(code)
				self.showInfo(code+','+JSON.stringify(root.getQueue(config.keyQueue)))
			}).on('keyup',function(evt){
				var code=evt.which,queue=root.getQueue(config.keyQueue);
				var qu=root.queueRemove(code,config.keyQueue);
				self.showInfo(code+','+JSON.stringify(queue))
			})
		},
		setStatus:function(target){
			var id=root.hash();
			var cmap={position:'relative',left:'10px',bottom:run.fixPosition+'px',opacity:'0.7',background:'#EEEEEE',padding:"3px 5px 3px 5px","border-radius":'3px','overflow':'hidden',width:'60%','-webkit-user-select':'none'}
			var dom='<div id="'+id+'">未拷贝任何块</div>'
			$(target).append(dom);
			run.status=$("#"+id);
			run.status.css(cmap);
		},
		
		showStatus:function(txt){
			run.status.html(txt);
		},
		setInfo:function(target){
			var id=root.hash();
			var cmap={position:'relative',left:'10px',bottom:'60px',opacity:'0.6',background:'#BBBBBB',width:'95%',padding:"3px 5px 3px 5px","border-radius":'3px','-webkit-user-select':'none'}
			var dom='<div id="'+id+'"></div>'
			$(target).append(dom);
			run.info=$("#"+id);
			run.info.css(cmap).hide();
		},
		
		showInfo:function(txt,at){
			if(run.infoTimer!=0){
				clearTimeout(run.infoTimer);
				run.infoTimer=0;
			} 
			run.info.html('').html(txt).show();
			if(at){
				run.infoTimer=setTimeout(function(){
					run.info.html('').hide()
				},at);
			}
		},

		/*鼠标滚轮操作*/
		mousewheel:function(ev,delta){		//这个delta需要jquery的插件支持
			//1.对小地图进行缩放
			var tg=run.active,env=run[tg],lmt=env.scaleLimit
			var rd=root[config.render];
			var calc=root.calc,toB=calc.disCtoB,CtoB=calc.pCtoB,BtoC=calc.pBtoC;
			var p=self.antiPoint([ev.offsetX, ev.offsetY],env.height);		//鼠标位置点
			//console.log(env)
			//console.log('滚轮获取的offset值:'+JSON.stringify(env.offset)+',scale值:'+env.scale)
			var s=env.scale*(1+config.scaleRate*delta)

			self.showInfo(JSON.stringify(lmt),1000);
			if(s>=lmt.min && s<=lmt.max){
				var pb=CtoB(p,env.scale,env.offset,env.multi,env.pxperm);
				rd.setScale(s,tg);
				var pc=CtoB(p,env.scale,env.offset,env.multi,env.pxperm);
				var dx=pc[0]-pb[0],dy=pc[1]-pb[1];
				var os=[env.offset[0]-dx,env.offset[1]-dy];
				rd.setOffset(os,tg);
				rd.render(tg);
			}
			//2.传出事件
			if(agents.scrollEnd!==null)agents.scrollEnd();
		},
		
		/*鼠标按下操作，类似于touchstart*/
		mousedown:function(ev){
			self.setMouseStatus(ev.button)		//更新鼠标状态
			
			var env=run[run.active];
			env.position=$('#'+env.canvasID).offset();		//计算dom的位置
			var p=self.getTouchPoint(ev);
			
			var bk=self.selectBlock(p);					//获取鼠标按下的block坐标
			if(ev.button==0)env.selected=bk;		//仅左键时记录为选择block
			self.setMouseStart(ev.button,p,bk);
			//显示状态
			var txt=''
			if(run[run.active].selected!=false) txt+='选中的块是:'+JSON.stringify(self.getSelectBlock());
			if(	run[run.active].copyBlock
				&&run[run.active].copyBlock[0]>0
				&& run[run.active].copyBlock[1]>0)txt+=',拷贝的块是:'+JSON.stringify(self.getCopyBlock());
			self.showStatus(txt);
			if(run.mouseStatus.middle)run.dragEnable=true;
			run.pre=p;
			root.rdTwo.render(run.active); 		//绘制canvas显示点击的块
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
			
			if(run.mouseStatus.left){		//框选的操作
				var bk=self.selectBlock(p);		//获取鼠标按下的block坐标
				var left=run.mouseStart.left
				self.showMouseSelect(left.touchpoint,p,left.startblock,bk);
			}
			run.pre=p;			//保存上一个点击点的位置
		},
		
		/*鼠标按键操作，类似于touchend*/
		mouseup:function(ev){
			var env=run[run.active];
			var p=self.getTouchPoint(ev);
			if(run.mouseStatus.left){		//框选的操作
				var bk=self.selectBlock(p);		//获取鼠标按下的block坐标
				var start=run.mouseStart.left.startblock;
				if(bk==true){
					var txt='超出选择范围';
					self.showStatus(txt);
				}else if(start[0]!=bk[0] || start[1]!=bk[1]){
					var txt='选中:'+JSON.stringify(start)+'到'+JSON.stringify(bk)+'的区域';
					self.showStatus(txt);
				}
				
				if(agents.selectEnd!==null && bk!==true){
					agents.selectEnd({start:root.clone(start),end:root.clone(bk)});
				}
			}else{
				if(agents.dragEnd!==null){
					agents.dragEnd();
				}
			}
			
			self.setMouseStatus(ev.button,true);		//更新鼠标状态
			run.dragEnable=false;
		},
		doubleTap:function(ev){
			run[run.active].copyBlock=self.getSelectBlock();
		},
		
		/*显示被框选的block的状态
		 * @param	pa		array		//[x,y]开始的触控点
		 * @param	pb	array		//[x,y]开始的Block
		 * @param	ba		array		//[x,y]结束的触控点
		 * @param	bb	array		//[x,y]结束的Block
		 * 
		 * */
		showMouseSelect:function(pa,pb,ba,bb){;
			var pCtoB=root.calc.pCtoB;		//p, s, o, m, px
			var env=run[run.active],rd=root.rdTwo;
			var cpa=pCtoB(pa,env.scale,env.offset,env.multi,env.pxperm);
			var cpb=pCtoB(pb,env.scale,env.offset,env.multi,env.pxperm);
			rd.render(run.active);
			rd.fillBlocks(ba,bb,{color:'#BBBBEE',alpha:0.3},run.active);		//填充选中的块
			//rd.dwgRectangle(cpa,cpb,'#EE3300',run.active);		//显示鼠标的框选框
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
					run.mouseStatus.middle=right?false:true;
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
					run.mouseStart.left.startblock=root.clone(bk);
					break;
				case 1:
					run.mouseStart.middle.touchpoint=root.clone(p);
					run.mouseStart.middle.startblock=root.clone(bk);
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
		selectBlock:function(p){
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
			var wd=me.rdTwo.world,s=wd.sideLength;
			var x=Math.ceil(cp[0]/s),y=Math.ceil(cp[1]/s);
			if(x<1 || y<1 || x>wd.xMax || y>wd.yMax) return false;
			return [x,y];
		}
	}
	
	root.regComponent(reg);
})(window.T)
