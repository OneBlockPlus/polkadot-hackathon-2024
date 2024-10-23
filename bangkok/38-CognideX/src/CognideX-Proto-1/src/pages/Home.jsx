import React from 'react'

import MainBg from '../components/backgrounds/MainBg'
import GradientBg from '../components/backgrounds/GradientBackground'
import FirstSection from '../components/sections/FirstSection'
import SecondSection from '../components/sections/SecondSection'

import MainButton from '../components/buttons/MainButton'
import FeatureCard from '../components/cards/FeatureCard'
import RowFeatureCard from '../components/cards/RowFeatureCard'

import MainSlider from '../components/slider/MainSlider'

import CognideXLogo from '../assets/logo/cognidex-logo.svg';
import ThirdSection from '../components/sections/ThirdSection'
import ForthSection from '../components/sections/ForthSection'

const Home = () => {
    const cardData = [
        {
            logo: CognideXLogo,
            title: "Utility",
            description: <>The CGDX token is the UTILITY token for the DATAPOOL</>,
        },
        {
            logo: CognideXLogo,
            title: "Buy and Sell",
            description: <>Buy and Contribute data using the CGDX token</>,
        },
        {
            logo: CognideXLogo,
            title: "Data Monetization",
            description: <>Monetize your data and GET PAID in CGDX</>,
        },
    ];
    return (
        <MainBg>
            <GradientBg>
                <FirstSection>
                    <div>
                        <h4>
                            CognideX Decentralized Data Exchange
                        </h4>
                        <h1>
                            Own your data,
                        </h1>
                        <h1>
                            Shape the future.
                        </h1>
                    </div>
                    <h4>
                        A platform that provides FAIR incentives for data contributors, <br></br>
                        allowing access to data like never before
                    </h4>
                    <div className='button-container'>
                        <div className='button-container'>
                            <MainButton header='D-GPT' subheader='Find the Data you need' onClick={() => window.location.href = '/D-GPT'} />
                        </div>
                        <div className='button-container'>
                            <MainButton header='Explore DataPool' subheader='Monetize your Data' onClick={() => window.location.href = '/DataPool'} />
                        </div>
                    </div>
                </FirstSection>
                <ThirdSection>
                    <h1>
                        MAXING OUT <br></br>
                        DATA for EVERYONE
                    </h1>
                    <h4>
                        Start contributing to the DataPool and Monetize your data today <br></br>
                        Buy data from the DataPool and access data like never before, all using CGDX
                    </h4>
                    <div className='card-collection'>
                        <FeatureCard logo={CognideXLogo} title="Data Providers" description={<>Contribute data to the DATAPOOL and MONETIZE your data</>} />
                        <FeatureCard logo={CognideXLogo} title="Data Consumers" description={<>Access the DATAPOOL and get the data you need FAST</>} />
                    </div>
                </ThirdSection>
                <SecondSection>
                    <div className='card-collection'>
                        <FeatureCard logo={CognideXLogo} title="Unlock Insights" description={<>Empowering users with SAFE and RELIABLE data-driven insights at UNPRECEDENTED SPEEDS</>} />
                        <FeatureCard logo={CognideXLogo} title="Vast Dataset" description={<>Access 22,000 DATASETS from over 15 DATA PROVIDERS, spanning 100+ CATEGORIES</>} />
                    </div>
                    <h1>
                        D-GPT <br></br>The Smart Assistant
                    </h1>
                    <h4>
                        Find the data that really matters to you, search with use cases, not keywords and get the data you need - fast
                    </h4>
                </SecondSection>
                <ForthSection>
                    <div className='card-collection'>
                        {cardData.map((card, index) => (
                            <div className='card' key={index}>
                                <FeatureCard
                                    logo={card.logo}
                                    title={card.title}
                                    description={card.description}
                                />
                            </div>
                        ))}
                    </div>
                    <div className='card-slider'>
                        <MainSlider slideWidth={100}>
                            {cardData.map((card, index) => (
                                <RowFeatureCard
                                    key={index}
                                    logo={card.logo}
                                    title={card.title}
                                    description={card.description}
                                    direction='left'
                                    minHeight='300px'
                                />
                            ))}
                        </MainSlider>
                    </div>
                    <h1>
                        The CGDX Token
                    </h1>
                    <h4 id="footer">
                        A token that EMCOMPASSES Data like never before, BUY and SELL data all using CGDX
                    </h4>
                </ForthSection>
            </GradientBg>
        </MainBg>
    )
}

export default Home
