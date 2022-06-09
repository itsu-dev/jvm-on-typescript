import { Frame } from "./Frame.js";
import { readUtf8FromConstantPool } from "../../../models/info/ConstantPoolInfo.js";
import { System } from "../../../lib/java/lang/System.js";
import { getArgumentsAndReturnType } from "../../cfl/ClassFileLoader.js";
var Thread = /** @class */ (function () {
    function Thread(runtimeDataArea, stackSize, id) {
        if (stackSize < 1) {
            System.err.println("StackSize must must be bigger than 1.");
            return;
        }
        this.runtimeDataArea = runtimeDataArea;
        this.stackSize = stackSize;
        this.stack = [];
        this.id = id;
    }
    Thread.prototype.invokeMethod = function (methodName, classFile, args) {
        var constantPool = classFile.constantPool;
        var method = classFile.methods.filter(function (value) { return readUtf8FromConstantPool(constantPool, value.nameIndex) === methodName; })[0];
        var codeAttributes = method.attributes.filter(function (attribute) { return readUtf8FromConstantPool(constantPool, attribute.attributeNameIndex) === "Code"; });
        if (!codeAttributes || codeAttributes.length == 0)
            return;
        var codeAttribute = codeAttributes[0];
        var code = codeAttribute.code;
        code.resetOffset();
        var argsCount = getArgumentsAndReturnType(readUtf8FromConstantPool(constantPool, method.descriptorIndex))[0].length;
        var frame = new Frame(this, method, classFile, codeAttribute.maxLocals - argsCount, constantPool, args);
        this.runtimeDataArea.incrementPCRegister(this.id);
        this.stack.push(frame);
        if (this.stack.length > this.stackSize) {
            System.err.println("StackOverflowError!");
            return;
        }
        frame.loadOpcodes();
        frame.execute();
    };
    return Thread;
}());
export default Thread;
//# sourceMappingURL=Thread.js.map