import {
    Constant,
    CONSTANT_CLASS,
    CONSTANT_DOUBLE,
    CONSTANT_FIELD_REF,
    CONSTANT_FLOAT,
    CONSTANT_INTEGER,
    CONSTANT_INTERFACE_METHOD_REF,
    CONSTANT_INVOKE_DYNAMIC,
    CONSTANT_LONG,
    CONSTANT_METHOD_HANDLE,
    CONSTANT_METHOD_REF,
    CONSTANT_METHOD_TYPE,
    CONSTANT_NAME_AND_TYPE,
    CONSTANT_STRING,
    CONSTANT_UTF8,
    ConstantClassInfo,
    ConstantDoubleInfo,
    ConstantFieldRefInfo,
    ConstantFloatInfo,
    ConstantIntegerInfo, ConstantInvokeDynamicInfo,
    ConstantLongInfo, ConstantMethodHandleInfo,
    ConstantMethodRefInfo, ConstantMethodTypeInfo,
    ConstantNameAndTypeInfo,
    ConstantPoolInfo,
    ConstantStringInfo, ConstantUtf8Info,
} from "./models/info/ConstantPoolInfo.js";
import {
    Attribute,
    readAttributes
} from "./models/info/AttributeInfo.js";
import {MethodInfo} from "./models/info/MethodInfo.js";
import {ClassFile} from "./core/cfl/ClassFile.js";
import {ByteBuffer} from "./utils/ByteBuffer.js";
import {Throwable} from "./lib/java/lang/Throwable.js";
import {FieldInfo} from "./models/info/FieldInfo.js";
import Thread from "./core/rda/stack/Thread.js";
import RuntimeDataArea from "./core/rda/RuntimeDataArea.js";

export class JVM {

    buffer: ByteBuffer
    runtimeDataArea: RuntimeDataArea;
    jvmArgs: {}
    args: []

    constructor(array: ArrayBuffer, jvmArgs: {}, args: []) {
        this.buffer = new ByteBuffer(array);
        this.jvmArgs = jvmArgs;
        this.args = args;
        this.runtimeDataArea = new RuntimeDataArea();
    }

    load() {
        if (!this.buffer) {
            console.error("buffer must not be undefined!");
            return;
        }

        const classFile = this.loadClassFile();
        console.log(classFile)

        this.runtimeDataArea
            .createThread(this.jvmArgs["Xss"])
            .then(thread => thread.invokeMethod("main", classFile, this.args));
    }

    private loadClassFile(): ClassFile {
        const magic = this.buffer.getUint32();
        const minorVersion = this.buffer.getUint16();
        const majorVersion = this.buffer.getUint16();
        const constantPoolCount = this.buffer.getUint16();

        const constantPool: ConstantPoolInfo[] = [];
        for (let i = 1; i < constantPoolCount; i++) {
            const tag = this.buffer.getUint8();
            let info: Constant;

            switch (tag) {
                case CONSTANT_CLASS:
                    (info as ConstantClassInfo) = {
                        tag: tag,
                        nameIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_FIELD_REF:
                case CONSTANT_METHOD_REF:
                case CONSTANT_INTERFACE_METHOD_REF:
                    (info as ConstantFieldRefInfo | ConstantMethodRefInfo) = {
                        tag: tag,
                        classIndex: this.buffer.getUint16(),
                        nameAndTypeIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_STRING:
                    (info as ConstantStringInfo) = {
                        tag: tag,
                        stringIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_INTEGER:
                    (info as ConstantIntegerInfo) = {
                        tag: tag,
                        bytes: this.buffer.getInt32()
                    }
                    break;

                case CONSTANT_FLOAT:
                    (info as ConstantFloatInfo) = {
                        tag: tag,
                        bytes: this.buffer.getUint32()
                    }
                    break;

                case CONSTANT_LONG:
                    (info as ConstantLongInfo) = {
                        tag: tag,
                        highBytes: this.buffer.getUint32(),
                        lowBytes: this.buffer.getUint32()
                    }
                    break;

                case CONSTANT_DOUBLE:
                    (info as ConstantDoubleInfo) = {
                        tag: tag,
                        highBytes: this.buffer.getUint32(),
                        lowBytes: this.buffer.getUint32()
                    }
                    console.log(info)
                    break;

                case CONSTANT_NAME_AND_TYPE:
                    (info as ConstantNameAndTypeInfo) = {
                        tag: tag,
                        nameIndex: this.buffer.getUint16(),
                        descriptorIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_UTF8:
                    const length = this.buffer.getUint16();
                    const utf8Buffer = new ByteBuffer(new ArrayBuffer(length));

                    for (let j = 0; j < length; j++) {
                        utf8Buffer.setUint8(this.buffer.getUint8());
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
                        referenceKind: this.buffer.getUint8(),
                        referenceIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_METHOD_TYPE:
                    (info as ConstantMethodTypeInfo) = {
                        tag: tag,
                        descriptorIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_INVOKE_DYNAMIC:
                    (info as ConstantInvokeDynamicInfo) = {
                        tag: tag,
                        bootstrapMethodAttrIndex: this.buffer.getUint16(),
                        nameAndTypeIndex: this.buffer.getUint16()
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

        const accessFlags = this.buffer.getUint16();
        const thisClass = this.buffer.getUint16();
        const superClass = this.buffer.getUint16();
        const interfacesCount = this.buffer.getUint16();

        const interfaces: number[] = [];
        for (let i = 0; i < interfacesCount; i++) {
            interfaces.push(this.buffer.getUint16());
        }

        const fieldsCount = this.buffer.getUint16();

        const fields: FieldInfo[] = [];
        for (let i = 0; i < fieldsCount; i++) {
            const accessFlags = this.buffer.getUint16();
            const nameIndex = this.buffer.getUint16();
            const descriptorIndex = this.buffer.getUint16();
            const attributesCount = this.buffer.getUint16();

            const attributes: Attribute[] = readAttributes(constantPool, attributesCount, this.buffer);

            fields.push({
                accessFlags: accessFlags,
                nameIndex: nameIndex,
                descriptorIndex: descriptorIndex,
                attributesCount: attributesCount,
                attributes: attributes
            })
        }

        const methodsCount = this.buffer.getUint16();
        const methods: MethodInfo[] = [];

        for (let i = 0; i < methodsCount; i++) {
            const accessFlags = this.buffer.getUint16();
            const nameIndex = this.buffer.getUint16();
            const descriptorIndex = this.buffer.getUint16();
            const attributeCount = this.buffer.getUint16();
            const attributes = readAttributes(constantPool, attributeCount, this.buffer);

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

    private getClassName(packageName: string): string {
        const split = packageName.split("/");
        return split[split.length - 1];
    }

}

export const getConstantPoolInfo = (constantPool: ConstantPoolInfo[], index: number): ConstantPoolInfo => {
    return constantPool.filter(constant => constant.id === index)[0];
}

export const throwErrorOrException = (throwable: Throwable) => {
    throwable.printStackTrace()
}

export const parseDescriptor = (descriptor: string): Array<string> => {
    const temp = descriptor.match("(?<=\\()[^\\(\\)]+(?=\\))")?.[0];
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
