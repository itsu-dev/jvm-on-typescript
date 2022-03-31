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
    isConstantDoubleInfo,
    isConstantFieldRefInfo,
    isConstantFloatInfo,
    isConstantIntegerInfo,
    isConstantLongInfo,
    isConstantStringInfo,
    readUtf8FromConstantPool
} from "./models/info/ConstantPoolInfo.js";
import {
    Attribute,
    CodeAttribute,
    readAttributes
} from "./models/info/AttributeInfo.js";
import {MethodInfo} from "./models/info/MethodInfo.js";
import {ClassFile} from "./models/ClassFile.js";
import {ByteBuffer} from "./utils/ByteBuffer.js";
import {Throwable} from "./lib/java/lang/Throwable.js";
import {NoSuchFieldError} from "./lib/java/lang/NoSuchFieldError.js";
import {FieldInfo} from "./models/info/FieldInfo.js";
import {Frame} from "./models/Frame.js";
import {ArrayVariable, DoubleVariable, FloatVariable, IntVariable, LongVariable} from "./models/Variable.js";
import {Error} from "./lib/java/lang/Error.js";
import {System} from "./lib/java/lang/System.js";

export class JVM {

    buffer: ByteBuffer

    constructor(array: ArrayBuffer) {
        this.buffer = new ByteBuffer(array);
    }

    load() {
        if (!this.buffer) {
            console.error("buffer must not be undefined!");
            return;
        }

        const classFile = this.loadClassFile();
        console.log(classFile)
        this.invoke("main", classFile.constantPool, classFile.methods);
    }

