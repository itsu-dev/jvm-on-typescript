import {ByteBuffer} from "../../utils/ByteBuffer.js";
import {getConstantPoolInfo} from "../../core/cfl/ClassFileLoader.js";

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
    id: number,
    info: Constant
}

export interface Constant {
    tag: number
}

export interface ConstantClassInfo extends Constant {
    nameIndex: number
}

export interface ConstantFieldRefInfo extends Constant {
    classIndex: number,
    nameAndTypeIndex: number
}

export const isConstantFieldRefInfo = (arg: unknown) : arg is ConstantFieldRefInfo =>
    typeof arg === "object" &&
    arg !== null &&
    typeof (arg as ConstantFieldRefInfo).tag === "number" &&
    typeof (arg as ConstantFieldRefInfo).classIndex === "number" &&
    typeof (arg as ConstantFieldRefInfo).nameAndTypeIndex === "number";

export interface ConstantMethodRefInfo extends Constant{
    classIndex: number,
    nameAndTypeIndex: number
}

export interface ConstantInterfaceMethodRefInfo extends Constant {
    classIndex: number,
    nameAndTypeIndex: number
}

export interface ConstantStringInfo extends Constant {
    stringIndex: number
}

export const isConstantStringInfo = (arg: unknown) : arg is ConstantStringInfo =>
    typeof arg === "object" &&
    arg !== null &&
    typeof (arg as ConstantStringInfo).tag === "number" &&
    typeof (arg as ConstantStringInfo).stringIndex === "number";

export interface ConstantIntegerInfo extends Constant {
    bytes: number
}

export const isConstantIntegerInfo = (arg: unknown) : arg is ConstantIntegerInfo =>
    typeof arg === "object" &&
    arg !== null &&
    typeof (arg as ConstantIntegerInfo).tag === "number" &&
    typeof (arg as ConstantIntegerInfo).bytes === "number";

export interface ConstantFloatInfo extends Constant {
    bytes: number
}

export const isConstantFloatInfo = (arg: unknown) : arg is ConstantFloatInfo =>
    typeof arg === "object" &&
    arg !== null &&
    typeof (arg as ConstantFloatInfo).tag === "number" &&
    typeof (arg as ConstantFloatInfo).bytes === "number";

export interface ConstantLongInfo extends Constant {
    highBytes: number,
    lowBytes: number
}

export const isConstantLongInfo = (arg: unknown) : arg is ConstantLongInfo =>
    typeof arg === "object" &&
    arg !== null &&
    typeof (arg as ConstantLongInfo).tag === "number" &&
    typeof (arg as ConstantLongInfo).highBytes === "number" &&
    typeof (arg as ConstantLongInfo).lowBytes === "number";

export interface ConstantDoubleInfo extends Constant {
    highBytes: number,
    lowBytes: number
}

export const isConstantDoubleInfo = (arg: unknown) : arg is ConstantDoubleInfo =>
    typeof arg === "object" &&
    arg !== null &&
    typeof (arg as ConstantDoubleInfo).tag === "number" &&
    typeof (arg as ConstantDoubleInfo).highBytes === "number" &&
    typeof (arg as ConstantDoubleInfo).lowBytes === "number";

export interface ConstantNameAndTypeInfo extends Constant {
    nameIndex: number,
    descriptorIndex: number
}

export interface ConstantUtf8Info extends Constant {
    length: number,
    bytes: ByteBuffer
}

export interface ConstantMethodHandleInfo extends Constant {
    referenceKind: number,
    referenceIndex: number
}

export interface ConstantMethodTypeInfo extends Constant {
    descriptorIndex: number
}

export interface ConstantInvokeDynamicInfo extends Constant {
    bootstrapMethodAttrIndex: number,
    nameAndTypeIndex: number
}

export const readUtf8FromConstantPool = (constantPool: ConstantPoolInfo[], index: number): string => {
    return new TextDecoder("utf-8").decode((getConstantPoolInfo(constantPool, index).info as ConstantUtf8Info).bytes.view);
}