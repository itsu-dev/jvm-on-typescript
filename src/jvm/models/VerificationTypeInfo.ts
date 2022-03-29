export type VerificationTypeInfo = {
    topVariableInfo: TopVariableInfo,
    integerVariableInfo: IntegerVariableInfo,
    floatVariableInfo: FloatVariableInfo,
    longVariableInfo: LongVariableInfo,
    doubleVariableInfo: DoubleVariableInfo,
    nullVariableInfo: NullVariableInfo,
    uninitializedThisVariableInfo: UnInitializedThisVariableInfo,
    objectVariableInfo: ObjectVariableInfo,
    uninitializedVariableInfo: UninitializedVariableInfo
}

export type TopVariableInfo = {
    tag: number
}

export type IntegerVariableInfo = {
    tag: number
}

export type FloatVariableInfo = {
    tag: number
}

export type NullVariableInfo = {
    tag: number
}

export type UnInitializedThisVariableInfo = {
    tag: number
}

export type ObjectVariableInfo = {
    tag: number
    cpoolIndex: number
}

export type UninitializedVariableInfo = {
    tag: number
    offset: number
}

export type LongVariableInfo = {
    tag: number
}

export type DoubleVariableInfo = {
    tag: number
}
