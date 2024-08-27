;(function(root){
	var reg={
		name:'rdObserve',
		type:'render',
		hooks:[],		//注册到fn下的方法,这样其他的组件就可以直接调用
		loops:[],		//注册循环启动函数，framework开始启动
		autoRun:'init',
		version:1,
		auth:['fuu'],
	};
	
	var hash=root.hash;		//随机key,需要多次使用
	
	var theme={};
	
	var config={
		intro:'观察渲染器',		//渲染器说明
		//fix:[Math.PI/2,0,0],			//相机位置修正
		fix:[0,Math.PI/2,0],			//相机位置修正
		scene:{
			background:0xf0f0f0,
		},
	}
	
	var me=root.getConfig();
	
	var run={
		renderTarget:hash(),		//包裹渲染器的div名称
		canvasID:hash(),
		fov:85,					//相机视角
		near:0.01,				//相机近点
		far:1000,				//相机远点
		structed:false,		//场景dom是否构建的标志位
		scene:null,			//场景对象
		renderer:null,		//渲染对象
		camScale:0,			//相机的显示比例
		camera:null,			//圆相机
		raycaster:null,		//触控检测对象
		mouse:null,			//输入位置对象
		stats:null,				//帧数显示对象,正式版关闭
		request:null,			//动画的指针,用来停止动画
		interval:null,
		controller:null,			//配置的控制器
		checkEnable:false,	//3D空间检测使能
	}

	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},
		getRun:function(){return run},

		domInit:function(target){
			run.target=target
			//1.构建基本的dom环境
			var rd = new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
			rd.setPixelRatio(window.devicePixelRatio);		//支持retain屏幕的配置
			
			var sel=$(target),w=sel.width(),h=sel.height()
			rd.setSize(w,h);		//设置显示尺寸
			
			var dom='<div class="'+run.renderTarget+'"></div>';
			sel.html(dom).find('.'+run.renderTarget).css({'display':'none'}).html(rd.domElement).find('canvas').attr('id',run.canvasID);
			run.container=sel.find('.'+run.renderTarget);
			
			//2.建立好3D环境
			var scfg=config.scene;
			run.renderer=rd;
			run.scene=new THREE.Scene();
			run.scene.background = new THREE.Color(scfg.background);

			var cvt=root.core.getConvert();
			run.camScale = w / h ;
			run.near=run.near*cvt;
			run.far=run.far*cvt;
			
			run.camera = new THREE.PerspectiveCamera(run.fov, run.camScale, run.near, run.far);		//透视相机
			
			/*var s=0.5*(me.core.world.sideLength+8);
			run.camera = new THREE.OrthographicCamera( -s * run.camScale , s * run.camScale, s , -s, run.near, run.far );*/			
			
			run.raycaster=new THREE.Raycaster();			//webgl_interactive_cubes.html,	Demo位置
			run.mouse=new THREE.Vector2();
			
			return true;
		},
		
		control:function(){
			var control=new THREE.OrbitControls( run.camera, run.renderer.domElement);
			//console.log(control)
			var p=root.core.getPlayerStatus(),pos=p.position
			var x=p.block[0],y=p.block[1],side=me.core.world.sideLength,cvt=root.core.getConvert()
			control.target =new THREE.Vector3( side*(x-0.5), side*(y-0.5),pos[2]+2*cvt);
			//control.maxPolarAngle = -Math.PI / 2
			//console.log(control.getPolarAngle())
			/*control.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
			control.dampingFactor = 0.25;
			control.screenSpacePanning = false;
			control.minDistance = 100;
			control.maxDistance = 500
			control.maxPolarAngle = Math.PI / 2;*/
			
			run.controller = control;
		},
		
		/**3D显示入口方法部分**/
		autoShow:function(x,y,target,ext){
			self.domInit(target);		//1.初始化three.js的运行环境
			self.control();		//2.加载控制器
			root.render.setScene(run.scene,target);
			//1.处理好需要的材质
			root.render.structTexture(function(){
				
				var ext=ext||0;
				self.structRange(x,y,target,ext);
				self.show();		//去除容器的隐藏属性
				self.stop();		//清理定时器			
				self.setCamera();
				self.start();
			});
		},
		
		//这里是为了多地块的观察者模式
		/*以X,Y为起点，构建一片范围，这个方法需要重写
		 * @param	x			number	//土地块的x编号
		 * @param	y			number	//土地块的y编号
		 * @param extend	number	//中心向外扩展的值
		 * 
		 * */
		structRange:function(x,y,target,extend){
			var fun=root.render.struct
			var extend=extend||0;
			if(extend==0) return fun(x,y,target,false);
			for(var i=-extend;i<extend+1;i++){
				for(var j=-extend;j<extend+1;j++){
					fun(x+i,y+j,target,false);
				}
			}
		},
		
		thumb:function(tag){
			var ctx=run.renderer.getContext("experimental-webgl",{preserveDrawingBuffer:true});
			var bs=ctx.canvas.toDataURL("image/jpeg");
			if(tag){
				var img = new Image();
				img.src = bs;
				return img;
			}
			return bs;
		},
		
		setCamera:function(){
			
			var p=root.core.getPlayerStatus(),pos=p.position,ros=p.rotation,fix=config.fix
			var x=p.block[0],y=p.block[1],side=me.core.world.sideLength,cvt=root.core.getConvert()
			
			run.camera.position.set(side*(x-0.5), side*(y-0.5),pos[2]+10*cvt);
			run.camera.rotation.set(ros[0]+fix[0],ros[1]+fix[1],ros[2]+fix[2]);		//注意对相机的修正
			var cen=new THREE.Vector3( side*(x-0.5), side*(y-0.5),pos[2] );
			run.camera.lookAt(cen);
			//console.log(JSON.stringify(run.camera.position))
		},
		

		/*处理3D场景内的内容更新*/
		
		/****检测场景中选中组件的命令****/
		check:function(mouse){
			if(!run.checkEnable) return false;
			run.raycaster.setFromCamera(mouse,run.camera);
			return run.raycaster.intersectObjects(run.scene.children);
		},
		enableCheck:function(){run.checkEnable=true},
		disableCheck:function(){run.checkEnable=false},
		/**渲染功能处理**/
		show:function(){$('.'+run.renderTarget).css('display','');},
		hidden:function(){$('.'+run.renderTarget).css('display','none');},
		stop:function(){window.cancelAnimationFrame(run.request);},
		start:function(){
			//run.renderer.render(run.scene,run.camera);		//只渲染1次
			run.request=window.requestAnimationFrame(self.animate);
		},
		
		animate:function(){
			run.renderer.render(run.scene,run.camera);	
			if(run.controller!=null)run.controller.update();
			run.request=window.requestAnimationFrame(self.animate);	
		},
	}
	
	root.regComponent(reg);
})(window.W)
