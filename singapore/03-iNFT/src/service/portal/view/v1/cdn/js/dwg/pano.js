;(function(root){
	var reg={
		name:'rdPano',
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
			host:'',
			cubePath:'/source/sky/1024/',
			imageArray: [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ],
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

	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},
		getRun:function(){return run},
		setHost:function(host){config.scene.host=host},
		setPath:function(path){config.scene.cubePath=path},
		
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
			self.pano();
			//run.scene.background = new THREE.Color(scfg.background);

			run.camScale = w / h ;
			run.near=run.near;
			run.far=run.far;
			run.camera = new THREE.PerspectiveCamera(run.fov, run.camScale, run.near, run.far);
			run.camera.aspect= w / h;
			run.raycaster=new THREE.Raycaster();			//webgl_interactive_cubes.html,	Demo位置
			run.mouse=new THREE.Vector2();
			//console.log(run)
			return true;
		},
		
		control:function(){
			var control=new THREE.OrbitControls( run.camera, run.renderer.domElement);
			control.target =new THREE.Vector3( 0, 0,0);
			run.controller = control;
		},

		pano:function(){
			var scfg=config.scene;
			var path=scfg.host+scfg.cubePath
			run.scene.background=new THREE.CubeTextureLoader().setPath(path).load(scfg.imageArray);
			//run.scene.background.rotation=ro;
		},
		/**3D显示入口方法部分**/
		autoShow:function(target){
			self.domInit(target);		//1.初始化three.js的运行环境
			var x=0,y=0,z=0;
			self.setCamera(x,y,z);		//设置相机位置好
			self.ax(3);		//显示坐标轴
			self.show();
			self.start();
			self.control();				//2.加载控制器
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
			//console.log('module size['+x+','+y+','+z+']')
			run.camera.position.set(x+10,y+10,z);		//2倍距离于物体
			var cen=new THREE.Vector3( 0, 0,0 );
			run.camera.lookAt(cen);
		},
		
		/**渲染功能处理**/
		show:function(){$('.'+run.renderTarget).css('display','');},
		hidden:function(){$('.'+run.renderTarget).css('display','none');},
		stop:function(){window.cancelAnimationFrame(run.request);},
		start:function(){run.request=window.requestAnimationFrame(self.animate);},
		
		animate:function(){
			run.renderer.render(run.scene,run.camera);	
			if(run.controller!=null)run.controller.update();
			run.request=window.requestAnimationFrame(self.animate);	
		},
	}
	
	root.regComponent(reg);
})(window.T)
