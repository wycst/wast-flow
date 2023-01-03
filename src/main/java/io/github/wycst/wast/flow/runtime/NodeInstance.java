package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.HandlerStatus;
import io.github.wycst.wast.flow.definition.Status;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 节点实例
 *
 * @Author wangyunchao
 * @Date 2022/11/29 13:17
 */
public class NodeInstance {

    // 节点实例id
    private final long id;

    // 所属节点
    private final RuntimeNode node;

    // 上一个节点
    private final NodeInstance prev;

    // 流程实例
    private final ProcessInstance processInstance;

    // 连线实例列表(通过/拒绝记录)
    private List<ConnectInstance> outConnectInstances = new ArrayList<ConnectInstance>();

    NodeInstance(RuntimeNode node, NodeInstance prev, ProcessInstance processInstance) {
        this.id = processInstance.nextNodeInstanceId();
        this.node = node;
        this.prev = prev;
        this.processInstance = processInstance;
        this.inDate = new Timestamp(System.currentTimeMillis());
        processInstance.addNodeInstance(this);
    }

    // 节点运行态id，默认和nodeId一致，当发生并行时按:序号后缀区分
    private String nodeUniqueId;

    // 进栈时间
    private Date inDate;

    // 出栈时间
    private Date outDate;

    // 当前状态
    private Status status;

    // handler状态
    private HandlerStatus handlerStatus = HandlerStatus.Undo;

    public long getId() {
        return id;
    }

    public RuntimeNode getNode() {
        return node;
    }

    public NodeInstance getPrev() {
        return prev;
    }

    public ProcessInstance getProcessInstance() {
        return processInstance;
    }

    public String getNodeUniqueId() {
        return nodeUniqueId;
    }

    void setNodeUniqueId(String nodeUniqueId) {
        this.nodeUniqueId = nodeUniqueId;
    }

    public Date getInDate() {
        return inDate;
    }

    void setInDate(Date inDate) {
        this.inDate = inDate;
    }

    public Date getOutDate() {
        return outDate;
    }

    void setOutDate(Date outDate) {
        this.outDate = outDate;
    }

    public Status getStatus() {
        return status;
    }

    void setStatus(Status status) {
        this.status = status;
    }

    public Map<String, Object> getMeta() {
        return node.getMeta();
    }

    void addConnectInstance(ConnectInstance connectInstance) {
        outConnectInstances.add(connectInstance);
    }

    List<ConnectInstance> getConnectInstances() {
        return outConnectInstances;
    }

    public HandlerStatus getHandlerStatus() {
        return handlerStatus;
    }

    void setHandlerStatus(HandlerStatus handlerStatus) {
        this.handlerStatus = handlerStatus;
    }

    @Override
    public String toString() {
        return "NodeInstance{" +
                "id=" + id +
                ", node=" + node +
                ", inDate=" + inDate +
                ", outDate=" + outDate +
                ", status=" + status +
                '}';
    }

    public FlowEngine getExecuteEngine() {
        return processInstance.getExecuteEngine();
    }
}
