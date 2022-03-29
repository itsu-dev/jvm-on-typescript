import {
    AppendFrame,
    ChopFrame, FullFrame,
    SameFrame, SameFrameExtended,
    SameLocals1StackItemFrame,
    SameLocals1StackItemFrameExtended,
    StackMapFrame
} from "../StackMapFrame.js";
import {ByteBuffer} from "../../utils/ByteBuffer.js";
import {ConstantPoolInfo, readUtf8FromConstantPool} from "./ConstantPoolInfo.js";
import {TopVariableInfo, VerificationTypeInfo} from "../VerificationTypeInfo.js";

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

export const readAttributes = (constantPool: ConstantPoolInfo[], length: number, buffer: ByteBuffer): Attribute[] => {
    const result: Attribute[] = [];

    for (let j = 0; j < length; j++) {
        const attributeNameIndex = buffer.getUint16();
        const attributeLength = buffer.getUint32();
        const name = readUtf8FromConstantPool(constantPool, attributeNameIndex);

        switch (name) {
            case "Code": {
                result.push(processCodeAttribute(constantPool, attributeNameIndex, attributeLength, buffer))
                break;
            }

            case "LineNumberTable": {
                result.push(processLineNumberAttribute(attributeNameIndex, attributeLength, buffer));
                break;
            }

            case "StackMapTable": {
                result.push(processStackMapAttribute(attributeNameIndex, attributeLength, buffer));
                break;
            }
        }
    }

    return result;
}

export const processCodeAttribute = (constantPool: ConstantPoolInfo[], attributeNameIndex: number, attributeLength: number, buffer: ByteBuffer): CodeAttribute => {
    const maxStack = buffer.getUint16();
    const maxLocals = buffer.getUint16();
    const codeLength = buffer.getUint32();

    const code: ByteBuffer = new ByteBuffer(new ArrayBuffer(codeLength));
    for (let i = 0; i < codeLength; i++) {
        code.setUint8(buffer.getUint8());
    }

    const exceptionTableLength = buffer.getUint16();

    const exceptionTable: ExceptionTable[] = [];
    for (let i = 0; i < exceptionTableLength; i++) {
        exceptionTable.push({
            startPc: buffer.getUint16(),
            endPc: buffer.getUint16(),
            handlerPc: buffer.getUint16(),
            catchType: buffer.getUint16()
        })
    }

    const attributesCount = buffer.getUint16();
    let attributes: Attribute[] = [];

    if (attributesCount > 0) {
        attributes = readAttributes(constantPool, attributesCount, buffer);
    }

    return {
        attributeNameIndex: attributeNameIndex,
        attributeLength: attributeLength,
        info: [],
        maxStack: maxStack,
        maxLocals: maxLocals,
        codeLength: codeLength,
        code: code,
        exceptionTableLength: exceptionTableLength,
        exceptionTable: exceptionTable,
        attributesCount: attributesCount,
        attributes: attributes
    };
}

export const processLineNumberAttribute = (attributeNameIndex: number, attributeLength: number, buffer: ByteBuffer): LineNumberTableAttribute => {
    const lineNumberTableLength = buffer.getUint16();
    const lineNumberTable: LineNumberTable[] = [];
    for (let i = 0; i < lineNumberTableLength; i++) {
        lineNumberTable.push({
            startPc: buffer.getUint16(),
            lineNumber: buffer.getUint16()
        })
    }

    return {
        attributeNameIndex: attributeNameIndex,
        attributeLength: attributeLength,
        info: [],
        lineNumberTableLength: lineNumberTableLength,
        lineNumberTable: lineNumberTable
    };
}

export const processStackMapAttribute = (attributeNameIndex: number, attributeLength: number, buffer: ByteBuffer): StackMapTableAttribute => {
    const numberOfEntries = buffer.getUint16();
    const entries: StackMapFrame[] = [];

    const getVerificationTypeInfo = (tag: number): VerificationTypeInfo => {
        switch (tag) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6: {
                return {
                    info: {
                        tag: tag
                    }
                }
            }

            case 7: {
                return {
                    info: {
                        tag: tag,
                        cpoolIndex: buffer.getUint16()
                    }
                }
            }

            case 8: {
                return {
                    info: {
                        tag: tag,
                        offset: buffer.getUint16()
                    }
                }
            }
        }
    }

    for (let i = 0; i < numberOfEntries; i++) {
        const frameType = buffer.getUint8();

        // same_frame
        if (0 <= frameType && frameType <= 63) {
            entries.push({
                frame: {
                    frameType: frameType
                }
            })

        // same_locals_1_stack_item_frame
        } else if (64 <= frameType && frameType <= 127) {
            entries.push({
                frame: {
                    frameType: frameType,
                    stack: [getVerificationTypeInfo(buffer.getUint8())]
                }
            })

        // same_locals_1_stack_item_frame_extended
        } else if (frameType == 247) {
            entries.push({
                frame: {
                    frameType: frameType,
                    offsetDelta: buffer.getUint16(),
                    stack: [getVerificationTypeInfo(buffer.getUint8())]
                }
            })

        // chop_frame
        } else if (248 <= frameType && frameType <= 250) {
            entries.push({
                frame: {
                    frameType: frameType,
                    offsetDelta: buffer.getUint16()
                }
            })

        // same_frame_extended
        } else if (frameType == 251) {
            entries.push({
                frame: {
                    frameType: frameType,
                    offsetDelta: buffer.getUint16()
                }
            })

        // append_frame
        } else if (252 <= frameType && frameType <= 254) {
            const appendFrameOffsetDelta = buffer.getUint16();
            const appendFrameLocals: VerificationTypeInfo[] = [];

            for (let j = 0; j < frameType - 251; j++) {
                appendFrameLocals.push(getVerificationTypeInfo(buffer.getUint8()))
            }

            entries.push({
                frame: {
                    frameType: frameType,
                    offsetDelta: appendFrameOffsetDelta,
                    locals: appendFrameLocals
                }
            })

        // full_frame
        } else if (frameType == 255) {
            const fullFrameOffsetDelta = buffer.getUint16();
            const numberOfLocals = buffer.getUint16();
            const fullFrameLocals: VerificationTypeInfo[] = [];

            for (let j = 0; j < numberOfLocals; j++) {
                fullFrameLocals.push(getVerificationTypeInfo(buffer.getUint8()))
            }

            const numberOfStackItems = buffer.getUint16();
            const fullFrameStack: VerificationTypeInfo[] = [];

            for (let j = 0; j < numberOfStackItems; j++) {
                fullFrameStack.push(getVerificationTypeInfo(buffer.getUint8()))
            }

            entries.push({
                frame: {
                    frameType: frameType,
                    offsetDelta: fullFrameOffsetDelta,
                    numberOfLocals: numberOfLocals,
                    locals: fullFrameLocals,
                    numberOfStackItems: numberOfStackItems,
                    stack: fullFrameStack
                }
            })

        }
    }

    return {
        attributeNameIndex: attributeNameIndex,
        attributeLength: attributeLength,
        info: [],
        numberOfEntries: numberOfEntries,
        entries: entries
    }

}