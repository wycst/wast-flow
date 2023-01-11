package io.github.wycst.wast.flow.definition;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 节点
 *
 * @Author wangyunchao
 * @Date 2021/12/6 18:38
 */
public abstract class Node extends Data {

    // 类型
    protected Type type;

    // 输入参数映射
    private Map<String, Object> inMapping = new LinkedHashMap<String, Object>();

    // 输出参数映射
    private Map<String, Object> outMapping = new LinkedHashMap<String, Object>();

    public final Type getType() {
        return type;
    }

    public final void setType(Type type) {
        this.type = type;
    }

    public final Map<String, Object> getInMapping() {
        return inMapping;
    }

    public final void setInMapping(Map<String, Object> inMapping) {
        this.inMapping = inMapping;
    }

    public final Map<String, Object> getOutMapping() {
        return outMapping;
    }

    public final void setOutMapping(Map<String, Object> outMapping) {
        this.outMapping = outMapping;
    }

    public List<Node> frontNodes() {
        return null;
    }

    public List<Node> nextNodes() {
        return null;
    }

    /**
     * 每个类型对应一个节点
     */
    public enum Type {

        /**
         * 开始
         */
        Start,

        /**
         * 完成结束
         */
        End,

        /**
         * 终止结束（未预期的Stop）
         */
        Termination,

        /**
         * 脚本
         */
        Script,

        /**
         * 服务
         */
        Service,

        /**
         * 业务
         */
        Business,

        /**
         * 人工
         */
        Manual,

        /**
         * 消息
         */
        Message,

        /**
         * 分支
         */
        Split,

        /**
         * 聚合
         */
        Join,

        /**
         * 子流程
         */
        SubProcess,

        /**
         * 未知类型
         */
        Unknown
    }
}
