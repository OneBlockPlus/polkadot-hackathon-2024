import { useState, useEffect } from "react";
import ListTemplate from "../component/list_template";

function Template(props) {
    const size = {
        row: [12],
        side: [2, 10],
    };

    let [update, setUpdate] = useState(0);

    const self = {
        fresh: () => {
            setUpdate(update + 1);
        },
    }

    useEffect(() => {
        self.fresh();
    }, [props.update]);

    return (
        <ListTemplate update={update} fresh={self.fresh} link={props.link} />
    )
}

export default Template;