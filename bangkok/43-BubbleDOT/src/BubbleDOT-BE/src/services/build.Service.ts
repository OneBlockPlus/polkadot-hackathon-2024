import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const findCargoTomlDir = async (startDir: string): Promise<string | null> => {
  const stack = [startDir];

  while (stack.length > 0) {
    const currentDir = stack.pop()!;
    const cargoTomlPath = path.join(currentDir, 'Cargo.toml');

    try {
      await fs.access(cargoTomlPath);
      return currentDir;
    } catch (err) {
      const subDirs = await fs.readdir(currentDir, { withFileTypes: true });
      for (const dirent of subDirs) {
        if (dirent.isDirectory()) {
          stack.push(path.join(currentDir, dirent.name));
        }
      }
    }
  }

  return null;
};

const buildProject = async (): Promise<{ message: string, status: string, error: string | null, data?: { 'flipper.contract': string, 'flipper.wasm': string, 'flipper.json': string } }> => {
  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    throw new Error('BUCKET_NAME is not defined');
  }

  const startDir = process.cwd();
  console.log(`Starting search for Cargo.toml from: ${startDir}`);

  const cargoDir = await findCargoTomlDir(startDir);
  if (!cargoDir) {
    throw new Error('Cargo.toml not found in any parent directory');
  }

  return new Promise((resolve, reject) => {
    console.log(`Starting pop build in: ${cargoDir}`);
    const process = exec('pop build --release', { cwd: cargoDir });

    process.stdout?.on('data', (data) => {
      console.log(data.toString());
    });

    process.stderr?.on('data', (data) => {
      console.error(data.toString());
    });

    process.on('close', async (code) => {
      if (code !== 0) {
        return reject(new Error(`Process exited with code ${code}`));
      }

      try {
        const contractPath = path.join(cargoDir, 'target', 'ink', 'flipper.contract');
        const wasmPath = path.join(cargoDir, 'target', 'ink', 'flipper.wasm');
        const jsonPath = path.join(cargoDir, 'target', 'ink', 'flipper.json');

        const contractData = await fs.readFile(contractPath, 'utf-8');
        const wasmData = await fs.readFile(wasmPath, 'utf-8');
        const jsonData = await fs.readFile(jsonPath, 'utf-8');

        resolve({
          message: 'Build initiated successfully.',
          status: 'success',
          error: null,
          data: {
            'flipper.contract': contractData,
            'flipper.wasm': wasmData,
            'flipper.json': jsonData,
          }
        });
      } catch (err) {
        reject(new Error(`Failed to read build files: ${(err as Error).message}`));
      }
    });
  });
};

export { buildProject };
