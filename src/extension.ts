// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import SocketServer from './socketServer';
import * as fs from 'fs';
import * as tsFileStruct from 'ts-file-parser';
import TypescriptDefinition, { TypescriptClass } from './models/typescriptDefinition';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let server: SocketServer | null = null;
let myStatusBarItem: vscode.StatusBarItem;
let objectTypes: Record<string, any> = {};
let globalVars: Record<string, any> = {};
let path: vscode.Uri | null = null;
let schemas: TypescriptDefinition;
let domSchema: TypescriptDefinition;
let schemes: Record<string, any> = {};

class GoCompletionItemProvider implements vscode.CompletionItemProvider {
    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):  Promise<vscode.CompletionItem[]> {
	// find out if we are completing a property in the 'dependencies' object.
	const range = document.getWordRangeAtPosition(position,/\S+/);
	const word = range ? document.getText(range) : '';

	let words: Array<string> = word.split('.');
	var range2 = new vscode.Range(position, new vscode.Position(position.line, position.character - words[words.length - 1].length - 1));
	words = words.filter((a, i, l) => i !== l.length - 1);
	
	const keys = Object.keys(schemes)
		.filter(a => a.startsWith(word) && a.split('.').length === words.length + 1);

	return keys
		.map((key, i) => {
			const arr = key.split('.');
			const name = arr[arr.length - 1];
			const type = schemes[key];
			let kind = vscode.CompletionItemKind.Property;
			if (type.type?.modulePath) { kind = vscode.CompletionItemKind.Field; }
			if (type.arguments !== undefined) { kind = vscode.CompletionItemKind.Method; }
			return {
				label: name,
				detail: type.text,
				insertText: '.' + name,
				range: range2,
				sortText: '.' + name,
				preselect: true,
				kind: kind,
				filterText: '.' + name
			};
		});
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
		await fs.readdir(path.fsPath + '/objectTypes', async (err, files) => {
			for (const file of files) {
				await vscode.workspace.openTextDocument(path!.fsPath + '/objectTypes/' + file).then((document) => {
					let type = JSON.parse(document.getText());
					if (objectTypes[type.name]) {
						type.behaviorTypes = [...(objectTypes[type.name].behaviourTypes || []), ...(type.behaviorTypes || [])];
						type.instanceVariables = [...(objectTypes[type.name].instanceVariables || []), ...(type.instanceVariables || [])];
					}
					objectTypes[type.name] = type;
					
				});
			}
			getGlobalVars(context);
		});
	}
}

