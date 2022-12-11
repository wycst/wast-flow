package io.github.wycst.wast.flow.definition;

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

    // 连线条件类型（默认true）
    protected ConditionType conditionType = ConditionType.Always;

    // 脚本代码,当conditionType == Script时有效
    private String script;

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
