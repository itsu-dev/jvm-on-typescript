import {StackMapFrame} from "../StackMapFrame.js";
import {ByteBuffer} from "../../ByteBuffer.js";

export interface Attribute {
    attributeNameIndex: number,
    attributeLength: number,
    info: Attribute[]
}

export interface ConstantValueAttribute extends Attribute {
    constantValueIndex: number
}

export interface CodeAttribute extends Attribute {
    maxStack: number,
    maxLocals: number,
    codeLength: number,
    code: ByteBuffer,
    exceptionTableLength: number,
    exceptionTable: ExceptionTable[],
    attributesCount: number,
    attributes: Attribute[]
}

export interface StackMapTableAttribute extends Attribute {
    numberOfEntries: number,
    entries: StackMapFrame[]
}

export interface ExceptionsAttribute extends Attribute {
    numberOfExceptions: number,
    exceptionIndexTable: number[]
}

export interface InnerClassesAttribute extends Attribute {
    numberOfClasses: number,
    classes: Class[]
}

export interface EnclosingMethod extends Attribute {
    classIndex: number,
    methodIndex: number
}

export interface SyntheticAttribute extends Attribute {
}

export interface SignatureAttribute extends Attribute {
    signatureIndex: number
}

export interface SourceFileIndex extends Attribute {
    sourceFileIndex: number
}

export interface SourceDebugExtensionAttribute extends Attribute {
    debugExtension: number[]
}

export interface LineNumberTableAttribute extends Attribute {
    lineNumberTableLength: number,
    lineNumberTable: LineNumberTable[]
}

export interface LocalVariableTableAttribute extends Attribute {
    localVariableTableLength: number,
    localVariableTable: LocalVariableTable[]
}

export interface LocalVariableTypeTableAttribute extends Attribute {
    localVariableTypeTableLength: number,
    localVariableTypeTable: LocalVariableTypeTable[]
}

export interface DeprecatedAttribute extends Attribute {
}

export interface RuntimeVisibleAnnotationsAttribute extends Attribute {
    numAnnotations: number,
    annotations: Annotation[]
}

export interface RuntimeInvisibleAnnotationsAttribute extends Attribute {
    numAnnotations: number,
    annotations: Annotation[]
}

export interface RuntimeVisibleParameterAnnotationsAttribute extends Attribute {
    numParameters: number,
    parameterAnnotations: ParameterAnnotation[]
}

export interface RuntimeInvisibleParameterAnnotationsAttribute extends Attribute {
    numParameters: number,
    parameterAnnotations: ParameterAnnotation[]
}

// TODO

export type ExceptionTable = {
    startPc: number,
    endPc: number,
    handlerPc: number,
    catchType: number
}

export type LineNumberTable = {
    startPc: number,
    lineNumber: number
}

export type LocalVariableTable = {
    startPc: number,
    length: number,
    nameIndex: number,
    descriptorIndex: number,
    index: number
}

export type LocalVariableTypeTable = {
    startPc: number,
    length: number,
    nameIndex: number,
    signatureIndex: number,
    index: number
}

export type EnumConstValue = {
    typeNameIndex: number,
    constNameIndex: number
}

export type ArrayValue = {
    numValues: number,
    values: ElementValue[]
}

export type ElementValue = {
    tag: number,
    constValueIndex: number,
    enumConstValue: EnumConstValue,
    classInfoIndex: number,
    annotationValue: Annotation,
    arrayValue: ArrayValue
}

export type ElementValuePairs = {
    elementNameIndex: number,
    value: ElementValue
}

export type ParameterAnnotation = {
    numAnnotations: number,
    annotations: Annotation[]
}

export type Annotation = {
    typeIndex: number,
    numElementValuePairs: number,
    elementValuePairs: ElementValuePairs
}

export type Class = {
    innerClassInfoIndex: number,
    outerClassInfoIndex: number,
    innerNameIndex: number,
    innerClassAccessFlags: number
}