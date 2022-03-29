export type VerificationTypeInfo = {
    info: TopVariableInfo
        | IntegerVariableInfo
        | FloatVariableInfo
        | LongVariableInfo
        | DoubleVariableInfo
        | NullVariableInfo
        | UnInitializedThisVariableInfo
        | ObjectVariableInfo
        | UninitializedVariableInfo
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
