import { TypescriptField, TypescriptMethod } from "./typescriptDefinition";

export default interface NestedKeyPair {
    [key: string]: NestedKeyPair | TypescriptField | TypescriptMethod | string;
}