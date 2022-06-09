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
import JNodeList from "./JNodeList.js";
import JNode from "../nodes/JNode.js";
var JNodeListOf = /** @class */ (function (_super) {
    __extends(JNodeListOf, _super);
    function JNodeListOf(ref) {
        var _this = _super.call(this) || this;
        _this.ref = ref;
        return _this;
    }
    JNodeListOf._valueOf = function (ref) {
        return new JNodeListOf(ref);
    };
    JNodeListOf.prototype.forEach = function (callbackFunc, args) {
        this.ref.forEach((function (value, key, parent) { return callbackFunc(JNode._valueOf(value), key, JNodeListOf._valueOf(parent)); }));
    };
    JNodeListOf.prototype.getLength = function () {
        return this.ref.length;
    };
    JNodeListOf.prototype.getItem = function (index) {
        return JNode._valueOf(this.ref.item(index));
    };
    return JNodeListOf;
}(JNodeList));
export default JNodeListOf;
//# sourceMappingURL=JNodeListOf.js.map