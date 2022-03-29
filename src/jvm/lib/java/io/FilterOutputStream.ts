import {OutputStream} from "./OutputStream.js";

export class FilterOutputStream extends OutputStream {

    constructor() {
        super();
    }

    toString(): string {
        return `java.io.FilterOutputStream`;
    }

}