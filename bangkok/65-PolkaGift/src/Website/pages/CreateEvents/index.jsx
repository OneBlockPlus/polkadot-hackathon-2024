import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Button from 'react-bootstrap/Button';
import UseFormInput from '../../components/components/UseFormInput';
import UseFormTextArea from '../../components/components/UseFormTextArea';
import { Header } from '../../components/layout/Header'
import NavLink from 'next/link';
import isServer from '../../components/isServer';
import { useIPFSContext } from '../../contexts/IPFSContext';
import { toast } from 'react-toastify';
import { useUtilsContext } from '../../contexts/UtilsContext';
import { useMixedContext } from '../../contexts/MixedContext';


export default function CreateEvents() {
    const {EasyToast} = useUtilsContext();
    const [EventImage, setEventImage] = useState([]);
    const {UploadBlob} = useIPFSContext(); 
    const {GetTotalEvents,contract,sendTransaction,signerAddress,CurrentToken, FormatOtherType} = useMixedContext();

    const [EventTitle, EventTitleInput] = UseFormInput({
        defaultValue: "",
        type: 'text',
        placeholder: 'Event Title',
        id: ''
    });
    const [EventReceiveWallet, EventReceiveWalletInput] = UseFormInput({
        defaultValue: "",
        type: 'text',
        placeholder: `Event Receive Wallet (${FormatOtherType})`,
        id: ''
    });
    const [EventDescription, EventDescriptionInput] = UseFormTextArea({
        defaultValue: "",
        placeholder: 'Event Description',
        id: '',
        rows: 4
    });
    const [EventDate, EventDateInput] = UseFormInput({
        defaultValue: "",
        type: 'datetime-local',
        placeholder: 'Event End Date ',
        id: 'enddate',
    });
    const [EventGoal, EventGoalInput] = UseFormInput({
        defaultValue: "",
        type: 'text',
        placeholder: `Event Goal in ${CurrentToken}`,
        id: 'goal',
    });


    function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    }
    async function CreatePlugin(src) {
        const output = `<html><head></head><body><iframe src="${src}" style="width: 100%;height: 100%;" /></body></html>`;
        // Download it
        const blob = new Blob([output]);
        const fileDownloadUrl = URL.createObjectURL(blob);
        downloadURI(fileDownloadUrl, "Generated Plugin.html");
        console.log(output);
    }
    async function createEvent() {
        const ToastId = toast.loading('Uploading IPFS ...');
  
        var CreateEVENTBTN = document.getElementById("CreateEVENTBTN")
        CreateEVENTBTN.disabled = true
        let allFiles = []
        for (let index = 0; index < EventImage.length; index++) {
            const element = EventImage[index];
            const url = element.type ? await UploadBlob(element) : '';
            const image = {
              url,
              type: element.type
            };
            allFiles.push(image)
        }

        const createdObject = {
            title: 'Asset Metadata',
            type: 'object',
            properties: {
                Title: {
                    type: 'string',
                    description: EventTitle,
                },
                Description: {
                    type: 'string',
                    description: EventDescription,
                },
                Date: {
                    type: 'string',
                    description: EventDate,
                },
                Goal: {
                    type: 'string',
                    description: EventGoal
                },
                logo: {
                    type: 'string',
                    description: allFiles[0]
                },
                wallet: {
                    type: 'string',
                    description: signerAddress
                },
                wallet2: {
                    type: 'string',
                    description: EventReceiveWallet
                },
                typeimg: {
                    type: 'string',
                    description: "Event"
                },
                allFiles
            }
        };
        console.log('======================>Creating Event');
        toast.update(ToastId, { render: 'Creating Event...', isLoading: true });
    

        try {
            let eventid = await GetTotalEvents();
            const result = await sendTransaction('createEvent',[signerAddress,JSON.stringify(createdObject),(((new Date).valueOf()/1000).toFixed(0))]);

            if (document.getElementById("plugin").checked) {
                await CreatePlugin(`http://${window.location.host}/donation/auction?[${eventid}]`);
            }
            await EasyToast('Created Successfully!','success',true,ToastId)
            
            window.location.href = ('/donation');

        } catch (er) {
            console.error(er);
            // window.location.href = ('/login');
        }
    }


    function CreateEventBTN() {
        if (window.localStorage.getItem("Type") != "manager" ) {
            return (<>
                <NavLink href="/login?[/CreateEvents]">
                    <Button style={{ margin: "17px 0 0px 0px", width: "100%" }}>
                        Login as Event Manager
                    </Button>
                </NavLink>

            </>);
        }
        return (<>
            <Button id="CreateEVENTBTN" style={{ margin: "17px 0 0px 0px", width: "100%" }} onClick={createEvent}>
                Create Event
            </Button>
        </>)
    }
    function FilehandleChange(event) {
        var allNames = []
        for (let index = 0; index < event.target.files.length; index++) {
            const element = event.target.files[index].name;
            allNames.push(element)
        }
        for (let index2 = 0; index2 < event.target.files.length; index2++) {
            setEventImage((pre) => [...pre, event.target.files[index2]])
        }

    }

    function AddBTNClick(event) {
        var EventImagePic = document.getElementById("EventImage");
        EventImagePic.click();

    }

    function DeleteSelectedImages(event) {
        var DeleteBTN = event.currentTarget;
        var idImage = Number(DeleteBTN.getAttribute("id"))
        var newImages = [];
        var allUploadedImages = document.getElementsByName("deleteBTN");
        for (let index = 0; index < EventImage.length; index++) {
            if (index != idImage) {
                const elementDeleteBTN = allUploadedImages[index];
                elementDeleteBTN.setAttribute("id", newImages.length.toString())
                const element = EventImage[index];
                newImages.push(element);
            }
        }
        setEventImage(newImages);

    }
    if (isServer()) return null;
    return (
        <><>
            <Head>
                <title>Create Event</title>
                <meta name="description" content="Create Event" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header></Header>
            <div className="row" style={{ "height": "100%" }}>
                <div className='createevents col' >
                    <div style={{ padding: "19px", borderRadius: "4px", height: "100%", border: "white solid" }}>
                        <div style={{ margin: "0px 0px 30px 0px" }}>
                            <h1>Create Event</h1>
                        </div>

                        <div style={{ margin: "18px 0" }}>
                            <h6>Event Title</h6>
                            {EventTitleInput}
                        </div>

                        <div style={{ margin: "18px 0" }}>
                            <h6>Event Description</h6>
                            {EventDescriptionInput}
                        </div>

                        <div style={{ margin: "18px 0" }}>
                            <h6>Event End Date</h6>
                            {EventDateInput}
                        </div>
                        <div style={{ margin: "18px 0" }}>
                            <h6>Event Receive Wallet ({FormatOtherType})</h6>
                            {EventReceiveWalletInput}
                        </div>
                        <div style={{ margin: "18px 0" }}>
                            <h6>Event Goal</h6>
                            {EventGoalInput}
                        </div>
                        <div style={{ height: '200px' }}>
                            <div className="Event-Create-file-container">
                                <input className="file-input" hidden onChange={FilehandleChange} id="EventImage" name="EventImage" type="file" multiple="multiple" />
                                <div className='Event-UploadedFileContainer'>
                                    {EventImage.map((item, i) => {
                                        return ( <div key={i} className='Event-Images'>
                                            <button onClick={DeleteSelectedImages} name='deleteBTN' id={i}>X</button>
                                            {(item.type.includes("image")) ? (<img className='Event-Images-imagebox' src={URL.createObjectURL(item)} />) : (<>
                                                <div className='Event-Uploaded-File-Container'>
                                                    <img className='Event-Uploaded-File-clip-icon' src='https://cdn1.iconfinder.com/data/icons/web-page-and-iternet/90/Web_page_and_internet_icons-10-512.png' />
                                                    <span className='Event-Uploaded-File-name'>{item.name.substring(0, 10)}...</span>
                                                </div>
                                            </>
                                            )}

                                        </div>)

                                    })}
                                    <div className='Event-ImageAdd'>
                                        <button id='Add-Image' onClick={AddBTNClick} className='Event-ImageAdd-button'>
                                            +
                                        </button>
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div style={{
                            margin: '18px 0px',
                            display: 'flex',
                            alignContent: 'center',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '5px'
                        }} >
                            <input type="checkbox" id="plugin" />
                            <h5 style={{ margin: '0' }}>Generate Plugin?</h5>
                        </div>
                        <CreateEventBTN />
                    </div>
                </div>
            </div>

        </>
        </>
    );
}
