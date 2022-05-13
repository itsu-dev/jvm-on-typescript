import {Throwable} from "./Throwable.js";


export default class Exception extends Throwable {

    constructor();

    constructor(message?: string) {
        super();
        this.message = message;
    }

    toString(): string {
        return `java.lang.Exception: ${this.message}`;
    }

}