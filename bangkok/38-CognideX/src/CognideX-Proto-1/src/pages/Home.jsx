import React from 'react'

import MainBg from '../components/backgrounds/MainBg'
import GradientBg from '../components/backgrounds/GradientBackground'
import FirstSection from '../components/sections/FirstSection'
import SecondSection from '../components/sections/SecondSection'

import MainButton from '../components/buttons/MainButton'
import FeatureCard from '../components/cards/FeatureCard'

import CognideXLogo from '../assets/logo/cognidex-logo.svg';
import ThirdSection from '../components/sections/ThirdSection'
import ForthSection from '../components/sections/ForthSection'

const Home = () => {
    return (
        <MainBg>
            <GradientBg>
                <FirstSection>
                    <div>
                        <h1>
                            The Decentralized
                        </h1>
                        <h1>
                            AI Data Marketplace
                        </h1>
                    </div>
                    <h4>
                        A platform where anyone can contribute data and <br></br>
                        anyone can access the anonymous data all using CGDX
                    </h4>
                    <div className='button-container'>
                        <MainButton header='Explore DataPool' subheader='Monetize your Data' />
                    </div>
                </FirstSection>
                <SecondSection>
                    <div className='card-collection'>
                        <FeatureCard logo={CognideXLogo} title="Unlock Insights" description={<>Empowering users with SAFE and RELIABLE data-driven insights at UNPRECEDENTED SPEEDS</>} />
                        <FeatureCard logo={CognideXLogo} title="Vast Dataset" description={<>Access 22,000 DATASETS from over 15 DATA PROVIDERS, spanning 100+ CATEGORIES</>} />
                    </div>
                    <h1>
                        D-GPT <br></br>The Smart Assistant
                    </h1>
                    <h4>
                        Find the data that REALLY matters to you, search with use cases, not keywords and get the data you need - FAST
                    </h4>
                </SecondSection>
                <ThirdSection>
                    <h1>
                        MAXING OUT <br></br>
                        DATA For EVERYONE
                    </h1>
                    <h4>
                        Start contributing to the DATAPOOL and MONETIZE your data today <br></br>
                        Buy data from the DATAPOOL and access DATA like never before, all using CGDX
                    </h4>
                    <div className='card-collection'>
                        <FeatureCard logo={CognideXLogo} title="Data Providers" description={<>Contribute data to the DATAPOOL and MONETIZE your data</>} />
                        <FeatureCard logo={CognideXLogo} title="Data Consumers" description={<>Access the DATAPOOL and get the data you need FAST</>} />
                    </div>
                </ThirdSection>
                <ForthSection>
                    <div className='card-collection'>
                        <div className='card'>
                            <FeatureCard logo={CognideXLogo} title="Utility" description={<>The CGDX token is the UTILITY token for the DATAPOOL</>} />
                        </div>
                        <div className='card'>
                            <FeatureCard logo={CognideXLogo} title="Buy and Sell" description={<>Buy and sell data using the CGDX token</>} />
                        </div>
                        <div className='card'>
                            <FeatureCard logo={CognideXLogo} title="Data Monetization" description={<>Monetize your data and GET PAID in CGDX</>} />
                        </div>
                    </div>
                    <h1>
                        The CGDX Token
                    </h1>
                    <h4>
                        A token that EMCOMPASSES Data like never before, BUY and SELL data all using CGDX
                    </h4>
                </ForthSection>
            </GradientBg>
        </MainBg>
    )
}

export default Home
