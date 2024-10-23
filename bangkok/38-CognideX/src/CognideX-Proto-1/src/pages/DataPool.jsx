import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import FirstSection from '../components/sections/FirstSection';
import DataPoolSection from '../components/sections/DataPoolSection';
import DataPoolBackground from '../components/backgrounds/DataPoolBackground';
import CognideXLogo from '../assets/logo/cognidex-logo-black-gif.gif';
import MainButton from '../components/buttons/MainButton';
import FeatureCard from '../components/cards/FeatureCard';
import FeatureCardInvert from '../components/cards/FeatureCardInvert';

import { faLinkedin, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faDigitalTachograph } from '@fortawesome/free-solid-svg-icons/faDigitalTachograph';

import { getDataPoolList } from '../apis/DataPoolInfo';

const DataPool = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const roleParam = searchParams.get('role') || '';
    const role = roleParam;
    const [dataPoolInfo, setDataPoolInfo] = useState(null);

    const changeRole = (newRole) => {
        setSearchParams({ role: newRole });

        const element = document.getElementById(newRole === 'buy' ? 'buy-data-pool' : 'contribute-data-pool');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (!roleParam) return;

        const element = document.getElementById(roleParam === 'buy' ? 'buy-data-pool' : 'contribute-data-pool');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, [roleParam]);

    // Debounced scroll handler to prevent frequent state changes
    const handleScroll = useCallback(() => {
        if (role) return;

        if (window.scrollY > 100) {
            setSearchParams({ role: 'buy' });
        }
    }, [role, setSearchParams]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            // Clean up the event listener on unmount
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const fetchDataPoolInfo = useCallback(async () => {
        const data = await getDataPoolList();
        setDataPoolInfo(data);
    }, []);

    const idConverter = (id) => {
        switch (id) {
            case 'linkedin':
                return faLinkedin;
            case 'tiktok':
                return faTiktok;
            case 'youtube':
                return faYoutube;
            default:
                return faDigitalTachograph;
        }
    }

    useEffect(() => {
        fetchDataPoolInfo();
    }, [fetchDataPoolInfo]);

    return (
        <DataPoolBackground>
            <FirstSection>
                <div>
                    <h4>Explore DataPool by</h4>
                    <h1>
                        Buy,<br />
                        Contribute,<br />
                        Data with CGDX.
                    </h1>
                </div>
                <div className='button-container'>
                    <MainButton
                        header='Buy Data'
                        subheader='Contributed By Users'
                        onClick={() => changeRole('buy')}
                    />
                    <MainButton
                        header='Contribute Data'
                        subheader='And get some CGDX'
                        onClick={() => changeRole('contribute')}
                    />
                </div>
                <div className='logo-container'>
                    <img src={CognideXLogo} alt='CognideX Logo' />
                </div>
            </FirstSection>
            <DataPoolSection role={role}>
                <div
                    id='buy-data-pool'
                    style={{ display: role === 'buy' ? 'flex' : 'none' }}
                    className='inner-container'
                >
                    <h1>Buy</h1>
                    <h4>Individual Contributions or Entire DataPools</h4>
                    <div className='card-collection'>
                        {dataPoolInfo?.map((dataPool, index) => (
                            <FeatureCardInvert
                                key={index}
                                icon={idConverter(dataPool.dataPoolId)}
                                title={dataPool.dataPoolName}
                                description={<>Max Price per Upload:<br></br> {dataPool.maxIncentive} CGDX</>}
                                direction='left'
                                onClick={() => navigate(`/datapool/buy/${dataPool.dataPoolName}`)}
                            />
                        ))}
                    </div>
                </div>
                <div
                    id='contribute-data-pool'
                    style={{ display: role === 'contribute' ? 'flex' : 'none' }}
                    className='inner-container'
                >
                    <h1>Contribute</h1>
                    <h4>Monetize your Data by uploading into the various DataPools</h4>
                    <div className='card-collection'>
                        {dataPoolInfo?.map((dataPool, index) => (
                            <FeatureCard
                                key={index}
                                icon={idConverter(dataPool.dataPoolId)}
                                title={dataPool.dataPoolName}
                                description={<>Upload your {dataPool.dataPoolName} data <br></br> Earn up to {dataPool.maxIncentive} CGDX</>}
                                direction='left'
                                onClick={() => navigate(`/datapool/contribute/${dataPool.dataPoolName}`)}
                            />
                        ))}
                    </div>
                </div>
            </DataPoolSection>
        </DataPoolBackground>
    );
};

export default DataPool;
