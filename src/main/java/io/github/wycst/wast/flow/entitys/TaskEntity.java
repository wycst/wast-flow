package io.github.wycst.wast.flow.entitys;

import io.github.wycst.wast.flow.definition.Status;
import io.github.wycst.wast.jdbc.annotations.Table;

import java.util.Date;

/**
 * 待办表
 * <p> table: wrf_task
 *
 * @Author wangyunchao
 * @Date 2022/12/1 23:23
 */
@Table(name = "wrf_task")
public class TaskEntity implements IEntity {

    // 主键id
    private String id;

    // 流程标识
    private String processId;

    // 流程名称
    private String processName;

    // 节点id
    private String nodeId;

    // 节点名称
    private String nodeName;

    // 流程实例id
    private String processInstanceId;

    // 创建时间
    private Date createTime;

    // 最后一次修改时间
    private Date lastModifyDate;

    // 任务状态
    private Status taskStatus;

    // 任务归属人
    private String actorOwnerId;

    // 完成时间
    private Date completeTime;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProcessId() {
        return processId;
    }

    public void setProcessId(String processId) {
        this.processId = processId;
    }

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public String getProcessInstanceId() {
        return processInstanceId;
    }

    public void setProcessInstanceId(String processInstanceId) {
        this.processInstanceId = processInstanceId;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getLastModifyDate() {
        return lastModifyDate;
    }

    public void setLastModifyDate(Date lastModifyDate) {
        this.lastModifyDate = lastModifyDate;
    }

    public Status getTaskStatus() {
        return taskStatus;
    }

    public void setTaskStatus(Status taskStatus) {
        this.taskStatus = taskStatus;
    }

    public String getActorOwnerId() {
        return actorOwnerId;
    }

    public void setActorOwnerId(String actorOwnerId) {
        this.actorOwnerId = actorOwnerId;
    }

    public Date getCompleteTime() {
        return completeTime;
    }

    public void setCompleteTime(Date completeTime) {
        this.completeTime = completeTime;
    }
}
