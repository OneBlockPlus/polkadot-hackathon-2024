;(function(root){
	var reg={
		name:'two',
		type:'lib',
		hooks:[],		//注册到fn下的方法,这样其他的组件就可以直接调用
		loops:[],		//注册循环启动函数，framework开始启动
		autoRun:'init',
		version:1,
		auth:['fuu'],
	};
	
	var hash=root.hash;		//随机key,需要多次使用
	
	var theme={};
	
	var config={
		intro:'2D绘制的基础函数',					//渲染器说明
	}
	
	var me=root.getConfig();
	var pen=null,run=null;
	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},
		getRun:function(){return run},
		setPen:function(cvs){pen=cvs;},
		setRun:function(env){run=env},
		setGlobalAlpha:function(val){pen.globalAlpha = val;},
		
		fillPolygon:function(ps,cfg){
			var cfg=cfg||{};
			var s=run.scale,o=run.offset,px=run.pxperm;
			var h=cfg.anticlock?run.height*run.multi:0;
			
			var pBtoC=root.calc.pBtoC;
			var c=cfg.mask?cfg.mask:(cfg.color||'#EEEEEE');
			
			pen.globalAlpha=cfg.alpha?cfg.alpha:1;
			pen.fillStyle=c;
			pen.beginPath();
			for (var i=0,len=ps.length;i<len;i++) {
				var p=pBtoC(ps[i],s,o,px,h);
				if(i==0)pen.moveTo(p[0]+0.5,p[1]+0.5);
				if(i>0 && i<len)pen.lineTo(p[0]+0.5,p[1]+0.5);
			}
			pen.closePath();
			pen.fill();
			pen.globalAlpha=1;
		},
		
		dwgLine:function(ps,cfg){
			var cfg=cfg||{};
			var s=run.scale,o=run.offset,px=run.pxperm,m=run.multi;
			//console.log(run)
			var pBtoC=root.calc.pBtoC;
			var h=cfg.anticlock?run.height*run.multi:0;			//C坐标系的画布高度
			//console.log('画布高度:'+h);
			pen.lineWidth = cfg.width;
			pen.strokeStyle = cfg.color;
			pen.beginPath();
			for (var i=0,len=ps.length;i<len;i++){
				var p=pBtoC(ps[i],s,o,px,h);
				if(i==0)pen.moveTo(p[0]+0.5,p[1]+0.5);
				if(i>0 && i<len)pen.lineTo(p[0]+0.5,p[1]+0.5);
			}
			pen.closePath();
			pen.stroke();
		},
		
		dwgWord:function(txt,cfg,tg){
			var h=cfg.anticlock?run.height*run.multi:0;			//C坐标系的画布高度
			var m=root.calc.pBtoC(cfg.pos,run.scale,run.offset,run.pxperm,h);
			pen.save();
			pen.translate(m[0],m[1]);
			pen.fillStyle = cfg.color;
			pen.font = cfg.size*run.multi+'px SimHei';
			pen.textAlign=cfg.align?cfg.align:'start';
			pen.fillText(txt,0,0);
			pen.restore();
		},
		
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
		
		//填充圆弧的方法
		//注意，角度已经进行过处理
		fillArc:function(param,cfg){
			var s=run.scale,o=run.offset,px=run.pxperm,ro=0,m=run.multi,zj=Math.PI/2
			var h=cfg.anticlock?run.height*run.multi:0;
			var calc=root.calc,pBtoC=calc.pBtoC,disBtoC=calc.disBtoC,anClear=calc.anClean
			var c=pBtoC(param.center,s,o,px,h),r=disBtoC(param.radius,ro,s,m,px);
			var s=anClear(param.start),e=anClear(param.end)
			//console.log(r)
			if(cfg.grad){
				//console.log(cfg.grad)
				var grd=pen.createRadialGradient(c[0],c[1],1,c[0],c[1],r);
				for(var i=0,len=cfg.grad.length;i<len;i++){
					var stop=cfg.grad[i];
					grd.addColorStop(stop[0],stop[1]);
				}
			}
			
			pen.beginPath();
			pen.fillStyle=cfg.grad?grd:cfg.color;
			pen.strokeStyle=cfg.color;
			pen.moveTo(c[0], c[1]);
			pen.arc(c[0], c[1],r,s,e);
			pen.closePath();
			pen.fill();
			
		},
		
		dwgArc:function(d,cfg){
			var h=cfg.anticlock?run.height*run.multi:0;
			var cc=root.calc.pBtoC(d.center,run.scale,run.offset,run.pxperm,h);
			var rr=root.calc.disBtoC(d.radius,0,run.scale,run.multi,run.pxperm);
			pen.beginPath();
			pen.strokeStyle=cfg.color;
			pen.arc( Math.round(cc[0]), Math.round(cc[1]),rr,d.start,d.end);	
			pen.stroke();
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
