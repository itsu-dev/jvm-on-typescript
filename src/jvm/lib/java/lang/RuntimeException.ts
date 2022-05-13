import {Throwable} from "./Throwable.js";
import Exception from "./Exception.js";

export default class RuntimeException extends Exception {

    constructor();

    constructor(message?: string) {
        super();
        this.message = message;
    }

    toString(): string {
        return `java.lang.RuntimeException: ${this.message}`;
    }

}