import { ByteBuffer } from "./utils/ByteBuffer.js";
import RuntimeDataArea from "./core/rda/RuntimeDataArea.js";
import ClassFileLoader from "./core/cfl/ClassFileLoader.js";
var JVM = /** @class */ (function () {
    function JVM(array, jvmArgs, args) {
        this.buffer = new ByteBuffer(array);
        this.jvmArgs = jvmArgs;
        this.args = args;
        this.runtimeDataArea = new RuntimeDataArea();
    }
    JVM.prototype.load = function () {
        var _this = this;
        if (!this.buffer) {
            console.error("buffer must not be undefined!");
            return;
        }
        var classFile = ClassFileLoader.loadClassFile(this.buffer);
        this.runtimeDataArea
            .createThread(this.jvmArgs["Xss"])
            .then(function (thread) { return thread.invokeMethod("main", classFile, _this.args); });
    };
    return JVM;
}());
export { JVM };
export var throwErrorOrException = function (throwable) {
    throwable.printStackTrace();
};
//# sourceMappingURL=jvm.js.map