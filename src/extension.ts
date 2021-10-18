// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import SocketServer from './socketServer';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let server: SocketServer | null = null;
let myStatusBarItem: vscode.StatusBarItem;
let objectTypes: Record<string, any> = {};
let familes: Record<string, any> = {};
let path: vscode.Uri | null = null;

class GoCompletionItemProvider implements vscode.CompletionItemProvider {
    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):  Promise<vscode.CompletionItem[]> {
	// find out if we are completing a property in the 'dependencies' object.
	const range = document.getWordRangeAtPosition(position,/\S+/);
	const word = range ? document.getText(range) : '';
	

	// var match = linePrefix.match(/"Objects\."/);
	// if (!match) {
	// 	return [];
	// }

	var range2 = new vscode.Range(position, new vscode.Position(position.line, position.character + word.length));
	if (word !== 'runtime.objects.') {return [];}

	return Object.keys(objectTypes).map((key) => ({
		label: key,
		insertText: key,
		range: range2,
		kind: vscode.CompletionItemKind.Class
	}));
    }
}

export async function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            "javascript", new GoCompletionItemProvider(), '.', '\"'));

	server = new SocketServer((socket) => {
		myStatusBarItem.text = `$(check) C3 - Connected`;
	}, (socket) => {
		myStatusBarItem.text = `$(warning) C3 - Disconnected`;
	});
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('construct3.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from Construct3!');
	// });

	context.subscriptions.push(vscode.tasks.onDidStartTask((task) => {
		if (task.execution.task.name === 'launch-preview') {
			server?.debug();
		}
	}));

	context.subscriptions.push(vscode.debug.onDidTerminateDebugSession(() => {
		server?.stopDebug();
	}));

	const myCommandId = 'sample.showSelectionCount';
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		vscode.window.showInformationMessage(`Yeah, line(s) selected... Keep going!`);
	}));

	path = vscode.workspace.workspaceFolders?.length ? vscode.workspace.workspaceFolders[0].uri : null;
	getFamilies(context);
	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.command = myCommandId;
	myStatusBarItem.show();
	myStatusBarItem.text = 'C3 - Connecting...';
	context.subscriptions.push(myStatusBarItem);

	



	// context.subscriptions.push(disposable);
}

async function getObjectTypes (context: vscode.ExtensionContext) {
	if (path) {
		await fs.readdir(path.fsPath + '\\objectTypes', async (err, files) => {
			for (const file of files) {
				await vscode.workspace.openTextDocument(path!.fsPath + '\\objectTypes\\' + file).then((document) => {
					let type = JSON.parse(document.getText());
					if (objectTypes[type.name]) {
						type.behaviorTypes = [...(objectTypes[type.name].behaviourTypes || []), ...(type.behaviorTypes || [])];
						type.instanceVariables = [...(objectTypes[type.name].instanceVariables || []), ...(type.instanceVariables || [])];
					}
					objectTypes[type.name] = type;
					
				});
			}
			createDefinitionFile(context);
		});
	}
}

async function getFamilies (context: vscode.ExtensionContext) {
	if (path) {
		await fs.readdir(path.fsPath + '\\families', async (err, files) => {
			for (const file of files) {
				await vscode.workspace.openTextDocument(path!.fsPath + '\\families\\' + file).then((document) => {
					let family = JSON.parse(document.getText());
					objectTypes[family.name] = family;
					(family.members || []).forEach((member: string) => {
						if (!objectTypes[member]) {
							objectTypes[member] = {};
						}
						objectTypes[member].behaviorTypes = [...(objectTypes[member].behaviorTypes || []),...(family.behaviorTypes || [])];
						objectTypes[member].instanceVariables = [...(objectTypes[member].instanceVariables || []),...(family.instanceVariables || [])];
					});
				});
			}
			getObjectTypes(context);
		});
	}
}


