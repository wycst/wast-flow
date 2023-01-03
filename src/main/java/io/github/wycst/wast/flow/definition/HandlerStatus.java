package io.github.wycst.wast.flow.definition;

/**
 * handler执行状态
 */
public enum HandlerStatus {

    /**
     * 成功
     */
    Success,

    /**
     * 失败
     */
    Failure,

    /**
     * 跳过
     */
    Skip,

    /**
     * 默认handler
     */
    Undo
}
