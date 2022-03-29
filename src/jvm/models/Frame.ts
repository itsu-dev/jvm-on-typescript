import {VerificationTypeInfo} from "./VerificationTypeInfo.js";
import {ConstantPoolInfo} from "./info/ConstantPoolInfo.js";
import {Variable} from "./Variable.js";

export class Frame {
    locals: Array<Variable>;
    operandStack: Array<any> = [];
    constantPool: ConstantPoolInfo[];

    constructor(localSize: number, constantPool: ConstantPoolInfo[]) {
        this.locals = new Array(localSize);
        this.constantPool = constantPool;
    }

}