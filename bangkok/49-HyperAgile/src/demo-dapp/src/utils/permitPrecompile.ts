import { Signature } from 'ethers';

import { signTypedData, readContract } from 'wagmi/actions';

import { moonbaseAlpha } from 'viem/chains';

import addresses from '@/data/addresses';
import wagmi from '@/config/wagmi';

import CallPermitABI from '@/contracts/CallPermitABI.json';

export const signPermitPrecompile = async (
    address: string,
    value: bigint,
    data: string
): Promise<any[]> => {
    const nonce = await readContract(wagmi, {
        abi: CallPermitABI,
        address: addresses.callPermit,
        functionName: 'nonces',
        args: [address],
    });

    const createPermitMessageData = function () {
        const message = {
            from: address,
            to: addresses.batch,
            value: value.toString(),
            data,
            gaslimit: 100000,
            nonce: (nonce as bigint).toString(),
            deadline: Date.now() + 50_000,
        };

        const typedData = {
            account: address,
            domain: {
                name: 'Call Permit Precompile',
                version: '1',
                chainId: moonbaseAlpha.id,
                verifyingContract: addresses.callPermit,
            },
            types: {
                EIP712Domain: [
                    {
                        name: 'name',
                        type: 'string',
                    },
                    {
                        name: 'version',
                        type: 'string',
                    },
                    {
                        name: 'chainId',
                        type: 'uint256',
                    },
                    {
                        name: 'verifyingContract',
                        type: 'address',
                    },
                ],
                CallPermit: [
                    {
                        name: 'from',
                        type: 'address',
                    },
                    {
                        name: 'to',
                        type: 'address',
                    },
                    {
                        name: 'value',
                        type: 'uint256',
                    },
                    {
                        name: 'data',
                        type: 'bytes',
                    },
                    {
                        name: 'gaslimit',
                        type: 'uint64',
                    },
                    {
                        name: 'nonce',
                        type: 'uint256',
                    },
                    {
                        name: 'deadline',
                        type: 'uint256',
                    },
                ],
            },
            primaryType: 'CallPermit',
            message: message,
        };

        return {
            typedData,
            message,
        };
    };

    const { message, typedData } = createPermitMessageData();
    const result = await signTypedData(wagmi, typedData as any);
    const signature = Signature.from(result);

    return [
        message.from,
        message.to,
        message.value,
        message.data,
        message.gaslimit,
        message.deadline,
        signature.v,
        signature.r,
        signature.s,
    ];
};
