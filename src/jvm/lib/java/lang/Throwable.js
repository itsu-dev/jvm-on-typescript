var Throwable = /** @class */ (function () {
    function Throwable(message) {
        this.message = message ? message : ".js";
    }
    Throwable.prototype.printStackTrace = function () {
        console.error(toString());
    };
    Throwable.prototype.toString = function () {
        return "java.lang.Throwable: " + this.message;
    };
    return Throwable;
}());
export { Throwable };
//# sourceMappingURL=Throwable.js.map