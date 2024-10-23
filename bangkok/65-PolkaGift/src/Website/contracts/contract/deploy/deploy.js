
// Just a standard hardhat-deploy deployment definition file!
const func = async (hre) => {
	const { deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();


	await deploy('PolkaGift', {
		from: deployer,
		log: true,
	});
};

module.exports = func;