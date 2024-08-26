
const RDS={};   //缓存render的方法

const config={
    //background:"#71366b",
    background:"#EEEEEE",
};

const self={
    border:(id,color)=>{
        const pen=RDS[id];
        const w=pen.canvas.clientWidth;
        const h=pen.canvas.clientHeight;
        pen.fillStyle=color===undefined?config.background:color;
		pen.fillRect(0,0,w,h);
    },
}

const Render= {
    create:(id,force)=>{
        if(RDS[id]!==undefined && force!==true) return RDS[id];
        const cvs=document.getElementById(id);		//1.创建好canvas并返回画笔
		RDS[id]=cvs.getContext("2d");
        self.border(id);
        return RDS[id];
    },
    active:(pen,w,h,sx,sy,color,width)=>{
        if(color!==undefined){
            pen.strokeStyle=color;
        }
        if(width!==undefined){
            pen.lineWidth=width;
        }
        pen.beginPath();
        pen.moveTo(sx,sy);
        pen.lineTo(sx+w,sy);
        pen.lineTo(sx+w,sy+h);
        pen.lineTo(sx,sy+h);
        //pen.lineTo(sx,sy);
        pen.closePath();
        pen.stroke();
        if(color!==undefined){
            pen.strokeStyle="#000000";
        }
        if(width!==undefined){
            pen.lineWidth=1;
        }
    },
    clear:(id)=>{
        self.border(id);
    },
    fill:(pen,color)=>{
        const w=pen.canvas.clientWidth;
        const h=pen.canvas.clientHeight;
        pen.fillStyle=(color===undefined?config.background:color);
		pen.fillRect(0,0,w,h);
    },
};

export default Render;