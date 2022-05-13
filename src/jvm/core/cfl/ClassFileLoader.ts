import {ClassFile} from "./ClassFile.js";
import {
    Constant,
    CONSTANT_CLASS, CONSTANT_DOUBLE,
    CONSTANT_FIELD_REF,
    CONSTANT_FLOAT,
    CONSTANT_INTEGER,
    CONSTANT_INTERFACE_METHOD_REF, CONSTANT_INVOKE_DYNAMIC, CONSTANT_LONG, CONSTANT_METHOD_HANDLE,
    CONSTANT_METHOD_REF, CONSTANT_METHOD_TYPE, CONSTANT_NAME_AND_TYPE,
    CONSTANT_STRING, CONSTANT_UTF8,
    ConstantClassInfo, ConstantDoubleInfo,
    ConstantFieldRefInfo, ConstantFloatInfo,
    ConstantIntegerInfo, ConstantInvokeDynamicInfo, ConstantLongInfo, ConstantMethodHandleInfo,
    ConstantMethodRefInfo, ConstantMethodTypeInfo, ConstantNameAndTypeInfo,
    ConstantPoolInfo,
    ConstantStringInfo, ConstantUtf8Info
} from "../../models/info/ConstantPoolInfo.js";
import {ByteBuffer} from "../../utils/ByteBuffer.js";
import {FieldInfo} from "../../models/info/FieldInfo.js";
import {Attribute, readAttributes} from "../../models/info/AttributeInfo.js";
import {MethodInfo} from "../../models/info/MethodInfo.js";
import {Throwable} from "../../lib/java/lang/Throwable.js";

export default class ClassFileLoader {
    
