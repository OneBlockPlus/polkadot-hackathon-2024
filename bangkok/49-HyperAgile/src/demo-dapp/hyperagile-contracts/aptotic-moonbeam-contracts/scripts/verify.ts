import { run } from 'hardhat';

export default async function verify(address: string, args: any[]) {
    try {
        await run('verify:verify', {
            address: address,
            constructorArguments: args,
        });
    } catch (e: any) {
        console.log(e);
    }
}
