import React, { useCallback, useEffect, useState, useContext } from 'react';
import styled from 'styled-components';

import AccountBackground from '../components/backgrounds/AccountBackground';
import ProfileSection from '../components/sections/ProfileSection';
import MainButton from '../components/buttons/MainButton';
import { useAuth } from '../context/AuthContext';
import { WalletContext } from '../context/WalletContext';
import { useSuccess } from '../context/SuccessContext';
import { useError } from '../context/ErrorContext';
import { useLoading } from '../context/LoadingContext';
import { signOut } from 'aws-amplify/auth';

import { incentivizeUpload } from '../apis/IncentivizeUpload';
import { getUserDataUploads } from '../apis/DataUpload';
import { getTransactions } from '../apis/DataTransactions';

import FeatureCard from '../components/cards/FeatureCard';
import RowTransactionsCard from '../components/cards/RowTransactionsCard';
import { faLinkedin, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faDigitalTachograph } from '@fortawesome/free-solid-svg-icons/faDigitalTachograph';

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: left;
    width: 430px;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  border-bottom: 1px solid #ccc;
  width: 100%;
`;

const Tab = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  color: ${(props) => (props.isActive ? 'white' : '#999')};
  font-weight: ${(props) => (props.isActive ? 'bold' : 'normal')};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0px;
    bottom: -1px;
    height: 2px;
    background-color: ${(props) => (props.isActive ? 'white' : 'transparent')};
    transition: background-color 0.3s ease;
  }

  &:hover {
    color: white;
  }
`;

const idConverter = (id) => {
    switch (id) {
        case 'linkedin':
            return faLinkedin;
        case 'tiktok':
            return faTiktok;
        case 'youtube-music':
            return faYoutube;
        default:
            return faDigitalTachograph;
    }
}

