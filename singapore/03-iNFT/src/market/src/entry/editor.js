import { useEffect } from "react";

function Editor(props) {
    useEffect(() => {
    }, []);

    return (
        <iframe id="minter" title="iNFT minter" src="https://inft.w3os.net/editor" frameBorder="0"></iframe>
    )
}

export default Editor;