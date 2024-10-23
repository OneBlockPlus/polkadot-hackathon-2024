// Everything transactions
import { IUpdateUser, IUser } from '@components/user/user.interface';
import config from '@config/config';
import amqp from 'amqplib';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { update } from '@components/user/user.service';
console.log(config.httpRpc, 'this is rpc url');

const web3 = new Web3('https://rpc.api.moonbase.moonbeam.network');

class TransactionsQueue {
  public channel: any;
  public connection: any;

  public async connectQueue() {
    try {
      this.connection = await amqp.connect(config.rabbitMqUrl);
      this.channel = await this.connection.createChannel();
      this.channel.prefetch(1);
      await this.channel.assertQueue('approvalQueue');
    } catch (error) {
      console.log(error);
    }
  }

  public async queueApprovalTransaction(user: IUser) {
    try {
      var data = JSON.stringify(user);
      await this.channel.sendToQueue('approvalQueue', Buffer.from(data));
    } catch (error) {
      console.log(error);
    }
  }

  public async processTransactionsQueue() {
    if (!this.channel) {
      await this.connectQueue();
    }

    await this.channel.assertQueue('approvalQueue');

    this.channel.consume(
      'approvalQueue',
      function (payload) {
        if (payload != null) {
          let user: IUser = JSON.parse(payload.content.toString());
          console.log('===== Receive =====');
          console.log(user);

          const abi = [
            {
              inputs: [
                {
                  internalType: 'address',
                  name: '_user',
                  type: 'address',
                },
                {
                  internalType: 'bytes32',
                  name: '_id',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint256',
                  name: '_amount',
                  type: 'uint256',
                },
              ],
              name: 'approve',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ];
          const trustDropsContract = new web3.eth.Contract(
            abi as AbiItem[],
            config.lunacredContractAddress,
          );
          const adminAddress = web3.eth.accounts.privateKeyToAccount(
            config.adminKey_wallet,
          );
          try {
            const methodCall = trustDropsContract.methods.approve(
              user.address,
              web3.utils.keccak256(user.twitterId),
              user.airdropAmount,
            );
            const encoded = methodCall.encodeABI();
            methodCall
              .estimateGas({ from: adminAddress.address })
              .then(async (gas) => {
                const tx = {
                  nonce: parseInt(
                    web3.utils.toHex(
                      await web3.eth.getTransactionCount(
                        adminAddress.address,
                        'pending',
                      ),
                    ),
                  ),
                  gas: Number(gas) * 2,
                  gasPrice: 50000000000,
                  to: config.lunacredContractAddress,
                  data: encoded,
                  from: adminAddress.address,
                };
                console.log(tx);
                web3.eth.getBalance(adminAddress.address).then(console.log);
                web3.eth
                  .getBalance(config.lunacredContractAddress)
                  .then(console.log);

                web3.eth.accounts
                  .signTransaction(tx, config.adminKey_wallet)
                  .then((signed) => {
                    web3.eth
                      .sendSignedTransaction(signed.rawTransaction)
                      .on('receipt', (receipt) => {
                        console.log('Approval receipt - ', receipt);
                        update(user, { approved: true } as IUpdateUser);
                      })
                      .on('error', (err) => {
                        console.log('Approval failure - ', err);
                      });
                  });
              });
          } catch (error) {
            console.log('errored for user - ', user, error);
          }
        }
      },
      {
        noAck: true,
      },
    );
  }
}

export default new TransactionsQueue();
