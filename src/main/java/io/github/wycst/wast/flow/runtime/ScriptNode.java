package io.github.wycst.wast.flow.runtime;

/**
 * 脚本节点
 *
 * @Author wangyunchao
 * @Date 2021/12/6 14:50
 */
public class ScriptNode extends RuntimeNode {

    public ScriptNode(String id, String name, RuleProcess process) {
        super(id, name, process);
    }

    @Override
    public String toString() {
        return "ScriptNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
