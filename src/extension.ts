import * as vscode from 'vscode';
import { lines_Align } from './aligner/aligner';
import { config_Resolve_For_Document } from './aligner/config';

export function activate(context: vscode.ExtensionContext) {
	console.log('Ladnik Column Aligner is now active!');

	const disposable_Align_Selection = vscode.commands.registerCommand('ladnik.alignSelection', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const selection = editor.selection;
		const text = editor.document.getText(selection);
		const lines = text.split('\n');

		const config = await config_Resolve_For_Document(editor.document);
		const result = lines_Align(config, lines);

		editor.edit(editBuilder => {
			editBuilder.replace(selection, result.join('\n'));
		});
	});

	const disposable_Align_File = vscode.commands.registerCommand('ladnik.alignFile', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const document = editor.document;
		const lines = document.getText().split('\n');

		const config = await config_Resolve_For_Document(document);
		const result = lines_Align(config, lines);

		editor.edit(editBuilder => {
			editBuilder.replace(
				new vscode.Range(
					document.positionAt(0),
					document.positionAt(document.getText().length)
				),
				result.join('\n')
			);
		});
	});

	const disposable_Configure = vscode.commands.registerCommand('ladnik.configure', async () => {
		const workspace_Root = vscode.workspace.rootPath;
		if (!workspace_Root) {
			vscode.window.showErrorMessage('No workspace opened');
			return;
		}

		const config_Path = `${workspace_Root}/.ladnikrc.json`;
		const config_Content = `{
  "align": {
    "separators": ["=>", "::", "=", ":", "->", ","],
    "padding": 2,
    "alignComments": true,
    "ignorePrefix": ["//", "#", ";"],
    "languages": []
  },
  "rules": {
    ".php": {
      "separators": ["=>", "::", "->"],
      "alignComments": false
    },
    ".js": {
      "separators": ["=", ":"],
      "padding": 1
    },
    ".py": {
      "separators": ["="],
      "ignorePrefix": ["#"]
    },
    ".css": {
      "separators": [":"],
      "padding": 1,
      "ignorePrefix": ["/*", "*/"]
    }
  }
}`;
		
		try {
			await vscode.workspace.fs.writeFile(vscode.Uri.file(config_Path), new Uint8Array(Buffer.from(config_Content, 'utf8')));
			vscode.window.showInformationMessage(`Configuration file created at ${config_Path}`);
			
			const doc = await vscode.workspace.openTextDocument(config_Path);
			await vscode.window.showTextDocument(doc);
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to create configuration file: ${error}`);
		}
	});

	// Регистрация форматтера по умолчанию
	const formatter = vscode.languages.registerDocumentFormattingEditProvider('*', {
		async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
			const text = document.getText();
			const lines = text.split('\n');
			const config = await config_Resolve_For_Document(document);
			const result = lines_Align(config, lines);

			return [vscode.TextEdit.replace(
				new vscode.Range(
					document.positionAt(0),
					document.positionAt(text.length)
				),
				result.join('\n')
			)];
		}
	});

	context.subscriptions.push(disposable_Align_Selection);
	context.subscriptions.push(disposable_Align_File);
	context.subscriptions.push(disposable_Configure);
	context.subscriptions.push(formatter);
}

export function deactivate() {}