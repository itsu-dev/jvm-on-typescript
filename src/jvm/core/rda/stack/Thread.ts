import {Frame} from "./Frame.js";
import {throwErrorOrException} from "../../../jvm.js";
import {ConstantPoolInfo, readUtf8FromConstantPool} from "../../../models/info/ConstantPoolInfo.js";
import {MethodInfo} from "../../../models/info/MethodInfo.js";
import {CodeAttribute} from "../../../models/info/AttributeInfo.js";
import {ArrayVariable} from "../../../models/Variable.js";
import {ClassFile} from "../../cfl/ClassFile.js";
import {System} from "../../../lib/java/lang/System.js";
import RuntimeDataArea from "../RuntimeDataArea.js";
import {getArgumentsAndReturnType} from "../../cfl/ClassFileLoader.js";

export default class Thread {

    runtimeDataArea: RuntimeDataArea;
    stack: Array<Frame>;
    id: number;
    stackSize: number;

    constructor(runtimeDataArea: RuntimeDataArea, stackSize: number, id: number) {
        if (stackSize < 1) {
            System.err.println("StackSize must must be bigger than 1.");
            return;
        }
        this.runtimeDataArea = runtimeDataArea;
        this.stackSize = stackSize;
        this.stack = [];
        this.id = id;
    }

    invokeMethod(methodName: string, classFile: ClassFile, args: Array<any>) {
        const constantPool = classFile.constantPool;
        const method = classFile.methods.filter(value => readUtf8FromConstantPool(constantPool, value.nameIndex) === methodName)[0]
        const codeAttributes =
            method.attributes.filter(attribute => readUtf8FromConstantPool(constantPool, attribute.attributeNameIndex) === "Code");
        if (!codeAttributes || codeAttributes.length == 0) return;

        const codeAttribute = codeAttributes[0]!! as CodeAttribute;
        const code = codeAttribute.code;
        code.resetOffset();

        const argsCount = getArgumentsAndReturnType(readUtf8FromConstantPool(constantPool, method.descriptorIndex))[0].length;

        const frame = new Frame(this, method, classFile, codeAttribute.maxLocals - argsCount, constantPool, args);
        this.runtimeDataArea.incrementPCRegister(this.id);
        this.stack.push(frame);

        if (this.stack.length > this.stackSize) {
            System.err.println("StackOverflowError!");
            return;
        }

        frame.loadOpcodes();
        frame.execute();

    }

}