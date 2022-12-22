package io.github.wycst.wast.flow.definition;

/**
 * 运行状态
 */
public enum Status {

    /**
     * 准备就绪
     */
    Ready,

    /**
     * 运行中
     */
    Running,

    /**
     * 暂停的
     */
    Suspended,

    /**
     * 完成
     */
    Completed,

    /**
     * 跳过
     */
    Skipped,

    /**
     * 终止或者退出
     */
    Stop,

    /**
     * 错误
     */
    Error

}
