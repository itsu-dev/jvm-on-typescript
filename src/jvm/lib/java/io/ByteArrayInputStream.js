var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import InputStream from "./InputStream.js";
var ByteArrayInputStream = /** @class */ (function (_super) {
    __extends(ByteArrayInputStream, _super);
    function ByteArrayInputStream(buf, offset, length) {
        var _this = _super.call(this) || this;
        if (offset == null)
            offset = 0;
        if (length == null)
            length = buf.length;
        _this.buf = buf;
        _this.count = length;
        _this._mark = 0;
        _this.pos = offset;
        return _this;
    }
    ByteArrayInputStream.prototype.available = function () {
        return this.count - this.pos;
    };
    ByteArrayInputStream.prototype.close = function () {
        this.buf = undefined;
    };
    ByteArrayInputStream.prototype.mark = function (readAheadLimit) {
        this._mark = readAheadLimit;
    };
    ByteArrayInputStream.prototype.markSupported = function () {
        return true;
    };
    ByteArrayInputStream.prototype.read = function (b, off, len) {
        if (this.pos === this.count)
            return -1;
        if (b == null)
            b = [];
        if (off == null)
            off = 0;
        if (len == null)
            len = b.length;
        var k = Math.min(len, this.available());
        if (k >= 0) {
            for (var i = this.pos; i < this.pos + k; i++) {
                b[off + i] = this.buf[this.pos + i];
            }
            this.pos += k;
        }
        return k;
    };
    ByteArrayInputStream.prototype.reset = function () {
        this.pos = this._mark;
    };
    ByteArrayInputStream.prototype.skip = function (n) {
        var k = Math.min(n, this.available());
        this.pos += k;
        return k;
    };
    return ByteArrayInputStream;
}(InputStream));
export default ByteArrayInputStream;
//# sourceMappingURL=ByteArrayInputStream.js.map