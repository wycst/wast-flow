package io.github.wycst.wast.flow.entitys;

import io.github.wycst.wast.common.idgenerate.providers.IdGenerator;
import io.github.wycst.wast.jdbc.annotations.Table;

/**
 * （组）待办任务参与人
 * <p> table: wrf_task_participants
 *
 * @Author wangyunchao
 * @Date 2023/1/12 15:08
 */
@Table(name = "wrf_task_participants")
public class TaskParticipantEntity implements IEntity {

    public TaskParticipantEntity() {
    }

    public TaskParticipantEntity(String taskId, String participant) {
        this.id = IdGenerator.hex();
        this.taskId = taskId;
        this.participant = participant;
    }

    private String id;

    private String taskId;

    private String participant;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getParticipant() {
        return participant;
    }

    public void setParticipant(String participant) {
        this.participant = participant;
    }
}
