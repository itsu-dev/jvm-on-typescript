import {
    CONSTANT_DOUBLE,
    CONSTANT_FLOAT,
    CONSTANT_INTEGER,
    CONSTANT_LONG,
    CONSTANT_STRING,
    ConstantClassInfo,
    ConstantDoubleInfo,
    ConstantFloatInfo,
    ConstantIntegerInfo,
    ConstantLongInfo,
    ConstantMethodRefInfo,
    ConstantNameAndTypeInfo,
    ConstantPoolInfo,
    ConstantStringInfo,
    isConstantFieldRefInfo,
    readUtf8FromConstantPool
} from "../../../models/info/ConstantPoolInfo.js";
import {
    AnyVariable,
    DoubleVariable,
    FloatVariable,
    IntVariable,
    LongVariable,
    Variable
} from "../../../models/Variable.js";
import {CodeAttribute} from "../../../models/info/AttributeInfo.js";
import {MethodInfo} from "../../../models/info/MethodInfo.js";
import {NoSuchFieldError} from "../../../lib/java/lang/NoSuchFieldError.js";
import {ByteBuffer} from "../../../utils/ByteBuffer.js";
import {System} from "../../../lib/java/lang/System.js";
import {throwErrorOrException} from "../../../jvm.js";
import Thread from "./Thread.js";
import {ClassFile} from "../../cfl/ClassFile.js";
import {getConstantPoolInfo, getArgumentsAndReturnType} from "../../cfl/ClassFileLoader.js";

export type Opcode = {
    id: number,
    opcode: number,
    operands: Array<number>
}

export class Frame {

    thread: Thread
    method: MethodInfo;
    classFile: ClassFile;
    locals: Array<Variable>;
    operandStack: Array<any> = [];
    constantPool: ConstantPoolInfo[];
    opcodes = new Array<Opcode>();
    isRunning = true;

    constructor(thread: Thread, method: MethodInfo, classFile: ClassFile, localSize: number, constantPool: ConstantPoolInfo[], args: Array<any>) {
        this.thread = thread;
        this.method = method;
        this.classFile = classFile;
        this.locals = new Array(localSize);
        this.constantPool = constantPool;
        args.forEach(arg => this.locals.push(new IntVariable(arg)));
    }

    execute() {
        this.executeOpcodes(0);
    }

