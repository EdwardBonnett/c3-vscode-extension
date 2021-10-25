import * as vscode from 'vscode';

export default class CompletionItemProvider implements vscode.CompletionItemProvider {

    keyList!: Record<string, any>;

    constructor (keyList: Record<string, any>) {
        this.keyList = keyList;
    }

    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):  Promise<vscode.CompletionItem[]> {
        const range = document.getWordRangeAtPosition(position,/\S+/);
        const word = this.unformatProperties(range ? document.getText(range) : '');

        let words: Array<string> = word.split('.');
        var range2 = new vscode.Range(position, new vscode.Position(position.line, position.character - words[words.length - 1].length - 1));
        words = words.filter((a, i, l) => i !== l.length - 1);

        let keys = Object.keys(this.keyList)
            .filter(a => a.startsWith(word) && a.split('.').length === words.length + 1);

        const otherKeys = ['.instVars', '.behaviors', 'runtime'];
        otherKeys.forEach((key) => {
            if (!keys.length && word.indexOf(key + '.') > -1) {
                const sub = word.substring(word.indexOf(key) + key.length);
                keys = [...new Set(Object.keys(this.keyList)
                    .filter((a) => {
                        const indexOf = a.indexOf(key);
                        if (indexOf === -1) { return false; }
                        const newWord = a.substring(indexOf + key.length);
                        return newWord.startsWith(sub) && newWord.split('.').length === sub.split('.').length;
                    }).filter((a, i, l) => {
                        const arr = a.split('.');
                        return i === l.findIndex((b: string) => {
                            const barr = b.split('.');
                            return arr[arr.length - 1] === barr[barr.length - 1];

                        });
                    }))];
            }
        });

        return keys
            .map((key, i) => {
                const arr = key.split('.');
                const name = arr[arr.length - 1];
                const type = this.keyList[key];
                let kind = vscode.CompletionItemKind.Property;
                if (type.type?.modulePath) { kind = vscode.CompletionItemKind.Field; }
                if (type.arguments !== undefined) { kind = vscode.CompletionItemKind.Method; }
                return {
                    label: name,
                    detail: type.text,
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

