import {ByteBuffer} from "./utils/ByteBuffer.js";
import {Throwable} from "./lib/java/lang/Throwable.js";
import RuntimeDataArea from "./core/rda/RuntimeDataArea.js";
import ClassFileLoader from "./core/cfl/ClassFileLoader.js";

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

        const classFile = ClassFileLoader.loadClassFile(this.buffer);
        this.runtimeDataArea
            .createThread(this.jvmArgs["Xss"])
            .then(thread => thread.invokeMethod("main", classFile, this.args));
    }

}

export const throwErrorOrException = (throwable: Throwable) => {
    throwable.printStackTrace()
}
