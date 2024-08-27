;(function(root){
	var reg={
		name:'rdTemplate',
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
		intro:'量子组件渲染器',		//渲染器说明
		fix:[Math.PI/2,0,0],			//相机位置修正
		scene:{
			background:0xf0f0f0,
		},
		face:['left','front','right','back','top','bottom'],			//各个面的严格定义
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
		data:null,					//需要显示的数据
		pattern:[0,0,0,0,0,0],	//量子状态
		size:[],						//量子的尺寸
	}
	

	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
		},
		getRun:function(){return run},
		setData:function(dt){
			run.data=root.clone(dt);
		},
		setPattern:function(fmt){
			run.pattern=root.clone(fmt);
		},
		
		hideObject:function(type){
			for(var k in run.scene.children){
				if(run.scene.children[k].userData.type==type)run.scene.children[k].visible=false;				
			}
		},
		showObject:function(type){
			for(var k in run.scene.children){
				if(run.scene.children[k].userData.type==type)run.scene.children[k].visible=true;				
			}
		},
		/*构建3D的dom部分程度参数
		 *	@param	size	array		//[x,y,z]类型的量子模板的尺寸
		 * @param	target	string	//绘制容器
		 * 
		 * */
		domInit:function(size,target){
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


			run.near=run.near;
			run.far=run.far;
			var x=size[0],y=size[1],z=size[2];
			run.camera = new THREE.OrthographicCamera( -x, x, y, -y, run.near, run.far );

				
			run.raycaster=new THREE.Raycaster();			//webgl_interactive_cubes.html,	Demo位置
			run.mouse=new THREE.Vector2();
			
			return true;
		},
		
		control:function(){
			var control=new THREE.OrbitControls( run.camera, run.renderer.domElement);
			control.target =new THREE.Vector3(0,0,0);
			run.controller = control;
			$(run.target).off('click').on('click',function(ev){
				//console.log('ready...')
				var mouse=self.getVectorPoint(ev);
				run.raycaster.setFromCamera(mouse,run.camera);
				var objs=run.raycaster.intersectObjects(run.scene.children);
				if(objs.length>0){
					console.log('这里检测3D空间操作')
				}
			})
		},
		getVectorPoint:function(ev){
			ev = window.event && window.event.touches ? event.touches[0] : ev;
			var mouse = new THREE.Vector2();
			mouse.x = (ev.clientX/window.innerWidth)*2 -1;
			mouse.y = -(ev.clientY/window.innerHeight)*2 + 1;
			return mouse;
		},
		
		setCamera:function(x,y,z){
			run.camera.position.set(0,0,y+1);		//2倍距离于物体
			//run.camera.rotation.set(-0.754,0.444,0.383);
		},
		
		/*3D自动绘制的入口
		 *	@param	size	array		//[x,y,z]类型的量子模板的尺寸
		 * @param	target	string	//绘制容器
		 * 
		 * */
		autoShow:function(size,target){
			//console.log(run.pattern)
			self.domInit(size,target);		//1.初始化three.js的运行环境
			run.size=root.clone(size);
			var x=size[0],y=size[1],z=size[2];
			self.setLight(x,y,z);			//显示辅助框			
			self.helpBox(x,y,z);		//显示辅助框
			self.ax(4,x,y,z);					//显示坐标轴
			var dt=self.getShowData();
			self.struct(dt);//构建显示的数据
			self.show();
			self.start();
			self.control();				//2.加载控制器
			self.setCamera(x,y,z);	//设置相机位置好
		},
		
		getShowData:function(){
			var rst={}
			for(var i in run.pattern){
				var k=config.face[i],row=run.data[run.pattern[i]][k];
				for(var mod in row){
					if(rst[mod]===undefined){
						rst[mod]=root.clone(row[mod]);
					}else{
						for(var j in row[mod])rst[mod].push(root.clone(row[mod][j]));
					}
				}
			}
			return rst;
		},
		
		updateData:function(data,pattern){
			run.data=data;
			run.pattern=pattern;
			self.clear();
			var dt=self.getShowData();
			self.struct(dt);//构建显示的数据
			self.setLight(x,y,z);			//显示辅助框			
			self.helpBox(x,y,z);		//显示辅助框
			self.ax(4,x,y,z);					//显示坐标轴
		},
		
		clear:function(){
			var scene=run.scene,chs=scene.children;
			if(scene!=null && chs.length!=0){
				var rst=[]
				for(var i in chs)	rst.push(chs[i]);
				for(var i in rst)scene.remove(rst[i]);
			}
		},
		
		struct:function(dt){
			for(var mod in dt){
				if(self[mod+'Struct']){
					self[mod+'Struct'](mod,dt[mod]);
				}else{
					self.defaultStruct(mod,dt[mod]);	
				}
			}
		},
		
		stopStruct:function(mod,arr){
			var x=run.size[0],y=run.size[1],z=run.size[2];
			var mm=new THREE.LineBasicMaterial({color:'#00FFFF'});
			for(var i in arr){
				var row=arr[i],bs=row[0],bp=row[1];
				var gg = new THREE.BoxBufferGeometry(bs[0], bs[2], bs[1]);
				var eg=new THREE.EdgesGeometry(gg);
				
				var eline=new THREE.LineSegments(eg,mm);	
				eline.position.set(bp[0]-x/2,bp[2]-z/2,-bp[1]+y/2);
				eline.userData={type:mod,id:parseInt(i)};		//写入属于，用于显示显示不同类型的组件
				run.scene.add(eline);
			}
		},
		wallStruct:function(mod,arr){
			var x=run.size[0],y=run.size[1],z=run.size[2];
			var mm=new THREE.LineBasicMaterial({color:'#C0CFFF'});
			for(var i in arr){
				var row=arr[i],bs=row[0],bp=row[1];
				var gg = new THREE.BoxBufferGeometry(bs[0], bs[2], bs[1]);
				var eg=new THREE.EdgesGeometry(gg);
				
				var eline=new THREE.LineSegments(eg,mm);	
				eline.position.set(bp[0]-x/2,bp[2]-z/2,-bp[1]+y/2);
				eline.userData={type:mod,id:parseInt(i)};		//写入属于，用于显示显示不同类型的组件
				//console.log(eline)
				run.scene.add(eline);
			}
		},
		importerStruct:function(mod,arr){
			var x=run.size[0],y=run.size[1],z=run.size[2];
			var mm=new THREE.LineBasicMaterial({color:'#30CFDD'});
			for(var i in arr){
				var row=arr[i],bs=row[0],bp=row[1];
				var gg = new THREE.BoxBufferGeometry(bs[0], bs[2], bs[1]);
				var eg=new THREE.EdgesGeometry(gg);
				
				var eline=new THREE.LineSegments(eg,mm);	
				eline.position.set(bp[0]-x/2,bp[2]-z/2,-bp[1]+y/2);
				eline.userData={type:mod,id:parseInt(i)};		//写入属于，用于显示显示不同类型的组件
				console.log(eline)
				run.scene.add(eline);
			}
		},
		defaultStruct:function(mod,arr){
			var x=run.size[0],y=run.size[1],z=run.size[2];
			var mm=new THREE.LineBasicMaterial({color:'#FFFFFF'});
			for(var i in arr){
				var row=arr[i],bs=row[0],bp=row[1];
				var gg = new THREE.BoxBufferGeometry(bs[0], bs[2], bs[1]);
				var eg=new THREE.EdgesGeometry(gg);
				
				var eline=new THREE.LineSegments(eg,mm);	
				eline.position.set(bp[0]-x/2,bp[2]-z/2,-bp[1]+y/2);
				eline.userData={type:mod,id:parseInt(i)};		//写入属于，用于显示显示不同类型的组件
				//console.log(eline)
				run.scene.add(eline);
			}
		},
		
		//添加helpbox到场景里
		helpBox:function(x,y,z){
			var mm=new THREE.LineBasicMaterial({color:'#FF0000',opacity:0.3,transparent:true});
			var gg = new THREE.BoxBufferGeometry(x, z, y);
			var eg=new THREE.EdgesGeometry(gg);
			
			var eline=new THREE.LineSegments(eg,mm);		//直接可以加载到scene的
			eline.userData={type:'helper'};
			run.scene.add(eline);
		},
		
		ax:function(w,x,y,z){
			var h=0.5*w,xh=0.01;
			var mx=new THREE.LineBasicMaterial({color:'#FF0000'});
			var my=new THREE.LineBasicMaterial({color:'#0000FF'});
			var mz=new THREE.LineBasicMaterial({color:'#00FF00'});
			var gx = new THREE.BoxBufferGeometry(w,xh,xh);
			var gy = new THREE.BoxBufferGeometry(xh,w,xh);
			var gz = new THREE.BoxBufferGeometry(xh,xh,w);
			var zx=new THREE.Mesh(gx, mx);
			zx.position.set(h,0,0);
			
			var zy=new THREE.Mesh(gy, my);
			zy.position.set(0,h,0);
			
			var zz=new THREE.Mesh(gz, mz);
			zz.position.set(0,0,-h);		
			
			var group=new THREE.Group();
			group.add(zx);
			group.add(zy);
			group.add(zz);
			group.position.set(-x/2,-z/2,y/2);		//z和x互换，z的位置反转！important
			group.userData={type:'ax'};
			
			run.scene.add(group);
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
		
		setLight:function(x,y,z){
			var light=new THREE.PointLight('#FFFFFF',3,4*y);
			light.position.set(0,y+y,0);
			var help=new THREE.PointLightHelper( light,0.1,0xCCFFBB);
			light.userData={type:'light'};
			help.userData={type:'light'};
			run.scene.add(light);
			run.scene.add(help);
			
			var light=new THREE.PointLight('#FFFFFF',3,4*y);
			light.position.set(0,-y-y,0);
			var help=new THREE.PointLightHelper( light,0.1,0xCCFFBB);
			light.userData={type:'light'};
			help.userData={type:'light'};
			run.scene.add(light);
			run.scene.add(help);
			
			var light=new THREE.PointLight('#FFFFFF',3,4*y);
			light.position.set(-x-x,0,0);
			var help=new THREE.PointLightHelper( light,0.1,0xCCFFBB);
			light.userData={type:'light'};
			help.userData={type:'light'};
			run.scene.add(light);
			run.scene.add(help);
			
			var light=new THREE.PointLight('#FFFFFF',3,4*y);
			light.position.set(x+x,0,0);
			var help=new THREE.PointLightHelper( light,0.1,0xCCFFBB);
			light.userData={type:'light'};
			help.userData={type:'light'};
			run.scene.add(light);
			run.scene.add(help);
			
			var light=new THREE.PointLight('#FFFFFF',3,4*y);
			light.position.set(0,0,z+z);
			var help=new THREE.PointLightHelper( light,0.1,0xCCFFBB);
			light.userData={type:'light'};
			help.userData={type:'light'};
			run.scene.add(light);
			run.scene.add(help);
			
			var light=new THREE.PointLight('#FFFFFF',3,4*y);
			light.position.set(0,0,-z-z);
			var help=new THREE.PointLightHelper( light,0.1,0xCCFFBB);
			light.userData={type:'light'};
			help.userData={type:'light'};
			run.scene.add(light);
			run.scene.add(help);
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
