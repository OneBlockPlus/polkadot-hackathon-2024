import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import DataPoolBuyBackground from '../components/backgrounds/DataPoolBuyBackground';
import BuyDataPoolSection from '../components/sections/BuyDataPoolSection';
import RowDataCard from '../components/cards/RowDataCard';

import { getDataPoolUploads } from '../apis/DataUpload';
import { getDataPoolInfo } from '../apis/DataPoolInfo';

import DataPopOut from '../components/popout/DataPopOut';
import { useData } from '../context/DataContext';

const BuyDataPool = () => {
    const location = useLocation();
    const path = location.pathname.split("/");
    const dataPoolName = path[path.length - 1];
    const { dataInfo, setDataInfo } = useData();

    const [uploads, setUploads] = useState([]);
    const [dataPoolInfo, setDataPoolInfo] = useState(null);

    const fetchDataUploads = useCallback(async () => {
        const dataPoolUploads = await getDataPoolUploads(dataPoolName.toLowerCase());
        if (dataPoolUploads) {
            setUploads(dataPoolUploads);
        }
    }, [dataPoolName]);

    const getDataPool = useCallback(async () => {
        const dataPoolInfo = await getDataPoolInfo(dataPoolName.toLowerCase());
        if (dataPoolInfo) {
            setDataPoolInfo(dataPoolInfo);
        }
    }, [dataPoolName]);

    useEffect(() => {
        getDataPool();
        fetchDataUploads();
    }, [getDataPool, fetchDataUploads]);

    const toggleSelectedUpload = (upload) => {
        setDataInfo(prevSelectedUpload => {
            const index = prevSelectedUpload.findIndex(item => item.uploadHash === upload.uploadHash);
            if (index !== -1) {
                // Remove the upload from selected uploads
                return prevSelectedUpload.filter(item => item.uploadHash !== upload.uploadHash);
            } else {
                // Add the upload to selected uploads
                return [...prevSelectedUpload, { uploadHash: upload.uploadHash, dataQualityScore: upload.dataQualityScore, price: upload.dataQualityScore * dataPoolInfo.price, dataPoolId: dataPoolInfo.dataPoolId }];
            }
        });
    };

    return (
        <DataPoolBuyBackground>
            {dataInfo?.length > 0 && <DataPopOut uploads={dataInfo} />}
            <BuyDataPoolSection>
                <h1>{dataPoolName} Data Pool</h1>
                <h4>
                    Pay per upload based on the data quality <br />
                    Max price per upload: {dataPoolInfo && dataPoolInfo.price * 10}
                </h4>
                {dataPoolInfo && uploads.length > 0 && (
                    <div className='upload-container'>
                        {uploads.map((upload, index) => (
                            <RowDataCard
                                key={index}
                                title={upload.dataQualityScore * dataPoolInfo.price}
                                uploadHash={upload.uploadHash}
                                description={upload.dataQualityScore}
                                onClick={() => toggleSelectedUpload(upload)}
                                selected={dataInfo.some(item => item.uploadHash === upload.uploadHash)}
                                time={upload.timestamp}
                            />
                        ))}
                    </div>
                )}
            </BuyDataPoolSection>
        </DataPoolBuyBackground>
    );
};

export default BuyDataPool;
