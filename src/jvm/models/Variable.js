var IntVariable = /** @class */ (function () {
    function IntVariable(value) {
        this.value = value;
    }
    IntVariable.prototype.setValue = function (value) {
        this.value = value;
    };
    IntVariable.prototype.getValue = function () {
        return this.value;
    };
    IntVariable.prototype.getCategory = function () {
        return 1;
    };
    return IntVariable;
}());
export { IntVariable };
var LongVariable = /** @class */ (function () {
    function LongVariable(value) {
        this.value = value;
    }
    LongVariable.prototype.setValue = function (value) {
        this.value = value;
    };
    LongVariable.prototype.getValue = function () {
        return this.value;
    };
    LongVariable.prototype.getCategory = function () {
        return 2;
    };
    return LongVariable;
}());
export { LongVariable };
var FloatVariable = /** @class */ (function () {
    function FloatVariable(value) {
        this.value = value;
    }
    FloatVariable.prototype.setValue = function (value) {
        this.value = value;
    };
    FloatVariable.prototype.getValue = function () {
        return this.value;
    };
    FloatVariable.prototype.getCategory = function () {
        return 1;
    };
    return FloatVariable;
}());
export { FloatVariable };
var DoubleVariable = /** @class */ (function () {
    function DoubleVariable(value) {
        this.value = value;
    }
    DoubleVariable.prototype.setValue = function (value) {
        this.value = value;
    };
    DoubleVariable.prototype.getValue = function () {
        return this.value;
    };
    DoubleVariable.prototype.getCategory = function () {
        return 2;
    };
    return DoubleVariable;
}());
export { DoubleVariable };
var AnyVariable = /** @class */ (function () {
    function AnyVariable(value) {
        this.value = value;
    }
    AnyVariable.prototype.setValue = function (value) {
        this.value = value;
    };
    AnyVariable.prototype.getValue = function () {
        return this.value;
    };
    AnyVariable.prototype.getCategory = function () {
        return 0;
    };
    return AnyVariable;
}());
export { AnyVariable };
var ArrayVariable = /** @class */ (function () {
    function ArrayVariable(value) {
        this.value = value;
    }
    ArrayVariable.prototype.setValue = function (value) {
        this.value = value;
    };
    ArrayVariable.prototype.getValue = function () {
        return this.value;
    };
    ArrayVariable.prototype.getCategory = function () {
        return 0;
    };
    return ArrayVariable;
}());
export { ArrayVariable };
//# sourceMappingURL=Variable.js.map