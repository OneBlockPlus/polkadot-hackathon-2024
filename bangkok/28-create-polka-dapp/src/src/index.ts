#!/usr/bin/env node

import { confirm, input, select } from "@inquirer/prompts";

import ora from "ora";

import * as fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import createDirectoryContents from "./createDirectoryContents.js";
import endingLogs from "./logs.js";

type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
};

const CURR_DIR = process.cwd();

// dirname is not available in ES6 modules
const __dirname = dirname(fileURLToPath(import.meta.url));

const PROJECT_TYPE_CHOICES: Choice<string>[] = [
  ...fs.readdirSync(path.join(__dirname, "..", "templates")).map((type) => {
    const projectType = type.replace(/-/g, " + ").replace(/_/g, " ");
    return {
      value: type,
      name: projectType,
    };
  }),
  { value: "frontend_contract", name: "frontend + contract" },
];

const PROJECT_CHOICES = (type: string) =>
  fs
    .readdirSync(path.join(__dirname, "..", "templates", type))
    .map((project) => {
      const isDisabled = project.at(-1) === "d";
      return {
        value: project,
        name: project.replace(/-/g, " + ").replace(/_/g, " "),
        disabled: isDisabled,
      };
    });

const selectedProjectType = await select({
  message: "What Polkadot app type are you building",
  choices: PROJECT_TYPE_CHOICES,
});

let selectedFrontend = "";
let selectedContract = "";
let selectedProject = "";

if (selectedProjectType === "frontend_contract") {
  selectedFrontend = await select({
    message: "Select a frontend template:",
    choices: PROJECT_CHOICES("frontend"),
  });
  selectedContract = await select({
    message: "Select a contract template:",
    choices: PROJECT_CHOICES("contract"),
  });
} else {
  selectedProject = await select({
    message: "What project template would you like to generate?",
    choices: PROJECT_CHOICES(selectedProjectType),
  });
}

const projectName = await input({
  message: "Project name:",
  validate: (input: string) => {
    if (
      /^(?:@[a-zA-Z\d\-*~][a-zA-Z\d\-*._~]*\/)?[a-zA-Z\d\-~][a-zA-Z\d\-._~]*$/.test(
        input
      )
    )
      return true;

    return "Project name may only include letters, numbers, underscores and hashes.";
  },
});

const templatePaths: string[] = [];
let useSubDir = false;

if (selectedProjectType !== "frontend_contract") {
  useSubDir = await confirm({
    message:
      "Do you want to create a subdirectory for this template? (EG: project-name/frontend or project-name/contract)",
    default: false,
  });
} else {
  useSubDir = true;
}

const spinner = ora(
  `creating a new Polkadot Dapp in ${CURR_DIR}/${projectName}`
).start();

if (selectedProjectType === "frontend_contract") {
  templatePaths.push(
    path.join(__dirname, "..", `templates/frontend/${selectedFrontend}`)
  );
  templatePaths.push(
    path.join(__dirname, "..", `templates/contract/${selectedContract}`)
  );
} else {
  templatePaths.push(
    path.join(
      __dirname,
      "..",
      `templates/${selectedProjectType}/${selectedProject}`
    )
  );
}

fs.mkdirSync(`${CURR_DIR}/${projectName}`);

for (const templatePath of templatePaths) {
  createDirectoryContents(templatePath, projectName, useSubDir);
}

spinner.succeed();

console.log("\n");

endingLogs(selectedProjectType, projectName, useSubDir);

process.exit(0);
