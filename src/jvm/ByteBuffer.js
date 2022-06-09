var ByteBuffer = /** @class */ (function () {
    function ByteBuffer(array) {
        this.offset = 0;
        this.view = new DataView(array);
    }
    ByteBuffer.prototype.getUint8 = function () {
        var result = this.view.getUint8(this.offset);
        this.offset += 1;
        return result;
    };
    ByteBuffer.prototype.getUint16 = function () {
        var result = this.view.getUint16(this.offset);
        this.offset += 2;
        return result;
    };
    ByteBuffer.prototype.getUint32 = function () {
        var result = this.view.getUint32(this.offset);
        this.offset += 4;
        return result;
    };
    ByteBuffer.prototype.getBigUint64 = function () {
        var result = this.view.getBigUint64(this.offset);
        this.offset += 8;
        return result;
    };
    ByteBuffer.prototype.setUint8 = function (n) {
        this.view.setUint8(this.offset, n);
        this.offset += 1;
    };
    ByteBuffer.prototype.setUint16 = function (n) {
        this.view.setUint16(this.offset, n);
        this.offset += 2;
    };
    ByteBuffer.prototype.setUint32 = function (n) {
        this.view.setUint32(this.offset, n);
        this.offset += 4;
    };
    ByteBuffer.prototype.setBigUint64 = function (n) {
        this.view.setBigUint64(this.offset, n);
        this.offset += 8;
    };
    ByteBuffer.prototype.resetOffset = function () {
        this.offset = 0;
    };
    ByteBuffer.prototype.getLength = function () {
        return this.view.byteLength;
    };
    return ByteBuffer;
}());
export { ByteBuffer };
//# sourceMappingURL=ByteBuffer.js.map