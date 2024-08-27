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
	
	var hash=root.hash;		//随机key,需要多次使用
	
	var config={
		intro:'Block地图渲染器',					//渲染器说明
		controller:'ctlMap',							//配置的控制器
		size:{
			width:0,
			height:0,
		},
		paddingX:10,			//X空白偏移像素
		paddingY:10,			//Y空白偏移像素
		marginSkyline:2,		//侧视图时候的偏移(m)
		sideLength:16,			//Block的边长(m)
		tpl:{
			basic:{
				background:'#EEEEEE',
				color:'#999999',
				width:1,
			},
			fill:{
				color:'#FF0000',
				alpha:0.3,
			},
			block:{
				color:'#AAAAAA',
				width:2,
			},
			coin:{
				color:'#AA6699',
				width:1,
			},
			stop:{
				color:'#FF4422',
				width:1,
			},
			trigger:{
				color:'#66FF99',
				width:1,
			},
			adjunct:{
				color:'#88EEFF',
				width:1,
			},
			light:{
				color:'#2233EE',
				width:1,
			},
		}
	}
	
	var me=root.getConfig();
	var pen=null,player=null;
	
	var run={
		target:'',
		position:{left:0,top:0},		//dom的位置偏移
		scroll:{top:0,left:0},			//滚动的偏移
		enable:{
			stop:true,
			trigger:true,
			adjunct:true,
			light:true,
			coin:true,
		},
		viewpoint:'top',
		data:{},
		scale:1,
		offset:[0,0],
	};
	
	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},

		getPen:function(){return pen;},
		getRun:function(){return run;},
		
		setEnable:function(keys){
			var inArray=root.inArray
			for(var k in run.enable){
				run.enable[k]=inArray(k,keys)?true:false;
			}
		},
		setViewpoint:function(view){
			run.viewpoint=view;
		},
		
		//3D的基础环境的初始化
		domInit:function(target){
			if(pen!=null) return true;
			var id=root.hash(),cid=root.hash();
			var w=$("#"+target).width(),h=$("#"+target).height();
			run.target=target;
			config.size.width=w;
			config.size.height=h;
			//console.log(config.size)
			var dom='<div id="'+id+'"><canvas  width="'+w+'" height="'+h+'" id="'+cid+'"></canvas></div>';
			var cmap={'margin':'0 auto','padding':'0px 0px 0px 0px','width':w+'px','height':h+'px',}
			var vmap={'margin':'0 auto','padding':'0px 0px 0px 0px'}
			$("#"+target).append(dom).find('#'+id).css(cmap).find('canvas').css(vmap);
			var cvs=document.getElementById(cid);
			pen=cvs.getContext("2d");
			
			//取dom的位置
			//$(document).scrollTop();   
			//$(document).scrollLeft();
		},
		
		
		/*canvas的初始化工作
		 * */
		cvsInit:function(){
			var tpl=config.tpl.basic
			pen.globalAlpha=1;
			pen.fillStyle=tpl.background;
			pen.fillRect(0,0,config.size.width,config.size.height);
		},
		
		/**Grid显示3D显示入口方法部分**/
		/*autoShow:function(target,data){
			if(pen==null) self.domInit(target);
			self.cvsInit();
		},*/
		
		autoStruct:function(data,force){
			//console.log(data)
			var empty=root.empty,rst={},vp=run.viewpoint;
			for(var mod in data){
				if(!empty(data[mod])){
					//console.log(mod)
					rst[mod]=self[mod+'Struct'](data[mod],vp);
				}
			}
			run.data=rst;
			//console.log(run.data)
			return true;
		},
		
		autoShow:function(ck){
			self.cvsInit();
			self.blockDrawing(config.tpl.block);
			for(var mod in run.data){
				if(run.enable[mod]) self[mod+'Show'](run.data[mod],config.tpl[mod]);
			}
			ck && ck()
		},
		/*canvas控制部分，实现拖动和选择*/
		autoControl:function(ck){
			var sel=$("#"+run.target).find('canvas'),ost=sel.offset();
			run.position.left=ost.left;
			run.position.top=ost.top;
			sel.off('click')
			if(run.viewpoint=='top') sel.on('click',function(ev){
				self.blockClick(ev,ck)
			})
			$(document).off('scroll').on('scroll',self.docScroll);
		},
		
		docScroll:function(){
			run.scroll.top=$(document).scrollTop();
			run.scroll.left=$(document).scrollLeft();
			//console.log(run.scroll)
		},
		
		blockClick:function(ev,ck){
			var p=self.getTouchPoint(ev),bp=self.pToBlock(p);
			var chks=self.check(bp)
			self.autoShow();
			self.active(chks)  		//亮显选中的组件
			ck && ck(chks)
		},
		
		active:function(chks){
			for(var mod in chks){
				var tpl=config.tpl.fill;
				if(mod!='adjunct'){
					for(var i=0,len=chks[mod].length;i<len;i++){
						var ps=run.data[mod][chks[mod][i]];
						self.fillPolygon(ps,tpl);
					}
				}else{
					for(var i=0,len=chks[mod].length;i<len;i++){
						var ps=run.data[mod][chks[mod][i][0]][chks[mod][i][1]];
						self.fillPolygon(ps,tpl);
					}
				}
			}
		},
		
		check:function(p){
			var rst={};
			for(var mod in run.data){
				if(!run.enable[mod]) continue;
				var chk=self[mod+'Check'](p,run.data[mod])
				rst[mod]=chk;
			}
			return rst;
		},
		coinCheck:function(p,arr){
			return [];
		},
		
		stopCheck:function(p,arr){
			var rst=[];
			for(var i=0,len=arr.length;i<len;i++){
				var ps=arr[i];
				if(self.isin(p,ps)) rst.push(i);
			}
			return rst;
		},
		
		triggerCheck:function(p,arr){
			var rst=[];
			//if(!run.enable.trigger) return rst;
			for(var i=0,len=arr.length;i<len;i++){
				var ps=arr[i];
				if(self.isin(p,ps)) rst.push(i);
			}
			return rst;
		},
		
		lightCheck:function(p,arr){
			//console.log(p)
			var rst=[];
			for(var i=0,len=arr.length;i<len;i++){
				var ps=arr[i];
				if(self.isin(p,ps)) rst.push(i);
			}
			//console.log(rst)
			return rst;
		},
		
		adjunctCheck:function(p,arr){
			var rst=[];
			//if(!run.enable.adjunct) return rst;
			for(var adj in arr){
				for(var i=0,len=arr[adj].length;i<len;i++){
					var ps=arr[adj][i];
					if(self.isin(p,ps)) rst.push([adj,i]);
				}
			}
			return rst;
		},
		isin: function (p, ps) {
            var len = ps.length, left = 0,  n = 0;
            if (len < 3) return false;
            if (len == 4 && self.isPsLine(ps[0], ps[1], ps[2])) return false;
            for (var i = 0; i < len; i++) {
                var p1 = ps[i], p2 = (i == (len - 1)) ? ps[0] : ps[i + 1];
                //fuu,判断在一条线上的函数有问题
                //if (T.fn[me.funKey].isPsLine(p, p1, p2)) return true

                if (p1[0] < left) left = p1[0];
            }
            for (var i = 0; i < len; i++) if (self.isCross([(left - 1), p[1]], p, ps[i], (i == (len - 1)) ? ps[0] : ps[i + 1])) n++;
            if (n % 2 > 0) return true;
            return false;
        },
        isPsLine: function (a, b, c) {return Math.round((a[1] - b[1]) * (a[0] - c[0])*100) == Math.round((a[0] - b[0]) * (a[1] - c[1]) * 100)?true:false},
        isCross: function (a, b, c, d) {
            var abc = (a[0] - c[0]) * (b[1] - c[1]) - (a[1] - c[1]) * (b[0] - c[0]), abd = (a[0] - d[0]) * (b[1] - d[1]) - (a[1] - d[1]) * (b[0] - d[0]);
            if (abc * abd >= 0) return false;
            var cda = (c[0] - a[0]) * (d[1] - a[1]) - (c[1] - a[1]) * (d[0] - a[0]), cdb = cda + abc - abd;
            if (cda * cdb >= 0) return false;
            return true;
        },
		getTouchPoint:function(ev){
	    	ev = window.event && window.event.touches ? event.touches[0] : ev;
	   	 	var pos=run.position,sc=run.scroll
	   	 	//console.log(sc)
	   	 	return [ev.clientX-pos.left+sc.left,ev.clientY-pos.top+sc.top];
	   	},
		
		pToBlock:function(p){
			var s=run.scale,os=run.offset,h=config.sideLength
			return [(p[0]-os[0])/s,h-(p[1]-os[1])/s];
		},
		
		blockDrawing:function(tpl){
			//1.计算偏移和缩放
			var size=config.size,w=size.width,h=size.height,bs=config.sideLength,mg=config.marginSkyline;
			var py=config.paddingY,px=config.paddingX
			var side=w>h?h-py-py:w-px-px;
			var ox=(w-side)*0.5,oy=(h-side)*0.5
			run.scale=side/config.sideLength;
			run.offset=[ox,oy];
			if(run.viewpoint=='top'){
				var ps=self.getPointsArray([0,0],[bs,bs])
				self.dwgLine(ps,config.tpl.block);
			}else{
				var pa=[0,mg],pb=[bs,mg];
				self.dwgLine([pa,pb],config.tpl.block)
			}
		},
		
		coinStruct:function(arr,vp){
			//console.log(arr)
			var rst=[];
			if(vp!='top') return rst;
			for(var k in arr){
				var c=arr[k]
				var start=[c[0][0]-0.25,c[0][1]-0.25],end=[c[0][0]+0.25,c[0][1]+0.25]
				rst.push(self.getPointsArray(start,end))
			}
			return rst;
		},
		
		coinShow:function(ps,tpl){
			self.dwgArray(ps,tpl);
		},
		
		lightStruct:function(arr,vp){
			//console.log('ok')
			var rst=[];
			for(var i=0,len=arr.length;i<len;i++){
				var stop=arr[i],size=stop[0],pos=stop[1];
				rst.push(self.viewpointArray(size,pos,vp))
			}
			return rst
		},
		lightShow:function(ps,tpl){
			self.dwgArray(ps,tpl);
		},
		stopStruct:function(arr,vp){
			var rst=[];
			for(var i=0,len=arr.length;i<len;i++){
				var stop=arr[i],size=stop[0],pos=stop[1];
				rst.push(self.viewpointArray(size,pos,vp))
			}
			return rst
		},
		
		stopShow:function(ps,tpl){
			self.dwgArray(ps,tpl);
		},
		
		triggerStruct:function(arr,vp){
			var rst=[];
			for(var i=0,len=arr.length;i<len;i++){
				var stop=arr[i],size=stop[0],pos=stop[1];
				rst.push(self.viewpointArray(size,pos,vp))
			}
			return rst
		},
		
		triggerShow:function(ps,tpl){
			self.dwgArray(ps,tpl);
		},
		
		adjunctStruct:function(arr,vp){
			var rst={};
			for(var mod in arr){
				rst[mod]=[]
				var adjs=arr[mod];
				for(var i=0,len=adjs.length;i<len;i++){
					var stop=adjs[i],size=stop[0],pos=stop[1];
					rst[mod].push(self.viewpointArray(size,pos,vp))
				}
			}
			return rst
		},
		
		adjunctShow:function(adjs,tpl){
			for(var k in adjs){
				self.dwgArray(adjs[k],tpl);
			}
		},

		
		/*基本计算方法*/
		viewpointArray:function(size,pos,vp){
			var bs=config.sideLength,mg=config.marginSkyline;
			switch (vp){
				case 'top':		//顶视图的线框
					var start=[pos[0]-size[0]*0.5,pos[1]-size[1]*0.5],end=[pos[0]+size[0]*0.5,pos[1]+size[1]*0.5];
					break;
				case 'front':
					var start=[pos[0]-size[0]*0.5,mg+pos[2]-size[2]*0.5],end=[pos[0]+size[0]*0.5,mg+pos[2]+size[2]*0.5];
					break;
				case 'left':
					var start=[pos[1]-size[1]*0.5,mg+pos[2]-size[2]*0.5],end=[pos[1]+size[1]*0.5,mg+pos[2]+size[2]*0.5];
					break;
				default:
					break;
			}
			return self.getPointsArray(start,end);
		},
		
		/*viewpointArray:function(size,pos,vp){
			var bs=config.sideLength,mg=config.marginSkyline;
			switch (vp){
				case 'top':		//顶视图的线框
					var start=[pos[0]-size[0]*0.5,pos[1]-size[1]*0.5],end=[pos[0]+size[0]*0.5,pos[1]+size[1]*0.5];
					break;
				case 'front':
					var start=[pos[0]-size[0]*0.5,bs-mg-pos[2]+size[2]*0.5],end=[pos[0]+size[0]*0.5,bs-mg-pos[2]-size[2]*0.5];
					break;
				case 'left':
					var start=[pos[1]-size[1]*0.5,bs-mg-pos[2]+size[2]*0.5],end=[pos[1]+size[1]*0.5,bs-mg-pos[2]-size[2]*0.5];
					break;
				default:
					break;
			}
			return self.getPointsArray(start,end);
		},
		*/
		psToCanvas:function(ps){
			var s=run.scale,nps=[],os=run.offset
			var h=config.sideLength
			for(var i=0,len=ps.length;i<len;i++){
				var p=ps[i];
				//nps.push([p[0]*s+os[0],p[1]*s+os[1]]);
				nps.push([p[0]*s+os[0],(h-p[1])*s+os[1]]);
			}
			return nps;
		},
		getPointsArray:function(pa,pb){
			return [pa,[pb[0],pa[1]],pb,[pa[0],pb[1]]];
		},
		
		dwgArray:function(arr,tpl){
			for(var i=0,len=arr.length;i<len;i++){
				self.dwgLine(arr[i],tpl);
			}
		},
		
		dwgLine:function(ps,tpl){
			var ps=self.psToCanvas(ps);
			pen.lineWidth = tpl.width;
			pen.strokeStyle =tpl.color;
			pen.beginPath();
			for (var i=0,len=ps.length;i<len;i++){
				var p=ps[i];
				if(i==0)pen.moveTo(p[0]+0.5,p[1]+0.5);
				if(i>0 && i<len)pen.lineTo(p[0]+0.5,p[1]+0.5);
			}
			pen.closePath();
			pen.stroke();
		},
		dwgArc:function(cfg,tpl){
			var cen=self.psToCanvas(cfg.center);
			pen.lineWidth = tpl.width;
			pen.strokeStyle =tpl.color;
			pen.beginPath();
			pen.arc( Math.round(cen[0]) + 0.5, Math.round(cen[1]) + 0.5,cfg.r*run.scale,cfg.start,cfg.end);
			pen.stroke();
		},

		fillPolygon:function(ps,tpl){
			var ps=self.psToCanvas(ps);
			pen.globalAlpha=tpl.alpha?tpl.alpha:1;
			pen.fillStyle=tpl.color;
			pen.beginPath();
			for (var i=0,len=ps.length;i<len;i++) {
				var p=ps[i];
				if(i==0)pen.moveTo(p[0]-0.5,p[1]);
				if(i>0 && i<len)pen.lineTo(p[0],p[1]);
			}
			pen.closePath();
			pen.fill();
		},
	
		/**以下为不能正确绘制代码部分**/
		
		dwgDash:function(ps,cfg,tg){
			if(ps.length<2)	return false;
			var len=ps.length,calc=root.calc,dash=calc.dash;
			for(var i=0;i<len;i++){
				var pa=ps[i],pb=i==len-1?ps[0]:ps[i+1];
				var ds=dash([pa,pb],cfg.dis),dlen=ds.length;
				for(var j=0;j<dlen;j++){
					self.dwgLine(ds[j],cfg,tg);
				}
			}
		},
		

		dwgTxt:function(txt,cfg,tg){
			var env=run[tg],pen=env.pen,tpl=theme[env.theme];
			var align=cfg.align?cfg.align:'center';
			var zj=Math.PI/2,qj=zj/2,kk=cfg.angle;
			//console.log(txt+','+kk)
			var ak=(kk==Math.PI)?cfg.angle+Math.PI:cfg.angle;
			//console.log(ak)
			is=cfg.help||false;
			var m=root.calc.pBtoC(cfg.pos,env.scale,env.offset,env.pxperm);
			//console.log(cfg)
			pen.save();
			pen.translate(m[0],m[1]);
			pen.rotate(ak);
			pen.fillStyle = cfg.color;
			pen.font = cfg.size*env.multi+'px SimHei';
			pen.textAlign=align;
			pen.fillText(txt,0,0);
			
			if(cfg.help){
				var pw=pen.measureText(txt),w=pw.width;
				var h=cfg.size*env.multi;
				self.dwgHelp({width:w,height:h},tg);
			}
			pen.restore();
		},
		
		dwgImage:function(img,cfg,tg){
			var env=run[tg],pen=env.pen,sd=cfg.shadow;
			var pBtoC=root.calc.pBtoC,disBtoC=root.calc.disBtoC;
			var s=env.scale,o=env.offset,m=env.multi,pp=env.pxperm;
			var cvt=root.core.getConvert(tg);
			var mm=new Image();
			mm.src=img.src;
			var ncen=pBtoC(cfg.center,s,o,pp);
			var w=disBtoC(cfg.width*m,0,s,m,pp),h=disBtoC(cfg.height*m,0,s,m,pp);
			
			pen.save();
			pen.translate(ncen[0],ncen[1]);
			pen.rotate(cfg.rotation);
			pen.shadowOffSetX = sd.offsetX;
			pen.shadowOffsetY = sd.offsetY;
			pen.shadowColor=sd.color;
			pen.shadowBlur = sd.blur;
			if (cfg.mirror) pen.scale(-1, 1);
			pen.drawImage(mm,0,0,mm.width,mm.height,-w/2,-h/2 ,w,h);
			pen.restore();
		},
		

	}
	
	root.regComponent(reg);
})(window.T)
