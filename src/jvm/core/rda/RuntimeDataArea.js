import Thread from "./stack/Thread.js";
var RuntimeDataArea = /** @class */ (function () {
    function RuntimeDataArea() {
        this.threadId = 1;
        this.stackArea = {};
        this.pcRegisters = {};
    }
    RuntimeDataArea.prototype.createThread = function (stackSize) {
        var _this = this;
        this.stackArea[this.threadId] = new Promise(function (resolve) {
            resolve(new Thread(_this, stackSize, _this.threadId));
        });
        this.pcRegisters[this.threadId] = 0;
        this.threadId++;
        return this.stackArea[this.threadId - 1];
    };
    RuntimeDataArea.prototype.getThreadPromise = function (threadId) {
        return this.stackArea[threadId];
    };
    RuntimeDataArea.prototype.setPCRegister = function (threadId, value) {
        this.pcRegisters[threadId] = value;
    };
    RuntimeDataArea.prototype.incrementPCRegister = function (threadId) {
        this.pcRegisters[threadId]++;
    };
    RuntimeDataArea.prototype.getPCRegister = function (threadId) {
        return this.pcRegisters[threadId];
    };
    return RuntimeDataArea;
}());
export default RuntimeDataArea;
//# sourceMappingURL=RuntimeDataArea.js.map