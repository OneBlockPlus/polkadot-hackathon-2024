import { Request, Response, NextFunction } from 'express';
import { initializeContract, deployContract, disconnectClient } from '../services/deployDD.Service';

const deployEndpoint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const { client, deployer } = await initializeContract();

        try {
            const contractAddress = await deployContract(deployer);
            res.json({
                status: "success",
                data: `Contract Address: ${contractAddress}`,
                error: null
            });
        } catch (deployError) {
            if (deployError instanceof Error) {
                res.status(403).json({ 
                    status: "false",
                    data: null,
                    error: `Deployment error: ${deployError.message}`
                });
            } else {
                res.status(404).json({
                    status: "false",
                    data: null,
                    error: "Deployment error: Unknown error occurred"
                });
            }
        } finally {
            await disconnectClient(client);
        }
    } catch (error) {
        res.status(500).json({
            status: "false",
            data: null,
            error: error instanceof Error ? error.message : "Đã xảy ra lỗi"
        });
    }
};
export { deployEndpoint };
