import * as fs from "node:fs";
import path from "node:path";

const CURR_DIR = process.cwd();

export default function createDirectoryContents(
  templatePath: string,
  newProjectPath: string,
  _useSubDir = false
) {
  const filesToCreate = fs.readdirSync(templatePath);
  const isContract = templatePath.includes("/contract/");
  const subDir = _useSubDir ? (isContract ? "contract" : "frontend") : "";

  for (const file of filesToCreate) {
    const origFilePath = path.join(templatePath, file);
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, "utf8");
      let writePath = subDir
        ? path.join(CURR_DIR, newProjectPath, subDir, file)
        : path.join(CURR_DIR, newProjectPath, file);

      if (file === "_gitignore")
        writePath = subDir
          ? path.join(CURR_DIR, newProjectPath, subDir, ".gitignore")
          : path.join(CURR_DIR, newProjectPath, ".gitignore");
      if (file === "_env_example")
        writePath = subDir
          ? path.join(CURR_DIR, newProjectPath, subDir, ".env.example")
          : path.join(CURR_DIR, newProjectPath, ".env.example");

      if (file === "package.json") {
        const packageJson = JSON.parse(contents);
        packageJson.name = _useSubDir
          ? `${newProjectPath}-${subDir}`
          : newProjectPath;
        contents = JSON.stringify(packageJson, null, 2);
      }

      fs.mkdirSync(path.dirname(writePath), { recursive: true });
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      createDirectoryContents(
        `${templatePath}/${file}`,
        _useSubDir
          ? `${newProjectPath}/${subDir}/${file}`
          : `${newProjectPath}/${file}`
      );
    }
  }
}
