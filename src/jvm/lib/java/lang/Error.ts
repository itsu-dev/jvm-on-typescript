import {Throwable} from "./Throwable.js";

export class Error extends Throwable {

    constructor();

    constructor(message?: string) {
        super();
        this.message = message;
    }

    toString(): string {
        return `java.lang.Error: ${this.message}`;
    }

}