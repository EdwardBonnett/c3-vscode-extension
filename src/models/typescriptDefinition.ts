export default interface TypescriptDefinition {
    classes: Array<TypescriptClass>;
    functions: Array<TypescriptFunction>;
}

export interface TypescriptFunction {
    isArrow: false;
    isAsync: false;
    isExport: false;
    name: string;
    params: Array<TypescriptFunctionParam>;
}

export interface TypescriptFunctionParam {
    mandatory: true;
    name: string;
    type: string;
}

export interface TypescriptClass {
    annotations: Array<unknown>;
    decorators: Array<unknown>;
    fields: Array<TypescriptField>;
    methods: Array<TypescriptMethod>;
    name: string;
    extends: Array<{ basicName: string; typeName: string }>;
}

export interface TypescriptField {
    annotations: Array<unknown>;
    decorations: Array<unknown>;
    name: string;
    optional: boolean;
    type: {
        basicName: string;
        typeKind: number;
        typeName: string;
        modulePath: string;
        typeArguments?: Array<{
            basicName: string;
            typeName: string;
            modulePath: string;
        }>
    }
}

export interface TypescriptMethod {
    arguments: Array<TypescriptMethodArgument>;
    end: number;
    name: string;
    returnType: {
        basicName: string;
        typeKind: number;
        typeName: string;
        modulePath: string;
        typeArguments: Array<{
            basicName: string;
            modulePath: string;
            typeKind: number;
            typeName: string;
        }>
        options?: Array<{
            typeName: string;
        }>
    }; 
    start: number;
    text: string;
}

export interface TypescriptMethodArgument {
    end: number;
    name: String;
    start: number;
    text: string;
    type: {
        options?: Array<{
            basicName: string;
            typeName: string;
            nameSpace: string;
            typeKind: number;

        }>;
        basicName: string;
        typeKind: number;
        typeName: string;
    }
}