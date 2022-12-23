package io.github.wycst.wast.flow.definition;

public enum ConditionType {

    /**
     * 永远，pass，true
     */
    Always,

    /**
     * 永不，reject， false
     */
    Never,

    /**
     * 脚本表达式判断 condition?
     */
    Script,

    /**
     * 拓展实现
     */
    HandlerCall
}
