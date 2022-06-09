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
import { Throwable } from "./Throwable.js";
var Error = /** @class */ (function (_super) {
    __extends(Error, _super);
    function Error(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    Error.prototype.toString = function () {
        return "java.lang.Error: " + this.message;
    };
    return Error;
}(Throwable));
export { Error };
//# sourceMappingURL=Error.js.map