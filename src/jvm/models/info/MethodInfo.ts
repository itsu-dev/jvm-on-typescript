import {Attribute} from "./AttributeInfo.js";

export type MethodInfo = {
    accessFlags: number,
    nameIndex: number,
    descriptorIndex: number,
    attributesCount: number,
    attributes: Attribute[]
}
