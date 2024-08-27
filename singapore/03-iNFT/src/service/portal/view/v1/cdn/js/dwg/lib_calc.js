;(function(root){
	var reg={
		name:'calc',
		type:'lib',
		hooks:[],
		loops:[],
		autoRun:'init',
		version:1,
	};
	
	var me=root.getConfig();
	var self=reg[me.funKey]={
		init:function(){
			//console.log(JSON.stringify(self.keys()));
		},
		
		//加密用方法，获取所有的方法的key，发布版本时注释掉
		keys:function(){
			var res=[]
			for(var k in self) if(k!='keys') res.push(k);
			return res;
		},
		
		calcRange:function(size,offset,s){
			var top=Math.ceil((offset[1]+size[1])/s);
			var right=Math.ceil((offset[0]+size[0])/s);
			var bottom=Math.ceil(offset[1]/s);
			var left=Math.ceil(offset[0]/s);
			return [top,right,bottom,left];
		},
		/*计算block跨越之后的块偏移
		 * @param	px		integer	//player的相对x坐标；
		 * @param	py	integer	//player的相对y坐标；
		 * @param	s		integer	//block的变成；
		 * 
		 * */
		crossDelta:function(px,py,s){
			var delta=[0,0];
			var cx=px/s,cy=py/s;
			if(cx>1)delta[0]=1;
			if(cx<0)delta[0]=-1;
			if(cy>1)delta[1]=1;
			if(cy<0)delta[1]=-1;
			return delta;
		},
		
		/*修正player的position的方法
		 *@param	px		float			//player的x偏移
		 *@param	py	float			//player的y偏移
		 *@param	s		integer		//block的边长
		 * return
		 *[x,y]		array	//修正过的player的坐标
		 * 
		 * */
		transPlayerPosition:function(px,py,s){
			var x=px<0?px+s:px>s?px-s:px;
			var y=py<0?py+s:py>s?py-s:py;
			return [self.toF(x,6),self.toF(y,6)];		//精度为小数点后6位
		},
		
		/*计算1组vector的选择框参数
		 *	@param	vs		array			//[row,row,..]类型的数据,row的格式是{size:[x,y,z],pos:[ox,oy,oz]}
		 * @param	pd	number		//选择框向外延伸的值
		 * return
		 * {size:[x,y,z],pos:[x,y,z]}		//可以定位的box
		 * */
		//fuu,暂时不写
		vectorPadding:function(vs,pd){
			var x=0,y=0,z=0,ox=0,oy=0,oz=0;
			for(var i=0,len=vs.length;i<len;i++){
				
				
			}
			
			//处理延伸的值
			if(pd && pd!=0){
				var dp=pd+pd;
				x+=dp;
				y+=dp;
				z+=dp;
				ox-=pd;
				oy-=pd;
				oz-=pd;
			}
			return	{size:[x,y,z],pos:[ox,oy,oz]}
		},
		
		//根据block的中心点位置转义成从左到右，从下到上的坐标
		getRengeByCenter:function(cen,ex,ey,limit){
			var mx=limit.xMax,my=limit.yMax,nx=limit.xMin,ny=limit.yMin;
			
			var x=cen[0]-0.5*ex,y=cen[1]-0.5*ey;
			return {x:x,y:y,ex:ex-1,ey:ey-1}
		},
		
		//根据start和end的block位置转义成从左到右，从下到上的坐标
		getRange:function(start,end){
			if(end[0]>=start[0]){
				return end[1]>=start[1]?{x:start[0],y:start[1],dx:end[0]-start[0],dy:end[1]-start[1]}:{x:start[0],y:end[1],dx:end[0]-start[0],dy:start[1]-end[1]};
			}else{
				return end[1]>=start[1]?{x:end[0],y:start[1],dx:start[0]-end[0],dy:end[1]-start[1]}:{x:end[0],y:end[1],dx:start[0]-end[0],dy:start[1]-end[1]};
			}
		},
		/*stop位置计算*/
		
		/*	@param	stops	object		//{id:[cz,wz],...},单条数据结构[box的中心值,box的z轴长度值]
		 *	@param	va 		number	//player的站立高度
		 * @param 	h			number	//player的身高(这个可以根据用户的动作进行调整)
		 * 
		 * */
		calcElevation:function(stops,va,h,top){
			console.log(stops)
		},
		
			
		//需要复核一下，如果[0,0]正常，可以优化算法
		/*多边形面积计算
		 *	@param	ps	array	//[[x,y],[x,y],...]多边形点阵列
		 * return
		 * 	number	//多边形的面积
		 * */
		calcArea:function(ps){
			var len=ps.length,mj=0;
			if(len<3) return false;
			var pa=[0,0];
			for(var i=0;i<len;i++){
				var pb=ps[i],pc=i==(len-1)?ps[0]:ps[i+1];
				var ja=pb[0]*pc[1]-pc[0]*pb[1];
				var jb=pa[0]*pc[1]-pa[0]*pc[0];
				var jc=pa[0]*pb[1]-pa[0]*pb[1];
				mj+=(ja-jb+jc)/2
			}
			return mj;
		},
		
		/*周长计算*/
		calcGirth:function(ps){
			var len=ps.length,dis=0;
			if(len<3) return false;
			for(var i=0;i<len;i++) dis+=self.ppDis(ps[i],i==(len-1)?ps[0]:ps[i+1]);
			return dis;
		},
		
        /*计算门连接后的参数，非常重要，很难算
		* 
		*@param		pa	array	[x,y]类型的a连接点B坐标系坐标
		*@param		pb	array	[x,y]类型的b连接点B坐标系坐标 
		*@param		ak	number	a点所在线的旋转角度
		*@param		bk	number	b点所在线的旋转角度 
		* 
		* 主要功能
		* 1.计算新的a点的位置和旋转
		* 
		* */
		calcAxes: function (pa, pb, ak, bk) {
            var abk = ak - bk + Math.PI, s = Math.sin(abk), c = Math.cos(abk);
            return { rotate: abk, pos: [pa[0] - pb[0] * c + pb[1] * s, pa[1] - pb[0] * s - pb[1] * c] };
		}, 
		
		/*向前走在x轴和y轴上的分配
		 *	@param		d	number			//前进的距离
		 * @param		a	number		//当前人面向的角度
		 * */
        disToAx: function (d, a) {
            return [-d * Math.sin(a), d * Math.cos(a)];
        },
        
         /*A坐标系的box位置偏移和旋转转换函数
		*@param	box	array	//[x,y,z],three.js的标准box,中心位于坐标系原点
		*@param	pos	array	//[x,y],box的位移(ips点坐标)
		* @param	ro		number	//墙的旋转
		* return
		* {npos:[x,y,z],rotation:0}
		*/
        boxPosCalc: function (box, pos, ro) {
        		var zo=pos[2]?pos[2]:0,cen = [0, 0], start = [0 - parseInt(box[0] / 2), parseInt(box[1] / 2)];
            var np = self.pRotate(start, cen, ro), rp = self.axMove(cen, pos, np);
            return { position: [rp[0], rp[1], box[2] / 2+zo], rotation: ro };
        },
        
        /*线段延伸交点计算方法
         *
         * 
         * */
        extCross:function(a,b,c,d){
        		if(b[0]-a[0]==0){
        			var p=self.plumb(c,[a,b]),dt=(p[0]-c[0])*Math.tan(self.ppAngle(c,d))
        			return [p[0],p[1]+dt]
        		}else if(d[0]-c[0]==0){
        			var p=self.plumb(a,[c,d]),dt=(p[0]-a[0])*Math.tan(self.ppAngle(b,a))
        			return [p[0],p[1]+dt]
        		}else{
        			var k0 =(b[1]-a[1])/(b[0]-a[0]),e0= b[1] - k0*b[0];
				var k1 =(d[1]-c[1])/(d[0]-c[0]),e1 = d[1] - k1*d[0];
				var x = (e1-e0)/(k0-k1),y = k0*x + e0;
	    			return [x,y];
        		}
        },
        
        /*直线交点计算方法
         *
         * */
        lineCross:function(a,b){
        		var ak=self.ppAngle(a[0],a[1]),bk=self.ppAngle(b[0],b[1]);
        		if((ak+bk)%(Math.PI)==0)return false;
        		if(a[0][0]-a[1][0]==0 && b[0][0]-b[1][0]==0)return false;
        		if(a[0][1]-a[1][1]==0 && b[0][1]-b[1][1]==0)return false;
        		return self.extCross(a[0],a[1],b[0],b[1]);
        },
        
        //顺时针方向，左下角开始
        offset: function (ps, d, a) {
	        var zj=Math.PI/2,ac=Math.PI/4,np=self.newPoint;
	        return [np(ps[0], d, a + zj +ac),np(ps[1], d, a - zj -ac),np(ps[2], d, a - ac),np(ps[3], d, a + ac)];
        },
        
        nOffset:function(ps,d,close,isin){
	        	isin=isin==undefined?false:isin;
	        	close=close==undefined?false:close;
	        	var ro=[],cross=self.cross,zj=Math.PI/2,nps=[],np=self.newPoint;
	        	for (var i = 0,len=ps.length; i < len; i++) {
					var p1 = ps[i],p2=(i == (len - 1))?ps[0]:ps[i + 1];
					var dx =p2[0]-p1[0],dy =p2[1]-p1[1];
					if(dx==0 && dy==0){
						ro[i]=i==0?ro[len-1]+zj:ro[i-1]+zj;
					}else{
						ro[i] = Math.atan((p2[1] - p1[1]) / (p2[0] - p1[0]));
						if (p2[0] < p1[0]) ro[i] += zj+zj;
					}
				}
	        	for(var i=0,len=ps.length;i<len;i++){
	        		var pre=i==0?len-1:i-1,next=i==len-1?0:i+1;
	        		var pa=ps[i],ra=ro[i],rn=ro[next],rp=ro[pre];
	        		nps[i]=(!close && i==0)?np(pa,d,ra-zj):(!close && i==len-1)?np(pa,d,ro[pre]-zj):cross(pa,rp,d,ra,d,isin);
	        	}
	        	return nps;
        },
        
        
        mid:function(pa,pb){return [(pa[0]+pb[0])/2,(pa[1]+pb[1])/2]},       
        cross: function (p, a, da, b, db, isin) {
            var k = isin ? b - a : a - b, ba = da / Math.sin(k), bb = db / Math.sin(k);
            var pa = [p[0] - bb * Math.cos(a), p[1] - bb * Math.sin(a)];
            var pb = [p[0] + ba * Math.cos(b), p[1] + ba * Math.sin(b)];
            return k==0?self.newPoint(p, da, a + isin?Math.PI/2:-Math.PI / 2):[pa[0] + pb[0] - p[0], pa[1] + pb[1] - p[1]];
        },
        
		isIn: function (p, ps) {
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
        
        /*判断点是不是在线段中部，注意只适合在第一象限判断
         * 
         * return
         * 如果在中部，返回到起点的距离
         *
         * */
        onSegment:function(p,ps){
        		if(!self.isPsLine(p,ps[0],ps[1])) return false;
        		var dd=self.ppDis(ps[0],ps[1]),da=self.ppDis(p,ps[0]),db=self.ppDis(p,ps[1]);
        		if(da>dd || db>dd) return false;
        		return da;
        },
        
        /* 用于检测点是否在线组上
         * @param	psa	array	//[[x,y],[x,y],...]类型的点
         *@param	psb	array	//[[x,y],[x,y],...]类型的闭合线组,线组或者[line,line,非闭合线组]
         * @param close	boolean	//是否自动将后部的点组自动变成先组	
         * return 在线上的关系
         * */
        edge:function(psa,psb,close){
        		var rst=[]
        		for(var i=psa.length-1;i>=0;i--){
        			if(close){
        				for(var j=0,len=psb.length;j<len;j++)if(self.isPsLine(psa[i],psb[j],psb[(j==(len-1))?0:j+1])) rst.push([i,j]);
  				}else{ 
  					for(var j=0,len=psb.length;j<len;j++)if(self.isPsLine(psa[i],psb[j][0],psb[j][1])) rst.push([i,j]);
        			}
        		}
        		return root.empty(rst)?false:rst
        },
        
        isLineCross:function(a,b){
        		return self.isCross(a[0],a[1],b[0],b[1]);
        },
        
        isCross: function (a, b, c, d) {
            var abc = (a[0] - c[0]) * (b[1] - c[1]) - (a[1] - c[1]) * (b[0] - c[0]), abd = (a[0] - d[0]) * (b[1] - d[1]) - (a[1] - d[1]) * (b[0] - d[0]);
            if (abc * abd >= 0) return false;
            var cda = (c[0] - a[0]) * (d[1] - a[1]) - (c[1] - a[1]) * (d[0] - a[0]), cdb = cda + abc - abd;
            if (cda * cdb >= 0) return false;
            return true;
        },
        
        isPsLine: function (a, b, c) {return Math.round((a[1] - b[1]) * (a[0] - c[0])*100) == Math.round((a[0] - b[0]) * (a[1] - c[1]) * 100)?true:false},
        
        /*判断目标点是不是在左侧 */
        isLeft:function(pa,pb){return pa[0]<=pb[0]?true:false;},
        
         /*判断目标点是不是在上部 */
        isTop:function(pa,pb){return pa[1]>=pb[1]?true:false;},
        
        //1.分成九宫格的形式，先区分出在哪个区域
		//----------------------
		//|		1		|		2		|		3		|
		//----------------------
		//|		4		|	  rb/9		|		5		|
		//----------------------
		//|		6		|		7		|		8		|
		//----------------------
        /*计算两个矩形的关系
         *	@param	ra	array			//[top,right,bottom,left]	活动的矩形
         *	@param	rb	array			//[top,right,bottom,left]	静止的矩形
         * 	@param	dis	number			//判断吸附类型的阈值
         * 	return 
         * 	{relate:0,type:0,isLeft:false,isTop:false}
         * 	type:	type:1.点对点吸附;2.点对线吸附;3.线对线吸附
         * */	
		psRelate:function(ra,rb,dis){
			var dis=dis||0,rst={relate:0,type:0,calc:null,inside:false},ret=0,x=[0,0,0,0];
			
       		//1.非轴判断，需要补充阈值
       		if(ra[1]<rb[3]-dis && ra[0]<rb[2]+dis) ret=1;
       		if(ra[3]>rb[3] && ra[1]<rb[1] && ra[0]<rb[2]) ret=2;
       		if(ra[3]>rb[1]-dis && ra[0]<rb[2]+dis) ret=3;		//测试正常
       		if(ra[0]<rb[0] && ra[2]>rb[2] && ra[1]<rb[3]) ret=4;
       		if(ra[0]<rb[0] && ra[1]<rb[1] && ra[2]>rb[2] && ra[3]>rb[3]) ret=9;
       		if(ra[0]<rb[0] && ra[2]>rb[2] && ra[3]>rb[1] ) ret=5;
       		if(ra[2]>rb[0] && ra[1]<rb[3]) ret=6;
       		if(ra[2]>rb[0] && ra[3]>rb[3] && ra[1]<rb[1]) ret=7;
       		if(ra[2]>rb[0] && ra[3]>rb[1]) ret=8;
       		rst.relate=ret;
       		
       		//2.确认吸附的类型
       		rst.type=root.inArray(ret,[1,3,6,8])?1:root.inArray(ret,[2,4,5,7,9])?3:2;
			
       		//3.判断边界及修正位移
       		if(ret==0){
       			if(ra[0]>rb[2] && ra[0]<rb[0]) x[0]=1;		//top边界是否在目标内
       			if(ra[1]>rb[3] && ra[1]<rb[1]) x[1]=1;		//right边界是否在目标内
       			if(ra[2]>rb[2] && ra[2]<rb[0]) x[2]=1;		//bottom边界是否在目标内
       			if(ra[3]>rb[3] && ra[3]<rb[1]) x[3]=1;		//left边界是否在目标内
       		}else if(ret==1){
       			x=[1,1,0,0];
       		}else if(ret==2){
       			x=[1,1,0,1];
       		}else if(ret==3){
       			x=[1,0,0,1];
       		}else if(ret==4){
       			x=[1,1,1,0];
       		}else if(ret==5){
       			x=[1,0,1,1];
       		}else if(ret==6){
       			x=[0,1,1,0];
       		}else if(ret==7){
       			x=[0,1,1,1];
       		}else if(ret==8){
       			x=[0,0,1,1];
       		}else if(ret==9){
       			rst.inside=true;
       		}
       		
       		if(rst.inside) rst.calc=[1,1,1,1];
       		else rst.calc=x;
       		
       		//4.计算吸附位移
       		return rst;
		},
       
		recRelate:function(ra,rb){
			var type=0;
       		if(ra[1]<rb[3] && ra[0]<rb[2]) type=1;
       		if(ra[3]>rb[3] && ra[1]<rb[1] && ra[0]<rb[2]) type=2;
       		if(ra[3]>rb[1] && ra[0]<rb[2]) type=3;
       		if(ra[0]<rb[0] && ra[2]>rb[2] && ra[1]<rb[3]) type=4;
       		if(ra[0]<rb[0] && ra[1]<rb[1] && ra[2]>rb[2] && ra[3]>rb[3]) type=9;
       		if(ra[0]<rb[0] && ra[2]>rb[2] && ra[3]>rb[1] ) type=5;
       		if(ra[2]>rb[0] && ra[1]<rb[3]) type=6;
       		if(ra[2]>rb[0] && ra[3]>rb[3] && ra[1]<rb[1]) type=7;
       		if(ra[2]>rb[0] && ra[3]>rb[1]) type=8;
       		return type;
		},
        
        /*求点组的边界
         *
         * */
        
		padding:function(ps){
			var pad=[];
			for(var i=0,len=ps.length;i<len;i++){
				var p=ps[i];
				pad[0]=(pad[0]==undefined)?p[1]:(p[1]<pad[0]?pad[0]:p[1]);
				pad[1]=(pad[1]==undefined)?p[0]:(p[0]>pad[1]?p[0]:pad[1]);
				pad[2]=(pad[2]==undefined)?p[1]:(p[1]>pad[2]?pad[2]:p[1]);
				pad[3]=(pad[3]==undefined)?p[0]:(p[0]<pad[3]?p[0]:pad[3]);
			}
			return pad;
		},
		
		
		/*把点挤到第一象限的操作
		 * @param	ps	array	//[[x,y],[x,y],...]点阵
		 * @param	ro	number	//点的旋转角度
		 * return
		 * {points:[[x,y],[x,y],...],offset:[dx,dy],center:[x,y],rotate:0}		//新的点阵及对应的参数
		 * */
		merge:function(ps,ro){
			//返回旋转值
			var ro=ro||0,len=ps.length;
			if(len<3) return false;
			var pad=self.padding(ps),dy=pad[2],dx=pad[3],nps=[];
			for(var i=0;i<len;i++){
				var p=ps[i];
				nps[i]=[p[0]-dx,p[1]-dy];
				if(p[2]!=undefined)nps[i][2]=p[2];
			}
			var cen = [(pad[1] - pad[3]) / 2, (pad[0] - pad[2]) / 2];
			return {points:nps,offset:[dx,dy],center:cen,pad:pad,rotate:ro};
		},
		
		/*两点距离计算*/
		ppDis:function(pa,pb){ return Math.sqrt(Math.pow((pa[0] - pb[0]), 2) + Math.pow((pa[1] - pb[1]), 2))},
		
		/*两点角度计算*/
		psAngle: function (ps) {
            var x1 = ps[0][0], x2 = ps[1][0],y1 = ps[0][1],y2 = ps[1][1],dx = x2 - x1,dy = y2 - y1,ak = Math.atan(dy / dx);
            return x2<x1?ak+Math.PI:ak;
		},
		
		/*两点角度计算*/
		//这个方法在象限上计算有问题,需要处理!!!!
		ppAngle:function(pa,pb){
            return Math.atan((pb[1] - pa[1])/(pb[0] - pa[0]));
		},
		
		/*两条线段的夹角*/
		deltaAngle:function(pa,pb,cen){
			var ak=self.anClean(self.ppAngle(cen,pb)-self.ppAngle(cen,pa));
			return ak>Math.PI?ak-Math.PI:ak;
		},
		
		/*点到线的垂足计算
		 * @param	p		array	//[x,y]检测点
		 * @param	line	array	//[[x,y],[x,y]]两点定义的线、
		 * return
		 * array	//[x,y]计算出的垂足点
		 * */
        plumb:function(p,line){
        	var pa=line[0],pb=line[1],k = ((p[0]-pa[0])*(pb[0]-pa[0])+(p[1]-pa[1])*(pb[1]-pa[1]))/((pb[0]-pa[0])*(pb[0]-pa[0]) + (pb[1]-pa[1]) * (pb[1]-pa[1]));
            return [pa[0] + k * (pb[0] - pa[0]), pa[1] + k * (pb[1] - pa[1])];
        },
        
        /*点到线的距离计算*/
        pDisToLine:function(p,line){
        		var pa=line[0],pb=line[1],a = pb[1] - pa[1],b = pa[0] - pb[0],c = pb[0] * pa[1] - pa[0] * pb[1];
            return Math.abs((p[0] * a + b * p[1] + c) / Math.sqrt(a * a + b * b));
        },
        
        /*点组对点旋转的计算*/
        psRotate: function (ps, o) {
            var pp = self.merge(ps), c = pp.center, nps = [];
            for (var i = 0; i < pp.points.length; i++) nps[i] = self.pRotate(pp.points[i], c, o);
            return self.merge(nps);
        },
        /*极坐标的方式求新点坐标*/
        newPoint: function (p, d, a) { return [Math.round(p[0] + d * Math.cos(a)), Math.round(p[1] + d * Math.sin(a))] },
		
		/*A坐标系的点组转换到B坐标系*/
		psAtoB: function (ps, a, o) {
            var nps = [];
            for (var i = 0; i < ps.length; i++) { nps[i] = self.pAtoB(ps[i], a, o) };
            return nps;
        },
        /*A坐标系的点转换到B坐标系*/
        pAtoB: function (p, a, o) {
            var s = Math.sin(a), c = Math.cos(a);
            return [o[0] + p[0] * c - p[1] * s, o[1] + p[0] * s + p[1] * c];
        },
        
        /*B坐标系的点转换到A坐标系*/
        pBtoA: function (p, a, o) {
            var s = Math.sin(a), c = Math.cos(a);
            return [ (p[0]-o[0])*c+(p[1]-o[1])*s, (o[0]-p[0]) * s + (p[1]-o[1])* c];
        },
        
        /*B坐标系的点转换到C坐标系*/
        /*pBtoC: function (p, s, o, px,h) {		//旧的方法
            var mm = px * s;
            if(!h) return [Math.ceil((p[0] + o[0]) * mm), Math.ceil((p[1] + o[1]) * mm)];
            return [Math.ceil((p[0] + o[0]) * mm),h-Math.ceil((p[1] + o[1]) * mm)];
        },*/
        
         pBtoC: function (p, s, o, px,h) {
            var mm = px * s;
            if(!h) return [Math.ceil((p[0] - o[0]) * mm), Math.ceil((p[1] - o[1]) * mm)];
            return [Math.ceil((p[0] - o[0]) * mm),h-Math.ceil((p[1] - o[1]) * mm)];
        },
        
        /*C坐标系的点转换到B坐标系*/
        pCtoB: function (p, s, o, m, px) {
        	//console.log(p)
            var mm = px * s / m;
            return [p[0] / mm + o[0], p[1] / mm + o[1]];			//因为和yhf的offset定义不一样
        },
        
        calcOffset:function(ax,ay,bx,by){
        	return [ax-0.5*bx,ay-0.5*by];
		},
       	pRotate: function (p, c, a,is) {
       	 	var b=is?Math.atan((c[1]-p[1])/(c[0]-p[0])):0;
        		var ss=Math.sin(a+b),cs=Math.cos(a+b);
			return [(p[0]-c[0])*cs-(p[1]-c[1])*ss+c[0],(p[0]-c[0])*ss+(p[1]-c[1])*cs+c[1]];
        },
        pMove: function (p, a, b) { return [p[0] + b[0] - a[0], p[1] + b[1] - a[1]] },
        disToDirect:function(dx,dy,a){	return dx*Math.cos(a)+dy*Math.sin(a);},
        axMove: function (p, a, b) { return [p[0] - b[0] + a[0], p[1] - b[1] + a[1]] },
        disCtoB: function (d, a, s, m, p) { if (a == undefined) { a = 0 } return m * d / (p * s)},	//未计算坐标旋转
        disBtoC: function (d, a, s, m, p) { if (a == undefined) { a = 0 } return d * p * s / m },		//未计算坐标旋转
        toF: function (a,fix){fix=fix||3;return parseFloat(a.toFixed(fix))},
        arrToF: function (a,fix) { fix=fix||3;var r = []; for (i = 0, x = a.length; i < x; i++) r[i] = parseFloat(a[i].toFixed(fix)); return r },
		dash:function(ps,d){
			var dis=self.ppDis(ps[0],ps[1]),ak=self.psAngle(ps),dw=d+d,n=Math.floor(dis/dw),ed=dis%dw,ds=[],np=self.newPoint;
			for(var i=0;i<n;i++) ds.push([np(ps[0],i*dw,ak),np(ps[0],i*dw+d,ak)]);
			var ep=ed>d?np(ps[0],i*dw+d,ak):ps[1];
			ds.push([np(ps[0],i*dw,ak),ep]);
			return ds;
		},
		
		/*	数接近步进的计算,需要补充好
		 * @param		n		number	//需要计算接近的值
		 * 	@param		arr	array		//[a,b,c,...]参与接近计算的所有数
		 *	@param		step	number	//接近步进值
		 * 	@param		dx	number	//接近阈值
		 * */
		approx:function(n,arr,step,dx){
			//console.log(dx)
			var narr=[];
			for(var i=0,len=arr.length;i<len;i++){
				var dis=arr[i]+n,d=dis%step;
				if(d<dx)narr.push([d,-1]);
				if(step-d<dx)narr.push([step-d,1]);
			}
			
			if(narr){
				var min=step,tag=-1;
				for(var i=0,nlen=narr.length;i<nlen;i++)if(narr[i][0]<min)tag=i;
				if(!(tag<0))n+=narr[tag][1]*narr[tag][0];
			}
			return n;
		},
		
		/*	点吸附操作
		 *	@param	p		array	//[[x,y],[x,y],...]点阵数组
		 * 	@param	dis		number	//吸附距离
		 * 	@param	ps		array	//[[x,y],[x,y],...]点阵数组
		 * 	@param	isPoint	boolean	//是否需要判断点吸附
		 * 	@param	isIn	boolean	//是否判断在线上
		 * 	return
		 * 	计算出吸附在线上的点相对于p的位差
		 * 	{dis:number,delta:[dx,dy],id:ps index,isPoint:true}
		 * */
		adsorb:function(arr,dis,ps,isPoint,isIn){
			var pDisToLine=self.pDisToLine,ppDis=self.ppDis;
			for(var pi=arr.length-1;pi>=0;pi--){
				var p=arr[pi];
				if(isPoint){				
					var adis=undefined,pid=undefined;
					for(var i=0,len=ps.length;i<len;i++){
						var pa=ps[i],ndis=ppDis(p,pa);
						if((adis==undefined && ndis<dis) || (ndis<dis && ndis<adis) ){
							adis=ndis;
							pid=i;
						}
					}
					if(adis!=undefined) return {dis:adis,delta:[ps[pid][0]-p[0],ps[pid][1]-p[1]],isPoint:true,id:pid};
				}
				
				var rst={}
				for(var i=0,len=ps.length;i<len;i++){
					var pa=ps[i],pb=i==(len-1)?ps[0]:ps[i+1],pdis=pDisToLine(p,[pa,pb]);
					if(pdis<dis) rst={dis:pdis,ps:[pa,pb],tag:i};
				}
				if(root.empty(rst)) return false;
				
				//计算垂直点的位移
				var pp=self.plumb(p,rst.ps);
				if(isIn){
					var pa=rst.ps[0],pb=rst.ps[1];
					if((pp[0]>pa[0]&&pp[0]>pb[0])||(pp[0]<pa[0]&&pp[0]<pb[0])) return false;
				}
				var rt={dis:rst.dis,delta:[pp[0]-p[0],pp[1]-p[1]],id:rst.tag};
				return rt;
			}
		},
		
		/*从点组里取出线段的方法*/
		getLine:function(arr,start){
			if(start>arr.length-1) return false;
			var rst=[arr[start]];
			rst.push(arr[start==(arr.length-1)?0:start+1]);
			return rst;
		},
		
		/*角度清理*/
		anClean: function (a) {
            var x = Math.PI + Math.PI;
            if (a < 0) return self.anClean(a + x);
            if (a >= x) return self.anClean(a - x);
            return a;
       },
       
       /*角度转弧度*/
        akRtoN:function(n){return Math.PI*self.anClean(n)/180},
        
        /*弧度转角度*/
	    akNtoR:function(n){return 180*n/Math.PI},
	};
	root.regComponent(reg);
})(window.T);