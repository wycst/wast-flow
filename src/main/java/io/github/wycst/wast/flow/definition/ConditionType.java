package io.github.wycst.wast.flow.definition;

public enum ConditionType {

    /**
     * 永远，通过，true
     */
    Always,

    /**
     * 永不，pass， false
     */
    Never,

    /**
     * 脚本判断 condition?
     */
    Script
}
