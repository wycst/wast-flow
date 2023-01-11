package io.github.wycst.wast.flow.runtime;

/**
 * 任务参与者（组待办认领使用）
 *
 * @Author wangyunchao
 * @Date 2023/1/11 10:21
 */
public class TaskParticipant {

    private String taskId;
    private String participant;

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
