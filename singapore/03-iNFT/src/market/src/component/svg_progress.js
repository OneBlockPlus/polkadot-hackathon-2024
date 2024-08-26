import { useState,useEffect } from "react";

/* progress bar
*   @param  {number}    width         //width of the svg
*   @param  {number}    amount        //total apply amount
*   @param  {number}    done          //accepted apply amount
*   @param  {number}    total         //bonus amount
*   @param  {object}    [background]  //{amount:"#000000",total:"#FFFFFF",done:"#abccdd"}
*/

function SVGProgress(props) {
  
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
export default SVGProgress;