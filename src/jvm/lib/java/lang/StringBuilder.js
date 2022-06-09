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
import { JavaObject } from "./JavaObject.js";
var StringBuilder = /** @class */ (function (_super) {
    __extends(StringBuilder, _super);
    function StringBuilder() {
        var _this = _super.call(this) || this;
        _this.value = "";
        return _this;
    }
    StringBuilder.prototype.append = function (a) {
        this.value += String(a);
        return this;
    };
    StringBuilder.prototype.toString = function () {
        return this.value;
    };
    return StringBuilder;
}(JavaObject));
export { StringBuilder };
//# sourceMappingURL=StringBuilder.js.map