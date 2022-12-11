package io.github.wycst.wast.flow.runtime;

/**
 * 自定义业务节点
 *
 * @Author wangyunchao
 * @Date 2021/12/6 14:51
 */
public class BusinessNode extends RuntimeNode {

    public BusinessNode(String id, String name, RuleProcess process) {
        super(id, name, process);
    }

    @Override
    public String toString() {
        return "BusinessNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