    private async executeOpcodes(id: number) {
        let opcode: Opcode

        if (this.opcodes[this.opcodes.length - 1].id < id) {
            id = id - 65536;
        }

        const index = this.getOpcodeIndexById(id);

        mainloop:
            for (let i = index; i < this.opcodes.length; i++) {
                opcode = this.opcodes[i];

                if (!this.isRunning || !opcode) break;

                switch (opcode.opcode) {
                    // nop
                    case 0x00: {
                        break;
                    }

                    // getstatic
                    case 0xb2: {
                        const indexByte1 = opcode.operands[0];
                        const indexByte2 = opcode.operands[1];
                        const constantPoolInfo = getConstantPoolInfo(this.constantPool, (indexByte1 << 8) | indexByte2);

                        if (!constantPoolInfo || !isConstantFieldRefInfo(constantPoolInfo.info)) {
                            throwErrorOrException(new NoSuchFieldError());
                            return;
                        }

                        const fieldRef = constantPoolInfo.info;
                        const classRef = getConstantPoolInfo(this.constantPool, fieldRef.classIndex).info as ConstantClassInfo
                        const fieldNameAndTypeRef = getConstantPoolInfo(this.constantPool, fieldRef.nameAndTypeIndex).info as ConstantNameAndTypeInfo
                        const module = await import("../../../lib/" + readUtf8FromConstantPool(this.constantPool, classRef.nameIndex) + ".js")
                        const fieldClassFileName = readUtf8FromConstantPool(this.constantPool, fieldNameAndTypeRef.nameIndex);

                        this.operandStack.push({
                            "callable": module[this.getClassName(readUtf8FromConstantPool(this.constantPool, classRef.nameIndex))][fieldClassFileName],
                            "return": readUtf8FromConstantPool(this.constantPool, fieldNameAndTypeRef.descriptorIndex)
                        });

                        break;
                    }

                    // ldc
                    case 0x12: {
                        const index = opcode.operands[0];
                        const info = getConstantPoolInfo(this.constantPool, index).info;

                        if (info.tag === CONSTANT_STRING) {
                            this.operandStack.push(readUtf8FromConstantPool(this.constantPool, (info as ConstantStringInfo).stringIndex));

                        } else if (info.tag === CONSTANT_INTEGER) {
                            const dataView = new ByteBuffer(new ArrayBuffer(32));
                            dataView.setInt32((info as ConstantIntegerInfo).bytes);
                            dataView.resetOffset();
                            this.operandStack.push(dataView.getInt8());

                        } else if (info.tag === CONSTANT_FLOAT) {
                            const dataView = new ByteBuffer(new ArrayBuffer(32));
                            dataView.setUint32((info as ConstantFloatInfo).bytes);
                            dataView.resetOffset();
                            this.operandStack.push(dataView.getFloat32());

                        }
                        break;
                    }

                    // ldc2_w
                    case 0x14: {
                        const indexByte1 = opcode.operands[0];
                        const indexByte2 = opcode.operands[1];
                        const info = getConstantPoolInfo(this.constantPool, (indexByte1 << 8) | indexByte2).info;

                        if (info.tag === CONSTANT_LONG) {
                            const dataView = new ByteBuffer(new ArrayBuffer(64));
                            dataView.setUint32((info as ConstantLongInfo).highBytes);
                            dataView.setUint32((info as ConstantLongInfo).lowBytes);
                            dataView.resetOffset();
                            this.operandStack.push((dataView.getUint32() << 32) + dataView.getUint32());

                        } else if (info.tag === CONSTANT_DOUBLE) {
                            const dataView = new ByteBuffer(new ArrayBuffer(64));
                            dataView.setUint32((info as ConstantDoubleInfo).highBytes);
                            dataView.setUint32((info as ConstantDoubleInfo).lowBytes);
                            dataView.resetOffset();
                            this.operandStack.push(dataView.getFloat64());

                        }
                        break;
                    }

                    // invokevirtual
                    case 0xb6: {
                        const indexByte1 = opcode.operands[0];
                        const indexByte2 = opcode.operands[1];
                        const methodRef = getConstantPoolInfo(this.constantPool, (indexByte1 << 8) | indexByte2).info as ConstantMethodRefInfo;
                        const methodNameAndTypeRef = getConstantPoolInfo(this.constantPool, methodRef.nameAndTypeIndex).info as ConstantNameAndTypeInfo;
                        const clazz = getConstantPoolInfo(this.constantPool, methodRef.classIndex).info as ConstantClassInfo;
                        const className = readUtf8FromConstantPool(this.constantPool, clazz.nameIndex);
                        const invokeMethodName = readUtf8FromConstantPool(this.constantPool, methodNameAndTypeRef.nameIndex);
                        const argumentsAndReturnType = getArgumentsAndReturnType(readUtf8FromConstantPool(this.constantPool, methodNameAndTypeRef.descriptorIndex));
                        const methodArgs = [];

                        for (let i = 0; i < argumentsAndReturnType[0].length; i++) {
                            methodArgs.push(this.operandStack.pop());
                        }

                        if (argumentsAndReturnType[1] !== "V") {
                            const result = this.operandStack.pop()[invokeMethodName](...methodArgs);
                            if (typeof result === "object") {
                                this.operandStack.push(result);
                            } else {
                                this.operandStack.push(result);
                            }

                        } else {
                            this.operandStack.pop()[invokeMethodName](...methodArgs)
                        }

                        break;
                    }

                    // iconst_m1
                    case 0x02: {
                        this.operandStack.push(-1);
                        break
                    }

                    // iconst_0
                    case 0x03: {
                        this.operandStack.push(0);
                        break
                    }

                    // iconst_1
                    case 0x04: {
                        this.operandStack.push(1);
                        break
                    }

                    // iconst_2
                    case 0x05: {
                        this.operandStack.push(2);
                        break
                    }

                    // iconst_3
                    case 0x06: {
                        this.operandStack.push(3);
                        break
                    }

                    // iconst_4
                    case 0x07: {
                        this.operandStack.push(4);
                        break
                    }

                    // iconst_5
                    case 0x08: {
                        this.operandStack.push(5);
                        break
                    }

                    // lconst_0
                    case 0x09: {
                        this.operandStack.push(1);
                        break;
                    }

                    // lconst_1
                    case 0x0a: {
                        this.operandStack.push(2);
                        break;
                    }

                    // fconst_0
                    case 0x0b: {
                        this.operandStack.push(0.0);
                        break;
                    }

                    // fconst_1
                    case 0x0c: {
                        this.operandStack.push(1.0);
                        break;
                    }

                    // fconst_2
                    case 0x0d: {
                        this.operandStack.push(2.0);
                        break;
                    }

                    // dconst_0
                    case 0x0e: {
                        this.operandStack.push(0.0);
                        break;
                    }

                    // dconst_1
                    case 0x0f: {
                        this.operandStack.push(1.0);
                        break;
                    }

                    // bipush
                    case 0x10: {
                        const data = opcode.operands[0];
                        this.operandStack.push(data);
                        break;
                    }

                    // iload
                    case 0x15: {
                        const index = opcode.operands[0];
                        this.operandStack.push(this.locals[index].getValue());
                        break;
                    }

                    // lload
                    case 0x16: {
                        const index = opcode.operands[0];
                        this.operandStack.push(this.locals[index].getValue());
                        break;
                    }

                    // fload
                    case 0x17: {
                        const index = opcode.operands[0];
                        this.operandStack.push(this.locals[index].getValue());
                        break;
                    }

                    // dload
                    case 0x18: {
                        const index = opcode.operands[0];
                        this.operandStack.push(this.locals[index].getValue());
                        break;
                    }

                    // aload
                    case 0x19: {
                        const index = opcode.operands[0];
                        this.operandStack.push(this.locals[index].getValue());
                        break;
                    }

                    // iload_0
                    case 0x1a: {
                        this.operandStack.push(this.locals[0].getValue());
                        break;
                    }

                    // iload_1
                    case 0x1b: {
                        this.operandStack.push(this.locals[1].getValue());
                        break;
                    }

                    // iload_2
                    case 0x1c: {
                        this.operandStack.push(this.locals[2].getValue());
                        break;
                    }

                    // iload_3
                    case 0x1d: {
                        this.operandStack.push(this.locals[3].getValue());
                        break;
                    }

                    // lload_0
                    case 0x1e: {
                        this.operandStack.push(this.locals[0].getValue());
                        break;
                    }

                    // lload_1
                    case 0x1f: {
                        this.operandStack.push(this.locals[1].getValue());
                        break;
                    }

                    // lload_2
                    case 0x20: {
                        this.operandStack.push(this.locals[2].getValue());
                        break;
                    }

                    // lload_3
                    case 0x21: {
                        this.operandStack.push(this.locals[3].getValue());
                        break;
                    }

                    // fload_0
                    case 0x22: {
                        this.operandStack.push(this.locals[0].getValue());
                        break;
                    }

                    // fload_1
                    case 0x23: {
                        this.operandStack.push(this.locals[1].getValue());
                        break;
                    }

                    // fload_2
                    case 0x24: {
                        this.operandStack.push(this.locals[2].getValue());
                        break;
                    }

                    // fload_3
                    case 0x25: {
                        this.operandStack.push(this.locals[3].getValue());
                        break;
                    }

                    // dload_0
                    case 0x26: {
                        this.operandStack.push(this.locals[0].getValue());
                        break;
                    }

                    // dload_1
                    case 0x27: {
                        this.operandStack.push(this.locals[1].getValue());
                        break;
                    }

                    // dload_2
                    case 0x28: {
                        this.operandStack.push(this.locals[2].getValue());
                        break;
                    }

                    // dload_3
                    case 0x29: {
                        this.operandStack.push(this.locals[3].getValue());
                        break;
                    }

                    // aload_0
                    case 0x2a: {
                        this.operandStack.push(this.locals[0].getValue());
                        break;
                    }

                    // aload_1
                    case 0x2b: {
                        this.operandStack.push(this.locals[1].getValue());
                        break;
                    }

                    // aload_2
                    case 0x2c: {
                        this.operandStack.push(this.locals[2].getValue());
                        break;
                    }

                    // aload_3
                    case 0x2d: {
                        this.operandStack.push(this.locals[3].getValue());
                        break;
                    }

                    // istore
                    case 0x36: {
                        const index = opcode.operands[0];
                        if (this.locals.length - 1 < index) {
                            this.locals.push(new IntVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(index, 0, new IntVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore
                    case 0x37: {
                        const index = opcode.operands[0];
                        if (this.locals.length - 1 < index) {
                            this.locals.push(new LongVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(index, 0, new LongVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore
                    case 0x38: {
                        const index = opcode.operands[0];
                        if (this.locals.length - 1 < index) {
                            this.locals.push(new FloatVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(index, 0, new FloatVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore
                    case 0x39: {
                        const index = opcode.operands[0];
                        if (this.locals.length - 1 < index) {
                            this.locals.push(new DoubleVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(index, 0, new DoubleVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // astore
                    case 0x3a: {
                        const index = opcode.operands[0];
                        if (this.locals.length - 1 < index) {
                            this.locals.push(new AnyVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(index, 0, new AnyVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // istore_0
                    case 0x3b: {
                        if (this.locals.length - 1 < 0) {
                            this.locals.push(new IntVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(0, 0, new IntVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // istore_1
                    case 0x3c: {
                        if (this.locals.length - 1 < 1) {
                            this.locals.push(new IntVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(1, 0, new IntVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // istore_2
                    case 0x3d: {
                        if (this.locals.length - 1 < 2) {
                            this.locals.push(new IntVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(2, 0, new IntVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // istore_3
                    case 0x3e: {
                        if (this.locals.length - 1 < 3) {
                            this.locals.push(new IntVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(3, 0, new IntVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore_0
                    case 0x3f: {
                        if (this.locals.length - 1 < 0) {
                            this.locals.push(new LongVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(0, 0, new LongVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore_1
                    case 0x40: {
                        if (this.locals.length - 1 < 1) {
                            this.locals.push(new LongVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(1, 0, new LongVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore_2
                    case 0x41: {
                        if (this.locals.length - 1 < 2) {
                            this.locals.push(new LongVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(2, 0, new LongVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // lstore_3
                    case 0x42: {
                        if (this.locals.length - 1 < 3) {
                            this.locals.push(new LongVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(3, 0, new LongVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore_0
                    case 0x43: {
                        if (this.locals.length - 1 < 0) {
                            this.locals.push(new FloatVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(0, 0, new FloatVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore_1
                    case 0x44: {
                        if (this.locals.length - 1 < 1) {
                            this.locals.push(new FloatVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(1, 0, new FloatVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore_2
                    case 0x45: {
                        if (this.locals.length - 1 < 2) {
                            this.locals.push(new FloatVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(2, 0, new FloatVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // fstore_3
                    case 0x46: {
                        if (this.locals.length - 1 < 3) {
                            this.locals.push(new FloatVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(3, 0, new FloatVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore_0
                    case 0x47: {
                        if (this.locals.length - 1 < 0) {
                            this.locals.push(new DoubleVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(0, 0, new DoubleVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore_1
                    case 0x48: {
                        if (this.locals.length - 1 < 1) {
                            this.locals.push(new DoubleVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(1, 0, new DoubleVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore_2
                    case 0x48: {
                        if (this.locals.length - 1 < 2) {
                            this.locals.push(new DoubleVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(2, 0, new DoubleVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // dstore_3
                    case 0x4a: {
                        if (this.locals.length - 1 < 3) {
                            this.locals.push(new DoubleVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(3, 0, new DoubleVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // astore_0
                    case 0x4b: {
                        if (this.locals.length - 1 < 0) {
                            this.locals.push(new AnyVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(0, 0, new AnyVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // astore_1
                    case 0x4c: {
                        if (this.locals.length - 1 < 1) {
                            this.locals.push(new AnyVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(1, 0, new AnyVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // astore_2
                    case 0x4d: {
                        if (this.locals.length - 1 < 2) {
                            this.locals.push(new AnyVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(2, 0, new AnyVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // astore_3
                    case 0x4e: {
                        if (this.locals.length - 1 < 3) {
                            this.locals.push(new AnyVariable(this.operandStack.pop()));
                        } else {
                            this.locals.splice(3, 0, new AnyVariable(this.operandStack.pop()));
                        }
                        break;
                    }

                    // pop
                    case 0x57: {
                        const data = this.operandStack.pop();
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
                        const value1 = this.operandStack.pop();
                        if (isCategory2(value1)) break;
                        else if (isCategory1(value1)) {
                            const value2 = this.operandStack.pop();
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
                        const original = this.operandStack.pop();
                        const copied = Object.assign(Object.create(Object.getPrototypeOf(original)), original);
                        const copied2 = Object.assign(Object.create(Object.getPrototypeOf(original)), original);
                        this.operandStack.push(copied);
                        this.operandStack.push(copied2);
                        break;
                    }

                    // iadd
                    case 0x60: {
                        this.operandStack.push(this.operandStack.pop() + this.operandStack.pop());
                        break;
                    }

                    // ladd
                    case 0x61: {
                        this.operandStack.push(this.operandStack.pop() + this.operandStack.pop());
                        break;
                    }

                    // fadd
                    case 0x62: {
                        this.operandStack.push(this.operandStack.pop() + this.operandStack.pop());
                        break;
                    }

                    // dadd
                    case 0x63: {
                        this.operandStack.push(this.operandStack.pop() + this.operandStack.pop());
                        break;
                    }

                    // isub
                    case 0x64: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() - value2);
                        break;
                    }

                    // lsub
                    case 0x65: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() - value2);
                        break;
                    }

                    // fsub
                    case 0x66: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() - value2);
                        break;
                    }

                    // dsub
                    case 0x67: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() - value2);
                        break;
                    }

                    // imul
                    case 0x68: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() * value2);
                        break;
                    }

                    // lmul
                    case 0x69: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() * value2);
                        break;
                    }

                    // fmul
                    case 0x6a: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() * value2);
                        break;
                    }

                    // dmul
                    case 0x6b: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() * value2);
                        break;
                    }

                    // idiv
                    case 0x6c: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() / value2);
                        break;
                    }

                    // ldiv
                    case 0x6d: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() / value2);
                        break;
                    }

                    // fdiv
                    case 0x6e: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() / value2);
                        break;
                    }

                    // ddiv
                    case 0x6f: {
                        const value2 = this.operandStack.pop();
                        this.operandStack.push(this.operandStack.pop() / value2);
                        break;
                    }

                    // irem
                    case 0x70: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 % value2);
                        break;
                    }

                    // lrem
                    case 0x71: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 % value2);
                        break;
                    }

                    // frem
                    case 0x72: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 % value2);
                        break;
                    }

                    // drem
                    case 0x73: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 % value2);
                        break;
                    }

                    // ineg
                    case 0x74: {
                        this.operandStack.push(-this.operandStack.pop());
                        break;
                    }

                    // lneg
                    case 0x75: {
                        this.operandStack.push(-this.operandStack.pop());
                        break;
                    }

                    // fneg
                    case 0x76: {
                        this.operandStack.push(-this.operandStack.pop());
                        break;
                    }

                    // dneg
                    case 0x77: {
                        this.operandStack.push(-this.operandStack.pop());
                        break;
                    }

                    // ishl
                    case 0x78: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 << value2);
                        break;
                    }

                    // lshl
                    case 0x79: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 << value2);
                        break;
                    }

                    // ishr
                    case 0x7a: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 >> value2);
                        break;
                    }

                    // lshr
                    case 0x7b: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 >> value2);
                        break;
                    }

                    // iushr
                    case 0x7c: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 >> value2);
                        break;
                    }

                    // lushr
                    case 0x7d: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 >> value2);
                        break;
                    }

                    // iand
                    case 0x7e: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 & value2);
                        break;
                    }

                    // land
                    case 0x7f: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 & value2);
                        break;
                    }

                    // ior
                    case 0x80: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 | value2);
                        break;
                    }

                    // lor
                    case 0x81: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 | value2);
                        break;
                    }

                    // ixor
                    case 0x82: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 ^ value2);
                        break;
                    }

                    // lxor
                    case 0x83: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        this.operandStack.push(value1 ^ value2);
                        break;
                    }

                    // iinc
                    case 0x84: {
                        const index = opcode.operands[0];
                        const vConst = opcode.operands[1];
                        this.locals[index].setValue(this.locals[index].getValue() + vConst);
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
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (value2 < value1) this.operandStack.push(1);
                        else if (value2 == value1) this.operandStack.push(0);
                        else this.operandStack.push(-1);
                        break;
                    }

                    // fcmpl
                    case 0x95: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (isNaN(value1) || isNaN(value2)) this.operandStack.push(-1);
                        else if (value2 < value1) this.operandStack.push(1);
                        else if (value2 == value1) this.operandStack.push(0);
                        else this.operandStack.push(-1);
                        break;
                    }

                    // fcmpg
                    case 0x96: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (isNaN(value1) || isNaN(value2)) this.operandStack.push(-1);
                        else if (value2 < value1) this.operandStack.push(1);
                        else if (value2 == value1) this.operandStack.push(0);
                        else this.operandStack.push(1);
                        break;
                    }

                    // dcmpl
                    case 0x97: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (isNaN(value1) || isNaN(value2)) this.operandStack.push(-1);
                        else if (value2 < value1) this.operandStack.push(1);
                        else if (value2 == value1) this.operandStack.push(0);
                        else this.operandStack.push(-1);
                        break;
                    }

                    // dcmpg
                    case 0x98: {
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (isNaN(value1) || isNaN(value2)) this.operandStack.push(-1);
                        else if (value2 < value1) this.operandStack.push(1);
                        else if (value2 == value1) this.operandStack.push(0);
                        else this.operandStack.push(1);
                        break;
                    }

                    // ifeq
                    case 0x99: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        if (this.operandStack.pop() === 0) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // ifne
                    case 0x9a: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        if (this.operandStack.pop() !== 0) {
                            await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                            break mainloop;
                        }
                        break;
                    }

                    // iflt
                    case 0x9b: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        if (this.operandStack.pop() < 0) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // ifge
                    case 0x9c: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        if (this.operandStack.pop() >= 0) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // ifgt
                    case 0x9d: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        if (this.operandStack.pop() > 0) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // ifle
                    case 0x9e: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        if (this.operandStack.pop() <= 0) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // if_icmpeq
                    case 0x9f: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (value1 === value2) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // if_icmpne
                    case 0xa0: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (value1 !== value2) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // if_icmplt
                    case 0xa1: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (value1 < value2) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // if_icmpge
                    case 0xa2: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (value1 >= value2) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // if_icmpgt
                    case 0xa3: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (value1 > value2) {
                            await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        }
                        break;
                    }

                    // if_icmple
                    case 0xa4: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        const value2 = this.operandStack.pop();
                        const value1 = this.operandStack.pop();
                        if (value1 <= value2) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // goto
                    case 0xa7: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // ireturn
                    case 0xac: {
                        this.thread.stack[this.thread.runtimeDataArea.getPCRegister(this.thread.id) - 2].operandStack.push(this.operandStack.pop());
                        break;
                    }

                    // return
                    case 0xb1: {
                        this.isRunning = false
                        break;
                    }

                    // invokespecial
                    case 0xb7: {
                        const indexByte1 = opcode.operands[0];
                        const indexByte2 = opcode.operands[1];
                        const methodRef = getConstantPoolInfo(this.constantPool, (indexByte1 << 8) | indexByte2).info as ConstantMethodRefInfo;
                        const methodNameAndTypeRef = getConstantPoolInfo(this.constantPool, methodRef.nameAndTypeIndex).info as ConstantNameAndTypeInfo;
                        const argumentsAndReturnType = getArgumentsAndReturnType(readUtf8FromConstantPool(this.constantPool, methodNameAndTypeRef.descriptorIndex));
                        const argumentsCount = argumentsAndReturnType[0].length;
                        const methodArgs = [];

                        for (let i = 0; i < argumentsCount; i++) {
                            methodArgs.push(this.operandStack.pop());
                        }

                        this.operandStack.push(this.operandStack.pop()["constructor"](...methodArgs));

                        break;
                    }

                    // invokestatic
                    case 0xb8: {
                        const indexByte1 = opcode.operands[0];
                        const indexByte2 = opcode.operands[1];
                        const methodRef = getConstantPoolInfo(this.constantPool, (indexByte1 << 8) | indexByte2).info as ConstantMethodRefInfo;
                        const methodNameAndTypeRef = getConstantPoolInfo(this.constantPool, methodRef.nameAndTypeIndex).info as ConstantNameAndTypeInfo;
                        const clazz = getConstantPoolInfo(this.constantPool, methodRef.classIndex).info as ConstantClassInfo;
                        const className = readUtf8FromConstantPool(this.constantPool, clazz.nameIndex);
                        const invokeMethodName = readUtf8FromConstantPool(this.constantPool, methodNameAndTypeRef.nameIndex);
                        const argumentsAndReturnType = getArgumentsAndReturnType(readUtf8FromConstantPool(this.constantPool, methodNameAndTypeRef.descriptorIndex));
                        const argumentsCount = argumentsAndReturnType[0].length;
                        const methodArgs = [];

                        for (let i = 0; i < argumentsCount; i++) {
                            methodArgs.push(this.operandStack.pop());
                        }

                        this.thread.invokeMethod(invokeMethodName, this.classFile, methodArgs);

                        // this.operandStack.pop()["callable"]["constructor"](...methodArgs)

                        break;
                    }

                    // new
                    case 0xbb: {
                        const indexByte1 = opcode.operands[0];
                        const indexByte2 = opcode.operands[1];
                        const classRef = getConstantPoolInfo(this.constantPool, (indexByte1 << 8) | indexByte2).info as ConstantClassInfo;
                        const className = readUtf8FromConstantPool(this.constantPool, classRef.nameIndex);
                        let module: any

                        module = await import("../../../lib/" + className + ".js");

                        /*
                        this.operandStack.push({
                            "callable": new module[this.getClassName(readUtf8FromConstantPool(this.constantPool, classRef.nameIndex))]()
                        });

                         */

                        this.operandStack.push(module.default.prototype);

                        break;
                    }

                    // checkcast
                    case 0xc6: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        const ref = getConstantPoolInfo(this.constantPool, (branchByte1 << 8) | branchByte2);
                        // TODO
                        break;
                    }

                    // ifnull
                    case 0xc6: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        const value = this.operandStack.pop();
                        if (value == null) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }

                    // ifnonnull
                    case 0xc7: {
                        const branchByte1 = opcode.operands[0];
                        const branchByte2 = opcode.operands[1];
                        const value = this.operandStack.pop();
                        if (value) await this.executeOpcodes(opcode.id + ((branchByte1 << 8) | branchByte2));
                        break;
                    }
                }
            }
    }

    loadOpcodes() {
        const codeAttributes =
            this.method.attributes.filter(attribute => readUtf8FromConstantPool(this.constantPool, attribute.attributeNameIndex) === "Code");
        if (!codeAttributes || codeAttributes.length == 0) return;

        const codeAttribute = codeAttributes[0]!! as CodeAttribute;
        const code = codeAttribute.code;
        code.resetOffset();

        let opcode: number;
        let id = 0;
        while (code.offset < code.getLength()) {
            opcode = code.getUint8()

            switch (opcode) {
                // nop
                case 0x00: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // getstatic
                case 0xb2: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // ldc
                case 0x12: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // ldc2_w
                case 0x14: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // invokevirtual
                case 0xb6: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // iconst_m1
                case 0x02: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iconst_0
                case 0x03: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iconst_1
                case 0x04: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iconst_2
                case 0x05: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iconst_3
                case 0x06: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iconst_4
                case 0x07: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iconst_5
                case 0x08: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lconst_0
                case 0x09: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lconst_1
                case 0x0a: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fconst_0
                case 0x0b: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fconst_1
                case 0x0c: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fconst_2
                case 0x0d: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dconst_0
                case 0x0e: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dconst_1
                case 0x0f: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // bipush
                case 0x10: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getInt8()]
                    });
                    id++;
                    break;
                }

                // iload
                case 0x15: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // lload
                case 0x16: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // fload
                case 0x17: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // dload
                case 0x18: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // iload_0
                case 0x1a: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iload_1
                case 0x1b: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iload_2
                case 0x1c: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iload_3
                case 0x1d: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lload_0
                case 0x1e: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lload_1
                case 0x1f: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lload_2
                case 0x20: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lload_3
                case 0x21: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fload_0
                case 0x22: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fload_1
                case 0x23: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fload_2
                case 0x24: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fload_3
                case 0x25: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dload_0
                case 0x26: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dload_1
                case 0x27: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dload_2
                case 0x28: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dload_3
                case 0x29: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // aload_0
                case 0x2a: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // aload_1
                case 0x2b: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // aload_2
                case 0x2c: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // aload_3
                case 0x2d: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // istore
                case 0x36: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // lstore
                case 0x37: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // fstore
                case 0x38: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // dstore
                case 0x39: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // astore
                case 0x3a: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8()]
                    });
                    id++;
                    break;
                }

                // istore_0
                case 0x3b: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // istore_1
                case 0x3c: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // istore_2
                case 0x3d: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // istore_3
                case 0x3e: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lstore_0
                case 0x3f: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lstore_1
                case 0x40: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lstore_2
                case 0x41: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lstore_3
                case 0x42: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fstore_0
                case 0x43: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fstore_1
                case 0x44: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fstore_2
                case 0x45: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fstore_3
                case 0x46: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dstore_0
                case 0x47: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dstore_1
                case 0x48: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dstore_2
                case 0x48: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dstore_3
                case 0x4a: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // astore_0
                case 0x4b: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // astore_1
                case 0x4c: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // astore_2
                case 0x4d: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // astore_3
                case 0x4e: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // pop
                case 0x57: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // pop2
                case 0x58: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dup
                case 0x59: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iadd
                case 0x60: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // ladd
                case 0x61: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fadd
                case 0x62: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dadd
                case 0x63: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // isub
                case 0x64: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lsub
                case 0x65: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fsub
                case 0x66: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dsub
                case 0x67: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // imul
                case 0x68: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lmul
                case 0x69: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fmul
                case 0x6a: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dmul
                case 0x6b: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // idiv
                case 0x6c: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // ldiv
                case 0x6d: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fdiv
                case 0x6e: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // ddiv
                case 0x6f: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // irem
                case 0x70: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lrem
                case 0x71: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // frem
                case 0x72: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // drem
                case 0x73: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // ineg
                case 0x74: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lneg
                case 0x75: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fneg
                case 0x76: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dneg
                case 0x77: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // ishl
                case 0x78: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lshl
                case 0x79: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // ishr
                case 0x7a: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lshr
                case 0x7b: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iushr
                case 0x7c: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lushr
                case 0x7d: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iand
                case 0x7e: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // land
                case 0x7f: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // ior
                case 0x80: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lor
                case 0x81: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // ixor
                case 0x82: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lxor
                case 0x83: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // iinc
                case 0x84: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getInt8()]
                    });
                    id += 2;
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
                case 0x93: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // lcmp
                case 0x94: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fcmpl
                case 0x95: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // fcmpg
                case 0x96: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dcmpl
                case 0x97: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // dcmpg
                case 0x98: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // ifeq
                case 0x99: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // ifne
                case 0x9a: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // iflt
                case 0x9b: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // ifge
                case 0x9c: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // ifgt
                case 0x9d: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // ifle
                case 0x9e: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // if_icmpeq
                case 0x9f: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // if_icmpne
                case 0xa0: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // if_icmplt
                case 0xa1: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // if_icmpge
                case 0xa2: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // if_icmpgt
                case 0xa3: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // if_icmple
                case 0xa4: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // goto
                case 0xa7: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // ireturn
                case 0xac: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // return
                case 0xb1: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: []
                    });
                    break;
                }

                // invokespecial
                case 0xb7: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // invokestatic
                case 0xb8: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // new
                case 0xbb: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // checkcast
                case 0xc0: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // ifnull
                case 0xc6: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }

                // ifnonnull
                case 0xc7: {
                    this.opcodes.push({
                        id: id,
                        opcode: opcode,
                        operands: [code.getUint8(), code.getUint8()]
                    });
                    id += 2;
                    break;
                }
            }
            id++;
        }
    }

    private getClassName(packageName: string): string {
        const split = packageName.split("/");
        return split[split.length - 1];
    }

    getOpcodeIndexById(id: number): number {
        return this.opcodes.findIndex(opcode => opcode.id === id);
    }

    getOpcodeById(id: number): Opcode {
        return this.opcodes.filter(opcode => opcode.id === id)[0];
    }

}