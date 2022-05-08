import {Frame} from "./Frame.js";
import {getArgumentsAndReturnType, throwErrorOrException} from "../jvm.js";
import {ConstantPoolInfo, readUtf8FromConstantPool} from "./info/ConstantPoolInfo.js";
import {MethodInfo} from "./info/MethodInfo.js";
import {CodeAttribute} from "./info/AttributeInfo.js";
import {ArrayVariable} from "./Variable.js";
import {ClassFile} from "./ClassFile.js";
import {System} from "../lib/java/lang/System.js";

export type Opcode = {
    id: number,
    opcode: number,
    operands: Array<number>
}

export default class Thread {

    pc: number = 0;
    stack: Array<Frame>
    stackSize: number

    constructor(stackSize: number) {
        if (stackSize < 1) {
            System.err.println("StackSize must must be bigger than 1.");
            return;
        }
        this.stackSize = stackSize;
        this.stack = [];
    }

    invokeMethod(methodName: string, constantPool: ConstantPoolInfo[], classFile: ClassFile, args: Array<any>) {
        const method = classFile.methods.filter(value => readUtf8FromConstantPool(constantPool, value.nameIndex) === methodName)[0]
        const codeAttributes =
            method.attributes.filter(attribute => readUtf8FromConstantPool(constantPool, attribute.attributeNameIndex) === "Code");
        if (!codeAttributes || codeAttributes.length == 0) return;

        const codeAttribute = codeAttributes[0]!! as CodeAttribute;
        const code = codeAttribute.code;
        code.resetOffset();

        const argsCount = getArgumentsAndReturnType(readUtf8FromConstantPool(constantPool, method.descriptorIndex))[0].length;

        const frame = new Frame(this, method, classFile, codeAttribute.maxLocals - argsCount, constantPool, args);
        this.pc++;
        this.stack.push(frame);

        if (this.stack.length > this.stackSize) {
            System.err.println("StackOverflowError!");
            return;
        }

        frame.loadOpcodes();
        frame.execute();

    }

}