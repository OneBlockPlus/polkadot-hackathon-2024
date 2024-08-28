import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { keccakAsHex } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring'
import { ApiPromise, WsProvider } from '@polkadot/api';

import { handle } from 'frog/vercel'

import { stringToBlakeTwo256Hash } from '../helper.js'

const keyring = new Keyring({ type: 'sr25519' });

type State = {
  transactionHash: string
  substrateAddress: string
}

export const app = new Frog<{ State: State }>({
  assetsPath: '/',
  basePath: '/api',
  title: 'Frog Frame',

  initialState: {
    transactionHash: '',
    substrateAddress: ''
  }
})



app.frame('/', (c) => {
  return c.res({
    action: '/next',
    image: (
      <div style={{
        backgroundColor: 'crimson',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 25,
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        flex: 1,
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 80,
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center'
        }}>
          Try Substrate ✨
        </div>
        <p style={{
          fontSize: 42,
          lineHeight: '1.5',
          margin: '0'
        }}>
          Remark with your EVM wallet on any substrate chain in just 2 clicks!
        </p>
      </div>

    ),
    intents: [
      <TextInput placeholder="What's happening?" />,
      <Button.Signature target="/sign">Sign Remark</Button.Signature>
    ]
  })
})

app.frame('/finish', (c) => {

  const state = c.deriveState()

  // const subA = stringToBlakeTwo256Hash("evm:" + c.frameData?.address)

  // console.log(subA)

  return c.res({
    action: '/next',
    image: (
      <div style={{
        background: 'linear-gradient(135deg, #2a9d8f, #264653)', /* Gradient from teal to dark blue-green */
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        flex: 1,
        textAlign: 'center',
        padding: '20px', /* Added padding for spacing */
        boxSizing: 'border-box' /* Ensure padding doesn't affect the element's width */
      }}>
        <div style={{
          fontSize: '80px',
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center'
        }}>
          Transaction Confirmed ✨
        </div>
        <p style={{
          fontSize: '42px',
          lineHeight: '1.5',
          margin: '0'
        }}>
          Hash: {state.transactionHash.slice(0, 4)}...{state.transactionHash.slice(state.transactionHash.length - 4)}
        </p>


        <p style={{
          fontSize: '42px',
          lineHeight: '1.5',
          margin: '0'
        }}>
          User Address: {state.substrateAddress}
        </p>
      </div>


    ),
    intents: [
      <TextInput placeholder="What's happening?" />,
      <Button.Link href={`https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/explorer/query/${state.transactionHash}`}>Open Explorer</Button.Link>,
      <Button.Signature target="/sign">Sign Another Remark</Button.Signature>
    ]
  })
})

app.frame('/next', async (c) => {
  const { transactionId } = c

  // Send transaction on-chain for the user.
  // Connect to a Substrate node
  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });

  const calls = [
    api.tx.system.remarkWithEvent(c.frameData?.inputText),
  ];

  async function sendTransactionAndGetBlockHash() {
    const pair = keyring.addFromUri('//Alice')
    return new Promise<String[]>((resolve, reject) => {
      api.tx.templateModule.execTxs(c.frameData?.address, transactionId, calls)
        .signAndSend(pair, async ({ status, events }) => {
          if (status.isInBlock || status.isFinalized) {
            const blockHash = status.asInBlock.toHex();
            console.log(`Transaction included in blockHash ${blockHash}`);
            let subsA = ''
            events.forEach(({ event: { data, method, section } }) => {
              if (method === 'UserSubstrateAddress' && section === 'templateModule') {
                const [address] = data;
                console.log('Extracted address:', address.toString());
                subsA = address.toString()
              }
            });
            resolve([blockHash.toString(), subsA]);
          } else if (status.isInvalid) {
            reject(new Error('Transaction failed'));
          }
        }).catch(error => {
          reject(error);
        });
    });
  }


  await c.deriveState(async previousState => {
    const t = await sendTransactionAndGetBlockHash()
    console.log('Tx Confirmed: ', t[0].toString())
    previousState.transactionHash = t[0].toString();
    previousState.substrateAddress = t[1].toString();
  })

  // Ask user to wait in the UI.

  return c.res({
    action: '/finish',
    image: (
      <div style={{
        background: 'linear-gradient(135deg, #e63946, #f1faee)', /* Gradient from crimson to light beige */
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        flex: 1,
        textAlign: 'center',
        padding: '20px', /* Added padding for spacing */
        boxSizing: 'border-box' /* Ensure padding doesn't affect the element's width */
      }}>
        <div style={{
          fontSize: '80px',
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center'
        }}>
          Transaction in process ⏳
        </div>
        <p style={{
          fontSize: '42px',
          lineHeight: '1.5',
          margin: '0'
        }}>
          Please wait for a couple of seconds...
        </p>
      </div>

    ),
    intents: [
      <Button>Check Status</Button>
    ]
  })
})

app.signature('/sign', async (c) => {
  // Connect to a Substrate node
  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });

  const calls = [
    api.tx.system.remarkWithEvent(c.frameData?.inputText),
  ];

  // Encode the calls
  const encodedCalls = api.createType('Vec<Call>', calls).toU8a();

  const callHash = keccakAsHex(encodedCalls);

  await api.disconnect()

  return c.signTypedData({
    chainId: 'eip155:84532',
    types: {
      Swamp: [{ name: 'calls_hash', type: 'string' }],
    },
    primaryType: 'Swamp',
    message: {
      calls_hash: callHash
    },
  })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