    static loadClassFile(buffer: ByteBuffer): ClassFile {
        const magic = buffer.getUint32();
        const minorVersion = buffer.getUint16();
        const majorVersion = buffer.getUint16();
        const constantPoolCount = buffer.getUint16();

        const constantPool: ConstantPoolInfo[] = [];
        for (let i = 1; i < constantPoolCount; i++) {
            const tag = buffer.getUint8();
            let info: Constant;

            switch (tag) {
                case CONSTANT_CLASS:
                    (info as ConstantClassInfo) = {
                        tag: tag,
                        nameIndex: buffer.getUint16()
                    }
                    break;

                case CONSTANT_FIELD_REF:
                case CONSTANT_METHOD_REF:
                case CONSTANT_INTERFACE_METHOD_REF:
                    (info as ConstantFieldRefInfo | ConstantMethodRefInfo) = {
                        tag: tag,
                        classIndex: buffer.getUint16(),
                        nameAndTypeIndex: buffer.getUint16()
                    }
                    break;

                case CONSTANT_STRING:
                    (info as ConstantStringInfo) = {
                        tag: tag,
                        stringIndex: buffer.getUint16()
                    }
                    break;

                case CONSTANT_INTEGER:
                    (info as ConstantIntegerInfo) = {
                        tag: tag,
                        bytes: buffer.getInt32()
                    }
                    break;

                case CONSTANT_FLOAT:
                    (info as ConstantFloatInfo) = {
                        tag: tag,
                        bytes: buffer.getUint32()
                    }
                    break;

                case CONSTANT_LONG:
                    (info as ConstantLongInfo) = {
                        tag: tag,
                        highBytes: buffer.getUint32(),
                        lowBytes: buffer.getUint32()
                    }
                    break;

                case CONSTANT_DOUBLE:
                    (info as ConstantDoubleInfo) = {
                        tag: tag,
                        highBytes: buffer.getUint32(),
                        lowBytes: buffer.getUint32()
                    }
                    break;

                case CONSTANT_NAME_AND_TYPE:
                    (info as ConstantNameAndTypeInfo) = {
                        tag: tag,
                        nameIndex: buffer.getUint16(),
                        descriptorIndex: buffer.getUint16()
                    }
                    break;

                case CONSTANT_UTF8:
                    const length = buffer.getUint16();
                    const utf8Buffer = new ByteBuffer(new ArrayBuffer(length));

                    for (let j = 0; j < length; j++) {
                        utf8Buffer.setUint8(buffer.getUint8());
                    }

                    (info as ConstantUtf8Info) = {
                        tag: tag,
                        length: length,
                        bytes: utf8Buffer
                    }
                    break;

                case CONSTANT_METHOD_HANDLE:
                    (info as ConstantMethodHandleInfo) = {
                        tag: tag,
                        referenceKind: buffer.getUint8(),
                        referenceIndex: buffer.getUint16()
                    }
                    break;

                case CONSTANT_METHOD_TYPE:
                    (info as ConstantMethodTypeInfo) = {
                        tag: tag,
                        descriptorIndex: buffer.getUint16()
                    }
                    break;

                case CONSTANT_INVOKE_DYNAMIC:
                    (info as ConstantInvokeDynamicInfo) = {
                        tag: tag,
                        bootstrapMethodAttrIndex: buffer.getUint16(),
                        nameAndTypeIndex: buffer.getUint16()
                    }
                    break;
            }

            constantPool.push({
                tag: tag,
                id: i,
                info: info
            })

            if (tag === CONSTANT_LONG || tag === CONSTANT_DOUBLE) i += 1;
        }

        const accessFlags = buffer.getUint16();
        const thisClass = buffer.getUint16();
        const superClass = buffer.getUint16();
        const interfacesCount = buffer.getUint16();

        const interfaces: number[] = [];
        for (let i = 0; i < interfacesCount; i++) {
            interfaces.push(buffer.getUint16());
        }

        const fieldsCount = buffer.getUint16();

        const fields: FieldInfo[] = [];
        for (let i = 0; i < fieldsCount; i++) {
            const accessFlags = buffer.getUint16();
            const nameIndex = buffer.getUint16();
            const descriptorIndex = buffer.getUint16();
            const attributesCount = buffer.getUint16();

            const attributes: Attribute[] = readAttributes(constantPool, attributesCount, buffer);

            fields.push({
                accessFlags: accessFlags,
                nameIndex: nameIndex,
                descriptorIndex: descriptorIndex,
                attributesCount: attributesCount,
                attributes: attributes
            })
        }

        const methodsCount = buffer.getUint16();
        const methods: MethodInfo[] = [];

        for (let i = 0; i < methodsCount; i++) {
            const accessFlags = buffer.getUint16();
            const nameIndex = buffer.getUint16();
            const descriptorIndex = buffer.getUint16();
            const attributeCount = buffer.getUint16();
            const attributes = readAttributes(constantPool, attributeCount, buffer);

            methods.push({
                accessFlags: accessFlags,
                nameIndex: nameIndex,
                descriptorIndex: descriptorIndex,
                attributesCount: attributeCount,
                attributes: attributes
            })
        }

        return {
            magic: magic,
            minorVersion: minorVersion,
            majorVersion: majorVersion,
            constantPoolCount: constantPoolCount,
            constantPool: constantPool,
            accessFlags: accessFlags,
            thisClass: thisClass,
            superClass: superClass,
            interfacesCount: interfacesCount,
            interfaces: interfaces,
            fieldsCount: fieldsCount,
            fields: fields,
            methodsCount: methodsCount,
            methods: methods,
            attributesCount: 0,
            attributes: []
        }
    }
    
    
    static getClassName(packageName: string): string {
        const split = packageName.split("/");
        return split[split.length - 1];
    }
    
}

export const getConstantPoolInfo = (constantPool: ConstantPoolInfo[], index: number): ConstantPoolInfo => {
    return constantPool.filter(constant => constant.id === index)[0];
}

export const parseDescriptor = (descriptor: string): Array<string> => {
    const temp = descriptor.match("(?<=\\()[^\\(\\)]+(?=\\))")?.[0];

    if (temp == null) return [];

    const primitives = ["B", "C", "D", "F", "I", "J", "S", "Z"];
    const args = [];
    const STATE_NORMAL = 0;
    const STATE_OBJECT = 1;
    let state = STATE_NORMAL;
    let isArray = false;
    let objectName = "";

    temp.split("").forEach(char => {
        switch (state) {
            case STATE_NORMAL: {
                if (primitives.includes(char)) {
                    args.push((isArray ? "[" : "") + char);
                    isArray = false;
                }
                else if (char === "L") state = STATE_OBJECT;
                else if (char === "[") isArray = true;
                break;
            }

            case STATE_OBJECT: {
                if (char !== ";") objectName += char;
                else {
                    args.push((isArray ? "[" : "") + objectName);
                    isArray = false;
                    objectName = "";
                    state = STATE_NORMAL;
                }
                break;
            }
        }
    });
    return args;
}

export const getArgumentsAndReturnType = (descriptor: string): [Array<string>, string] => {
    const returnTypeSplit = descriptor.split(")");
    return [parseDescriptor(descriptor), returnTypeSplit[returnTypeSplit.length - 1]];
}