import { Row, Col } from "react-bootstrap";
import { useEffect } from "react";
import { FaDownload } from "react-icons/fa";

function Web3storage(props) {
    const size = {
        row: [12],
    };


    const self={

    }

    useEffect(() => {
        
    }, [props.update]);

    const umap={ 
        color: "rgb(13, 110, 253)", 
        cursor: "pointer",
        marginLeft:"10px",
        marginRight:"10px"
    }

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <p>1. Click the download icon <FaDownload style={umap}/> at the right of "iNFT Components"</p>
                <p>2. Open <a href="http://web3.storage" target="_blank" rel="noopener noreferrer">web3.storage</a> to create a new space.</p>
                <p>3. Upload the iNFT definition JSON file, please unselect "Wrap in Directory", then the link is just for the new iNFT.</p>
                <p>4. After upload successful, check the "LIST", will find the CID and URL like: <a href="https://bafkreihze725zh5uqcffao5w27qdmaihjffjzj3wvtdfjocc33ajqtzc7a.ipfs.w3s.link" target="_blank" rel="noopener noreferrer">https://[CID].ipfs.w3s.link</a></p>
                <p>5. You can check the IPFS file on browser to confirm. Then you can share the CID <span className="text-warning">bafkreihze725zh5uqcffao5w27qd<br/>maihjffjzj3wvtdfjocc33ajqtzc7a</span></p>
            </Col>
        </Row>
    )
}

export default Web3storage;