;(function(root){
	var reg={
		name:'rdTerrain',
		type:'render',
		hooks:[],		//注册到fn下的方法,这样其他的组件就可以直接调用
		loops:[],		//注册循环启动函数，framework开始启动
		autoRun:'init',
		version:1,
		auth:['fuu'],
	};
	
	var hash=root.hash;		//随机key,需要多次使用
	var config={
		intro:'地形渲染查看器',		//渲染器说明
		scene:{
			background:0xf0f0f0,
		},
		world:{								//世界的基本配置
			sideLength:16,
		},
	}
	
	var me=root.getConfig();
	var cache={material:{}};
	
	var run={
		renderTarget:hash(),		//包裹渲染器的div名称
		canvasID:hash(),				//canvas的id
		fov:85,						//相机视角
		near:0.1,					//相机近点
		far:2000,					//相机远点
		structed:false,			//场景dom是否构建的标志位
		scene:null,				//场景对象
		renderer:null,			//渲染对象
		camScale:0,				//相机的显示比例
		camera:null,				//圆相机
		raycaster:null,			//触控检测对象
		mouse:null,				//输入位置对象
		stats:null,					//帧数显示对象,正式版关闭
		request:null,				//动画的指针,用来停止动画
		controller:null,			//配置的控制器
		checkEnable:false,	//3D空间检测使能
		structed:false,			//dom是否构建的标志位
		
		start:[0,0],					//数据开始的位置
		extend:[0,0],				//数据范围
		data:null,					//需要显示的range的数据
		showConfig:{},			//组件是否显示的配置
	}
	

	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},
		
		getRun:function(){return run},
		setStart:function(start){run.start=root.clone(start)},
		setExtend:function(ex){run.extend=root.clone(ex)},
		setData:function(dt){run.data=root.clone(dt)},
		setShowConfig:function(cfg){run.showConfig=root.clone(cfg)},
		hideObject:function(type){for(var k in run.scene.children)if(run.scene.children[k].userData.type==type)run.scene.children[k].visible=false;},
		showObject:function(type){for(var k in run.scene.children)if(run.scene.children[k].userData.type==type)run.scene.children[k].visible=true;	},
		
		domInit:function(target){
			var sel=$(target),w=sel.width(),h=sel.height();
			run.camScale =w/h;
			console.log('width:'+w+',height:'+h);
			run.target=target
			//1.渲染器准备
			var rd = new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
			rd.setPixelRatio(window.devicePixelRatio);		//支持retain屏幕的配置
			rd.setSize(w,h);							//设置显示尺寸
			run.renderer=rd;
		
			var dom='<div class="'+run.renderTarget+'"></div>';
			sel.html(dom).find('.'+run.renderTarget).css({'display':'none'}).html(rd.domElement).find('canvas').attr('id',run.canvasID);
			run.container=sel.find('.'+run.renderTarget);
			
			//2.scene准备
			var scfg=config.scene;
			run.scene=new THREE.Scene();
			run.scene.background = new THREE.Color(scfg.background);
			
			//3.camera准备
			run.near=run.near;
			run.far=run.far;
			//run.camera = new THREE.PerspectiveCamera(run.fov, run.camScale, run.near, run.far);
			
			//var ext=run.extend,s=config.world.sideLength;
			//var x=s*ext[0],y=s*ext[1];
			run.camera = new THREE.OrthographicCamera( -w*0.5, w*0.5, h*0.5, -h*0.5, run.near, run.far );
			
			run.raycaster=new THREE.Raycaster();			//webgl_interactive_cubes.html,	Demo位置
			run.mouse=new THREE.Vector2();
			
			return true;
		},
		
		control:function(){
			var control=new THREE.OrbitControls( run.camera, run.renderer.domElement);
			var s=config.world.sideLength;
			var x=s*run.start[0],y=s*run.start[1];
			control.target =new THREE.Vector3(x,y,0);
			run.controller = control;
			$(run.target).off('click').on('click',function(ev){
				//console.log('click')
				var mouse=self.getVectorPoint(ev);
				run.raycaster.setFromCamera(mouse,run.camera);
				var objs=run.raycaster.intersectObjects(run.scene.children);
				if(objs.length>0){
					var obj=objs[0];
					console.log('这里检测3D空间操作');
					
				}
			})
		},

		/**3D显示入口方法部分**/
		autoShow:function(target){
			if(!run.structed) self.domInit(target);		//1.初始化three.js的运行环境
			else self.stop();

			if(run.data!=null) self.struct();//构建显示的数据
			self.show();
			self.setLight();
			self.setCamera();			//设置相机位置好
			self.control();
			self.start();
		},
				
		setCamera:function(){
			if(run.start[0]<1 || run.start[1]<1) return false;
			var s=config.world.sideLength;
			var cx=s*(run.start[0]-0.5),cy=s*(run.start[1]-0.5);
			run.camera.position.set(cx,cy,s*10);		//2倍距离于物体
			//console.log('相机位置:'+JSON.stringify([cx,cy,s*10]))
		},
		setLight:function(){
			if(run.start[0]<1 || run.start[1]<1) return false;
			var s=config.world.sideLength;
			var cx=s*(run.start[0]-0.5),cy=s*(run.start[1]-0.5);
			var light = new THREE.HemisphereLight('#FFFFFF','#FFFFFF',2);
			light.position.set(cx,cy,s*10);
			light.userData={type:'sun'};
			run.scene.add(light);
		},
		clear:function(){
			
		},
		
		struct:function(){
			if(run.start[0]<1 || run.start[1]<1) return false;
			self.blockStruct();
			var scfg=run.showConfig;
			if(scfg.stop)self.stopStruct();
			if(scfg.trigger)self.triggerStruct();
			if(scfg.adjunct)self.adjunctStruct();
			if(scfg.light)self.lightStruct();
		},
		//block的位置计算,先把这个计算对
		blockStruct:function(){
			var s=config.world.sideLength;
			var sx=run.start[0],sy=run.start[1];
			for(var x in run.data){
				for(var y in run.data[x]){
					var row=run.data[x][y],ele=row.elevation;
					if(!row.base)row.base=[s*(x-0.5),s*(y-0.5),ele]
					var color=(x==sx && y==sy)?'#FFEEEE':(row.preter=='water'?'#EEEEFF':'#EEFFEE');
					var info={x:parseInt(x),y:parseInt(y),type:'block'};
					self.threeBox([s,s,ele],[row.base[0],row.base[1],row.base[2]*0.5],[0,0,0],{color:color,opacity:1,type:'solid'},info);
				}
			}
		},
		stopStruct:function(){
			var empty=root.empty;
			for(var x in run.data){
				for(var y in run.data[x]){
					var row=run.data[x][y],bs=row.base;
					if(!empty(row.stop)){
						console.log('struct stop...')
					}
				}
			}
		},
		triggerStruct:function(){
			var empty=root.empty;
			for(var x in run.data){
				for(var y in run.data[x]){
					var row=run.data[x][y],bs=row.base;
					if(!empty(row.trigger)){
						console.log('struct trigger...')
					}
				}
			}
		},
		adjunctStruct:function(){
			var empty=root.empty;
			for(var x in run.data){
				for(var y in run.data[x]){
					var row=run.data[x][y],bs=row.base;
					if(!empty(row.adjunct)){
						console.log('struct adjunct...')
					}
				}
			}
		},
		lightStruct:function(){
			var empty=root.empty;
			for(var x in run.data){
				for(var y in run.data[x]){
					var row=run.data[x][y],bs=row.base;
					if(!empty(row.light)){
						console.log('struct light...')
					}
				}
			}
		},
		
		
		//注意,这里会对block进行y和z的位置进行互换,这样控制器能正常使用
		threeBox:function(size,pos,ro,cfg,info){
			//console.log(pos)
			var gg = new THREE.BoxBufferGeometry(size[0], size[1], size[2]);
			var mm=self.getLineBasicMaterial(cfg.color,cfg.opacity);
			switch (cfg.type){
				case 'solid':
					var xx = new THREE.Mesh(gg, mm);
					xx.position.set(pos[0],pos[1],pos[2]);
					xx.rotation.set(ro[0],ro[1],ro[2]);
					xx.userData=info;
					break;
					
				case 'edge':
				
					break;
					
				default:
					var xx = new THREE.Mesh(gg, mm);
					xx.position.set(pos[0],pos[1],pos[2]);
					xx.rotation.set(ro[0],ro[1],ro[2]);
					xx.userData=info;
					break;
			}
			run.scene.add(xx);
		},
		
		getLineBasicMaterial:function(color,opacity){
			var pre='color_',k=pre+color+(opacity?('_'+opacity):'');
			var rst=cache.material[k];
			if(rst==undefined){
				var cfg=opacity?{color:color,opacity:opacity,transparent:true}:{color:color}
				var rst=new THREE.LineBasicMaterial(cfg);
				cache.material[k]=rst;
			}
			return rst;
		},
		
		getVectorPoint:function(ev){
			ev = window.event && window.event.touches ? event.touches[0] : ev;
			var mouse = new THREE.Vector2();
			mouse.x = (ev.clientX/window.innerWidth)*2 -1;
			mouse.y = -(ev.clientY/window.innerHeight)*2 + 1;
			return mouse;
		},
		
		/**渲染功能处理**/
		show:function(){$('.'+run.renderTarget).show();},
		hidden:function(){$('.'+run.renderTarget).hide();},
		stop:function(){window.cancelAnimationFrame(run.request);},
		start:function(){run.request=window.requestAnimationFrame(self.animate);},
		
		animate:function(){
			//run.camera.rotation.z+=0.01
			//console.log(run.camera.rotation.y)
			run.renderer.render(run.scene,run.camera);	
			if(run.controller!=null)run.controller.update();
			run.request=window.requestAnimationFrame(self.animate);	
		},
	}
	
	root.regComponent(reg);
})(window.T)
