export class ByteBuffer {
    view: DataView
    offset: number = 0

    constructor(array: ArrayBuffer) {
        this.view = new DataView(array);
    }

    getInt8() {
        const result = this.view.getInt8(this.offset);
        this.offset += 1;
        return result;
    }

    getUint8() {
        const result = this.view.getUint8(this.offset);
        this.offset += 1;
        return result;
    }

    getUint16() {
        const result = this.view.getUint16(this.offset);
        this.offset += 2;
        return result;
    }

    getUint32() {
        const result = this.view.getUint32(this.offset);
        this.offset += 4;
        return result;
    }

    setUint8(n: number) {
        this.view.setUint8(this.offset, n);
        this.offset += 1;
    }

    setUint16(n: number) {
        this.view.setUint16(this.offset, n);
        this.offset += 2;
    }

    setUint32(n: number) {
        this.view.setUint32(this.offset, n);
        this.offset += 4;
    }

    resetOffset() {
        this.offset = 0;
    }

    getLength() {
        return this.view.byteLength;
    }

}