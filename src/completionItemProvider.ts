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

        let obj = this.keyList;
        allExceptLastWords.forEach((key) => {
            if (obj[key]) {obj = obj[key] as NestedKeyPair;}
        });
        let keys = Object.keys(obj)
            .filter(a => a.startsWith(lastWord));

        // const otherKeys = ['.instVars', '.behaviors', 'runtime'];
        // otherKeys.forEach((key) => {
        //     if (!keys.length && word.indexOf(key + '.') > -1) {
        //         const sub = word.substring(word.indexOf(key) + key.length);
        //         keys = [...new Set(Object.keys(this.keyList)
        //             .filter((a) => {
        //                 const indexOf = a.indexOf(key);
        //                 if (indexOf === -1) { return false; }
        //                 const newWord = a.substring(indexOf + key.length);
        //                 return newWord.startsWith(sub) && newWord.split('.').length === sub.split('.').length;
        //             }).filter((a, i, l) => {
        //                 const arr = a.split('.');
        //                 return i === l.findIndex((b: string) => {
        //                     const barr = b.split('.');
        //                     return arr[arr.length - 1] === barr[barr.length - 1];

        //                 });
        //             }))];
        //     }
        // });

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

