import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";

const ignoreLocation = ".git/info/exclude";

export function activate(context: vscode.ExtensionContext) {
  let addToLocalIgnore = vscode.commands.registerCommand("gitignorelocal.addToLocalIgnore", (fileUri?: vscode.Uri) => {
    const folders = vscode.workspace.workspaceFolders;
    if (!fileUri || !folders?.length) {
      return;
    }
    const workspacePath = folders[0].uri;
    // Check to see if the file already exists
    const ignorePath = vscode.Uri.file(path.join(workspacePath.path, ignoreLocation));
    const exists = fs.existsSync(ignorePath.fsPath);
    const fileToIgnoreRelPath = fileUri.path.replace(workspacePath.path, "");
    let newContents = `${fileToIgnoreRelPath}\n`;
    if (exists) {
      // Get original file contents
      const originalContents = fs.readFileSync(ignorePath.fsPath, { encoding: "utf-8" });
      // Return early if the file already exists
      if (originalContents.includes(`${newContents}`) || originalContents.endsWith(fileToIgnoreRelPath)) {
        return;
      }
      newContents = `${originalContents}\n${newContents}`;
    }

    // Append the line to the existing content
    fs.writeFileSync(ignorePath.fsPath, newContents, "utf8");
    // TODO: Trigger re-run of git status
  });

  let removeFromLocalIgnore = vscode.commands.registerCommand(
    "gitignorelocal.removeFromLocalIgnore",
    (fileUri?: vscode.Uri) => {
      const folders = vscode.workspace.workspaceFolders;
      if (!fileUri || !folders?.length) {
        return;
      }
      const workspacePath = folders[0].uri;
      // Check to see if the file already exists
      const ignorePath = vscode.Uri.file(path.join(workspacePath.path, ignoreLocation));
      const exists = fs.existsSync(ignorePath.fsPath);
      const fileToIgnoreRelPath = fileUri.path.replace(workspacePath.path, "");
      let newContents = `${fileToIgnoreRelPath}\n`;
      if (!exists) {
        return;
      }
      // Get original file contents
      const originalContents = fs.readFileSync(ignorePath.fsPath, { encoding: "utf-8" });

      // Remove the entry
      newContents = originalContents.replace(newContents, "");

      // Append the line to the existing content
      fs.writeFileSync(ignorePath.fsPath, newContents, "utf8");
      // TODO: Trigger re-run of git status
    }
  );

  context.subscriptions.push(addToLocalIgnore);
  context.subscriptions.push(removeFromLocalIgnore);
}

export function deactivate() {}
