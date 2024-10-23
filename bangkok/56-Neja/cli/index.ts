#!/usr/bin/env node

import chalk from 'chalk'
import figlet from 'figlet'
import { Command } from 'commander'
import loading from 'loading-cli'
import { setupNeja } from './commands/setup.js'
import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'
import { deployCloudFunctionOnChain } from './commands/deploy.js'

const asyncExec = promisify(exec)

const program = new Command();

program
  .name('neja')
  .version('0.0.1');

program
  .command('setup')
  .argument('<string>', 'Path to create the neja cloud functions project setup.')
  .description('Creates the neja file system for cloud functions ')
  .action(async (path: string) => {
    const load = loading("Setting up neja folder for your project...").start();
    try {
      await setupNeja(path);
    } catch (e: any) {
      console.log(e.message)
    } finally {
      load.stop();
    }
  });

program
  .command('deploy')
  .argument('<string>', 'Path to create the neja cloud functions project setup.')
  .description('Deploy the cloud function wasm to testnet.')
  .action(async (path) => {
    const load = loading("Deploying the cloud function for your project...").start();

    await deployCloudFunctionOnChain(path)

    load.stop();

    console.log(`✅ Deploy successful, the cloud function is now deployed on the Neja's testnet.`)
  });

program
  .command('compile')
  .argument('<string>', 'Path to create the neja cloud functions project setup.')
  .description('Compiles and generates the wasm code for the algorithm.')
  .action(async (path) => {
    // Change to the new directory
    const fullPath = path.resolve(path);
    process.chdir(fullPath);

    const load = loading("Compiling your cloud functions & generating the wasm build...").start();

    // Initialize AssemblyScript project
    await asyncExec('npm i && npm run asbuild:release');

    load.stop();
    console.log('✅ Build successful, the algorithm is compiled into wasm executable file.')
  });


program.parse();
