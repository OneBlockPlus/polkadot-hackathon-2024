import { useState,useEffect } from "react";

/* Show image selected
*   @param  {object}    grid          //{x:10,y:15},  image grid             
*   @param  {object}    selected      //{row:1,start:4,ex:0,ey:0,amount:8}
*   @param  {object}    [background]  //{highlight:"#aabbcc",normal:"#ffffff"}
*/

function SVGImage(props) {
  
  let [list, setList]=useState([]);

  useEffect(() => {
    if(props.x && props.y){
      const arr=[];
      const w=props.width;
      for(let i=0;i<props.x;i++){
        for(let j=0;j<props.y;j++){
          arr.push({x:i*w,y:j*w});
        }
      }
      setList(arr);
    }
  }, [props.x,props.y]);

  return (
    <svg width={props.x*props.width} height={props.y*props.width} xmlns="http://www.w3.org/2000/svg">
      {list.map((row, index) => (
          <rect key={index} x={row.x} y={row.y} width={props.width} height={props.width} fill={props.background} stroke="black" strokeWidth="1" />
      ))}
    </svg>
  );
}
export default SVGImage;