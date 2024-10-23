import React from 'react'
import DGPTBackground from '../components/backgrounds/DGPTBackground'
import DGPTSection from '../components/sections/DGPTSection'

import ChatBox from '../components/ChatBox/ChatBox'

import RowFeatureCard from '../components/cards/RowFeatureCard'

const DGPT = () => {
    return (
        <DGPTBackground>
            <DGPTSection>
                <ChatBox />
                <div className='feature-container'>
                    <div className='feature-card-container'>
                        <RowFeatureCard title="22,000+ Datasets" description="Access a vast collection of diverse, high-quality datasets from various industries." direction='left' />
                        <RowFeatureCard title="20+ Data Providers" description="Partnering with top providers to ensure reliable and up-to-date data for your needs." direction='left' />
                        <RowFeatureCard title="100+ Categories" description="Find data across a wide range of topics, from healthcare to finance, all in one place." direction='left' />
                        <RowFeatureCard title="7 Languages" description="Explore datasets in multiple languages to cater to a global audience." direction='left' />
                    </div>
                </div>
            </DGPTSection>
        </DGPTBackground>
    )
}

export default DGPT
