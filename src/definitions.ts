import * as vscode from 'vscode';
import * as fs from 'fs';
import * as tsFileStruct from './ts-file-parse';
import TypescriptDefinition, { TypescriptClass } from './models/typescriptDefinition';


export default class ProjectDefinitions {

    path:  vscode.Uri;

    objectTypes: Record<string, any> = {};

    globalVars: Record<string, any> = {};

    schemas!: TypescriptDefinition;

    domSchema!: TypescriptDefinition;

    constructor (path: vscode.Uri) {
        this.path = path;
    }

    async generateDefinition (context: vscode.ExtensionContext) {
        await this.getFamilies(context);
        await this.getObjectTypes(context);
        await this.getGlobalVars(context);
        await this.createDefinitionFile(context);
        await this.generateSchema(context);
        return this.getAutoComplete();

    }

    async getObjectTypes (context: vscode.ExtensionContext) {
        if (this.path && fs.existsSync(this.path.fsPath + '/objectTypes')) {
            await fs.promises.readdir(this.path.fsPath + '/objectTypes').then(async (files) => {
                for (const file of files) {
                    await vscode.workspace.openTextDocument(this.path!.fsPath + '/objectTypes/' + file).then((document) => {
                        let type = JSON.parse(document.getText());
                        if (this.objectTypes[type.name]) {
                            type.behaviorTypes = [...(this.objectTypes[type.name].behaviourTypes || []), ...(type.behaviorTypes || [])];
                            type.instanceVariables = [...(this.objectTypes[type.name].instanceVariables || []), ...(type.instanceVariables || [])];
                        }
                        this.objectTypes[type.name] = type;

                    });
                }
            });
        }
    }

    async getFamilies (context: vscode.ExtensionContext) {
        if (this.path && fs.existsSync(this.path.fsPath + '/families')) {
            await fs.promises.readdir(this.path.fsPath + '/families').then(async (files) => {
                for (const file of files) {
                    await vscode.workspace.openTextDocument(this.path!.fsPath + '/families/' + file).then((document) => {
                        let family = JSON.parse(document.getText());
                        this.objectTypes[family.name] = family;
                        (family.members || []).forEach((member: string) => {
                            if (!this.objectTypes[member]) {
                                this.objectTypes[member] = {};
                            }
                            this.objectTypes[member].behaviorTypes = [...(this.objectTypes[member].behaviorTypes || []),...(family.behaviorTypes || [])];
                            this.objectTypes[member].instanceVariables = [...(this.objectTypes[member].instanceVariables || []),...(family.instanceVariables || [])];
                        });
                    });
                }
            });
        }
    }

    async getGlobalVars (context: vscode.ExtensionContext) {
        if (!this.path || !fs.existsSync(this.path.fsPath + '/eventSheets')) {return;}
        await fs.promises.readdir(this.path.fsPath + '/eventSheets').then(async (files) => {
            for (const file of files) {
                await vscode.workspace.openTextDocument(this.path!.fsPath + '/eventSheets/' + file).then((document) => {
                    let eventSheet = JSON.parse(document.getText());
                    if (eventSheet.events) {
                        eventSheet.events.forEach((event: any) => {
                            if (event.eventType !== 'variable') {return;}
                            this.globalVars[event.name] = event;
                        });
                    }
                });
            }
        });

    }

    formatProperty (key: string) {
        if (key.match(/^\d/) || key.indexOf(' ') > -1) {
            return `['${key}']`;
        }
        return key;
    }


    formatKey(key: string) {
        key = key.replace(/ /g, '');
        return key;
    }

