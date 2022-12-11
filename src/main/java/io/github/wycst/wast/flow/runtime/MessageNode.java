package io.github.wycst.wast.flow.runtime;

/**
 * 消息组件
 *
 * @Author wangyunchao
 * @Date 2022/12/1 18:00
 */
public class MessageNode extends RuntimeNode {

    public MessageNode(String id, String name, RuleProcess process) {
        super(id, name, process);
    }

    @Override
    public String toString() {
        return "MessageNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
