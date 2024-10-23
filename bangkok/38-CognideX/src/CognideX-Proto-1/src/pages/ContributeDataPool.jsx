import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';

import DataPoolContributeBg from '../components/backgrounds/DataPoolContributeBg';
import ContributeSection from '../components/sections/ContributeSection';

import UploadCard from '../components/cards/UploadCard';
import MainUpload from '../components/inputs/MainUpload';
import MainButton from '../components/buttons/MainButton';

import { faUpload, faCheck, faMoneyBill } from '@fortawesome/free-solid-svg-icons';

import { uploadFile } from '../apis/AmplifyStorage';
import { dataQuality } from '../apis/DataQuality';
import { getDataPoolInfo } from '../apis/DataPoolInfo';

const ContributeDataPool = () => {
    // get the last part of the URL
    const location = useLocation();
    const path = location.pathname.split("/");
    const dataPoolName = path[path.length - 1].replace(/%20/g, '-');
    const [step, setStep] = useState({
        step: 1,
        title: 'Upload your data'
    });
    const [uploadStatus, setUploadStatus] = useState(1);
    const [dataUploaded, setDataUploaded] = useState(null);
    const [data_filepath, setDataFilepath] = useState(null);
    const [dataQualityScore, setDataQualityScore] = useState(null);
    const [dataError, setDataError] = useState(null);
    const [incentive, setIncentive] = useState(0);

    const getIncentive = useCallback(async (data_quality_score) => {
        const dataPoolInfo = await getDataPoolInfo(dataPoolName.toLowerCase());
        if (dataPoolInfo) {
            console.log('Data Pool Info:', dataPoolInfo);
            const incentiveCalc = dataPoolInfo.maxIncentive * data_quality_score / 10;
            console.log('Incentive:', incentiveCalc);
            setIncentive(incentiveCalc);
        } else {
            return 0;
        }
    }, [dataPoolName]);

    const handleUpload = async () => {
        if (!dataUploaded) {
            alert('Please upload a file');
            return;
        }
        const data_filepath = await uploadFile(dataUploaded, dataPoolName);
        setDataFilepath(data_filepath);
        setStep({
            step: 2,
            title: 'Data Checking & Scoring'
        });
    }

    const handleDataQuality = useCallback(async () => {
        try {
            const dataQualityRes = await dataQuality(dataPoolName, data_filepath);
            if (dataQualityRes.data.status_code) {
                setDataError(dataQualityRes.data.detail)
            } else {
                setDataQualityScore(dataQualityRes.data.data_quality_score)
            }
            getIncentive(dataQualityRes.data.data_quality_score);
            setUploadStatus(2);
        } catch (error) {
            console.error('Error calculating data quality:', error)
        }
    }, [data_filepath, dataPoolName, getIncentive]);

    useEffect(() => {
        if (data_filepath) {
            handleDataQuality();
        }
    }, [data_filepath, handleDataQuality]);


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
                            <UploadCard title='Data uploaded' description='The following file has been sent for verification:' icon={faUpload} active={uploadStatus > 0}>
                                <div className='file-info'>
                                    <p>Filename: {dataUploaded.name}</p>
                                    <p>Filesize: {dataUploaded.size} bytes</p>
                                    <p>DataPool: {dataPoolName}</p>
                                </div>
                            </UploadCard>
                            <UploadCard title='Data Processing' description='Your data will undergo the checks below' icon={faCheck} active={uploadStatus > 0}>
                                <div className='process-info'>
                                    <p>1. Data Authencity Check</p>
                                    <p>2. Data Quality Scoring</p>
                                    <p>3. Personal Identifiable Information (PII) Masking</p>

                                    <div className='score-info'>
                                        {dataError && <p>Error: {dataError}</p>}
                                        {dataQualityScore && <p>Data Quality Score: {dataQualityScore}</p>}
                                        {!dataQualityScore && !dataError && <p>Calculating...</p>}
                                    </div>
                                </div>
                            </UploadCard>
                            <UploadCard title='Upload Successful' description='You can claim the tokens in your account' icon={faMoneyBill} active={uploadStatus === 2}>
                                <div className='process-info'>
                                    <p>1. Create your Ethereum Wallet</p>
                                    <p>2. Link the wallet to your account and claim the rewards</p>
                                </div>
                                <div className='file-info'>
                                    <p>Reward: {incentive} CGDX</p>
                                </div>
                            </UploadCard>
                        </div>
                        <div className='button-container'>
                            <MainButton header='Next' subheader='Claim your rewards' onClick={() => window.location.href = '/account'} />
                        </div>
                    </>
                }
            </ContributeSection>
        </DataPoolContributeBg>
    )
}

export default ContributeDataPool
