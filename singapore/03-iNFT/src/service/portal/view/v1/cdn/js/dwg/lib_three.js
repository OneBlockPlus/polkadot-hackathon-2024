;(function(root){
	var reg={
		name:'three',
		type:'lib',
		hooks:[],		//注册到fn下的方法,这样其他的组件就可以直接调用
		loops:[],		//注册循环启动函数，framework开始启动
		autoRun:'init',
		version:1,
		auth:['fuu'],
	};
	
	var config={
		intro:'three.js代码汇总，保障其他项目也能用',		//组件显示名称
		render:'rdFirst',													//默认配置使用的渲染器
		loaderPath:'view/v1/cdn/js/loaders/',										//loader的路径
	}
	
	var me=root.getConfig();
	var run=null,timer=null;
	var tLoader=new THREE.TextureLoader();		//纹理加载器,可以重用，不用反复生成
	var raycaster=new THREE.Raycaster();
	
	/*	组件说明
	 *	所有内置物体的解释器，屋顶和地板也靠这个去实现
	 * 	进入房间后的处理的数据，碰撞检测，是否可以踏上去等都在这里处理
	 * 
	 * */
	
	var self=reg[me.funKey]={
		init:function(){
			root.regConfig(config,[reg.name],true);
			
		},
		
		//渲染器调用设置，获取对应渲染器的run
		setRender:function(rd){
			var rnd=rd?rd:config.render;
			run=root[rnd].getRun();
		},
		
		/*3D射线检测方法
		 *@param	mouse		object		//3D的点
		 * @param	camera		object		//three.js的相机
		 * @param	children	array		//需要检测的three.js的mesh的阵列
		 * */
		check:function(mouse,camera,children){
			if(!run.checkEnable) return false;
			raycaster.setFromCamera(mouse,camera);
			return raycaster.intersectObjects(children,true);
		},
		
		
		/*多个mesh生成组的处理*/
		group:function(objs){
			
		},
		
		/*加载器的统一入口，用于统一资源
		 * @param	type		string		//加载器的类型[3ds,fbx,...]
		 * @param	bcfg		obj			//{position:[0,0,0],scale:[0,0,0],rotation:[0,0,0],userData:{}}
		 * @param	ecfg		obj			//直接送给特定loader的参数，每种loader都不同
		 * @param	ck			function	//回调函数
		 * */
		loader:function(x,y,mods,va,ck){
			var rst=[],len=mods.length;
			var s=me.core.world.sideLength;
			
			for(var i=0;i<len;i++){
				var mod=mods[i];mid=mod.mid
				var preter='load'+mod.type.toUpperCase();
				var data=root.core.getModule(mid);
				var ecfg={target:data.url,}
				mod.cfgBasic.position[0]+=s*(x-1);
				mod.cfgBasic.position[1]+=s*(y-1);
				mod.cfgBasic.userData.x=x;
				mod.cfgBasic.userData.y=y;
				
				self[preter](mod.cfgBasic,ecfg,function(obj){
					rst.push(obj);
					if(rst.length==len) ck && ck(rst);
				});
			}
		},
		
		loadJSON:function(bcfg,ecfg,ck){
			var loader = new THREE.ObjectLoader();
 			loader.load( ecfg.target, function ( obj ){
				ck && ck(obj);
			});
		},
		/*OBJ的文件加载器
		 * @param	bcfg		obj			//{position:[0,0,0],scale:[0,0,0],rotation:[0,0,0],userData:{}}
		 * @param	ecfg		obj			//直接送给特定loader的参数，每种loader都不同
		 * @param	ck			function	//回调函数
		 * */
		loadOBJ:function(bcfg,ecfg,ck){
			self.libOBJ(function(){
				var loader = new THREE.OBJLoader();
				loader.load( ecfg.target, function ( obj ) {
					//console.log(bcfg)
					var pos=bcfg.position,sc=bcfg.scale,ro=bcfg.rotation
					obj.position.set(pos[0],pos[1],pos[2]);
					obj.rotation.set(ro[0],ro[1],ro[2]);
					obj.scale.set(sc[0],sc[1],sc[2]);
					obj.userData=bcfg.userData;
					//console.log(obj.children.length)
					if(obj.children.length>0){
						for(var i=0,len=obj.children.length;i<len;i++){
							obj.children[i].userData=bcfg.userData;	
						}
					}
					ck && ck(obj);
				});
			});
		},
		
		/*OBJ Load官方加载的自动加载
		 *	@param	ck		function	//回调函数
		 * */
		libJSON:function(ck){
			if(THREE.OBJLoader===undefined){
				var fa=config.loaderPath+'JSONLoader.js';
				head.load(fa);
				head.ready(function(){ck&&ck()});
			}else{
				ck&&ck();
			}
		},
		
		/*OBJ Load官方加载的自动加载
		 *	@param	ck		function	//回调函数
		 * */
		libOBJ:function(ck){
			if(THREE.OBJLoader===undefined){
				var fa=config.loaderPath+'OBJLoader.js';
				head.load(fa);
				head.ready(function(){ck&&ck()});
			}else{
				ck&&ck();
			}
		},
	
		/*FBX的文件加载器
		 * @param	bcfg		obj			//{position:[0,0,0],scale:[0,0,0],rotation:[0,0,0],userData:{}}
		 * @param	ecfg		obj			//直接送给特定loader的参数，每种loader都不同
		 * @param	ck			function	//回调函数
		 * */
		loadFBX:function(bcfg,ecfg,ck){
			self.libFBX(function(){
				var loader = new THREE.FBXLoader();
				loader.load( ecfg.target, function ( fbx ) {
					//if(fbx.type=='Group' && fbx.children.length==1)fbx=fbx.children[0]
					
					var pos=bcfg.position,sc=bcfg.scale,ro=bcfg.rotation
					fbx.position.set(pos[0],pos[1],pos[2]);
					fbx.rotation.set(ro[0],ro[1],ro[2]);
					fbx.scale.set(sc[0],sc[1],sc[2]);
					fbx.userData=bcfg.userData;
					ck && ck(fbx);
				});
			});
		},
		
		/*FBX Load官方加载的自动加载
		 *	@param	ck		function	//回调函数
		 * */
		libFBX:function(ck){
			if(THREE.FBXLoader==undefined){
				var fa=config.loaderPath+'FBXLoader.js';
				head.load(fa);
				head.ready(function(){ck&&ck()});
			}else{
				ck&&ck();
			}
		},
		
		/*3DS资源文件加载方法
		 * @param	bcfg		obj			//{position:[0,0,0],scale:[0,0,0],rotation:[0,0,0],userData:{}}
		 * @param	ecfg		obj			//{target:filepath,normalMap:filepath,texturePath:filepath,}	{目标资源文件，贴图文件，纹理文件夹位置}
		 * @param	ck			function	//回调函数
		 * */
		load3DS:function(bcfg,ecfg,ck){
			self.lib3DS(function(){
				var loader = new THREE.TDSLoader( );
				loader.setPath( ecfg.texturePath );
				loader.load( ecfg.target, function(mod){
					mod.traverse(function (child){
						var normal = tLoader.load(ecfg.normalMap);
						if(child instanceof THREE.Mesh) child.material.normalMap = normal;
					});
					
					var pos=bcfg.position,sc=bcfg.scale,ro=bcfg.rotation
					mod.position.set(pos[0],pos[1],pos[2]);
					mod.rotation.set(ro[0],ro[1],ro[2]);
					mod.scale.set(sc[0],sc[1],sc[2]);
					mod.userData=bcfg.userData;
					//console.log(ecfg.target)
					ck && ck(mod);
				});
			})
		},
		
		/*3DS Load官方加载的自动加载
		 *	@param	ck		function	//回调函数
		 * */
		lib3DS:function(ck){
			if(THREE.TDSLoader==undefined){
				var fa=config.loaderPath+'TDSLoader.js';
				head.load(fa);
				head.ready(function(){ck&&ck()});
			}else{
				ck&&ck();
			}
		},
		
		//c.加载MMD模型
		/*var bcfg={position:[px+2*cvt,py+2*cvt,pz],scale:[cvt,cvt,cvt],rotation:[Math.PI/2,0,0],userData:{x:x,y:y}}
			var ecfg={
				target:'models/mmd/miku/miku_v2.pmd',
				vmdFiles:[ 'models/mmd/vmds/wavefile_v2.vmd'],
			}
			root.three.loader('MMD',bcfg,ecfg,function(mod){
				run.scene.add(mod)
			});*/
			
		/*MMD资源文件加载方法
		 * @param	bcfg		obj			//{position:[0,0,0],scale:[0,0,0],rotation:[0,0,0],userData:{}}
		 * @param	ecfg		obj			//{target:filepath}	{目标资源文件，贴图文件，纹理文件夹位置}
		 * @param	ck			function	//回调函数
		 * */	
		loadMMD:function(bcfg,ecfg,ck){
			self.libMMD(function(){
				var loader = new THREE.MMDLoader();
				loader.loadWithAnimation( ecfg.target, ecfg.vmdFiles, function ( mmd ) {
					var mod = mmd.mesh;
					var pos=bcfg.position,sc=bcfg.scale,ro=bcfg.rotation
					mod.position.set(pos[0],pos[1],pos[2]);
					mod.rotation.set(ro[0],ro[1],ro[2]);
					mod.scale.set(sc[0],sc[1],sc[2]);
					mod.userData=bcfg.userData;
					ck&&ck(mod)
					
				}, function(){}, function(){});
			})
		},
		
		/*MMD Load官方加载的自动加载
		 *	@param	ck		function	//回调函数
		 * */
		libMMD:function(ck){
			if(THREE.TDSLoader==undefined){
				var fa=config.loaderPath+'MMDLoader.js';
				head.load(fa);
				head.ready(function(){ck&&ck()});
			}else{
				ck&&ck();
			}
		},
		
		/*FBX的文件加载器
		 * @param	bcfg		obj			//{position:[0,0,0],scale:[0,0,0],rotation:[0,0,0],userData:{}}
		 * @param	ecfg		obj			//直接送给特定loader的参数，每种loader都不同
		 * @param	ck			function	//回调函数
		 * */
		loadDAE:function(bcfg,ecfg,ck){
			self.libDAE(function(){
				var loader = new THREE.ColladaLoader();
				loader.load( ecfg.target, function ( dt ) {
					var dae = dt.scene;
					var pos=bcfg.position,sc=bcfg.scale,ro=bcfg.rotation
					dae.position.set(pos[0],pos[1],pos[2]);
					dae.rotation.set(ro[0],ro[1],ro[2]);
					dae.scale.set(sc[0],sc[1],sc[2]);
					dae.userData=bcfg.userData;
					ck && ck(dae);
				});
			});
		},
		
		/*FBX Load官方加载的自动加载
		 *	@param	ck		function	//回调函数
		 * */
		libDAE:function(ck){
			if(THREE.FBXLoader==undefined){
				var fa=config.loaderPath+'ColladaLoader.js';
				head.load(fa);
				head.ready(function(){ck&&ck()});
			}else{
				ck&&ck();
			}
		},
		/***********************************************************************/
		/***********************three.js几何体处理*****************************/
		/***********************************************************************/
		
		/*	统一资源处理数据结构
		* @param	x		number	//block的x坐标
		* @param	y		number	//block的y坐标
		* @param	ges	array		//[obj,obj,...],几何体的列表
		* @param	va	number	//block的坐标高度
		* return
		* array		[threObj,threeObj,...]		//three的标准几何体
		 * */
		geometry:function(x,y,ges,va){
			var s=me.core.world.sideLength;
			var rst=[];
			for(var i=0,len=ges.length;i<len;i++){
				var b=ges[i],type=b.type;
				var pos=b.position,px=s*(x-1)+pos[0],py=s*(y-1)+pos[1],pz=pos[2];
				b.info.x=x;
				b.info.y=y;
				
				switch (type){
					case 'plane':			//平面
						var arr=self.plane({data:b.data,position:[px,py,pz],rotation:b.rotation},b.cfg,b.info);
						for(var j=0,jlen=arr.length;j<jlen;j++)rst.push(arr[j]);
						break;
					
					case 'box':			//立方体
						var arr=self.box({data:b.data,position:[px,py,pz],rotation:b.rotation},b.cfg,b.info);
						for(var j=0,jlen=arr.length;j<jlen;j++)rst.push(arr[j]);
						break;
						
					case 'water':			//水,独立类型
						var arr=self.water({data:b.data,position:[px,py,pz],rotation:b.rotation},b.cfg,b.info);
						for(var j=0,jlen=arr.length;j<jlen;j++)rst.push(arr[j]);
						break;
						
					case	'extrude':		//拉伸体
						
						break;
						
					case	'sphere':		//球体
						
						break;
						
					case	'ring':			//环形		
						
						break;
					case	'character':			//英文字母
						
						break;
					case	'shape':			//形状
						
						break;	
					default:
						break;
				}
			}
			return rst;
		},
		
		//three的不同几何体的实现
		
		/*three.js球体的实现
		 * 
		 */
		sphere:function(b,cfg,info){
			//var geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
		},
		
		/*three.js圆环的实现
		 * 
		 */
		ring:function(b,cfg,info){
			//var geometry = new THREE.RingBufferGeometry( 1, 5, 32 );
		},
		
		/*three.js英文字母的实现
		 * 
		 */
		character:function(b,cfg,info){
			
		},
		
		/*three.js形状的实现
		 * 
		 */
		shape:function(b,cfg,info){
			//var heartShape = new THREE.Shape();
			/*var x = 0, y = 0;
			heartShape.moveTo( x + 5, y + 5 );
			heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
			heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
			heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
			heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
			heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
			heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );*/
			
		},
		cone:function(b,cfg,info){
			//var geometry = new THREE.ConeBufferGeometry( 5, 20, 32 );
		},
		cylinder:function(b,cfg,info){
			//var geometry = new THREE.CylinderBufferGeometry( 5, 5, 20, 32 );
		},
		/*标准的three的water
		 * 需要借助第三方库实现
		 * 
		 * 
		 * */
		water:function(b,cfg,info){
			var rst=[],bs=b.data,pos=b.position,ro=b.rotation;
			var cvt=root.core.getConvert(),fix=0.01*cvt;
			
			var gg = new THREE.PlaneBufferGeometry(bs[0], bs[1]);
			var water = new THREE.Water( gg, {
				color: cfg.color,
				scale: cfg.scale,
				flowDirection: new THREE.Vector2( cfg.flowX, cfg.flowY ),
				textureWidth: 1024,
				textureHeight: 1024,
				normalMap0:root.core.getTextureBuffer(cfg.map0),
				normalMap1:root.core.getTextureBuffer(cfg.map1),
			});
			
			
			water.position.set(pos[0],pos[1],pos[2]+bs[2]+0.1*cvt);
			water.userData=info;
			rst.push(water);
			
			//增加water的背景
			var mm=self.getMeshPhongMaterial(cfg.background,cfg.rpx,cfg.rpy);
			var xx = new THREE.Mesh( gg, mm );
			xx.position.set(pos[0],pos[1],pos[2]+bs[2]/2);			//fuu,这里的位置要调整
			xx.rotation.set(ro[0],ro[2],ro[2]);
			xx.material.map.repeat.set(cfg.rpx,cfg.rpy);
			xx.material.map.wrapS = THREE.RepeatWrapping;
			xx.material.map.wrapT = THREE.RepeatWrapping;
			xx.receiveShadow = true;
					
			xx.userData=info;
			rst.push(xx);
			
			return rst;
		},
		/*生成three的标准面
		 * 需要处理面朝向及定位的问题
		 *
		 * 
		 * */
		plane:function(b,cfg,info){
			var rst=[],bs=b.data,pos=b.position,ro=b.rotation;
			var cvt=root.core.getConvert();
			
			var rpx=cfg.repeat[0]||1,rpy=cfg.repeat[1]||1
			var gg = new THREE.PlaneBufferGeometry(bs[0], bs[1]);
			if(cfg.tid){
				var mm=self.getMeshPhongMaterial(cfg.tid,rpx,rpy);
			}else if(cfg.color){
				var mm=self.getLineBasicMaterial(cfg.color);
				if(cfg.opacity)	mm.opacity=cfg.opacity;
			}
			
			var xx = new THREE.Mesh(gg, mm);
			xx.position.set(pos[0],pos[1],cfg.texture?pos[2]-fix:pos[2]);
			xx.rotation.set(ro[0],ro[1],ro[2]);
			xx.userData=info;
			
			
			rst.push(xx);
			
			return rst;
		},
		
		/*	生成Three标准格子的基础方法,后面根据cfg的情况进行贴图
		 *	@param	b		object	//{data:[x,y,z],position:[x,y,z],rotation:[x,y,z]}类型的数据
		 *	@param	cfg	object	//{color:'#FF0000',opacity:1,help:true,edge:true},THREE需要的配置信息放在这里
		 * 	@param	info	object	//附属信息,
		 * 
		 * */
		box:function(b,cfg,info){
			var rst=[],bs=b.data,pos=b.position,ro=b.rotation;
			var cvt=root.core.getConvert(),fix=0.01*cvt;
			//根据配置，填充不同的材质
			if(!cfg.only){
				var rpx=cfg.repeat[0]||1,rpy=cfg.repeat[1]||1
				var mm=self.getMeshPhongMaterial(cfg.tid,rpx,rpy)
				var gg = new THREE.BoxBufferGeometry(bs[0], bs[1], bs[2]);
				var xx = new THREE.Mesh(gg, mm);
				xx.position.set(pos[0],pos[1],cfg.texture?pos[2]-fix:pos[2]);
				xx.rotation.set(ro[0],ro[1],ro[2]);
				if(cfg.repeat){
					xx.material.map.repeat.set(cfg.repeat[0],cfg.repeat[1]);
				}
				xx.material.map.wrapS = THREE.RepeatWrapping;
				xx.material.map.wrapT = THREE.RepeatWrapping;
				xx.userData=info;
				rst.push(xx);
			}
		
			if(cfg.edge){
				var gg = new THREE.BoxBufferGeometry(bs[0], bs[1], bs[2]);
				var eg=new THREE.EdgesGeometry(gg);
				var mm=self.getLineBasicMaterial(cfg.color?cfg.color:'#FFF000');
				var eline=new THREE.LineSegments(eg,mm);
				eline.position.set(pos[0],pos[1],pos[2]);
				
				var einfo=root.clone(info);		//需要复制，不然所有的都检测不出
				einfo.skip=true;						//边缘不参与点击检测，跳掉
				eline.userData=einfo;
				rst.push(eline);
			}
			
			if(cfg.help){
				var mm=self.getLineBasicMaterial(cfg.color,cfg.opacity)
				var gg = new THREE.BoxBufferGeometry(bs[0], bs[1], bs[2]);
				var hh = new THREE.Mesh(gg, mm);
				hh.position.set(pos[0],pos[1],pos[2]);
				hh.rotation.set(ro[0],ro[2],ro[2]);
				hh.userData=info;
				rst.push(hh)
			}
			
			//if(info.type=='stop') console.log(rst);
			return rst;
		},
		
		/*用plane拼接出来的box,可以精细控制贴图
		 *
		 * 
		 * */
		cube:function(b,cfg,info){
			
			
		},
		
		ball:function(b,cfg,info){
			
		},
		
		/*生成extrude的基本方法，需要说明b的数据结构
		 *
		 * 
		 * */
		extrude:function(b,cfg,info){
			var rst=[];
			var bs=b.data,pos=b.position,ro=b.rotation;
			var shape = new THREE.Shape()
			for(var i=0,len=bs.length;i<len;i++){
				if(i==0)	shape.moveTo(bs[0][0],bs[0][1]);
				shape.lineTo(bs[i][0],bs[i][1]);
			}
			
			var setting = {steps: 1,amount: b.amount};
			var gg = new THREE.ExtrudeGeometry( shape, setting );
			var mm = self.getLineBasicMaterial(cfg.color);
			
			var xx = new THREE.Mesh(gg, mm);
			xx.position.set(pos[0],pos[1],pos[2]);
			xx.rotation.z=b.rotation;
			xx.userData=info
			rst.push(xx);
			
			if(cfg.help){
				
			}
			
			if(cfg.edge){
				
			}
			
			return rst;
		},
		
		/***********************************************************************/
		/**************************three.js灯光处理*****************************/
		/***********************************************************************/
		
		/*光源生成的统一入口
		* @param	x			number	//block的x坐标
		* @param	y			number	//block的y坐标
		* @param	lights	array		//[obj,obj,...],灯光的列表
		* @param	va		number	//block的坐标高度
		* return
		* array		[threeLight,threeLight,...]		//three的标准几何体
		 * */
		light:function(x,y,lights,va){
			var s=me.core.world.sideLength,cvt=me.core.convert;
			var rst=[];
			for(var i=0,len=lights.length;i<len;i++){
				var b=lights[i],type=b.type;
				var pos=b.position,ro=b.rotation,px=s*(x-1)+pos[0],py=s*(y-1)+pos[1],pz=pos[2];
				switch (type){
					case 'sun':
						var light = new THREE.DirectionalLight(b.color);
						light.position.set(px,py,pz);
						light.rotation.set(ro[0],ro[1],ro[2]);
						light.userData={x:x,y:y,type:'light',id:b.info.id};
						//run.scene.add(light);
						rst.push(light)
						
						if(b.help){
							var help=new THREE.DirectionalLightHelper( light, 5*cvt);
							help.userData={x:x,y:y,type:'light',id:b.info.id};
							rst.push(help)
						}
					
					break;
					
					case 'direct':
						var light = new THREE.DirectionalLight(b.color, b.intensity, 0);
						
	                		light.position.set(px,py,pz);	
	                		light.rotation.set(ro[0],ro[1],ro[2]);
	                	
	                	
	                	if(b.param){
	                		var cfg=b.param,sd=cfg.shadow,ms=sd.mapSize,cm=sd.camera;
	                		light.intensity=cfg.intensity;
	                		light.castShadow = cfg.castShadow;

							light.shadow.mapSize.width = ms.width;
							light.shadow.mapSize.height = ms.height;
			
							light.shadow.camera.near = cm.near;
							light.shadow.camera.far = cm.far;
			
							light.shadow.camera.left =cm.left;
							light.shadow.camera.right = cm.right;
							light.shadow.camera.top = cm.top;
							light.shadow.camera.bottom = cm.bottom;
	                	}
	                	
	                	light.userData={x:x,y:y,type:'light',id:b.info.id};
	                	rst.push(light)
						if(b.help){
							var help=new THREE.DirectionalLightHelper( light);
							help.userData={x:x,y:y,type:'light',id:b.info.id};
							rst.push(help)
						}

					break;
					
					case 'point':
						//console.log(pz)
						var light=new THREE.PointLight(b.color,b.intensity,b.distance);
						light.position.set(px,py,pz);
						light.rotation.set(ro[0],ro[1],ro[2]);
						light.userData={x:x,y:y,type:'light',id:b.info.id};
						rst.push(light)
						
						if(b.help){
							var help=new THREE.PointLightHelper( light,0.5*cvt,0xCCFFBB);
							help.userData={x:x,y:y,type:'light',id:b.info.id};
							rst.push(help);
						}
					
					break;
					case 'spot':
						var light = new THREE.SpotLight(b.color, b.intensity, b.distance);
	                	light.position.set(px,py,pz);			
	                	light.rotation.set(ro[0],ro[1],ro[2]);
	                	light.userData={x:x,y:y,type:'light',id:b.info.id};
						rst.push(light)
						
						if(b.help){
							var help=new THREE.SpotLightHelper(light);
							help.userData={x:x,y:y,type:'light',id:b.info.id};
							rst.push(help)
						}
						
					break;
					default:
					
					break;
				}
			}
			return rst;
		},
		

		
		/**********************************************************/
		/*****************控制器需要的输出部分*******************/
		/**********************************************************/
		
		/*灯光编辑的主入口
		 * @param	obj	object		//灯光在scene里的完整数据
		 * @param	type	string		//灯光类型名
		 * return
		 * [row,row,...]			//{type:'input',...}编辑条目列表
		 * */
		xsuite:function(obj,type){
			var type=type||'PointLight';
			switch (type){
				case 'PointLight':
					return self.xPointLight(obj);
					break;
					
				case 'SpotLight':
					return self.xSpotLight(obj);
					break;
				default:
					break;
			}
		},
		
		/**灯光更新的主入口
		 * @param	p		object		//灯光更新的参数
		 * @param	light	object		//scene中的light完整数据
		 * return
		 * 调整好scene中灯光的参数
		 * **/
		updateLight:function(p,light){
			//console.log(light.type)
			switch (light.type){
				case "PointLight":
					return self.updatePointLight(p,light);
					break;
				case "SpotLight":
					return self.updateSpotLight(p,light);
					break;
				default:
					break;
			}
		},
		
		/*{PointLight的xsuite编辑列表输出
		 * @param	obj	object		//scene中的完整light
		 * 
		 * return
		 * [row,row,...]			//{type:'input',...}编辑条目列表
		 */
		xPointLight:function(obj){
			var toN=root.calc.akNtoR
			var pos=obj.position,ro=obj.rotation
			return[
				{type:"fieldset", name:"basic", label:"Basic", offsetLeft:20,inputWidth:"auto", list:[
			        {type:"input",   name:"distance",label:'distance', value:obj.distance,inputWidth: 50,labelWidth:80,position:"label-left"},
			        {type: "newcolumn"},
			        {type:"input",   name:"intensity",label:'intensity', value:obj.intensity,inputWidth: 50,labelWidth:80,position:"label-left"},
					{type:"colorpicker",   name:"color",label:'color', value:obj.color,inputWidth: 50,labelWidth:80,position:"label-left"},]
			  	},
			    {type:"fieldset", name:"position", label:"Position", offsetLeft:20,inputWidth:"auto", list:[
			        {type:"input",   name: "x",label:'X', value:pos.x,inputWidth: 50,labelWidth:20,position:"label-left"},
			        {type: "newcolumn"},
			        {type:"input", 	name:"y", label:'Y',  value:pos.y,inputWidth: 50,labelWidth:20,position:"label-left"},  
			        {type: "newcolumn"},
			        {type:"input",   name:"z", label:'Z',  value:pos.z,inputWidth: 50,labelWidth:20,position:"label-left"}] 
				},
				{type:"fieldset", name:"rotation", label:"Rotation", offsetLeft:20,inputWidth:"auto", list:[
			        {type:"input",   name:"rx",label:'RX', value:toN(ro.x),inputWidth: 50,labelWidth:20,position:"label-left"},
			        {type: "newcolumn"},
			        {type:"input", 	name:"ry", label:'RY',  value:toN(ro.y),inputWidth: 50,labelWidth:20,position:"label-left"},
			        {type: "newcolumn"},
			        {type:"input",   name:"rz", label:'RZ',  value:toN(ro.z),inputWidth: 50,labelWidth:20,position:"label-left"}] 
			  	},
			];
		},
		/*spotLight的xsuite编辑列表输出
		 * @param	obj	object		//scene中的完整light
		 * 
		 * return
		 * [row,row,...]			//{type:'input',...}编辑条目列表
		 */
		xSpotLight:function(obj){
			return [
				{type:"fieldset", name:"position", label:"Position", offsetLeft:20,inputWidth:"auto", list:[
			        {type:"input",   name: "x",label:'X', value:pos.x,inputWidth: 50,labelWidth:20,position:"label-left"},
			        {type: "newcolumn"},
			        {type:"input", 	name:"y", label:'Y',  value:pos.y,inputWidth: 50,labelWidth:20,position:"label-left"},  
			        {type: "newcolumn"},
			        {type:"input",   name:"z", label:'Z',  value:pos.z,inputWidth: 50,labelWidth:20,position:"label-left"}] 
				},
				{type:"fieldset", name:"rotation", label:"Rotation", offsetLeft:20,inputWidth:"auto", list:[
			        {type:"input",   name:"rx",label:'RX', value:toN(ro.x),inputWidth: 50,labelWidth:20,position:"label-left"},
			        {type: "newcolumn"},
			        {type:"input", 	name:"ry", label:'RY',  value:toN(ro.y),inputWidth: 50,labelWidth:20,position:"label-left"},
			        {type: "newcolumn"},
			        {type:"input",   name:"rz", label:'RZ',  value:toN(ro.z),inputWidth: 50,labelWidth:20,position:"label-left"}] 
			  	},
			]
		},
		
		/*PointLight更新的实现
		 *	@param		p	obj	//输出的light参数对应的获取值
		 * @param	light	obj	//scene里的对应的light
		 * 
		 * */
		updatePointLight:function(p,light){
			if(p.x) light.position.setX(p.x);
			if(p.y) light.position.setY(p.y);
			if(p.z) light.position.setZ(p.z);
			if(p.rx) light.rotation.x=p.rx;
			if(p.ry) light.rotation.y=p.ry;
			if(p.rz) light.rotation.z=p.rz;
			if(p.intensity) light.intensity=p.intensity;
			if(p.distance) light.distance=p.distance;
			return true;
		},
		
		/*SpotLight更新的实现
		 *	@param		p	obj	//输出的light参数对应的获取值
		 * @param	light	obj	//scene里的对应的light
		 * 
		 * */
		updateSpotLight:function(p,light){
			//console.log(light);
			if(p.x) light.position.setX(p.x);
			if(p.y) light.position.setY(p.y);
			if(p.z) light.position.setZ(p.z);
			if(p.rx) light.rotation.x=p.rx;
			if(p.ry) light.rotation.y=p.ry;
			if(p.rz) light.rotation.z=p.rz;
			if(p.intensity) light.intensity=p.intensity;
			if(p.distance) light.distance=p.distance;
			return true;
		},
		
		
		/**********统一数据处理部分***********/
		getNormalTexture:function(url){
			return tLoader.load(url);
		},
		
		/*统一管理PhongMaterial的方法
		 * @param	tid	number	//texture的id
		 * @param	rpx	number	//纹理在x轴上的重复次数
		 * @param	rpy	number	//纹理在y轴上的重复次数
		 * 	return
		 * 
		 * */
		getMeshPhongMaterial:function(tid,rpx,rpy){
			var pre='phong_',k=pre+tid+'_'+rpx+'_'+rpy;
			var rst=root.core.getMaterial(k);
			if(!rst){
				var tt = root.core.getTextureBuffer(tid);
				var rst = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, map: tt });
				root.core.setMaterial(k,rst);
			}
			return rst;
		},
		
		getLineBasicMaterial:function(color,opacity){
			var pre='color_',k=pre+color+(opacity?('_'+opacity):'');
			var rst=root.core.getMaterial(k);
			if(!rst){
				var cfg=opacity?{color:color,opacity:opacity,transparent:true}:{color:color}
				var rst=new THREE.LineBasicMaterial(cfg);
				root.core.setMaterial(k,rst)
			}
			return rst;
		},
		
		getLineDashedMaterial:function(color,dash,gap){
			var pre='dash_',k=pre+dash+'_'+gap;
			var rst=root.core.getMaterial(k);
			if(!rst){
				var rst=new THREE.LineDashedMaterial({color:color,dashSize:dash,gapSize:gap});
				root.core.setMaterial(k,rst)
			}
			return rst;
		},
		
		/***texture的控制在这里进行处理***/
		getTextureBaseMaterial:function(tid,type){
			var pre='txt_',k=pre+tid+'_'+type;
			var rst=root.core.getMaterial(k);
			if(!rst){
				switch (type){
					case 'water':
						//var rst=new THREE.LineDashedMaterial({color:color,dashSize:dash,gapSize:gap});
					
						break;
					case 'phong':
						var tt=root.core.lo(tid);
						var rst=new THREE.MeshPhongMaterial({map: tt });
						break;
					case 'standard':
					
					
						break;
					default:
						break;
				}
				
				
				root.core.setMaterial(k,rst)
			}
			//console.log(rst)
			return rst;
		},
		

		/**辅助功能实现**/
		//这个需要重写，跟着海拔走
		ax:function(x,y,z,va){
			var cone = new THREE.ConeGeometry( 5, 20, 32 );
			var cylinder = new THREE.CylinderBufferGeometry( 5, 5, 20, 32 );
			
			var cvt=me.core.convert,rst=[];
			var zx=self.box({data:[2*cvt,0.1*cvt,0.1*cvt],position:[x+1*cvt,y,z+2*cvt+va],rotation:[0,0,0],repeat:[1,1]},{color:'#CC0000',opacity:1},{info:'x轴'});
			var zy=self.box({data:[0.1*cvt,2*cvt,0.1*cvt],position:[x,y+1*cvt,z+2*cvt+va],rotation:[0,0,0],repeat:[1,1]},{color:'#00FF00',opacity:1},{info:'y轴'});
			var zz=self.box({data:[0.1*cvt,0.1*cvt,2*cvt],position:[x,y,z+3*cvt+va],rotation:[0,0,0],repeat:[1,1]},{color:'#0000FF',opacity:1},{info:'z轴'});
			
			for(var i=0,len=zx.length;i<len;i++) rst.push(zx[i]);
			for(var i=0,len=zy.length;i<len;i++) rst.push(zy[i]);
			for(var i=0,len=zz.length;i<len;i++) rst.push(zz[i]);
			return rst;
		},
	}
	
	
	root.regComponent(reg);
})(window.T)