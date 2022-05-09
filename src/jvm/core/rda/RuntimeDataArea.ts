import {ClassFile} from "../cfl/ClassFile.js";
import Thread from "./stack/Thread.js";

export default class RuntimeDataArea {

    private threadId = 1;
    private stackArea = {};
    private pcRegisters = {};

    createThread(stackSize: number): Promise<Thread> {
        this.stackArea[this.threadId] = new Promise<Thread>(resolve => {
            resolve(new Thread(this, stackSize, this.threadId));
        })
        this.pcRegisters[this.threadId] = 0;
        this.threadId++;
        return this.stackArea[this.threadId - 1];
    }

    getThreadPromise(threadId: number): Promise<Thread> {
        return this.stackArea[threadId];
    }

    setPCRegister(threadId: number, value: number) {
        this.pcRegisters[threadId] = value;
    }

    incrementPCRegister(threadId: number) {
        this.pcRegisters[threadId]++;
    }

    getPCRegister(threadId: number): number {
        return this.pcRegisters[threadId];
    }

}