    private async invoke(methodName: string, constantPool: ConstantPoolInfo[], methods: MethodInfo[]) {
        for (const method of methods) {
            const name = readUtf8FromConstantPool(constantPool, method.nameIndex);
            if (name !== methodName) continue;

            const codeAttributes =
                method.attributes.filter(attribute => readUtf8FromConstantPool(constantPool, attribute.attributeNameIndex) === "Code");
            if (!codeAttributes || codeAttributes.length == 0) return;

            const codeAttribute = codeAttributes[0]!! as CodeAttribute;
            const code = codeAttribute.code;
            code.resetOffset();

            const argsCount = readUtf8FromConstantPool(constantPool, method.descriptorIndex).split(";").length - 1;
            const frame = new Frame(codeAttribute.maxLocals - argsCount, constantPool);
            frame.locals.push(new ArrayVariable([]));

            let opcode = code.getUint8();
            while (code.offset < code.getLength()) {
                switch (opcode) {

                    // nop
                    case 0x00: {
                        break;
                    }

                    // getstatic
                    case 0xb2: {
                        const indexByte1 = code.getUint8();
                        const indexByte2 = code.getUint8();
                        const constantPoolInfo = getConstantPoolInfo(constantPool, (indexByte1 << 8) | indexByte2);

                        if (!constantPoolInfo || !isConstantFieldRefInfo(constantPoolInfo.info)) {
                            this.throwErrorOrException(new NoSuchFieldError());
                            return;
                        }

                        const fieldRef = constantPoolInfo.info;
                        const classRef = getConstantPoolInfo(constantPool, fieldRef.classIndex).info as ConstantClassInfo
                        const fieldNameAndTypeRef = getConstantPoolInfo(constantPool, fieldRef.nameAndTypeIndex).info as ConstantNameAndTypeInfo
                        const module = await import("./lib/" + readUtf8FromConstantPool(constantPool, classRef.nameIndex) + ".js")
                        const fieldClassFileName = readUtf8FromConstantPool(constantPool, fieldNameAndTypeRef.nameIndex);

                        frame.operandStack.push({
                            "callable": module[this.getClassName(readUtf8FromConstantPool(constantPool, classRef.nameIndex))][fieldClassFileName],
                            "return": readUtf8FromConstantPool(constantPool, fieldNameAndTypeRef.descriptorIndex)
                        });

                        break;
                    }

                    // ldc
                    case 0x12: {
                        const index = code.getUint8();
                        const info = getConstantPoolInfo(constantPool, index).info;

                        if (info.tag === CONSTANT_STRING) {
                            frame.operandStack.push(readUtf8FromConstantPool(constantPool, (info as ConstantStringInfo).stringIndex));

                        } else if (info.tag === CONSTANT_INTEGER) {
                            const dataView = new ByteBuffer(new ArrayBuffer(32));
                            dataView.setInt32((info as ConstantIntegerInfo).bytes);
                            dataView.resetOffset();
                            frame.operandStack.push(dataView.getInt8());

                        } else if (info.tag === CONSTANT_FLOAT) {
                            const dataView = new ByteBuffer(new ArrayBuffer(32));
                            dataView.setUint32((info as ConstantFloatInfo).bytes);
                            dataView.resetOffset();
                            frame.operandStack.push(dataView.getFloat32());

                        }
                        break;
                    }

                    // ldc2_w
                    case 0x14: {
                        const indexByte1 = code.getUint8();
                        const indexByte2 = code.getUint8();
                        const info = getConstantPoolInfo(constantPool, (indexByte1 << 8) | indexByte2).info;

                        if (info.tag === CONSTANT_LONG) {
                            const dataView = new ByteBuffer(new ArrayBuffer(64));
                            dataView.setUint32((info as ConstantLongInfo).highBytes);
                            dataView.setUint32((info as ConstantLongInfo).lowBytes);
                            dataView.resetOffset();
                            frame.operandStack.push((dataView.getUint32() << 32) + dataView.getUint32());

                        } else if (info.tag === CONSTANT_DOUBLE) {
                            const dataView = new ByteBuffer(new ArrayBuffer(64));
                            dataView.setUint32((info as ConstantDoubleInfo).highBytes);
                            dataView.setUint32((info as ConstantDoubleInfo).lowBytes);
                            dataView.resetOffset();
                            frame.operandStack.push(dataView.getFloat64());

                        }
                        break;
                    }

                    // invokevirtual
                    case 0xb6: {
                        const indexByte1 = code.getUint8();
                        const indexByte2 = code.getUint8();
                        const methodRef = getConstantPoolInfo(constantPool, (indexByte1 << 8) | indexByte2).info as ConstantMethodRefInfo;
                        const methodNameAndTypeRef = getConstantPoolInfo(constantPool, methodRef.nameAndTypeIndex).info as ConstantNameAndTypeInfo;
                        const invokeMethodName = readUtf8FromConstantPool(constantPool, methodNameAndTypeRef.nameIndex);
                        const descriptor = readUtf8FromConstantPool(constantPool, methodNameAndTypeRef.descriptorIndex).split(")")
                        const argumentText = descriptor[0].replace("(", "");
                        const argumentsCount = argumentText.includes(";") ? argumentText.split(";").length - 1 : (argumentText === "" ? 0 : argumentText.split(";").length)
                        const methodArgs = [];

                        for (let i = 0; i < argumentsCount; i++) {
                            methodArgs.push(frame.operandStack.pop());
                        }

                        if (descriptor[descriptor.length - 1] !== "V") {
                            const result = frame.operandStack.pop()["callable"][invokeMethodName](...methodArgs);
                            if (typeof result === "object") {
                                frame.operandStack.push({
                                    "callable": result
                                });
                            } else {
                                frame.operandStack.push(result);
                            }

                        } else {
                            frame.operandStack.pop()["callable"][invokeMethodName](...methodArgs)
                        }

                        break;
                    }

                    // iconst_m1
                    case 0x02: {
                        frame.operandStack.push(-1);
                        break
                    }

                    // iconst_0
                    case 0x03: {
                        frame.operandStack.push(0);
                        break
                    }

                    // iconst_1
                    case 0x04: {
                        frame.operandStack.push(1);
                        break
                    }

                    // iconst_2
                    case 0x05: {
                        frame.operandStack.push(2);
                        break
                    }

                    // iconst_3
                    case 0x06: {
                        frame.operandStack.push(3);
                        break
                    }

                    // iconst_4
                    case 0x07: {
                        frame.operandStack.push(4);
                        break
                    }

                    // iconst_5
                    case 0x08: {
                        frame.operandStack.push(5);
                        break
                    }

                    // lconst_0
                    case 0x09: {
                        frame.operandStack.push(1);
                        break;
                    }

                    // lconst_1
                    case 0x0a: {
                        frame.operandStack.push(2);
                        break;
                    }

                    // fconst_0
                    case 0x0b: {
                        frame.operandStack.push(0.0);
                        break;
                    }

                    // fconst_1
                    case 0x0c: {
                        frame.operandStack.push(1.0);
                        break;
                    }

                    // fconst_2
                    case 0x0d: {
                        frame.operandStack.push(2.0);
                        break;
                    }

                    // dconst_0
                    case 0x0e: {
                        frame.operandStack.push(0.0);
                        break;
                    }

                    // dconst_1
                    case 0x0f: {
                        frame.operandStack.push(1.0);
                        break;
                    }

                    // bipush
                    case 0x10: {
                        const data = code.getInt8();
                        frame.operandStack.push(data);
                        break;
                    }

                    // iload
                    case 0x15: {
                        const index = code.getUint8();
                        frame.operandStack.push(frame.locals[index].getValue());
                        break;
                    }

                    // lload
                    case 0x16: {
                        const index = code.getUint8();
                        frame.operandStack.push(frame.locals[index].getValue());
                        break;
                    }

                    // fload
                    case 0x17: {
                        const index = code.getUint8();
                        frame.operandStack.push(frame.locals[index].getValue());
                        break;
                    }

                    // dload
                    case 0x18: {
                        const index = code.getUint8();
                        frame.operandStack.push(frame.locals[index].getValue());
                        break;
                    }

                    // iload_0
                    case 0x1a: {
                        frame.operandStack.push(frame.locals[0].getValue());
                        break;
                    }

                    // iload_1
                    case 0x1b: {
                        frame.operandStack.push(frame.locals[1].getValue());
                        break;
                    }

                    // iload_2
                    case 0x1c: {
                        frame.operandStack.push(frame.locals[2].getValue());
                        break;
                    }

                    // iload_3
                    case 0x1d: {
                        frame.operandStack.push(frame.locals[3].getValue());
                        break;
                    }

                    // lload_0
                    case 0x1e: {
                        frame.operandStack.push(frame.locals[0].getValue());
                        break;
                    }

                    // lload_1
                    case 0x1f: {
                        frame.operandStack.push(frame.locals[1].getValue());
                        break;
                    }

                    // lload_2
                    case 0x20: {
                        frame.operandStack.push(frame.locals[2].getValue());
                        break;
                    }

                    // lload_3
                    case 0x21: {
                        frame.operandStack.push(frame.locals[3].getValue());
                        break;
                    }

                    // fload_0
                    case 0x22: {
                        frame.operandStack.push(frame.locals[0].getValue());
                        break;
                    }

                    // fload_1
                    case 0x23: {
                        frame.operandStack.push(frame.locals[1].getValue());
                        break;
                    }

                    // fload_2
                    case 0x24: {
                        frame.operandStack.push(frame.locals[2].getValue());
                        break;
                    }

                    // fload_3
                    case 0x25: {
                        frame.operandStack.push(frame.locals[3].getValue());
                        break;
                    }

                    // dload_0
                    case 0x26: {
                        frame.operandStack.push(frame.locals[0].getValue());
                        break;
                    }

                    // dload_1
                    case 0x27: {
                        frame.operandStack.push(frame.locals[1].getValue());
                        break;
                    }

                    // dload_2
                    case 0x28: {
                        frame.operandStack.push(frame.locals[2].getValue());
                        break;
                    }

                    // dload_3
                    case 0x29: {
                        frame.operandStack.push(frame.locals[3].getValue());
                        break;
                    }

                    // istore
                    case 0x36: {
                        const index = code.getUint8();
                        if (frame.locals.length - 1 < index) {
                            frame.locals.push(new IntVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(index, 0, new IntVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore
                    case 0x37: {
                        const index = code.getUint8();
                        if (frame.locals.length - 1 < index) {
                            frame.locals.push(new LongVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(index, 0, new LongVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore
                    case 0x38: {
                        const index = code.getUint8();
                        if (frame.locals.length - 1 < index) {
                            frame.locals.push(new FloatVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(index, 0, new FloatVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore
                    case 0x39: {
                        const index = code.getUint8();
                        if (frame.locals.length - 1 < index) {
                            frame.locals.push(new DoubleVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(index, 0, new DoubleVariable(frame.operandStack.pop()));
                        }
                        break;
                    }
                    
                    // istore_0
                    case 0x3b: {
                        if (frame.locals.length - 1 < 0) {
                            frame.locals.push(new IntVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(0, 0, new IntVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // istore_1
                    case 0x3c: {
                        if (frame.locals.length - 1 < 1) {
                            frame.locals.push(new IntVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(1, 0, new IntVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // istore_2
                    case 0x3d: {
                        if (frame.locals.length - 1 < 2) {
                            frame.locals.push(new IntVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(2, 0, new IntVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // istore_3
                    case 0x3e: {
                        if (frame.locals.length - 1 < 3) {
                            frame.locals.push(new IntVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(3, 0, new IntVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore_0
                    case 0x3f: {
                        if (frame.locals.length - 1 < 0) {
                            frame.locals.push(new LongVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(0, 0, new LongVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore_1
                    case 0x40: {
                        if (frame.locals.length - 1 < 1) {
                            frame.locals.push(new LongVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(1, 0, new LongVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore_2
                    case 0x41: {
                        if (frame.locals.length - 1 < 2) {
                            frame.locals.push(new LongVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(2, 0, new LongVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore_3
                    case 0x42: {
                        if (frame.locals.length - 1 < 3) {
                            frame.locals.push(new LongVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(3, 0, new LongVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore_0
                    case 0x43: {
                        if (frame.locals.length - 1 < 0) {
                            frame.locals.push(new FloatVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(0, 0, new FloatVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore_1
                    case 0x44: {
                        if (frame.locals.length - 1 < 1) {
                            frame.locals.push(new FloatVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(1, 0, new FloatVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore_2
                    case 0x45: {
                        if (frame.locals.length - 1 < 2) {
                            frame.locals.push(new FloatVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(2, 0, new FloatVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore_3
                    case 0x46: {
                        if (frame.locals.length - 1 < 3) {
                            frame.locals.push(new FloatVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(3, 0, new FloatVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore_0
                    case 0x47: {
                        if (frame.locals.length - 1 < 0) {
                            frame.locals.push(new DoubleVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(0, 0, new DoubleVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore_1
                    case 0x48: {
                        if (frame.locals.length - 1 < 1) {
                            frame.locals.push(new DoubleVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(1, 0, new DoubleVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore_2
                    case 0x48: {
                        if (frame.locals.length - 1 < 2) {
                            frame.locals.push(new DoubleVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(2, 0, new DoubleVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore_3
                    case 0x4a: {
                        if (frame.locals.length - 1 < 3) {
                            frame.locals.push(new DoubleVariable(frame.operandStack.pop()));
                        } else {
                            frame.locals.splice(3, 0, new DoubleVariable(frame.operandStack.pop()));
                        }
                        break;
                    }

                    // pop
                    case 0x57: {
                        const data = frame.operandStack.pop();
                        if (data instanceof DoubleVariable || data instanceof LongVariable) {
                            System.err.println("Illegal operation: pop with category 2.")
                            return;
                        }
                        break;
                    }

                    // pop2
                    case 0x58: {
                        const isCategory1 = (data) => data instanceof IntVariable || data instanceof FloatVariable
                        const isCategory2 = (data) => data instanceof DoubleVariable || data instanceof LongVariable
                        const value1 = frame.operandStack.pop();
                        if (isCategory2(value1)) break;
                        else if (isCategory1(value1)) {
                            const value2 = frame.operandStack.pop();
                            if (isCategory1(value2)) break;
                            else {
                                System.err.println("Illegal operation: pop2 with category 1.")
                                return;
                            }
                        }
                        break;
                    }

                    // dup
                    case 0x59: {
                        const original = frame.operandStack.pop();
                        const copied = Object.assign(Object.create(Object.getPrototypeOf(original)), original);
                        const copied2 = Object.assign(Object.create(Object.getPrototypeOf(original)), original);
                        frame.operandStack.push(copied);
                        frame.operandStack.push(copied2);
                        break;
                    }

                    // iadd
                    case 0x60: {
                        frame.operandStack.push(frame.operandStack.pop() + frame.operandStack.pop());
                        break;
                    }

                    // ladd
                    case 0x61: {
                        frame.operandStack.push(frame.operandStack.pop() + frame.operandStack.pop());
                        break;
                    }

                    // fadd
                    case 0x62: {
                        frame.operandStack.push(frame.operandStack.pop() + frame.operandStack.pop());
                        break;
                    }

                    // dadd
                    case 0x63: {
                        frame.operandStack.push(frame.operandStack.pop() + frame.operandStack.pop());
                        break;
                    }

                    // isub
                    case 0x64: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() - value2);
                        break;
                    }

                    // lsub
                    case 0x65: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() - value2);
                        break;
                    }

                    // fsub
                    case 0x66: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() - value2);
                        break;
                    }

                    // dsub
                    case 0x67: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() - value2);
                        break;
                    }

                    // imul
                    case 0x68: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() * value2);
                        break;
                    }

                    // lmul
                    case 0x69: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() * value2);
                        break;
                    }

                    // fmul
                    case 0x6a: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() * value2);
                        break;
                    }

                    // dmul
                    case 0x6b: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() * value2);
                        break;
                    }

                    // idiv
                    case 0x6c: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() / value2);
                        break;
                    }

                    // ldiv
                    case 0x6d: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() / value2);
                        break;
                    }

                    // fdiv
                    case 0x6e: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() / value2);
                        break;
                    }

                    // ddiv
                    case 0x6f: {
                        const value2 = frame.operandStack.pop();
                        frame.operandStack.push(frame.operandStack.pop() / value2);
                        break;
                    }

                    // irem
                    case 0x70: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 - (value1 / value2) * value2);
                        break;
                    }

                    // lrem
                    case 0x71: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 - (value1 / value2) * value2);
                        break;
                    }

                    // frem
                    case 0x72: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 - (value1 / value2) * value2);
                        break;
                    }

                    // drem
                    case 0x73: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 - (value1 / value2) * value2);
                        break;
                    }

                    // ineg
                    case 0x74: {
                        frame.operandStack.push(-frame.operandStack.pop());
                        break;
                    }

                    // lneg
                    case 0x75: {
                        frame.operandStack.push(-frame.operandStack.pop());
                        break;
                    }

                    // fneg
                    case 0x76: {
                        frame.operandStack.push(-frame.operandStack.pop());
                        break;
                    }

                    // dneg
                    case 0x77: {
                        frame.operandStack.push(-frame.operandStack.pop());
                        break;
                    }

                    // ishl
                    case 0x78: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 << value2);
                        break;
                    }

                    // lshl
                    case 0x79: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 << value2);
                        break;
                    }

                    // ishr
                    case 0x7a: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 >> value2);
                        break;
                    }

                    // lshr
                    case 0x7b: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 >> value2);
                        break;
                    }

                    // iushr
                    case 0x7c: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 >> value2);
                        break;
                    }

                    // lushr
                    case 0x7d: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 >> value2);
                        break;
                    }

                    // iand
                    case 0x7e: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 & value2);
                        break;
                    }

                    // land
                    case 0x7f: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 & value2);
                        break;
                    }

                    // ior
                    case 0x80: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 | value2);
                        break;
                    }

                    // lor
                    case 0x81: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 | value2);
                        break;
                    }

                    // ixor
                    case 0x82: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 ^ value2);
                        break;
                    }

                    // lxor
                    case 0x83: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        frame.operandStack.push(value1 ^ value2);
                        break;
                    }

                    // iinc
                    case 0x84: {
                        const index = code.getUint8();
                        const vConst = code.getInt8();
                        frame.locals[index].setValue(frame.locals[index].getValue() + vConst);
                        break;
                    }

                    // i2l~i2s
                    // TypeScript has only number type so these operation don't have any effects.
                    case 0x85:
                    case 0x86:
                    case 0x87:
                    case 0x88:
                    case 0x89:
                    case 0x8a:
                    case 0x8b:
                    case 0x8c:
                    case 0x8d:
                    case 0x8e:
                    case 0x8f:
                    case 0x90:
                    case 0x91:
                    case 0x92:
                    case 0x93:
                        break;

                    // lcmp
                    case 0x94: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (value2 < value1) frame.operandStack.push(1);
                        else if (value2 == value1) frame.operandStack.push(0);
                        else frame.operandStack.push(-1);
                        break;
                    }

                    // fcmpl
                    case 0x95: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (isNaN(value1) || isNaN(value2)) frame.operandStack.push(-1);
                        else if (value2 < value1) frame.operandStack.push(1);
                        else if (value2 == value1) frame.operandStack.push(0);
                        else frame.operandStack.push(-1);
                        break;
                    }

                    // fcmpg
                    case 0x96: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (isNaN(value1) || isNaN(value2)) frame.operandStack.push(-1);
                        else if (value2 < value1) frame.operandStack.push(1);
                        else if (value2 == value1) frame.operandStack.push(0);
                        else frame.operandStack.push(1);
                        break;
                    }

                    // dcmpl
                    case 0x97: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (isNaN(value1) || isNaN(value2)) frame.operandStack.push(-1);
                        else if (value2 < value1) frame.operandStack.push(1);
                        else if (value2 == value1) frame.operandStack.push(0);
                        else frame.operandStack.push(-1);
                        break;
                    }

                    // dcmpg
                    case 0x98: {
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (isNaN(value1) || isNaN(value2)) frame.operandStack.push(-1);
                        else if (value2 < value1) frame.operandStack.push(1);
                        else if (value2 == value1) frame.operandStack.push(0);
                        else frame.operandStack.push(1);
                        break;
                    }

                    // ifeq
                    case 0x99: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        if (frame.operandStack.pop() === 0) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // ifne
                    case 0x9a: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        if (frame.operandStack.pop() !== 0) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // iflt
                    case 0x9b: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        if (frame.operandStack.pop() < 0) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // ifge
                    case 0x9c: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        if (frame.operandStack.pop() >= 0) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // ifgt
                    case 0x9d: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        if (frame.operandStack.pop() > 0) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // ifle
                    case 0x9e: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        if (frame.operandStack.pop() <= 0) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // if_icmpeq
                    case 0x9f: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (value1 === value2) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // if_icmpne
                    case 0xa0: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (value1 !== value2) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // if_icmplt
                    case 0xa1: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (value1 < value2) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // if_icmpge
                    case 0xa2: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (value1 >= value2) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // if_icmpgt
                    case 0xa3: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (value1 > value2) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // if_icmple
                    case 0xa4: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        const value2 = frame.operandStack.pop();
                        const value1 = frame.operandStack.pop();
                        if (value1 <= value2) code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // goto
                    case 0xa7: {
                        const branchByte1 = code.getUint8();
                        const branchByte2 = code.getUint8();
                        code.offset = (branchByte1 << 8) | branchByte2;
                        break;
                    }

                    // return
                    case 0xb1: {
                        return;
                    }

                    // invokespecial
                    case 0xb7: {
                        const indexByte1 = code.getUint8();
                        const indexByte2 = code.getUint8();
                        const methodRef = getConstantPoolInfo(constantPool, (indexByte1 << 8) | indexByte2).info as ConstantMethodRefInfo;
                        const methodNameAndTypeRef = getConstantPoolInfo(constantPool, methodRef.nameAndTypeIndex).info as ConstantNameAndTypeInfo;
                        const argumentsCount = readUtf8FromConstantPool(constantPool, methodNameAndTypeRef.descriptorIndex).split(";").length - 1;
                        const methodArgs = [];

                        for (let i = 0; i < argumentsCount; i++) {
                            methodArgs.push(frame.operandStack.pop());
                        }

                        frame.operandStack.pop()["callable"]["constructor"](...methodArgs)

                        break;
                    }

                    // new
                    case 0xbb: {
                        const indexByte1 = code.getUint8();
                        const indexByte2 = code.getUint8();
                        const classRef = getConstantPoolInfo(constantPool, (indexByte1 << 8) | indexByte2).info as ConstantClassInfo;
                        const module = await import("./lib/" + readUtf8FromConstantPool(constantPool, classRef.nameIndex) + ".js")

                        frame.operandStack.push({
                            "callable": new module[this.getClassName(readUtf8FromConstantPool(constantPool, classRef.nameIndex))]()
                        });

                        break;
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

    private throwErrorOrException(throwable: Throwable) {
        throwable.printStackTrace()
    }

    private getClassName(packageName: string): string {
        const split = packageName.split("/");
        return split[split.length - 1];
    }

}

export const getConstantPoolInfo = (constantPool: ConstantPoolInfo[], index: number): ConstantPoolInfo => {
    return constantPool.filter(constant => constant.id === index)[0];
}
