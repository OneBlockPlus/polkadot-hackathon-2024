import { useEffect } from "react";

function Minter(props) {
    
    const size = {
        row: [12],
    };

    useEffect(() => {
    }, []);

    return (
        <iframe id="minter" title="iNFT minter" src="https://inft.w3os.net/minter" frameBorder="0"></iframe>
    )
}

export default Minter;