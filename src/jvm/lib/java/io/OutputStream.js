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
import { JavaObject } from "../lang/JavaObject.js";
var OutputStream = /** @class */ (function (_super) {
    __extends(OutputStream, _super);
    function OutputStream() {
        return _super.call(this) || this;
    }
    OutputStream.prototype.close = function () {
    };
    OutputStream.prototype.flush = function () {
    };
    OutputStream.prototype.write = function (b, off, len) {
        if (off === void 0) { off = 0; }
        if (len === void 0) { len = b.byteLength; }
        console.log(new TextDecoder("utf-8").decode(b.slice(off, len)));
    };
    OutputStream.prototype.toString = function () {
        return "java.io.OutputStream";
    };
    return OutputStream;
}(JavaObject));
export { OutputStream };
//# sourceMappingURL=OutputStream.js.map