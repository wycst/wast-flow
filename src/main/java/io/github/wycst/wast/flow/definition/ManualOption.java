package io.github.wycst.wast.flow.definition;

/**
 * 人工节点配置项
 *
 * @Author wangyunchao
 * @Date 2023/1/11 16:26
 */
public class ManualOption {

    // 参与者支持使用占位符，例如: ${actualOwner} or ${accepts}
    private String actualOwner = "${actualOwner}";

    // 泳道(目标节点id)（如果配置了泳道，当actualOwner解析为空时将启用泳道节点的历史受理人）
    private String swimlane;

    // 人工节点是否自动完成
    private boolean autoComplete;

    public String getActualOwner() {
        return actualOwner;
    }

    public void setActualOwner(String actualOwner) {
        this.actualOwner = actualOwner;
    }

    public String getSwimlane() {
        return swimlane;
    }

    public void setSwimlane(String swimlane) {
        this.swimlane = swimlane;
    }

    public boolean isAutoComplete() {
        return autoComplete;
    }

    public void setAutoComplete(boolean autoComplete) {
        this.autoComplete = autoComplete;
    }
}
