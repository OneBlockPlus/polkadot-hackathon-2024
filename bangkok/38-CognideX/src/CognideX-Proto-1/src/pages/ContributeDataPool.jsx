import React, { useState } from 'react'
import { useLocation } from 'react-router-dom';

import DataPoolContributeBg from '../components/backgrounds/DataPoolContributeBg';
import ContributeSection from '../components/sections/ContributeSection';

import UploadCard from '../components/cards/UploadCard';
import MainUpload from '../components/inputs/MainUpload';
import MainButton from '../components/buttons/MainButton';

import { faUpload, faCheck, faMoneyBill } from '@fortawesome/free-solid-svg-icons';

const ContributeDataPool = () => {
    // get the last part of the URL
    const location = useLocation();
    const path = location.pathname.split("/");
    const dataPoolName = path[path.length - 1];
    const [step, setStep] = useState({
        step: 1,
        title: 'Upload your data'
    });

    const handleUpload = () => {
        setStep({
            step: 2,
            title: 'Data Checking & Scoring'
        });
    }

    const [dataUploaded, setDataUploaded] = useState(null);


    return (
        <DataPoolContributeBg>
            <ContributeSection>
                <div>
                    <h4>Thanks for contributing your</h4>
                    <h1>{dataPoolName} Data</h1>
                    <h2>Step {step.step} - {step.title}</h2>
                </div>
                {step.step === 1 &&
                    <>
                        <div className='upload-container'>
                            <MainUpload label='Upload your data here' onChange={(e) => setDataUploaded(e.target.files[0])} />
                        </div>
                        <div className='button-container'>
                            <MainButton header='Upload' subheader='Your data be scored' onClick={handleUpload} />
                        </div>
                    </>
                }
                {step.step === 2 &&
                    <>
                        <div className='card-container'>
                            <UploadCard title='Data uploaded' description='The following file has been sent for verification:' icon={faUpload}>
                                <div className='file-info'>
                                    <p>Filename: {dataUploaded.name}</p>
                                    <p>Filesize: {dataUploaded.size} bytes</p>
                                    <p>DataPool: {dataPoolName}</p>
                                </div>
                            </UploadCard>
                            <UploadCard title='Data Processing' description='Your data will undergo the checks below' icon={faCheck}>
                                <div className='process-info'>
                                    <p>1. Data Authencity Check</p>
                                    <p>2. Data Quality Scoring</p>
                                    <p>3. Personal Identifiable Information (PII) Masking</p>

                                    <div className='score-info'>
                                        <p>Data Score: 8/10</p>
                                    </div>
                                </div>
                            </UploadCard>
                            <UploadCard title='Upload Code' description='You will need to use this Code to claim your rewards' icon={faMoneyBill}>
                                <div className='process-info'>
                                    <p>1. Keep this code safe</p>
                                    <p>2. Create a wallet to claim your rewards</p>
                                </div>
                                <div className='file-info'>
                                    <p>Code: 1234-5678-9012-3456</p>
                                </div>
                            </UploadCard>
                        </div>
                        <div className='button-container'>
                            <MainButton header='Next' subheader='Claim your rewards' />
                        </div>
                    </>
                }
            </ContributeSection>
        </DataPoolContributeBg>
    )
}

export default ContributeDataPool
