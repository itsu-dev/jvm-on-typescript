import {Attribute} from "./AttributeInfo.js";

export type FieldInfo = {
    accessFlags: number,
    nameIndex: number,
    descriptorIndex: number,
    attributesCount: number,
    attributes: Attribute[]
}