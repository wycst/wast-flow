package io.github.wycst.wast.flow.definition;

import java.util.List;

/**
 * @Author wangyunchao
 * @Date 2022/11/29 10:55
 */
public abstract class Connect extends Data implements Comparable<Connect> {

    // 连线源端ID
    private String fromId;

    // 连线目的端ID
    private String toId;

    // 优先级
    private int priority;

    // 连线条件类型（默认Always）
    protected ConditionType conditionType = ConditionType.Always;

    // 脚本代码,当conditionType == Script时有效
    protected String script;

    public String getFromId() {
        return fromId;
    }

    public void setFromId(String fromId) {
        this.fromId = fromId;
    }

    public String getToId() {
        return toId;
    }

    public void setToId(String toId) {
        this.toId = toId;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public ConditionType getConditionType() {
        return conditionType;
    }

    public void setConditionType(ConditionType conditionType) {
        this.conditionType = conditionType;
    }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }

    public abstract Node from();

    public abstract Node to();

    /**
     * 获取前置最近指定类型的节点
     *
     * @param type
     * @return
     */
    public List<Node> getFrontNearestNodes(Node.Type type) {
        return null;
    }

    /**
     * 获取后置最近的指定类型的节点
     *
     * @param type
     * @return
     */
    public List<Node> getNextNearestNodes(Node.Type type) {
        return null;
    }

    /**
     * priority 越大优先级越高，越靠前
     *
     * @param o
     * @return
     */
    @Override
    public int compareTo(Connect o) {
        return Integer.valueOf(o.priority).compareTo(priority);
    }
}
