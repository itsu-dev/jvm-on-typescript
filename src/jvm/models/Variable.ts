export interface Variable {
    getValue();
}

export class IntVariable implements Variable {

    value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

}

export class LongVariable implements Variable {

    value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

}

export class FloatVariable implements Variable {

    value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

}

export class DoubleVariable implements Variable {

    value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

}

export class StringVariable implements Variable {

    value: string;

    constructor(value: string) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

}

export class ArrayVariable implements Variable {

    value: Array<any>;

    constructor(value: Array<any>) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

}