    getInstanceType (instance: string, isGlobal: boolean) {
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

    getBehaviours ({ behaviorId, name }: { behaviorId: string; name: string }) {
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

    async createDefinitionFile (context: vscode.ExtensionContext) {
        await fs.promises.readFile(context.asAbsolutePath('.') + '/templates/c3.d.ts', 'utf8').then(async (data) => {
            Object.keys(this.objectTypes).forEach((key) => {
                data = data.replace("// {objects}", `// {objects}\r\n\t['${key}']: IObjectClass<I${this.formatKey(key)}>;`);

                const instanceVariables = (this.objectTypes[key].instanceVariables || []).map((a: any) =>
                    `/** ${a.desc} **/\r\n\t['${a.name}']: ${a.type};`);

                const behaviours = (this.objectTypes[key].behaviorTypes || []).map((a: any) =>
                    this.getBehaviours(a)
                );

                data = data.replace('// {instances}', '// {instances}\r\n'
                    + `interface I${this.formatKey(key)}Vars extends VariableType {\r\n\t${instanceVariables.join('\r\n\t')}\r\n}\r\n`
                    + `interface I${this.formatKey(key)}Behaviors extends Record<string, IBehaviorInstance> {\r\n\t${behaviours.join('\r\n\t')}\r\n}\r\n`
                    + `interface I${this.formatKey(key)} extends ${this.getInstanceType(this.objectTypes[key]['plugin-id'], this.objectTypes[key].isGlobal)} {`
                    + `\r\n\tinstVars: I${this.formatKey(key)}Vars;\r\n\tbehaviors: I${this.formatKey(key)}Behaviors;\r\n}\r\n`);
            });

            Object.values(this.globalVars).forEach((globalVar) => {
                data = data.replace('// {globalVars}', `// {globalVars}`
                +`\r\n\t/** ${globalVar.comment} **/`
                +`\r\n\t${globalVar.isConstant ? 'readonly ' : ''}["${globalVar.name}"]: ${globalVar.type}`);
            });

            data = data.replace('// {generatedDate}', '// ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
            data = data.replace('// {instances}', '');
            data = data.replace('// {globalVars}', '');
            data = data.replace('// {objects}', '');

            await fs.promises.writeFile(this.path!.fsPath + '/c3.d.ts', data).then(() => {
                vscode.workspace.openTextDocument(this.path!.fsPath + '/c3.d.ts');
              });
          });

    }

    getAutoComplete () {
        const runtime = this.schemas.classes.find(a => a.name === 'IRuntime');
        const toProcess: Array<any> = [];
        let keys: Record<string, any> = {};

        const getProperties = (path: string, pathLength: number, c?: TypescriptClass, t?: string) => {
            if (!path || !c || pathLength > 10 || path.indexOf('.runtime') > -1) { return; }
            if (path.split('.').filter(a => a === '.layout.').length > 1
                && path.split('.').filter(a => a === '.layout.').length > 1) {return;}
            c.extends.forEach((extend) => {
                toProcess.push({
                    words: path,
                    pathLength,
                    c: this.schemas.classes.find(a => a.name === extend.typeName)
                });
            });
            c.fields.forEach((field) => {
                keys[path + field.name] = field;
                if (field.type.typeName) {
                    toProcess.push({
                        words: `${path}${field.name}.`,
                        pathLength: pathLength + 1,
                        c: this.schemas.classes.find(a => a.name === (field.type.typeName)) ?? this.domSchema.classes.find(a => a.name === (field.type.typeName)),
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
                        c: this.schemas.classes.find(a => a.name === method.returnType.typeName) || this.domSchema.classes.find(a => a.name === method.returnType.typeName),
                        t: method.returnType.typeArguments?.length ? method.returnType.typeArguments[0].typeName : ''
                    });
                } else if (!method.returnType.typeName && method.returnType.options?.length && method.returnType.options[0].typeName === 'T') {
                    toProcess.push({
                        words: `${newPath}.`,
                        pathLength: pathLength + 1,
                        c: this.schemas.classes.find(a => a.name === t) || this.domSchema.classes.find(a => a.name === method.returnType.typeName),
                     });
                }
            });
        };

        getProperties('runtime.', 0, runtime);

        while (toProcess.length) {
            const row = toProcess.splice(0, 1)[0];
            getProperties(row.words, row.pathLength, row.c, row.t);
        }

        const extrasKeys: Record<string, unknown> = {};
        Object.keys(keys).forEach((key) => {
            const behaviorIndex = key.indexOf('.behaviors.');
            if (behaviorIndex > -1) {
                const behaviorKey = key.substring(behaviorIndex + 1);
                extrasKeys[behaviorKey] = keys[key];
            }
            const instVarsIndex = key.indexOf('.instVars.');
            if (instVarsIndex > -1) {
                const varKey = key.substring(instVarsIndex + 1);
                extrasKeys[varKey] = keys[key];
            }

            const layoutIndex = key.indexOf('.layout.');
            if (layoutIndex > -1) {
                const varKey = key.substring(layoutIndex + 1);
                extrasKeys[varKey] = keys[key];
            }

            const layerIndex = key.indexOf('.layer.');
            if (layerIndex > -1) {
                const varKey = key.substring(layerIndex + 1);
                extrasKeys[varKey] = keys[key];
            }
        });
        return keys;

    }

    generateSchema (context: vscode.ExtensionContext) {
        var filePath = this.path!.fsPath + '/c3.d.ts';
        var decls = fs.readFileSync(filePath).toString();
        this.schemas = tsFileStruct.parseStruct(decls, {}, filePath) as unknown as TypescriptDefinition;

        var filePath2 = context.asAbsolutePath('.') + '/templates/typescript.d.ts';
        var decls2 = fs.readFileSync(filePath2).toString();
        this.domSchema = tsFileStruct.parseStruct(decls2, {}, filePath2) as unknown as TypescriptDefinition;
    }

}