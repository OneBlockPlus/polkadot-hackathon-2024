export default function endingLogs(
  selectedProjectType: string,
  projectName: string,
  useSubDir: boolean
) {
  console.log("Done. Next steps:\n");

  if (selectedProjectType === "frontend_contract") {
    console.log(`1. cd ${projectName}`);
    console.log("2. For the frontend:");
    console.log("   cd frontend");
    console.log("   npm install");
    console.log("   npm run dev");
    console.log("\n3. For the contract:");
    console.log("   cd ../contract");
    console.log(
      "   Read the README.md file for instructions on compiling and deploying the contract."
    );
  } else if (selectedProjectType === "contract") {
    console.log(`1. cd ${projectName}`);
    if (useSubDir) {
      console.log("2. cd contract");
    }
    console.log(
      "3. Read the README.md file for instructions on compiling and deploying the contract."
    );
  } else {
    console.log(`1. cd ${projectName}`);
    if (useSubDir) {
      console.log("2. cd frontend");
    }
    console.log("3. npm install");
    console.log("4. npm run dev");
  }
}
