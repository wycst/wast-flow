package io.github.wycst.wast.flow.entitys;

import io.github.wycst.wast.flow.definition.HandlerStatus;
import io.github.wycst.wast.flow.definition.Node;
import io.github.wycst.wast.flow.definition.Status;
import io.github.wycst.wast.jdbc.annotations.Id;
import io.github.wycst.wast.jdbc.annotations.Table;

import java.util.Date;

/**
 * 节点实例
 *
 * <p> table: wrf_node_instance
 *
 * @Author wangyunchao
 * @Date 2022/11/29 13:17
 */
@Table(name = "wrf_node_instance")
public class NodeInstanceEntity implements IEntity, Comparable<NodeInstanceEntity> {

    // 主键id
    @Id(strategy = Id.GenerationType.AutoAlg)
    private String id;

    // 运行时生成的实例id
    private long nodeInstanceId;

    // 节点id
    private String nodeId;

    // 节点运行态id，默认和nodeId一致，当发生并行时按:序号后缀区分
    private String nodeUniqueId;

    // 节点名称
    private String nodeName;

    // 节点类型
    private Node.Type nodeType;

    // 上一个节点实例id
    private long prevNodeInstanceId;

    // 流程id
    private String processId;

    // 流程实例id
    private String processInstanceId;

    // 流程名称
    private String processName;

    // 进栈时间
    private Date inDate;

    // 出栈时间
    private Date outDate;

    // 当前状态
    private Status instanceStatus;

    // handler状态
    private HandlerStatus handlerStatus;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getNodeUniqueId() {
        return nodeUniqueId;
    }

    public void setNodeUniqueId(String nodeUniqueId) {
        this.nodeUniqueId = nodeUniqueId;
    }

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public Node.Type getNodeType() {
        return nodeType;
    }

    public void setNodeType(Node.Type nodeType) {
        this.nodeType = nodeType;
    }

    public String getProcessId() {
        return processId;
    }

    public void setProcessId(String processId) {
        this.processId = processId;
    }

    public String getProcessInstanceId() {
        return processInstanceId;
    }

    public void setProcessInstanceId(String processInstanceId) {
        this.processInstanceId = processInstanceId;
    }

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public Date getInDate() {
        return inDate;
    }

    public void setInDate(Date inDate) {
        this.inDate = inDate;
    }

    public Date getOutDate() {
        return outDate;
    }

    public void setOutDate(Date outDate) {
        this.outDate = outDate;
    }

    public long getNodeInstanceId() {
        return nodeInstanceId;
    }

    public void setNodeInstanceId(long nodeInstanceId) {
        this.nodeInstanceId = nodeInstanceId;
    }

    public Status getInstanceStatus() {
        return instanceStatus;
    }

    public void setInstanceStatus(Status instanceStatus) {
        this.instanceStatus = instanceStatus;
    }

    public long getPrevNodeInstanceId() {
        return prevNodeInstanceId;
    }

    public void setPrevNodeInstanceId(long prevNodeInstanceId) {
        this.prevNodeInstanceId = prevNodeInstanceId;
    }

    public HandlerStatus getHandlerStatus() {
        return handlerStatus;
    }

    public void setHandlerStatus(HandlerStatus handlerStatus) {
        this.handlerStatus = handlerStatus;
    }

    @Override
    public int compareTo(NodeInstanceEntity o) {
        return id.compareTo(o.id);
    }
}
