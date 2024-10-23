import { useState,useEffect } from "react";

/* iNFT render component parameters
*   @param  {number}    x             //cell amount of x
*   @param  {number}    y             //cell amount of y
*   @param  {number}    width         //cell width
*   @param  {string}    [background]  //cell background color
*/

function SVGGrid(props) {
  
  let [list, setList]=useState([]);

  useEffect(() => {
    console.log(props.x,props.y);
    if(props.x && props.y){
      const arr=[];
      const w=props.width;
      for(let i=0;i<props.x;i++){
        for(let j=0;j<props.y;j++){
          arr.push({x:i*w,y:j*w,width:w});
        }
      }
      setList(arr);
    }
  }, [props.x,props.y]);

  return (
    <svg width={props.x*props.width} height={props.y*props.width} xmlns="http://www.w3.org/2000/svg">
      {list.map((row, index) => (
          <rect 
            key={index} 
            x={row.x} 
            y={row.y} 
            width={row.width} 
            height={row.width} 
            fill={props.background}
            stroke="black" 
            strokeWidth="1"
          />
      ))}
    </svg>
  );
}
export default SVGGrid;