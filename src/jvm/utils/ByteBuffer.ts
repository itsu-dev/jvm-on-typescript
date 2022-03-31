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

    getInt16() {
        const result = this.view.getInt8(this.offset);
        this.offset += 2;
        return result;
    }

    getInt32() {
        const result = this.view.getInt8(this.offset);
        this.offset += 4;
        return result;
    }

    getFloat32() {
        const result = this.view.getFloat32(this.offset);
        this.offset += 4;
        return result;
    }

    getFloat64() {
        const result = this.view.getFloat64(this.offset);
        this.offset += 8;
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

    getBigInt64() {
        const result = this.view.getBigInt64(this.offset);
        this.offset += 8;
        return result;
    }

    setInt8(n: number) {
        this.view.setInt8(this.offset, n);
        this.offset += 1;
    }

    setInt16(n: number) {
        this.view.setInt32(this.offset, n);
        this.offset += 2;
    }

    setInt32(n: number) {
        this.view.setInt32(this.offset, n);
        this.offset += 4;
    }

    setFloat32(n: number) {
        this.view.setFloat32(this.offset, n);
        this.offset += 4;
    }

    setFloat64(n: number) {
        this.view.setFloat64(this.offset, n);
        this.offset += 8;
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