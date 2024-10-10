import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import FirstSection from '../components/sections/FirstSection';
import DataPoolSection from '../components/sections/DataPoolSection';
import DataPoolBackground from '../components/backgrounds/DataPoolBackground';
import CognideXLogo from '../assets/logo/cognidex-logo-black-gif.gif';
import MainButton from '../components/buttons/MainButton';
import FeatureCard from '../components/cards/FeatureCard';

import { faLinkedin, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';

const DataPool = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const roleParam = searchParams.get('role') || 'buy';
    const role = roleParam;

    const changeRole = (newRole) => {
        // Update the URL with the new role
        setSearchParams({ role: newRole });

        // Scroll to the appropriate section
        let element;
        if (newRole === 'buy') {
            element = document.getElementById('buy-data-pool');
        } else {
            element = document.getElementById('contribute-data-pool');
        }

        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (!role) return;
        // Scroll to the appropriate section when the role changes (e.g., via browser navigation)
        let element;
        if (role === 'buy') {
            element = document.getElementById('buy-data-pool');
        } else {
            element = document.getElementById('contribute-data-pool');
        }

        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, [role]);

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
                    <div className='card-collection'></div>
                </div>
                <div
                    id='contribute-data-pool'
                    style={{ display: role === 'contribute' ? 'flex' : 'none' }}
                    className='inner-container'
                >
                    <h1>Contribute</h1>
                    <h4>Monetize your Data by uploading into the various DataPools</h4>
                    <div className='card-collection'>
                        <FeatureCard title='LinkedIn' description={<>Upload your LinkedIn data <br></br> Earn up to 100 CGDX</>} direction='left' icon={faLinkedin} onClick={() => navigate('/datapool/contribute/LinkedIn')} />
                        <FeatureCard title='TikTok' description={<>Upload your TikTok data <br></br> Earn up to 80 CGDX</>} direction='left' icon={faTiktok} onClick={() => navigate('/datapool/contribute/TikTok')} />
                        <FeatureCard title='YouTube' description={<>Upload your YouTube data <br></br> Earn up to 60 CGDX</>} direction='left' icon={faYoutube} onClick={() => navigate('/datapool/contribute/YouTube')} />
                    </div>
                </div>
            </DataPoolSection>
        </DataPoolBackground>
    );
};

export default DataPool;
