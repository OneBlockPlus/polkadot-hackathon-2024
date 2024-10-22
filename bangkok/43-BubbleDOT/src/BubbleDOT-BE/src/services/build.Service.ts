import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';


const findCargoTomlDir = async (startDir: string): Promise<string | null> => {
  let currentDir = startDir;
  while (true) {
    const cargoTomlPath = path.join(currentDir, 'Cargo.toml');
    console.log(`Checking Cargo.toml in: ${cargoTomlPath}`);
    try {
      await fs.access(cargoTomlPath);
      return currentDir;
    } catch (err) {
      const parentDir = path.dirname(currentDir);
      console.log(`Parent directory: ${parentDir}`);
      if (parentDir === currentDir) {
        return null;
      }
      currentDir = parentDir;
    }
  }
};

const buildProject = async (bucketName: string): Promise<void> => {
  // Bắt đầu tìm kiếm từ thư mục tương ứng với bucketName
  const cargoDir = await findCargoTomlDir(path.join(process.cwd(), 'src', bucketName));
  if (!cargoDir) {
    throw new Error('Cargo.toml not found in any parent directory');
  }
  return new Promise((resolve, reject) => {
    exec('cargo build', { cwd: cargoDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing cargo build: ${error.message}`);
      }
      if (stdout) {
        console.log(`Build stdout: ${stdout}`);
      }
      
      if (stderr) {
        console.warn(`Build stderr: ${stderr}`);
      }
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
};


export { buildProject };