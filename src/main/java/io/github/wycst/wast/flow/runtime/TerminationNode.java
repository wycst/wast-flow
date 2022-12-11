package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Status;

import java.sql.Timestamp;

/**
 * 终止节点(错误或者跳出节点)
 * <p>为避免破坏流程设计原则添加的节点</p>
 * <p>一个流程只有一个结束节点（EndNode），但可以有多个终止节点</p>
 *
 * @Author wangyunchao
 * @Date 2021/12/6 17:52
 */
public class TerminationNode extends RuntimeNode {

    public TerminationNode(String id, String name, RuleProcess process) {
        super(id, name, process);
    }

    @Override
    protected void runOut(ProcessInstance processInstance, NodeInstance nodeInstance) {
        processInstance.setStatus(Status.Stop);
        processInstance.setCompletedDate(new Timestamp(System.currentTimeMillis()));
    }

    @Override
    public String toString() {
        return "TerminationNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
