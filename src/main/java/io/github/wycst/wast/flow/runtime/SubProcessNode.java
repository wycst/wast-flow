package io.github.wycst.wast.flow.runtime;

/**
 * 子流程节点
 *
 * @Author wangyunchao
 * @Date 2021/12/6 18:52
 */
public class SubProcessNode extends RuntimeNode {

    public SubProcessNode(String id, String name, RuleProcess process) {
        super(id, name, process);
    }

    @Override
    public String toString() {
        return "SubProcessNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
