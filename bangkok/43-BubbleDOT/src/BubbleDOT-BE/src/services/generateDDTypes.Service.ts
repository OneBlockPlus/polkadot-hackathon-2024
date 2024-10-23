import { exec } from "child_process";
import path from 'path';
import { promises as fs } from 'fs';

const findFileInProject = async (fileName: string, startDir: string = process.cwd()): Promise<string | null> => {
    const stack = [startDir];

    while (stack.length > 0) {
        const currentDir = stack.pop()!;
        const files = await fs.readdir(currentDir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(currentDir, file.name);
            if (file.isDirectory()) {
                stack.push(fullPath);
            } else if (file.isFile() && file.name === fileName) {
                return fullPath;
            }
        }
    }

    return null;
};

const generateTypes = async (): Promise<void> => {
    const jsonFilePath = await findFileInProject('flipper.json');
    if (!jsonFilePath) {
        throw new Error('flipper.json not found');
    }
    const outputDir = path.join(process.cwd(), 'DedotScript');

    return new Promise((resolve, reject) => {
        const command = `dedot typink -m ${jsonFilePath} -o ${outputDir}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error generating types: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                if (stderr.toLowerCase().includes('error')) {
                    console.error(`stderr: ${stderr}`);
                    reject(new Error(stderr));
                    return;
                }
                console.log(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            console.log('Types generated successfully.');
            resolve();
        });
    });
};

export { generateTypes };
