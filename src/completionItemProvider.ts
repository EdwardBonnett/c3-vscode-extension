import * as vscode from 'vscode';
import NestedKeyPair from './models/nestedKeyPair';
import { TypescriptField, TypescriptMethod } from './models/typescriptDefinition';

export default class CompletionItemProvider implements vscode.CompletionItemProvider {

    keyList!: NestedKeyPair;

    constructor (keyList: NestedKeyPair) {
        this.keyList = keyList;
    }

    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):  Promise<vscode.CompletionItem[]> {
        const range = document.getWordRangeAtPosition(position,/\S+/);
        const word = this.unformatProperties(range ? document.getText(range) : '');

        let words: Array<string> = word.split('.');
        var range2 = new vscode.Range(position, new vscode.Position(position.line, position.character - words[words.length - 1].length - 1));
        const allExceptLastWords = words.filter((a, i, l) => i !== l.length - 1);
        const lastWord = words[words.length - 1];

        let nest = 0;
        let obj = this.keyList;
        allExceptLastWords.forEach((key) => {
            if (obj[key]) {
                obj = obj[key] as NestedKeyPair;
                nest += 1;
            }
        });

        if (nest < 1) {return [];}

        let keys = Object.keys(obj)
            .filter(a => a !== '${type}' && a !== '${detail}' && a.startsWith(lastWord));

        return keys
            .map((key, i) => {
                const arr = key.split('.');
                const name = arr[arr.length - 1];
                const type = obj[key];
                let kind = vscode.CompletionItemKind.Property;
                switch ((type as NestedKeyPair)['${type}']) {
                    case 'method': kind = vscode.CompletionItemKind.Method; break;
                    case 'field': kind = vscode.CompletionItemKind.Field; break;
                }
                return {
                    label: name,
                    detail: name,
                    insertText: '.' + this.formatProperty(name),
                    range: range2,
                    sortText: '.' + name,
                    preselect: true,
                    kind: kind,
                    filterText: '.' + name
                };
            });
    }

    formatProperty (key: string) {
        if (key.match(/^\d/) || key.indexOf(' ') > -1) {
            return `['${key}']`;
        }
        return key;
    }

    unformatProperties (word: string) {
        return word.replace(/\[/g, '')
            .replace(/\]/g, '')
            .replace(/\'/g, '')
            .replace(/\"/g, '')
            .replace(/^\(+|\)+$/g, '')
            .replace(/^\{+|\}+$/g, '');
    }

}

