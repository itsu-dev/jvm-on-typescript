export var CONSTANT_CLASS = 7;
export var CONSTANT_FIELD_REF = 9;
export var CONSTANT_METHOD_REF = 10;
export var CONSTANT_INTERFACE_METHOD_REF = 11;
export var CONSTANT_STRING = 8;
export var CONSTANT_INTEGER = 3;
export var CONSTANT_FLOAT = 4;
export var CONSTANT_LONG = 5;
export var CONSTANT_DOUBLE = 6;
export var CONSTANT_NAME_AND_TYPE = 12;
export var CONSTANT_UTF8 = 1;
export var CONSTANT_METHOD_HANDLE = 15;
export var CONSTANT_METHOD_TYPE = 16;
export var CONSTANT_INVOKE_DYNAMIC = 18;
export var isConstantFieldRefInfo = function (arg) {
    return typeof arg === "object" &&
        arg !== null &&
        typeof arg.tag === "number" &&
        typeof arg.classIndex === "number" &&
        typeof arg.nameAndTypeIndex === "number";
};
//# sourceMappingURL=ConstantPoolInfo.js.map