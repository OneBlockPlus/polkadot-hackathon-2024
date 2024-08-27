;(function(root){
	var reg={
		name:'rdDemo',
		type:'render',
		hooks:[],		//注册到fn下的方法,这样其他的组件就可以直接调用
		loops:[],		//注册循环启动函数，framework开始启动
		autoRun:'init',
		version:1,
		auth:['fuu'],
	};
	
	var hash=root.hash;		//随机key,需要多次使用
	
	var theme={};
	var module={};
	
	var config={
		intro:'module渲染器',		//渲染器说明
		fix:[Math.PI/2,0,0],			//相机位置修正
		scene:{
			background:0xf0f0f0,
		},
	}
	var params={
		camera:{
			position:[0,0,0],
			rotation:[0,0,0],
			lookAt:[0,0,0],
		},
		
	}
	
	var me=root.getConfig();
	
	var run={
		renderTarget:hash(),		//包裹渲染器的div名称
		canvasID:hash(),
		fov:85,					//相机视角
		near:0.1,				//相机近点
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
		controller:null,			//配置的控制器
		checkEnable:false,	//3D空间检测使能
	}
	
	var task=[];		//同步任务列表

	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},
		getRun:function(k){
			if(k && run[k]) return run[k];
			return run;
		},
		
		setTask:function(fun){
			task.push(fun);
		},
		runTask:function(){
			if(root.empty(task)) return false;
			var isType=root.isType
			for(var k in task){
				if(isType(task[k],'function')) task[k]();
			}
		},
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

			run.camScale = w / h ;
			run.near=run.near;
			run.far=run.far;
			run.camera = new THREE.PerspectiveCamera(run.fov, run.camScale, run.near, run.far);
			run.camera.aspect= w / h;
			run.camera.name='main';
			
			run.raycaster=new THREE.Raycaster();			//webgl_interactive_cubes.html,	Demo位置
			run.mouse=new THREE.Vector2();
			
			return true;
		},
		
		/**3D显示入口方法部分**/
		autoShow:function(target){
			self.domInit(target);		//1.初始化three.js的运行环境
			self.setLight(2,3,4);
			self.setCamera(5,5,4);		//设置相机位置好
			self.helpBox(2,3,4);		//显示辅助框
			self.ax(1);		//显示坐标轴
			self.show();
			self.start();
			self.control();				//2.加载控制器
		},
		setLight:function(x,y,z){
			console.log('ok')
			var light=new THREE.PointLight('#FFFFFF',3,z+z+z);
			light.position.set(x,y,z+z);
			run.scene.add(light);
			
			var help=new THREE.PointLightHelper( light,0.5,0xCCFFBB);
			run.scene.add(help);
		},
		
		control:function(){
			var control=new THREE.OrbitControls( run.camera, run.renderer.domElement);
			control.target =new THREE.Vector3( 0, 0,0);
			run.controller = control;
		},
		
		struct:function(obj,ck){
			var type=obj.suffix.toUpperCase();
			if(!root.three['load'+type]) return false;
			var bcfg={position:[0,0,0],scale:[1,1,1],rotation:[0,0,0],userData:{}}
			var ecfg={target:obj.url};
			root.three['load'+type](bcfg,ecfg,function(mm){
				run.scene.add(mm);				//把模型添加到scene
				ck && ck();
			});
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
		
		//添加helpbox到场景里
		helpBox:function(x,y,z){
			var mm=new THREE.LineBasicMaterial({color:'#FF0000',opacity:0.3,transparent:true});
			var gg = new THREE.BoxBufferGeometry(x, y, z);
			var eg=new THREE.EdgesGeometry(gg);
			
			var eline=new THREE.LineSegments(eg,mm);		//直接可以加载到scene的
			var xx = new THREE.Mesh(gg, mm);					//直接可以加载到scene的
			run.scene.add(eline);
			
			//下面是生成1个在世界坐标原点的box
			var gg=new THREE.BoxBufferGeometry(1, 1, 1);
			var xx=new THREE.Mesh(gg, mm);
			run.scene.add(xx)
			
			//另外生成了1个box，位置在z轴上偏移2
			var gg=new THREE.BoxBufferGeometry(1, 1, 1);
			var xx=new THREE.Mesh(gg, mm);
			xx.position.set(0,0,2);		//设置z轴偏移
			run.scene.add(xx)
			
			//另外生成1个绿色的盒子，位置在y轴上偏移2
			var mm=new THREE.LineBasicMaterial({color:'#00FF00',opacity:0.3,transparent:true});
			var gg=new THREE.BoxBufferGeometry(1, 1, 1);
			var xx=new THREE.Mesh(gg, mm);
			xx.position.set(0,2,0);		//设置z轴偏移
			run.scene.add(xx)
			
			//另外生成1个蓝色的盒子，位置在x轴上偏移2
			var mm=new THREE.LineBasicMaterial({color:'#0000FF',opacity:0.3,transparent:true});
			var gg=new THREE.BoxBufferGeometry(1, 1, 1);
			var xx=new THREE.Mesh(gg, mm);
			xx.position.set(2,0,0);		//设置z轴偏移
			run.scene.add(xx)
		},
		
		ax:function(w){
			var h=0.5*w,x=0.01;
			var mx=new THREE.LineBasicMaterial({color:'#FF0000'});
			var my=new THREE.LineBasicMaterial({color:'#00FF00'});
			var mz=new THREE.LineBasicMaterial({color:'#0000FF'});
			var gx = new THREE.BoxBufferGeometry(w,x,x);
			var gy = new THREE.BoxBufferGeometry(x,w,x);
			var gz = new THREE.BoxBufferGeometry(x,x,w);
			var zx=new THREE.Mesh(gx, mx);
			zx.position.set(h,0,0);
			
			var zy=new THREE.Mesh(gy, my);
			zy.position.set(0,h,0);
			
			var zz=new THREE.Mesh(gz, mz);
			zz.position.set(0,0,h);
			
			run.scene.add(zx);
			run.scene.add(zy);
			run.scene.add(zz);
		},
		
		setCamera:function(x,y,z){
			run.camera.position.set(x,y,z);
			run.camera.lookAt(new THREE.Vector3(0,0,3));
		},
		
		/**渲染功能处理**/
		show:function(){$('.'+run.renderTarget).css('display','');},
		hidden:function(){$('.'+run.renderTarget).css('display','none');},
		stop:function(){window.cancelAnimationFrame(run.request);},
		start:function(){run.request=window.requestAnimationFrame(self.animate);},
		
		animate:function(){
			run.renderer.render(run.scene,run.camera);	
			if(run.controller!=null)run.controller.update();
			self.runTask();
			run.request=window.requestAnimationFrame(self.animate);	
		},
	}
	
	root.regComponent(reg);
})(window.T)
