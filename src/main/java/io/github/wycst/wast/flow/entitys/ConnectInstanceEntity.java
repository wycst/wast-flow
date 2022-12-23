package io.github.wycst.wast.flow.entitys;

import io.github.wycst.wast.flow.definition.ConditionType;
import io.github.wycst.wast.flow.definition.ConnectStatus;
import io.github.wycst.wast.jdbc.annotations.Id;
import io.github.wycst.wast.jdbc.annotations.Table;

import java.util.Date;

/**
 * 连线日志记录
 *
 * @Author wangyunchao
 * @Date 2022/12/23 9:18
 */
@Table(name = "wrf_connect_instance")
public class ConnectInstanceEntity implements IEntity, Comparable<ConnectInstanceEntity> {

    // 主键id
    @Id(strategy = Id.GenerationType.AutoAlg)
    private String id;

    /**
     * 连线id
     */
    private String connectId;

    /**
     * 流程实例id
     */
    private String processInstanceId;

    /**
     * 连线前置节点实例id
     */
    private long nodeInstanceId;

    /**
     * 连线前置节点id
     */
    private String nodeId;

    /**
     * 条件类型
     */
    protected ConditionType conditionType;

    /**
     * 运行时间
     */
    private Date executeTime;

    /**
     * 当前状态: 通过/拒绝
     */
    private ConnectStatus instanceStatus = ConnectStatus.Pass;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConnectId() {
        return connectId;
    }

    public void setConnectId(String connectId) {
        this.connectId = connectId;
    }

    public String getProcessInstanceId() {
        return processInstanceId;
    }

    public void setProcessInstanceId(String processInstanceId) {
        this.processInstanceId = processInstanceId;
    }

    public long getNodeInstanceId() {
        return nodeInstanceId;
    }

    public void setNodeInstanceId(long nodeInstanceId) {
        this.nodeInstanceId = nodeInstanceId;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public ConnectStatus getInstanceStatus() {
        return instanceStatus;
    }

    public void setInstanceStatus(ConnectStatus instanceStatus) {
        this.instanceStatus = instanceStatus;
    }

    public Date getExecuteTime() {
        return executeTime;
    }

    public void setExecuteTime(Date executeTime) {
        this.executeTime = executeTime;
    }

    public ConditionType getConditionType() {
        return conditionType;
    }

    public void setConditionType(ConditionType conditionType) {
        this.conditionType = conditionType;
    }

    @Override
    public int compareTo(ConnectInstanceEntity o) {
        return id.compareTo(o.id);
    }

}
