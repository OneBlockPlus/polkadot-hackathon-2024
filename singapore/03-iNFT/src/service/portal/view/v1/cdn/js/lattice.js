;(function(){
	var config={
		name:'Lattice',
		intro:'基于canvas把图像处理成点阵信息的方法',		//渲染器说明
	}
	
	var run={
		content:null,
		raw:null,
		lattice:null,
	}
	
	/******************************************************************************/
	//1.先在imageData的基础上处理一维数组
	//2.像素化的转换切换到二维数组进行
	//3.可以进行scale运算等
	
	/******************************************************************************/
	var self={
		init:function(source,target,cfg){},
		/*****************图像输出部分*******************/
		
		dwgSource:function(source,iw,ih,w,h,target){
			//1.获取canvas
			var c=document.getElementById(target);
			run.content=c.getContext("2d");
			
			//2.缩放绘制图像
			var img=new Image();
			img.src=source;
			run.content.drawImage(img,0,0,iw,ih,0,0,w,h);
			run.raw=run.content.getImageData(0,0,w,h);			//获取绘制后的点阵数据
		},
		
		
		
		renderLattice:function(target,way){
			var w=run.lattice[0].length;h=run.lattice.length;
			var imgData=self.toImageData(run.lattice,way);
			var c=document.getElementById(target);
			cvs=c.getContext("2d");
			
			var sel=$("#"+target),cw=sel.width(),ch=sel.height();
			cvs.fillStyle="#FFFFFF";
			cvs.clearRect(0,0,cw,ch);
			
			cvs.putImageData(imgData,0,0,0,0, w, h);
		},
		
		/*****************二维像素化点阵处理*******************/
		calcLattice:function(way,w,h,cfg){
			var res=self[way](run.raw,cfg);
			run.lattice=self.toTwoArray(res,w,h);
			return true;
		},
		
		//点阵压缩处理
		scale:function(lattice,s){
			var width=lattice[0].length,height=lattice.length
			var w=Math.floor(width/s),h=Math.floor(height/s);
			var dw=width/s,dh=height/s;
			var we=width%(w*s),he=height%(h*s)
			//console.log(w+','+h+',,'+we+','+he)
			var rst=[];
			for(var i=0;i<w;i++){
				if(rst[i]==undefined)rst[i]=[]
				for(var j=0;j<h;j++){
					rst[i].push();
				}
			}
			return rst;
		},
		
		toImageData:function(lattice,way){
			var way=way||'bw';
			var alen=lattice[0].length,blen=lattice.length;
			var dt=new ImageData(alen,blen);
			for(var i=0;i<alen;i++){
				for(var j=0;j<blen;j++){
					var row=lattice[i][j];
					var start=(i*alen+j)*4;
					switch (way){
						case 'bw':
							dt.data[start]=row?0:255;
							dt.data[start+1]=row?0:255;
							dt.data[start+2]=row?0:255;
							break;
						case 'grey':
							dt.data[start]=row;
							dt.data[start+1]=row;
							dt.data[start+2]=row;
							break;
						default:
							break;
					}
					
					dt.data[start+3]=255;
				}
			}
			return dt;
		},
		
		/*****************像素化抽取部分*******************/
		//按照指定中值进行像素化处理，直接切分
		divide:function(raw,cfg){
			var line=cfg.divide==undefined?140:cfg.divide,color=(cfg.path==undefined)?'RGB':((cfg.path=='R' || cfg.path=='G' || cfg.path=='B')?cfg.path:'RGB');
			var rst=[];
			//var start=color=='R'?0:(color=='G'?1:2);
			for(var i=0,len=raw.data.length;i<len;i+=4){
				switch (color){
					case 'RGB':
						var bw=(raw.data[i]+raw.data[i+1]+raw.data[i+2])>line+line+line?0:1;
						break;
					case 'R':
						var bw=raw.data[i]>line?0:1;
						break;
					case 'G':
						var bw=raw.data[i+1]>line?0:1;
						break;
					case 'B':
						var bw=raw.data[i+2]>line?0:1;
						break;
					default:
						break;
				}
				rst.push(bw);
			}
			return rst;
		},
		//按照数据进行灰度计算，分成不同的级别
		average:function(raw,cfg){
			var n=cfg.level||16;
			var color=(cfg.path==undefined)?'RGB':((cfg.path=='R' || cfg.path=='G' || cfg.path=='B')?cfg.path:'RGB');
			var level=256/n;
			var d=color.length*Math.floor(256/n);	
			var rst=[];
			for(var i=0,len=raw.data.length;i<len;i+=4){
				switch (color){
					case 'RGB':
						var sum=raw.data[i]+raw.data[i+1]+raw.data[i+2];
						break;
					case 'R':
						var sum=raw.data[i];
						break;
					case 'G':
						var sum=raw.data[i+1];
						break;
					case 'B':
						var sum=raw.data[i+2];
						break;
					default:
						break;
				}
				var le=Math.floor(sum/d),grey=Math.round(le*level);
				rst.push(grey);
			}
			return rst;
		},
		toTwoArray:function(raw,w,h){
			var rst=[],row=0,n=0;
			for(var i=0,len=raw.length;i<len;i++){
				if(n==w){
					n=0;			
					row++;
				}
				if(rst[row]==undefined)rst[row]=[];
				rst[row].push(raw[i]);
				n++;
			}
			return rst;
		},
	}
	
	window[config.name]=self;
})();