async function getFamilies (context: vscode.ExtensionContext) {
	if (path) {
		await fs.readdir(path.fsPath + '/families', async (err, files) => {
			for (const file of files) {
				await vscode.workspace.openTextDocument(path!.fsPath + '/families/' + file).then((document) => {
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

async function getGlobalVars (context: vscode.ExtensionContext) {
	if (!path) {return;}
	await fs.readdir(path.fsPath + '/eventSheets', async (err, files) => {
		for (const file of files) {
			await vscode.workspace.openTextDocument(path!.fsPath + '/eventSheets/' + file).then((document) => {
				let eventSheet = JSON.parse(document.getText());
				if (eventSheet.events) {
					eventSheet.events.forEach((event: any) => {
						if (event.eventType !== 'variable') {return;}
						globalVars[event.name] = event;
					});
				}
			});
		}
		createDefinitionFile(context);
	});
	
}


function formatKey(key: string) {
	key = key.replace(/ /g, '');
	return key;
}

function getInstanceType (instance: string, isGlobal: boolean) {
	switch (instance) {
		case '3DCamera': return 'I3DCameraObjectType';
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
			data = data.replace("// {objects}", `// {objects}
		['${key}']: IObjectClass<I${formatKey(key)}>;
			`);

			const instanceVariables = (objectTypes[key].instanceVariables || []).map((a: any) => 
				`/** ${a.desc} **/
		['${a.name}']: ${a.type};`);

			const behaviours = (objectTypes[key].behaviorTypes || []).map((a: any) => 
				getBehaviours(a)
			);

			data = data.replace('// {instances}', `// {instances}

interface I${formatKey(key)}Vars {
	${instanceVariables.join('\r\n		')}
}

interface I${formatKey(key)}Behaviors {
	${behaviours.join('\r\n		')}
}

interface I${formatKey(key)} extends ${getInstanceType(objectTypes[key]['plugin-id'], objectTypes[key].isGlobal)} {
	instVars: I${formatKey(key)}Vars;
	behaviors: I${formatKey(key)}Behaviors;
}
`);
		});

		Object.values(globalVars).forEach((globalVar) => {
			data = data.replace('// {globalVars}', `// {globalVars}
		/** ${globalVar.comment} **/
		${globalVar.isConstant ? 'readonly ' : ''}["${globalVar.name}"]: ${globalVar.type}
	`);
		});

		data = data.replace('// {generatedDate}', '// ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
		data = data.replace('// {instances}', '');
		data = data.replace('// {globalVars}', '');
		data = data.replace('// {objects}', '');

		fs.writeFile(path!.fsPath + '/c3.d.ts', data, err => {
			if (err) {
				console.error(err);
				return;
			}
			
			vscode.workspace.openTextDocument(path!.fsPath + '/c3.d.ts');
			generateSchema(context);
			getAutoComplete();
		  });
	  });

}

function getAutoComplete () {
	const runtime = schemas.classes.find(a => a.name === 'IRuntime');
	const toProcess: Array<any> = [];
	let keys: Record<string, any> = {};

	const getProperties = (path: string, pathLength: number, c?: TypescriptClass, t?: string) => {
		if (!path || !c || pathLength > 10) { return; }
		c.extends.forEach((extend) => {
			toProcess.push({ 
				path, 
				pathLength, 
				c: schemas.classes.find(a => a.name === extend.typeName) ?? domSchema.classes.find(a => a.name === extend.typeName)
			});
		});
		c.fields.forEach((field) => {
			keys[path + field.name] = field;
			if (field.type.typeName) {
				toProcess.push({ 
					words: `${path}${field.name}.`, 
					pathLength: pathLength + 1, 
					c: schemas.classes.find(a => a.name === (field.type.typeName)) ?? domSchema.classes.find(a => a.name === (field.type.typeName)), 
					t: field.type.typeArguments?.length ? field.type.typeArguments[0].typeName : '' });
			}
		});
		c.methods.forEach((method) => {
			const newPath = `${path}${method.name}(${method.arguments.map(a => a.name).join(',')})`;
			keys[newPath] = method;
			if (method.returnType.typeName) {
				toProcess.push({ 
					words: `${newPath}.`, 
					pathLength: pathLength + 1, 
					c: schemas.classes.find(a => a.name === method.returnType.typeName) || domSchema.classes.find(a => a.name === method.returnType.typeName), 
					t: method.returnType.typeArguments?.length ? method.returnType.typeArguments[0].typeName : '' 
				});				
			} else if (!method.returnType.typeName && method.returnType.options?.length && method.returnType.options[0].typeName === 'T') {
				toProcess.push({ 
					words: `${newPath}.`, 
					pathLength: pathLength + 1,
					c: schemas.classes.find(a => a.name === t) || domSchema.classes.find(a => a.name === method.returnType.typeName), 
				 });
			} 
		});
	};

	getProperties('runtime.', 0, runtime);
	
	while (toProcess.length) {
		const row = toProcess.splice(0, 1)[0];
		getProperties(row.words, row.pathLength, row.c, row.t);
	}

	schemes = keys;

}

function generateSchema (context: vscode.ExtensionContext) {
	var filePath = path!.fsPath + '/c3.d.ts';
	var decls = fs.readFileSync(filePath).toString();
	schemas = tsFileStruct.parseStruct(decls, {}, filePath) as unknown as TypescriptDefinition;	
	
	var filePath2 = context.asAbsolutePath('.') + '/typescript.d.ts';
	var decls2 = fs.readFileSync(filePath2).toString();
	domSchema = tsFileStruct.parseStruct(decls2, {}, filePath2) as unknown as TypescriptDefinition;	

	// const program = TJS.getProgramFromFiles([resolve(path!.fsPath + '/c3.d.ts')], {}, path?.fsPath);
	  
	// const generator = TJS.buildGenerator(program, { ignoreErrors: true });
	// schemas['runtime'] = generator!.getSchemaForSymbol("IRuntime");
	// Object.keys(objectTypes).forEach((key) => {
	// 	schemas[key] = generator!.getSchemaForSymbol("I" + formatKey(key));
	// });
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (server) {
		server.destroy();
	}
}
