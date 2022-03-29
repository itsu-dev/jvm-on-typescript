import {LinkageError} from "./LinkageError.js";

export class NoSuchFieldError extends LinkageError {

    constructor();

    constructor(message?: string) {
        super();
        this.message = message;
    }

    toString(): string {
        return `java.lang.NoSuchFieldError: ${this.message}`;
    }

}