import {ConstantPoolInfo} from "./info/ConstantPoolInfo.js";
import {Attribute} from "./info/AttributeInfo.js";
import {FieldInfo} from "./info/FieldInfo.js";
import {MethodInfo} from "./info/MethodInfo.js";

export type ClassFile = {
    magic: number,
    minorVersion: number,
    majorVersion: number,
    constantPoolCount: number,
    constantPool: ConstantPoolInfo[],
    accessFlags: number,
    thisClass: number,
    superClass: number,
    interfacesCount: number,
    interfaces: number[],
    fieldsCount: number,
    fields: FieldInfo[],
    methodsCount: number,
    methods: MethodInfo[],
    attributesCount: number,
    attributes: Attribute[]
}