const Account = () => {
    const [activeTab, setActiveTab] = useState('Rewards');
    const [rewards, setRewards] = useState([]);
    const [claimedRewards, setClaimedRewards] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const { openLoadingModal, closeLoadingModal } = useLoading();
    const { openSuccessModal } = useSuccess();
    const { openErrorModal } = useError();

    const { user } = useAuth();
    const { walletAddress, connectWallet, disconnectWallet } = useContext(WalletContext);

    const fetchRewards = useCallback(async () => {
        if (!user?.username) {
            return;
        }

        try {
            const userRewards = await getUserDataUploads(user?.username);
            // filer out the rewards that have been claimed
            const claimedRewardsData = userRewards.filter(reward => reward.rewardClaimed === true);
            setClaimedRewards(claimedRewardsData);
            // filter out the rewards that have not been claimed
            const rewardsData = userRewards.filter(reward => reward.rewardClaimed === false);
            setRewards(rewardsData);
        } catch (err) {
            console.error('Error fetching rewards:', err);
        } finally {
            // setLoading(false);
            console.log('Rewards fetched');
        }
    }, [user]);

    const fetchTransactions = useCallback(async () => {
        if (!user?.username) {
            return;
        }

        try {
            const transactions = await getTransactions(walletAddress);
            console.log('Transactions:', transactions);

            setTransactions(transactions);

        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            // setLoading(false);
            console.log('Transactions fetched');
        }
    }, [user, walletAddress]);

    const downloadFile = async (presignedUrl) => {
        try {
            const response = await fetch(presignedUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.zip';
            a.click();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    }

    const handleTab = (tab) => {
        setActiveTab(tab);
        if (tab === 'Transactions') {
            fetchTransactions();
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut();
            await disconnectWallet();
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }


    const handleClaimReward = async (dataPoolId) => {
        try {
            openLoadingModal({
                loadingHeader: 'Claiming Reward...',
                loadingMessage: 'Please wait while we credit the CGDX tokens to your wallet'
            })

            await incentivizeUpload(user?.username, dataPoolId, walletAddress);

            closeLoadingModal();

            fetchRewards();
            openSuccessModal({
                successHeader: 'Success',
                successMessage: 'Reward claimed successfully, please check your wallet for the CGDX tokens'
            });
        } catch (error) {
            console.error(error);
            openErrorModal({
                errorHeader: 'Error',
                errorMessage: 'Error claiming reward'
            });
        }
    }

    useEffect(() => {
        fetchRewards();
    }, [fetchRewards]);


    return (
        <AccountBackground>
            <ProfileSection>
                <div>
                    <h2>Account</h2>
                    <h5>{user?.signInDetails?.loginId}</h5>
                </div>
                <ButtonContainer className='button-container'>
                    <MainButton
                        header='Sign Out'
                        subheader='Click to sign out'
                        onClick={handleSignOut}
                    />
                    <MainButton
                        header={walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
                        subheader={walletAddress ? 'Click to disconnect' : 'Connect your wallet'}
                        onClick={walletAddress ? disconnectWallet : connectWallet}
                        active={walletAddress}
                    />
                </ButtonContainer>
                <TabsContainer>
                    <Tab isActive={activeTab === 'Rewards'} onClick={() => setActiveTab('Rewards')}>
                        Rewards
                    </Tab>
                    <Tab isActive={activeTab === 'Claimed'} onClick={() => setActiveTab('Claimed')}>
                        Claimed
                    </Tab>
                    <Tab isActive={activeTab === 'Transactions'} onClick={() => handleTab('Transactions')}>
                        Transactions
                    </Tab>
                </TabsContainer>
                {activeTab === 'Rewards' && rewards.length > 0 &&
                    <div className='rewards-container'>
                        {rewards.map((reward, index) => (
                            <FeatureCard
                                key={index}
                                icon={idConverter(reward.dataPoolId)}
                                title={reward.dataPoolId}
                                description={<>Data Quality Score: {reward.dataQualityScore}, <br></br>  Click to claim the rewards</>}
                                onClick={() => handleClaimReward(reward.dataPoolId)}
                                direction='left'
                            />
                        ))}
                    </div>
                }
                {activeTab === 'Rewards' && rewards.length === 0 &&
                    <div className='no-rewards-container'>
                        <h4>No rewards available</h4>
                        <p>Contribute data to DataPools to earn rewards</p>
                        <MainButton header='Explore DataPools' subheader='Contribute data to earn rewards' onClick={() => window.location.href = '/DataPool'} />
                    </div>
                }
                {activeTab === 'Claimed' && claimedRewards.length > 0 &&
                    <div className='rewards-container'>
                        {claimedRewards.map((reward, index) => (
                            <FeatureCard
                                key={index}
                                icon={idConverter(reward.dataPoolId)}
                                title={reward.dataPoolId}
                                description={<>Data Quality Score: {reward.dataQualityScore}, claimed</>}
                                onClick={() => console.log('Claim reward')}
                                direction='left'
                            />
                        ))}
                    </div>
                }
                {activeTab === 'Claimed' && claimedRewards.length === 0 &&
                    <div className='no-rewards-container'>
                        <div>
                            <h4>No rewards claimed</h4>
                            <p>Earn rewards by contributing data to DataPools</p>
                        </div>
                        <MainButton header='Explore DataPools' subheader='Contribute data to earn rewards' onClick={() => window.location.href = '/DataPool'} />
                    </div>
                }
                {activeTab === 'Transactions' && transactions.length > 0 &&
                    <div className='transactions-container'>
                        {transactions.map((transaction, index) => (
                            <RowTransactionsCard
                                key={index}
                                txHash={transaction.transactionHash}
                                time={transaction.createdAt}
                                txStatus={transaction.status}
                                description={transaction.averageDataQuality}
                                cost={transaction.spentAmount}
                                boughtHashes={transaction.uploadHashes}
                                onClick={() => downloadFile(transaction.presignedUrl)}
                            />
                        ))}
                    </div>
                }
            </ProfileSection>
        </AccountBackground>
    )
}

export default Account;
