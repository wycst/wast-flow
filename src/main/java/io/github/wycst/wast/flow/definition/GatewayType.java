package io.github.wycst.wast.flow.definition;

/**
 * @Author wangyunchao
 * @Date 2022/11/30 11:17
 */
public enum GatewayType {

    /**
     * 运行所有满足条件的分支
     */
    OR,

    /**
     * 运行第一个满足条件的分支
     * 注：所有的非网关节点默认带有一个XOR特性
     *
     */
    XOR,

    /**
     * 并行无视条件运行所有分支
     */
    AND
}
