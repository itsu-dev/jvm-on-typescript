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
import RuntimeException from "./RuntimeException.js";
var IllegalStateException = /** @class */ (function (_super) {
    __extends(IllegalStateException, _super);
    function IllegalStateException(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    IllegalStateException.prototype.toString = function () {
        return "java.lang.IllegalStateException: " + this.message;
    };
    return IllegalStateException;
}(RuntimeException));
export { IllegalStateException };
//# sourceMappingURL=IllegalStateException.js.map