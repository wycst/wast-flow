package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Status;

import java.sql.Timestamp;

/**
 * 结束节点（单进）
 *
 * @Author wangyunchao
 * @Date 2021/12/6 14:48
 */
public class EndNode extends RuntimeNode {

    public EndNode(String id, String name, RuleProcess process) {
        super(id, name, process);
    }

    @Override
    public boolean isEnd() {
        return true;
    }

    @Override
    protected void runOut(ProcessInstance processInstance, NodeInstance nodeInstance) {
        processInstance.setStatus(Status.Completed);
        processInstance.setCompletedDate(new Timestamp(System.currentTimeMillis()));

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



