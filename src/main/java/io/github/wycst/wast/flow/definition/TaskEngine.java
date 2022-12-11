package io.github.wycst.wast.flow.definition;

import io.github.wycst.wast.flow.runtime.Task;

import java.util.Map;

/**
 * @Author wangyunchao
 * @Date 2022/11/30 20:31
 */
public interface TaskEngine {

    /**
     * 完成任务
     *
     * @param taskId
     * @param actorId
     * @param context
     */
    public void complete(String taskId, String actorId, Map<String, Object> context);


    /**
     * 获取待办
     *
     * @param taskId
     * @return
     */
    public Task getTask(String taskId);

    /**
     * 启动任务
     *
     * @param taskId
     * @param actorId
     */
    public void startTask(String taskId, String actorId);

    /**
     * 暂停任务
     *
     * @param taskId
     * @param actorId
     * @param note    阶段回复
     */
    public void suspendTask(String taskId, String actorId, String note);

    /**
     * 恢复暂停的任务
     *
     * @param taskId
     * @param actorId
     * @param note
     */
    public void resumeTask(String taskId, String actorId, String note);

    /**
     * 组待办场景下认领任务
     *
     * @param taskId
     * @param actorId
     */
    public void claimTask(String taskId, String actorId);

    /**
     * 组待办场景下已认领任务放弃
     *
     * @param taskId
     * @param actorId
     */
    public void giveupTask(String taskId, String actorId);

    /**
     * 跳过任务（不执行当前任务，并将任务下发到下个环节）
     *
     * @param taskId
     * @param actorId
     */
    public void skipTask(String taskId, String actorId);

}
