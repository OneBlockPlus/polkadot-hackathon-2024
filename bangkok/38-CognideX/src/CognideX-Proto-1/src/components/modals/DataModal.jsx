import React, { useState, useEffect, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import MainButtonInvert from '../buttons/MainButtonInvert';
import { WalletContext } from '../../context/WalletContext';
import { useData } from '../../context/DataContext';
import { useLoading } from '../../context/LoadingContext';
import { useSuccess } from '../../context/SuccessContext';
import { useError } from '../../context/ErrorContext';

import { Moonbeam_setup } from '../../smart-contracts/moonbeam_setup';

// Keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const scaleOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
`;

// Styled components with animations
const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 101;
  animation: ${(props) =>
    props.animationType === 'in' ? fadeIn : fadeOut} 0.3s ease-in-out forwards;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 400px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 0 10px var(--primary-color);
  border: 2px solid black;
  padding: 10px;
  gap: 10px;
  transition: all 0.3s ease-in-out;
  animation: ${(props) =>
    props.animationType === 'in' ? scaleIn : scaleOut} 0.3s ease-in-out forwards;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  h3 {
    font-size: 30px;
    font-family: 'Modernist', sans-serif;
    color: black;
    margin: 0;
  }
`;

const CloseButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  height: auto;
  max-height: 90vh;
  max-width: 400px;
  text-align: left;
  overflow-y: auto;

  p {
    margin: 0;
    font-size: 20px;
    color: black;
    font-weight: 600;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header {
    border-bottom: 2px solid black;
    padding-bottom: 5px;
  }

  .tabulate {
    padding-top: 5px;
    border-top: 2px solid black;
  }
`;

const TableItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: auto;
`
const Overlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: calc(100% - 10px);
  background: black;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  cursor: pointer;
  z-index: 100;
  padding: 5px;
  border-radius: 5px;
`;

const CheckoutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: auto;
  position: relative;
  overflow: hidden;
  padding: 5px 0;

  &:hover {
    ${Overlay} {
      transform: translateX(0);
    }
  }
`;



const ModalEnd = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  min-height: 50px;
  margin-top: 30px;
  gap: 10px;
`;

// Success Modal Component
const DataModal = () => {
  const [animationType, setAnimationType] = useState('in');
  const [isVisible, setIsVisible] = useState(false);
  const { dataInfo, setDataInfo, closeDataModal, dataModalOpen } = useData();
  const { walletAddress, connectWallet, disconnectWallet } = useContext(WalletContext);
  const { initializeContracts, approveTokens, purchaseUploads } = Moonbeam_setup();
  const { openLoadingModal, setLoadingMessage, closeLoadingModal } = useLoading();
  const { openSuccessModal } = useSuccess();
  const { openErrorModal } = useError();

  useEffect(() => {
    if (dataModalOpen) {
      setIsVisible(true);
      setAnimationType('in');
    } else if (!dataModalOpen && isVisible) {
      setAnimationType('out');
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [dataModalOpen, isVisible]);

  if (!isVisible) return null;

  const totalCost = dataInfo.reduce((acc, curr) => acc + curr.price, 0);

  const handleApproveAndPurchase = async () => {
    try {

      openLoadingModal({
        loadingHeader: 'Approving Tokens...',
        loadingMessage: 'You will be prompted to approve the usage of tokens in your wallet.'
      })
      // Initialize the contracts
      await initializeContracts();
      // Step 1: Approve the tokens
      await approveTokens(totalCost);

      setLoadingMessage({
        loadingHeader: 'Purchasing Uploads...',
        loadingMessage: 'Your uploads are being purchased. Please wait...'
      })

      // Step 2: If approval succeeds, proceed to purchase uploads
      await purchaseUploads(dataInfo, totalCost);

      closeLoadingModal();

      openSuccessModal({
        successHeader: 'Uploads Purchased',
        successMessage: 'Your uploads have been successfully purchased. View and download them in your account.'
      })

      setAnimationType('out');
      setTimeout(() => {
        closeDataModal();
      }, 300);
    } catch (error) {
      console.error("Error during approval and purchase: ", error);

      closeLoadingModal();

      openErrorModal({
        errorHeader: 'Error during purchase',
        errorMessage: 'There was an error while purchasing the uploads. Please try again.'
      })
    }
  };

  const handleClose = () => {
    setAnimationType('out');
    setTimeout(() => {
      closeDataModal();
    }, 300);
  };

  const removeData = (uploadHash) => {
    const updatedData = dataInfo.filter((data) => data.uploadHash !== uploadHash);
    if (updatedData.length === 0) {
      handleClose();
      setDataInfo(updatedData);
    } else {
      setDataInfo(updatedData);
    }
  };

  return (
    <Background animationType={animationType}>
      <Modal animationType={animationType}>
        <ModalHeader>
          <h3>Data Selected</h3>
          <CloseButton onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71A1 1 0 0 0 5.7 7.12L10.59 12l-4.88 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.42L13.41 12l4.88-4.88a1 1 0 0 0 0-1.41z" />
            </svg>
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <TableItem className="header">
            <p>Upload Hash</p>
            <p>Price</p>
          </TableItem>
          {dataInfo.map((data) => (
            <CheckoutItem key={data.uploadHash} onClick={() => removeData(data.uploadHash)}>
              <p>{data.uploadHash}</p>
              <p>{data.price} CGDX</p>
              <Overlay>
                Remove
              </Overlay>
            </CheckoutItem>
          ))}
          <TableItem className="tabulate">
            <p>Total</p>
            <p>
              {totalCost} CGDX
            </p>
          </TableItem>
        </ModalBody>
        <ModalEnd>
          <MainButtonInvert
            header={walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
            subheader={walletAddress ? 'Click to disconnect' : 'Connect your wallet'}
            onClick={walletAddress ? disconnectWallet : connectWallet}
            active={walletAddress}
          />
          <MainButtonInvert onClick={handleApproveAndPurchase} header="Checkout" subheader="Proceed & Pay" />
        </ModalEnd>
      </Modal>
    </Background>
  );
};

export default DataModal;
