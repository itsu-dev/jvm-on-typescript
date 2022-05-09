import {ConstantPoolInfo} from "../../models/info/ConstantPoolInfo.js";
import {Attribute} from "../../models/info/AttributeInfo.js";
import {FieldInfo} from "../../models/info/FieldInfo.js";
import {MethodInfo} from "../../models/info/MethodInfo.js";

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