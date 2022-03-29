import {ByteBuffer} from "../../ByteBuffer.js";

export const CONSTANT_CLASS = 7;
export const CONSTANT_FIELD_REF = 9;
export const CONSTANT_METHOD_REF = 10;
export const CONSTANT_INTERFACE_METHOD_REF = 11;
export const CONSTANT_STRING = 8;
export const CONSTANT_INTEGER = 3;
export const CONSTANT_FLOAT = 4;
export const CONSTANT_LONG = 5;
export const CONSTANT_DOUBLE = 6;
export const CONSTANT_NAME_AND_TYPE = 12;
export const CONSTANT_UTF8 = 1;
export const CONSTANT_METHOD_HANDLE = 15;
export const CONSTANT_METHOD_TYPE = 16;
export const CONSTANT_INVOKE_DYNAMIC = 18;

export type ConstantPoolInfo = {
    tag: number,
    info: Constant
}

export interface Constant {}

export interface ConstantClassInfo extends Constant {
    tag: number,
    nameIndex: number
}

export interface ConstantFieldRefInfo extends Constant {
    tag: number,
    classIndex: number,
    nameAndTypeIndex: number
}

export const isConstantFieldRefInfo = (arg: unknown) : arg is ConstantFieldRefInfo =>
    typeof arg === "object" &&
    arg !== null &&
    typeof (arg as ConstantFieldRefInfo).tag === "number" &&
    typeof (arg as ConstantFieldRefInfo).classIndex === "number" &&
    typeof (arg as ConstantFieldRefInfo).nameAndTypeIndex === "number"

export interface ConstantMethodRefInfo extends Constant{
    tag: number,
    classIndex: number,
    nameAndTypeIndex: number
}

export interface ConstantInterfaceMethodRefInfo extends Constant {
    tag: number,
    classIndex: number,
    nameAndTypeIndex: number
}

export interface ConstantStringInfo extends Constant {
    tag: number,
    stringIndex: number
}

export interface ConstantIntegerInfo extends Constant {
    tag: number,
    bytes: number
}

export interface ConstantFloatInfo extends Constant {
    tag: number,
    bytes: number
}

export interface ConstantLongInfo extends Constant {
    tag: number,
    highBytes: number,
    lowBytes: number
}

export interface ConstantDoubleInfo extends Constant {
    tag: number,
    highBytes: number,
    lowBytes: number
}

export interface ConstantNameAndTypeInfo extends Constant {
    tag: number,
    nameIndex: number,
    descriptorIndex: number
}

export interface ConstantUtf8Info extends Constant {
    tag: number,
    length: number,
    bytes: ByteBuffer
}

export interface ConstantMethodHandleInfo extends Constant {
    tag: number,
    referenceKind: number,
    referenceIndex: number
}

export interface ConstantMethodTypeInfo extends Constant {
    tag: number,
    descriptorIndex: number
}

export interface ConstantInvokeDynamicInfo extends Constant {
    tag: number,
    bootstrapMethodAttrIndex: number,
    nameAndTypeIndex: number
}