import {Throwable} from "./Throwable.js";
import RuntimeException from "./RuntimeException.js";

export class IllegalStateException extends RuntimeException {

    constructor();

    constructor(message?: string) {
        super();
        this.message = message;
    }

    toString(): string {
        return `java.lang.IllegalStateException: ${this.message}`;
    }

}