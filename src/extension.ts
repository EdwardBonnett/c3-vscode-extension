// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import SocketServer from './socketServer';
import ProjectDefinitions from './definitions';
import CompletionItemProvider from './completionItemProvider';
import * as fs from 'fs';

let server: SocketServer | null = null;
let statusBar: vscode.StatusBarItem;
let path: vscode.Uri | null = null;
let autoCompleteKeys: Record<string, any> = {};
let languageProvider: vscode.Disposable;

export async function activate(context: vscode.ExtensionContext) {
	path = vscode.workspace.workspaceFolders?.length ? vscode.workspace.workspaceFolders[0].uri : null;

	try {
		setupDebug(context);
	} catch (ex: any) {
		vscode.window.showInformationMessage(ex);
	}
	try {
		setupServer(context);
	} catch (ex: any) {
		vscode.window.showInformationMessage(ex);
	}
	try {
		getDefinitions(context);
	} catch (ex: any) {
		vscode.window.showInformationMessage(ex);
	}

	const myCommandId = 'construct3.checkStatus';
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		vscode.window.showInformationMessage(`Hosted websocket server on localhost:3003`);
	}));

	vscode.workspace.onDidSaveTextDocument((e) => {
		server?.fileSaved();
	});

	statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBar.command = myCommandId;
	statusBar.show();
	statusBar.text = 'C3 - Connecting...';
	context.subscriptions.push(statusBar);

	let regenerateDefinitions = vscode.commands.registerCommand('construct3.regenerateDefinitions', () => {
		getDefinitions(context);
	});
	context.subscriptions.push(regenerateDefinitions);

	let createDebug = vscode.commands.registerCommand('construct3.createDebug', () => {
		setupDebug(context, true);
	});
	context.subscriptions.push(regenerateDefinitions);
	context.subscriptions.push(createDebug);
}

function setupDebug (context: vscode.ExtensionContext, warnExists = false) {
	if (fs.existsSync(path?.fsPath + '/.vscode/launch.json')) {
		if (warnExists) {vscode.window.showInformationMessage('.vscode/launch.json already exists');}
		return;
	}
    if (!fs.existsSync(path?.fsPath + '/.vscode')) {
        fs.mkdirSync(path?.fsPath + '/.vscode');
    }
	const src = context.asAbsolutePath('.') + '/templates/launch.json';
	fs.promises.copyFile(src, path?.fsPath + '/.vscode/launch.json').then(() => {
		vscode.window.showInformationMessage('Debug config created');
	});

}


function setupServer (context: vscode.ExtensionContext) {
	server = new SocketServer((socket) => {
		statusBar.text = `$(check) C3 - Connected`;
	}, (socket) => {
		statusBar.text = `$(warning) C3 - Disconnected`;
	});

	context.subscriptions.push(vscode.tasks.onDidStartTask((task) => {
		if (task.execution.task.name === 'launch-preview') {
			server?.debug();
		}
	}));

	context.subscriptions.push(vscode.debug.onDidTerminateDebugSession(() => {
		server?.stopDebug();
	}));
}

async function getDefinitions (context: vscode.ExtensionContext) {
	if (!path) {return;}
	vscode.window.showInformationMessage('Generating definitions...');
	const definitions = new ProjectDefinitions(path);
	autoCompleteKeys = await definitions.generateDefinition(context);
	vscode.window.showInformationMessage('Definition generated');

	if (languageProvider) {languageProvider.dispose();}
	languageProvider = vscode.languages.registerCompletionItemProvider(
		"javascript", new CompletionItemProvider(autoCompleteKeys), '.', '\"');

	context.subscriptions.push(languageProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (server) {
		server.destroy();
	}
}
