
import fs from 'fs'
import path from 'path'
  
export const createAlgorithmHelperFile = (data: string, directory: string) => {

  const directoryPath = path.join(process.cwd(), directory, "assembly");

  if (!fs.existsSync(directoryPath))
    fs.mkdirSync(directory)

  const filePath = path.join(directoryPath, 'NejaHelper.ts');

  try {
    fs.writeFileSync(filePath, data)
    return true;
  } catch (e) {
    return false;
  }
}

// Function to create or append to .env file
export function writeToEnvFile(data: string) {
  const envFilePath = path.join(process.cwd(), '.env');

  // Check if .env file exists, if not create it
  if (!fs.existsSync(envFilePath)) {
    fs.writeFileSync(envFilePath, data);
    console.log('\n.env file created successfully.');
  } else {
    // Append data to existing .env file
    fs.appendFileSync(envFilePath, '\n' + data);
    console.log('\nSecret added to .env file successfully.');
  }
}


// Function to create or append to .env file
export function writeToGitIgnore(data: string) {
  const envFilePath = path.join(process.cwd(), '.gitignore');

  // Check if .env file exists, if not create it
  if (!fs.existsSync(envFilePath)) {
    fs.writeFileSync(envFilePath, data);
  } else {
    // Append data to existing .env file
    fs.appendFileSync(envFilePath, '\n' + data);
  }
}


function executeJSInContext(jsCode: string, commandToExecute: string) {
  // Create a new function that wraps the jsCode and the command to execute
  const wrappedCode = `
    ${jsCode}
    
    // Return the result of the command
    (function() {
      return ${commandToExecute};
    })();
  `;

  // Use Function constructor instead of eval for better scoping
  const executionFunction = new Function(wrappedCode);

  try {
    // Execute the function and return the result
    return executionFunction();
  } catch (error) {
    console.error('Error executing command:', error);
    return null;
  }
}



export function readWasmAsBytes(filePath: string): number[] {
  // Read the file as a buffer
  const buffer = fs.readFileSync(filePath);
  
  // Convert the buffer to a Uint8Array
  const uint8Array = new Uint8Array(buffer);
  
  // Convert the Uint8Array to a regular array of numbers
  return Array.from(uint8Array);
}


interface AsBuildConfig {
  targets?: {
    [key: string]: any;
  };
  options?: {
    bindings?: string;
    noExportMemory?: boolean;
    importMemory?: boolean;
    exportTable?: boolean;
    importTable?: boolean;
    exportStart?: boolean;
    noAssert?: boolean;
    [key: string]: any;
  };
}

export async function updateNejaConfig(filePath: string): Promise<void> {
  try {
    // Read the existing config file
    const configContent =  fs.readFileSync(filePath, 'utf-8');
    const config: AsBuildConfig = JSON.parse(configContent);

    // Update the specified values
    if (!config.options) {
      config.options = {};
    }

    config.options.bindings = "raw";
    config.options.noExportMemory = false;
    config.options.importMemory = true;
    config.options.exportTable = false;
    config.options.importTable = false;
    config.options.exportStart = false;
    config.options.noAssert = true;

    // Write the updated config back to the file
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(`Error updating config: ${error}`);
  }
}
