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
    CONSTANT_UTF8, ConstantClassInfo, ConstantMethodRefInfo, ConstantNameAndTypeInfo,
    ConstantPoolInfo, ConstantStringInfo,
    ConstantUtf8Info,
    isConstantFieldRefInfo
} from "./models/info/ConstantPoolInfo.js";
import {
    Attribute,
    CodeAttribute,
    ExceptionTable,
    LineNumberTable,
    LineNumberTableAttribute
} from "./models/info/AttributeInfo.js";
import {MethodInfo} from "./models/info/MethodInfo.js";
import {ClassFile} from "./models/ClassFile.js";
import {ByteBuffer} from "./ByteBuffer.js";
import {Throwable} from "./lib/java/lang/Throwable.js";
import {NoSuchFieldError} from "./lib/java/lang/NoSuchFieldError.js";
import {FieldInfo} from "./models/info/FieldInfo.js";

export class JVM {

    buffer: ByteBuffer
    operandStack: Array<any> = [];

    constructor(array: ArrayBuffer) {
        this.buffer = new ByteBuffer(array);
    }

    load() {
        if (!this.buffer) {
            console.error("buffer must not be undefined!");
            return;
        }

        const classFile = this.loadClassFile();
        this.invoke("main", classFile.constantPool, classFile.methods);
    }

    private async invoke(methodName: string, constantPool: ConstantPoolInfo[], methods: MethodInfo[]) {
        for (const method of methods) {
            const name = this.readUtf8FromConstantPool(constantPool, method.nameIndex);
            if (name !== methodName) continue;

            const codeAttributes =
                method.attributes.filter(attribute => this.readUtf8FromConstantPool(constantPool, attribute.attributeNameIndex) === "Code");
            if (!codeAttributes || codeAttributes.length == 0) return;

            const codeAttribute = codeAttributes[0]!! as CodeAttribute;
            const code = codeAttribute.code;
            code.resetOffset();

            let opcode = code.getUint8();
            while (code.offset < code.getLength()) {
                switch (opcode) {
                    // getstatic
                    case 0xb2: {
                        const indexByte1 = code.getUint8();
                        const indexByte2 = code.getUint8();
                        const constantPoolInfo = this.getConstantPoolInfo(constantPool, (indexByte1 << 8) | indexByte2);

                        if (!constantPoolInfo || !isConstantFieldRefInfo(constantPoolInfo.info)) {
                            this.throwErrorOrException(new NoSuchFieldError());
                            return;
                        }

                        const fieldRef = constantPoolInfo.info;
                        const classRef = this.getConstantPoolInfo(constantPool, fieldRef.classIndex).info as ConstantClassInfo
                        const fieldNameAndTypeRef = this.getConstantPoolInfo(constantPool, fieldRef.nameAndTypeIndex).info as ConstantNameAndTypeInfo
                        const module = await import("./lib/" + this.readUtf8FromConstantPool(constantPool, classRef.nameIndex) + ".js")
                        const fieldClassFileName = this.readUtf8FromConstantPool(constantPool, fieldNameAndTypeRef.nameIndex);

                        const map = new Map<string, any>();
                        map.set("callable", module[this.getClassName(this.readUtf8FromConstantPool(constantPool, classRef.nameIndex))][fieldClassFileName]);
                        map.set("return", this.readUtf8FromConstantPool(constantPool, fieldNameAndTypeRef.descriptorIndex));
                        this.operandStack.push(map);

                        break;
                    }

                    // ldc
                    case 0x12: {
                        const index = code.getUint8();
                        const stringRef = this.getConstantPoolInfo(constantPool, index).info as ConstantStringInfo;
                        this.operandStack.push(this.readUtf8FromConstantPool(constantPool, stringRef.stringIndex));
                        break;
                    }

                    // invokevirtual
                    case 0xb6: {
                        const indexByte1 = code.getUint8();
                        const indexByte2 = code.getUint8();
                        const methodRef = this.getConstantPoolInfo(constantPool, (indexByte1 << 8) | indexByte2).info as ConstantMethodRefInfo;
                        const methodNameAndTypeRef = this.getConstantPoolInfo(constantPool, methodRef.nameAndTypeIndex).info as ConstantNameAndTypeInfo;
                        const invokeMethodName = this.readUtf8FromConstantPool(constantPool, methodNameAndTypeRef.nameIndex);
                        const argumentsCount = this.readUtf8FromConstantPool(constantPool, methodNameAndTypeRef.descriptorIndex).split(";").length - 1;
                        const methodArgs = [];

                        for (let i = 0; i < argumentsCount; i++) {
                            methodArgs.push(this.operandStack.pop());
                        }

                        (this.operandStack.pop() as Map<string, any>).get("callable")[invokeMethodName](...methodArgs);
                        break;
                    }

                    // return
                    case 0xb1: {
                        return;
                    }
                }
                opcode = code.getUint8()
            }
        }
    }

