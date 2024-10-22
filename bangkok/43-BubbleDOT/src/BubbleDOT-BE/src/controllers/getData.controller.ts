import { Request, Response } from 'express';
import { getFileContent, findFileInSrc } from '../services/getBuildDataFile.Service';

const getAllDataController = async (req: Request, res: Response): Promise<void> => {
    const fileNames = ['flipper.contract', 'flipper.json', 'flipper.wasm'];
    let errors: string[] = [];
    let data: { [key: string]: string | null } = {
        'flipper.contract': null,
        'flipper.json': null,
        'flipper.wasm': null
    };

    for (const fileName of fileNames) {
        try {
            const filePath = await findFileInSrc(fileName);
            if (!filePath) {
                throw new Error(`File ${fileName} not found`);
            }
            data[fileName] = await getFileContent(filePath);
        } catch (error) {
            errors.push(`Error reading ${fileName}: ${(error as Error).message}`);
        }
    }

    if (errors.length > 0) {
        res.status(500).json({
            status: false,
            error: errors.join('; '),
            data: null
        });
    } else {
        res.status(200).json({
            status: true,
            error: null,
            data: data
        });
    }
};

export { getAllDataController };
