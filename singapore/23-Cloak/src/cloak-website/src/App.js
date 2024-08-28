import cloakLogo from './assets/cloak-logo.png';
import './App.css';

import React, { useEffect, useState } from 'react';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

import GithubButton from './components/buttons/GithubButton';
import MainButton from './components/buttons/MainButton';
import NumberInput from './components/inputs/NumberInput';

function App() {
  const [api, setApi] = useState(null);
  const [_chain, setChain] = useState('');
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(0);
  const [_status, setStatus] = useState('');
  const [ciphertext1, setCiphertext1] = useState('');
  const [ciphertext2, setCiphertext2] = useState('');
  const [operationIndex, setOperationIndex] = useState(0);
  const [decryptedResult, setDecryptedResult] = useState(0);

  const [voteTitle, setVoteTitle] = useState('');
  const [voteIndex, setVoteIndex] = useState(0);
  const [voteResult, setVoteResult] = useState('');
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    const connect = async () => {
      const wsProvider = new WsProvider('wss://testnet.admeta.network'); // Replace with your node's WS address
      const api = await ApiPromise.create({ provider: wsProvider });
      setApi(api);

      // Fetch chain info
      const chain = await api.rpc.system.chain();
      setChain(chain.toString());
    };

    connect();
  }, []);


  // encrypt extrinsic
  const submitEncryptNumbers = async () => {
    if (!api) return;

    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice'); // Use Alice's account as in your screenshot
    console.log('Encrypting numbers...');

    // Construct the extrinsic for `encryptNumbers`
    const extrinsic = api.tx.fheMath.encryptNumbers(number1, number2);

    // Sign and send the extrinsic
    const unsub = await extrinsic.signAndSend(alice, ({ status, events }) => {
      if (status.isInBlock) {
        setStatus(`Completed at block hash #${status.asInBlock}`);
        console.log(`Transaction included at blockHash ${status.asInBlock}`);

        // Process the events
        events.forEach(({ event: { data, method, section } }) => {
          console.log(`Event: ${section}.${method}`, data.length);

          // Assuming the event is `fheMath.CiphertextsGenerated` (replace with your actual event)
          if (section === 'fheMath' && method === 'NumbersEncrypted') {
            setCiphertext1(data[1]); // Extract and set ciphertext1
            setCiphertext2(data[2]); // Extract and set ciphertext2
          }

          console.log(`Ciphertext 1: ${ciphertext1}`);
          console.log(`Ciphertext 2: ${ciphertext2}`);
        });
        unsub(); // Unsubscribe from further updates
      } else {
        setStatus(`Current status: ${status.type}`);
        console.log(`Current status: ${status.type}`);
      }
    });
  };

  // decrypt extrinsic
  // const submitDecryptCiphertext_index = async (operation) => {
  //   if (!api) return;

  //   console.log('Decrypting numbers...');

  //   const keyring = new Keyring({ type: 'sr25519' });
  //   const alice = keyring.addFromUri('//Alice'); // Use Alice's account as in your screenshot

  //   // Construct the extrinsic for `encryptNumbers`
  //   const extrinsic = api.tx.fheMath.decryptResult(operationIndex, operation);

  //   // Sign and send the extrinsic
  //   const unsub = await extrinsic.signAndSend(alice, ({ status, events }) => {
  //     if (status.isInBlock) {
  //       setStatus(`Completed at block hash #${status.asInBlock}`);
  //       console.log(`Transaction included at blockHash ${status.asInBlock}`);

  //       // Process the events
  //       events.forEach(({ event: { data, method, section } }) => {
  //         console.log(`Event: ${section}.${method}`, data.length);

  //         // Assuming the event is `fheMath.CiphertextsGenerated` (replace with your actual event)
  //         if (section === 'fheMath' && method === 'ResultDecrypted') {
  //           setDecryptedResult(data[1][0]); // Extract and set decrypted result
  //         }

  //         console.log(`Decrypted Result: ${decryptedResult}`);
  //       });
  //       unsub(); // Unsubscribe from further updates
  //     } else {
  //       setStatus(`Current status: ${status.type}`);
  //       console.log(`Current status: ${status.type}`);
  //     }
  //   });
  // };

  const submitDecryptCiphertext = async (operation) => {
    if (!api) return;

    console.log('Decrypting numbers...');

    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice'); // Use Alice's account as in your screenshot

    // Construct the extrinsic for `encryptNumbers`
    const extrinsic = api.tx.fheMath.decryptCiphertexts(ciphertext1, ciphertext2, operationIndex, operation);

    // Sign and send the extrinsic
    const unsub = await extrinsic.signAndSend(alice, ({ status, events }) => {
      if (status.isInBlock) {
        setStatus(`Completed at block hash #${status.asInBlock}`);
        console.log(`Transaction included at blockHash ${status.asInBlock}`);

        // Process the events
        events.forEach(({ event: { data, method, section } }) => {
          console.log(`Event: ${section}.${method}`, data.length);

          // Assuming the event is `fheMath.CiphertextsGenerated` (replace with your actual event)
          if (section === 'fheMath' && method === 'ResultDecrypted') {
            setDecryptedResult(data[1][0]); // Extract and set decrypted result
          }

          console.log(`Decrypted Result: ${decryptedResult}`);
        });
        unsub(); // Unsubscribe from further updates
      } else {
        setStatus(`Current status: ${status.type}`);
        console.log(`Current status: ${status.type}`);
      }
    });
  };

  const submitInitiateVote = async () => {
    if (!api) return;

    console.log('Initiating vote...');

    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice'); // Use Alice's account as in your screenshot

    // Construct the extrinsic for `initiateVote`
    const extrinsic = api.tx.fheVote.initiateVote(voteTitle);

    // Sign and send the extrinsic
    const unsub = await extrinsic.signAndSend(alice, ({ status, events }) => {
      if (status.isInBlock) {
        setStatus(`Completed at block hash #${status.asInBlock}`);
        console.log(`Transaction included at blockHash ${status.asInBlock}`);

        // Process the events
        events.forEach(({ event: { data, method, section } }) => {
          console.log(`Event: ${section}.${method}`, data.length);
        });
        unsub(); // Unsubscribe from further updates
      } else {
        setStatus(`Current status: ${status.type}`);
        console.log(`Current status: ${status.type}`);
      }
    });
  }

  const submitCastVote = async (voteIndex, vote) => {
    try {
      if (!api) return;

      console.log('Casting vote...');

      const keyring = new Keyring({ type: 'sr25519' });
      const alice = keyring.addFromUri('//Alice'); // Use Alice's account as in your screenshot

      const extrinsic = api.tx.fheVote.vote(voteIndex, vote);

      // Sign and send the extrinsic
      const unsub = await extrinsic.signAndSend(alice, ({ status, events }) => {
        if (status.isInBlock) {
          setStatus(`Completed at block hash #${status.asInBlock}`);
          console.log(`Transaction included at blockHash ${status.asInBlock}`);

          // Process the events
          events.forEach(({ event: { data, method, section } }) => {
            console.log(`Event: ${section}.${method}`, data.length);
          });
          unsub(); // Unsubscribe from further updates
        } else {
          setStatus(`Current status: ${status.type}`);
          console.log(`Current status: ${status.type}`);
        }
      });
    } catch (error) {
    }
  }

  const submitFinalizeVote = async (voteIndex) => {
    try {
      if (!api) return;

      console.log('Finalizing vote...');

      const keyring = new Keyring({ type: 'sr25519' });
      const alice = keyring.addFromUri('//Alice'); // Use Alice's account as in your screenshot

      const extrinsic = api.tx.fheVote.finalizeVote(voteIndex);

      // Sign and send the extrinsic
      const unsub = await extrinsic.signAndSend(alice, ({ status, events }) => {
        if (status.isInBlock) {
          setStatus(`Completed at block hash #${status.asInBlock}`);
          console.log(`Transaction included at blockHash ${status.asInBlock}`);

          // Process the events
          events.forEach(({ event: { data, method, section } }) => {
            console.log(`Event: ${section}.${method}`, data.length);

            if (section === 'fheVote' && method === 'VoteResult') {
              setVoteCount(data[2]); // Extract and set decrypted result
              setVoteResult(
                // total votes / 2 > yay votes
                data[2] / 2 > data[1][0] ? 'NAY' : 'YAY'
              )
            }
          });

          unsub(); // Unsubscribe from further updates
        } else {
          setStatus(`Current status: ${status.type}`);
          console.log(`Current status: ${status.type}`);
        }
      });
    } catch (error) {
    }
  }

  const swapCiphertexts = () => {
    const temp = ciphertext1;
    setCiphertext1(ciphertext2);
    setCiphertext2(temp);
  }


  return (
    <div className="website-bg">
      <div className="header">
        <div className="logo">
          <img src={cloakLogo} alt="cloak-logo" className="cloak-logo" />
        </div>
        <h1 className="header-text">
          Polkadot's first
        </h1>
        <h1 className="header-text" style={{ color: 'lightcoral' }}>
          Fully Homomorphic Encryption (FHE)
        </h1>
      </div>
      <div className="body">
        <h2 className="body-text">
          What is FHE?
        </h2>
        <p className="body-text">
          Fully Homomorphic Encryption (FHE) is a form of encryption that allows computation on ciphertexts, generating an encrypted result which, when decrypted, matches the result of the operations as if they had been performed on the plaintext.
        </p>
        <h2 className="body-text">
          Here's an example:
        </h2>
        <p className="body-text">
          A pharmaceutical company wants to analyze patient data from multiple hospitals to study the effectiveness of a new drug. Each hospital encrypts their patient data with FHE and uploads it to a data marketplace. The pharmaceutical company runs its analysis on the encrypted data across all hospitals. The results, such as drug efficacy metrics, are then decrypted by each hospital and shared with the pharmaceutical company, ensuring that patient privacy is preserved throughout the process.
        </p>
        <h2 className="body-text">
          Let's get started!
        </h2>
        <GithubButton onClick={() => window.open('https://github.com/Cloak-Network')} buttonText="See our pallet" />
      </div>
      <div className="demo-body">
        <h2 className="body-text">
          FHE Arithmatic Demo
        </h2>
        <p className="body-text">
          What you will see below is a simple demonstration of how FHE can be used to perform arithmetic operations on encrypted data. This demo is fully interacting with the Solo Chain of the Cloak Network.
        </p>
        <div className="demo-input-container">
          <div className="demo-input-subcontainer">
            <NumberInput placeholder={'Enter first number'} onInput={(e) => setNumber1(e.target.value)} />
            <NumberInput placeholder={'Enter second number'} onInput={(e) => setNumber2(e.target.value)} />
            <NumberInput placeholder={'Enter operation index, first operation is 0'} onInput={(e) => setOperationIndex(e.target.value)} />
          </div>
          <div className="demo-input-subcontainer">
            <h3 className="body-text">
              What is happening here?
            </h3>
            <p className="body-text">
              In the input fields above, you can enter two numbers. These numbers will be encrypted into ciphertexts then you are able to perform arithmetic operations on them. The result will be decrypted and displayed below. Click the button below to encrypt and perform the operation. Remember to update the operation index as you create new ciphertexts.
            </p>
            <MainButton onClick={submitEncryptNumbers} buttonText="Encrypt" />
          </div>
        </div>
        <div className="demo-output-subcontainer">
          <h3 className="body-text">
            Result of Encryption
          </h3>
          <p className="body-text">
            The result of the encryption is displayed here. This is the ciphertext that is generated when you click the "Encrypt" button. Now, click the button below to perform the operation on the encrypted data.
          </p>
          <NumberInput placeholder={'Result'} onInput={(e) => setCiphertext1(e.target.value)} value={ciphertext1} />
          <NumberInput placeholder={'Result'} onInput={(e) => setCiphertext2(e.target.value)} value={ciphertext2} />
        </div>
        <div className="demo-output-subcontainer-row">
          <MainButton onClick={() => submitDecryptCiphertext('Add')} buttonText="Add & Decrypt" />
          <MainButton onClick={() => submitDecryptCiphertext('Sub')} buttonText="Subtract & Decrypt" />
          <MainButton onClick={() => submitDecryptCiphertext('Mul')} buttonText="Multiply & Decrypt" />
          <MainButton onClick={() => swapCiphertexts()} buttonText="Swap Position" />
        </div>
        <div className="demo-output-subcontainer">
          <h3 className="body-text">
            Result of Operation on Encrypted Data (Decrypted)
          </h3>
          <p className="body-text">
            The result of the operation on the encrypted data is displayed here. This is the plaintext that is generated when you click the "Add & Decrypt", "Subtract & Decrypt", or "Multiply & Decrypt" button.
          </p>
          <NumberInput placeholder={'Result'} onInput={(e) => setDecryptedResult(e.target.value)} value={decryptedResult} />
        </div>
        <div className="demo-output-subcontainer-row">
          Note: Reset values to perform another operation on 2 new numbers, as secret keys are generated for each operation.
        </div>
      </div>
      <div className="demo-body">
        <h2 className="body-text">
          FHE Voting Demo
        </h2>
        <p className="body-text">
          How can FHE be used in voting systems? In a voting system, FHE can be used to encrypt votes, tally the encrypted votes, and decrypt the final result without revealing individual votes. This ensures voter privacy and integrity of the election process.
        </p>
        <div className="demo-output-subcontainer">
          <h3 className="body-text">
            We can start off by initiating a vote
          </h3>
          <p className="body-text">
            Name the title of the vote and click the button below to initiate the vote.
          </p>
          <NumberInput placeholder={'Enter vote title'} onInput={(e) => setVoteTitle(e.target.value)} />
          <MainButton onClick={() => submitInitiateVote()} buttonText="Initiate Vote" />
        </div>
        <div className="demo-output-subcontainer">
          <h3 className="body-text">
            Vote Casting Process
          </h3>
          <p className="body-text">
            For example, here we can cast votes, click the button below to cast your vote. The votes will be encrypted and add to their respective tallies.
          </p>
          <NumberInput placeholder={'Index of voting pool'} onInput={(e) => setVoteIndex(e.target.value)} />
        </div>
        <div className="demo-output-subcontainer-row">
          <MainButton onClick={() => submitCastVote(voteIndex, 'Yes')} buttonText="Cast YAY vote" />
          <MainButton onClick={() => submitCastVote(voteIndex, 'No')} buttonText="Cast NAY vote" />
        </div>
        <div className="demo-output-subcontainer">
          <h3 className="body-text">
            Finalize Vote
          </h3>
          <p className="body-text">
            Once all votes have been cast, click the button below to finalize the vote.
          </p>
          <MainButton onClick={() => submitFinalizeVote(voteIndex)} buttonText="Finalize Vote" />
        </div>
        <div className="demo-output-subcontainer">
          <h3 className="body-text">
            Result of Vote
          </h3>
          <p className="body-text">
            The result of the vote is displayed here. This is the decrypted result of the vote. Where the tallies are compared and the result is displayed.
          </p>
          <p className="body-text">
            Vote Result:
          </p>
          <NumberInput placeholder={'Result'} onInput={(e) => setVoteResult(e.target.value)} value={voteResult} />
          <p className="body-text">
            Vote Count:
          </p>
          <NumberInput placeholder={'Result'} onInput={(e) => setVoteCount(e.target.value)} value={voteCount} />
        </div>
      </div>
    </div>
  );
}

export default App;