function formatKey(key: string) {
	key = key.replace(/ /g, '');
	// const numberMap: Record<string, string> = 
	// { 
	// 	'0': 'Zero',
	// 	'1': 'One',
	// 	'2': 'Two',
	// 	'3': 'Three',
	// 	'4': 'Four',
	// 	'5': 'Five',
	// 	'6': 'Six',
	// 	'7': 'Seven',
	// 	'8': 'Eight',
	// 	'9': 'Nine'
	// };
	// if (numberMap[key[0]]) {
	// 	return numberMap[key[0]] + key.substring(1);
	// }
	return key;
}

function getInstanceType (instance: string, isGlobal: boolean) {
	switch (instance) {
		case '3DShape': return 'I3DShapeInstance';
		case 'Array': return 'IArrayInstance';
		case 'Audio': return 'IAudioObjectType';
		case 'BinaryData': return 'IBinaryDataInstance';
		case 'Button': return 'IButtonInstance';
		case 'Dictionary': return 'IDictionaryInstance';
		case 'DrawingCanvas': return 'IDrawingCanvasInstance';
		case 'Json': return 'IJsonInstance';
		case 'Keyboard': return 'IKeyboardObjectType';
		case 'Mouse': return 'IMouseObjectType';
		case 'SlideBar': return 'ISliderBarInstance';
		case 'Sprite': return 'ISpriteInstance';
		case 'SpriteFont': return 'ISpriteFontInstance';
		case 'Text': return 'ITextInstance';
		case 'TextInput': return 'ITextInputInstance';
		case 'TiledBackground': return 'ITiledBackgroundInstance';
		case 'Tilemap': return 'ITilemapInstance';
		case 'Touch': return 'ITouchObjectType';
		default: return isGlobal ? 'IInstance' : 'IWorldInstance';
	}
}

function getBehaviours ({ behaviorId, name }: { behaviorId: string; name: string }) {
	switch (behaviorId) {
		case 'EightDir':  return `['${name}']: I8DirectionBehaviorInstance`;
		case 'Bullet': return `['${name}']: IBulletBehaviorInstance`;
		case 'Car': return `['${name}']: ICarBehaviorInstance`;
		case 'LOS': return `['${name}']: ILOSBehaviorInstance`;
		case 'MoveTo': return `['${name}']: IMoveToBehaviorInstance`;
		case 'Pathfinding': return `['${name}']: IPathfindingBehaviorInstance`;
		case 'Physics': return `['${name}']: IPhysicsBehaviorInstance`;
		case 'Platform': return `['${name}']: IPlatformBehaviorInstance`;
		case 'Sine': return `['${name}']: ISineBehaviorInstance`;
		case 'TileMovement': return `['${name}']: ITileMovementBehaviourInstance`;
		default: return `['${name}']: IBehaviorInstance`;
	}

}

function createDefinitionFile (context: vscode.ExtensionContext) {
	fs.readFile(context.asAbsolutePath('.') + '/c3.d.ts', 'utf8' , (err, data) => {
		if (err) {
		  console.error(err);
		  return;
		}

		Object.keys(objectTypes).forEach((key) => {
			data = data.replace("// objects", `// objects
		['${formatKey(key)}']: IObjectClass<I${formatKey(key)}>;
			`);

			const instanceVariables = (objectTypes[key].instanceVariables || []).map((a: any) => 
				`['${a.name}']: ${a.type};`);

			const behaviours = (objectTypes[key].behaviorTypes || []).map((a: any) => 
				getBehaviours(a)
			);

			data = data.replace('// instances', `// instances
interface I${formatKey(key)} extends ${getInstanceType(objectTypes[key]['plugin-id'], objectTypes[key].isGlobal)} {
	instVars: {
		${instanceVariables.join('\r\n		')}
	},
	behaviors: {
		${behaviours.join('\r\n		')}
	}
}

			`);
		});

		data = data.replace('// generatedDate', '// ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());

		fs.writeFile(path!.fsPath + '/c3.d.ts', data, err => {
			if (err) {
				console.error(err);
				return;
			}
			
			vscode.workspace.openTextDocument(path!.fsPath + '/c3.d.ts');

		  });
	  });
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (server) {
		server.destroy();
	}
}
