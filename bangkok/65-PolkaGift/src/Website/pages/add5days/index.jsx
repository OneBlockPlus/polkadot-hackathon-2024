import React from 'react';
import Head from 'next/head';
import Button from 'react-bootstrap/Button';
import useContract from '../../services/useContract';
import { Header } from '../../components/layout/Header'
import NavLink from 'next/link';

export default function Add5DaysFORM() {
    const { contract, signerAddress,sendTransaction } = useContract();

    async function Adding5Days() {


        const totalEvent = await contract.totalEvent().call();
        for (let i = 0; i < Number(totalEvent); i++) {
            const valueAll = await contract.eventURI(i).call();
            const value = valueAll[1];
            if (value) {
                const object = JSON.parse(value);
                console.log(object.properties.Date.description)
                var c = new Date(object.properties.Date.description);
                c.setDate(c.getDate() + 5);
                object.properties.Date.description = c.toISOString()
                await sendTransaction(contract._setEventURI(i,valueAll[0], JSON.stringify(object)));
            }
        }
    }
 
function Add5DaysBTN(){    
    return (<>
        <Button style={{ margin: "17px 0 0px 0px", width: "100%" }} onClick={Adding5Days}>
            Add 5 days
        </Button>
    </>)
}


    return (
        <><>
            <Head>
                <title>Add 5 days from now to Event</title>
                <meta name="description" content="Add 5 days from now to Event" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header></Header>
            <div className="row" style={{ "height": "100%" }}>
                <div className='createevents col' >
                    <div style={{ padding: "19px", borderRadius: "4px", height: "100%", border: "white solid" }}>
                        
                        <Add5DaysBTN/>
                    </div>
                </div>
            </div>

        </>
        </>
    );
}
