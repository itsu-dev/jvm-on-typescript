import {JavaObject} from "../lang/JavaObject.js";

export class OutputStream extends JavaObject {

    constructor() {
        super();
    }

    close() {

    }

    flush() {

    }

    write(b: ArrayBuffer, off: number = 0, len: number = b.byteLength) {
        console.log(new TextDecoder("utf-8").decode(b.slice(off, len)));
    }

    toString(): string {
        return `java.io.OutputStream`;
    }

}