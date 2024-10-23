import { promises as fs } from 'fs';
import path from 'path';

const getFileContent = async (filePath: string): Promise<string> => {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return data;
    } catch (error) {
        throw new Error(`Unable to read file: ${(error as Error).message}`);
    }
}

const findFileInSrc = async (fileName: string, startDir: string = path.join(process.cwd())): Promise<string | null> => {
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
}

export { getFileContent, findFileInSrc };
