package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Status;

import java.util.Date;
import java.util.List;

/**
 * 待办任务
 *
 * @Author wangyunchao
 * @Date 2022/11/29 18:17
 */
public class Task {

    // 待办id（自动生成）
    private String id;

    // 待办关联节点实例
    private NodeInstance nodeInstance;

    // 待办任务参与者
    private List<TaskParticipant> taskParticipants;

    // 待办受理人
    private String actorOwnerId;

    // 待办状态
    private Status taskStatus;

    Task() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public NodeInstance getNodeInstance() {
        return nodeInstance;
    }

    public void setNodeInstance(NodeInstance nodeInstance) {
        this.nodeInstance = nodeInstance;
    }

    public List<TaskParticipant> getTaskParticipants() {
        return taskParticipants;
    }

    public void setTaskParticipants(List<TaskParticipant> taskParticipants) {
        this.taskParticipants = taskParticipants;
    }

    public String getActorOwnerId() {
        return actorOwnerId;
    }

    public void setActorOwnerId(String actorOwnerId) {
        this.actorOwnerId = actorOwnerId;
    }

    public Status getTaskStatus() {
        return taskStatus;
    }

    public void setTaskStatus(Status taskStatus) {
        this.taskStatus = taskStatus;
    }
}