    private loadClassFile(): ClassFile {
        const magic = this.buffer.getUint32();
        const minorVersion = this.buffer.getUint16();
        const majorVersion = this.buffer.getUint16();
        const constantPoolCount = this.buffer.getUint16();

        const constantPool: ConstantPoolInfo[] = [];
        for (let i = 1; i < constantPoolCount; i++) {
            const tag = this.buffer.getUint8();
            let info: Constant = [];

            switch (tag) {
                case CONSTANT_CLASS:
                    info = {
                        tag: tag,
                        nameIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_FIELD_REF:
                case CONSTANT_METHOD_REF:
                case CONSTANT_INTERFACE_METHOD_REF:
                    info = {
                        tag: tag,
                        classIndex: this.buffer.getUint16(),
                        nameAndTypeIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_STRING:
                    info = {
                        tag: tag,
                        stringIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_INTEGER:
                case CONSTANT_FLOAT:
                    info = {
                        tag: tag,
                        bytes: this.buffer.getUint32()
                    }
                    break;

                case CONSTANT_LONG:
                case CONSTANT_DOUBLE:
                    info = {
                        tag: tag,
                        highBytes: this.buffer.getUint32(),
                        lowBytes: this.buffer.getUint32(),
                    }
                    break;

                case CONSTANT_NAME_AND_TYPE:
                    info = {
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

                    info = {
                        tag: tag,
                        length: length,
                        bytes: utf8Buffer
                    }
                    break;

                case CONSTANT_METHOD_HANDLE:
                    info = {
                        tag: tag,
                        referenceKind: this.buffer.getUint8(),
                        referenceIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_METHOD_TYPE:
                    info = {
                        tag: tag,
                        descriptorIndex: this.buffer.getUint16()
                    }
                    break;

                case CONSTANT_INVOKE_DYNAMIC:
                    info = {
                        tag: tag,
                        bootstrapMethodAttrIndex: this.buffer.getUint16(),
                        nameAndTypeIndex: this.buffer.getUint16()
                    }
                    break;
            }

            constantPool.push({
                tag: tag,
                info: info
            })
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

        // TODO Hello, Worldでは必要ない
        const fields: FieldInfo[] = [];
        for (let i = 0; i < fieldsCount; i++) {
            const accessFlags = this.buffer.getUint16();
            const nameIndex = this.buffer.getUint16();
            const descriptorIndex = this.buffer.getUint16();
            const attributesCount = this.buffer.getUint16();

            const attributes: Attribute[] = this.loadAttributes(constantPool, attributesCount);

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
            const attributes = this.loadAttributes(constantPool, attributeCount);

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

    private loadAttributes(constantPool: ConstantPoolInfo[], length: number): Attribute[] {
        const result: Attribute[] = [];

        for (let j = 0; j < length; j++) {
            const attributeNameIndex = this.buffer.getUint16();
            const attributeLength = this.buffer.getUint32();
            const name = this.readUtf8FromConstantPool(constantPool, attributeNameIndex);

            switch (name) {
                case "Code": {
                    const maxStack = this.buffer.getUint16();
                    const maxLocals = this.buffer.getUint16();
                    const codeLength = this.buffer.getUint32();

                    const code: ByteBuffer = new ByteBuffer(new ArrayBuffer(codeLength));
                    for (let i = 0; i < codeLength; i++) {
                        code.setUint8(this.buffer.getUint8());
                    }

                    const exceptionTableLength = this.buffer.getUint16();

                    const exceptionTable: ExceptionTable[] = [];
                    for (let i = 0; i < exceptionTableLength; i++) {
                        exceptionTable.push({
                            startPc: this.buffer.getUint16(),
                            endPc: this.buffer.getUint16(),
                            handlerPc: this.buffer.getUint16(),
                            catchType: this.buffer.getUint16()
                        })
                    }

                    const attributesCount = this.buffer.getUint16();
                    let attributes: Attribute[] = [];

                    if (attributesCount > 0) {
                        attributes = this.loadAttributes(constantPool, attributesCount);
                    }

                    const codeAttribute: CodeAttribute = {
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
                    }

                    result.push(codeAttribute)
                    break;
                }

                case "LineNumberTable": {
                    const lineNumberTableLength = this.buffer.getUint16();
                    const lineNumberTable: LineNumberTable[] = [];
                    for (let i = 0; i < lineNumberTableLength; i++) {
                        lineNumberTable.push({
                            startPc: this.buffer.getUint16(),
                            lineNumber: this.buffer.getUint16()
                        })
                    }

                    const lineNumberTableAttribute: LineNumberTableAttribute = {
                        attributeNameIndex: attributeNameIndex,
                        attributeLength: attributeLength,
                        info: [],
                        lineNumberTableLength: lineNumberTableLength,
                        lineNumberTable: lineNumberTable
                    }

                    result.push(lineNumberTableAttribute);
                    break;
                }
            }
        }

        return result;
    }

    private throwErrorOrException(throwable: Throwable) {
        throwable.printStackTrace()
    }

    private getConstantPoolInfo(constantPool: ConstantPoolInfo[], index: number): ConstantPoolInfo {
        return constantPool[index - 1]
    }

    private readUtf8FromConstantPool(constantPool: ConstantPoolInfo[], index: number): string {
        return new TextDecoder("utf-8").decode((this.getConstantPoolInfo(constantPool, index).info as ConstantUtf8Info).bytes.view);
    }

    private getClassName(packageName: string): string {
        const split = packageName.split("/");
        return split[split.length - 1];
    }

}
