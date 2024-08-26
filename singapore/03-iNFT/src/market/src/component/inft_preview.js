import { useEffect, useState } from "react";

import Render from "../lib/render";
import TPL from "../system/tpl";

/* iNFT render component parameters
*   @param  {string}    id              //the canvas dom ID
*   @param  {string}    hash            //hash needed to render the iNFT
*   @param  {boolean}   hidden          //hide iNFT render result
*   @param  {array}     [offset]        //customer offset array for rendering
*   @param  {string}    [template]      //the template CID for rendering
*   @param  {boolean}   [hightlight]    //index of parts which is needed to be hightlight
*   @param  {boolean}   [force]         //force to autofresh the iNFT
*   @param  {boolean}   [animate]       //animate support
*   @param  {function}  [callback]      //callback function 
*/

let pre_hash = "";
let screen_lock = false;

function PriveiwINFT(props) {

    let [width, setWidth] = useState(400);
    let [height, setHeight] = useState(400);
    let [hidden, setHidden] = useState(true);

    const self = {
        show: (id, hash, tpl, offset, ck) => {
            setWidth(tpl.size[0]);
            setHeight(tpl.size[1]);

            Render.drop(id);
            const pen = Render.create(id);
            const basic = {
                cell: tpl.cell,
                grid: tpl.grid,
                target: tpl.size
            };
            const ani = !props.animate ? false : true
            if (ani) {
                Render.preview(pen, tpl.image, pre_hash, tpl.parts, basic, offset);
                screen_lock = true;
            }
            //console.log(`Rending:${hash}, offst: ${JSON.stringify(offset)}`);
            Render.preview(pen, tpl.image, hash, tpl.parts, basic, offset, props.hightlight, () => {
                screen_lock = false;
                return ck && ck();
            }, ani);
        },

        autoFresh: (ck) => {
            if (props.template !== undefined) {
                TPL.view(props.template, (def) => {
                    if (!def) return false;
                    self.show(props.id, props.hash, def, props.offset, ck);
                });
            } else {
                const tpl = TPL.current();
                if (tpl !== null) {
                    self.show(props.id, props.hash, tpl, props.offset, ck);
                } else {
                    return setTimeout(() => {
                        self.autoFresh(ck);
                    }, 200)
                }
            }
        },
        calcWidth: () => {
            return { width: "100%" };
        },
    }

    useEffect(() => {
        //!important, when animation is going on and the hash is not changed, fresh should be forbidden
        if (!props.template || !props.hash) {

        } else {
            if (props.force) {
                self.autoFresh(() => {
                    setHidden(!props.hidden ? false : true);
                    pre_hash = props.hash;
                });
            } else {

                if (!screen_lock && props.hash !== pre_hash) self.autoFresh(() => {
                    setHidden(!props.hidden ? false : true);
                    pre_hash = props.hash;
                });
            }
        }

    }, [props.hash, props.offset, props.id, props.template, props.hightlight, props.hidden]);


    return (
        <div className="backflip">
            <canvas
                hidden={hidden}
                width={width}
                height={height}
                id={props.id}
                style={self.calcWidth()}>

            </canvas>
            <img 
                hidden={!hidden} 
                src={`${window.location.origin}/imgs/logo.png`} 
                alt="iNFT logo" 
                style={self.calcWidth()} 
            />
        </div>
    )
}

export default PriveiwINFT;