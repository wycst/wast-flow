package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Consts;

/**
 * 结束节点（单进）
 *
 * @Author wangyunchao
 * @Date 2021/12/6 14:48
 */
public class EndNode extends RuntimeNode {

    public EndNode(String id, String name, RuleProcess process) {
        super(id, name == null ? Consts.EndNodeName : name, process);
    }

    @Override
    public boolean isEnd() {
        return true;
    }

    @Override
    protected void runOut(ProcessInstance processInstance, NodeInstance nodeInstance) throws Exception {
        processInstance.completedInstance();
        processInstance.getExecuteEngine().onCompleted(processInstance);
    }

    @Override
    public String toString() {
        return "EndNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}



