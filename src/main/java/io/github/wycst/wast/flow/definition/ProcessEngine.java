package io.github.wycst.wast.flow.definition;

import io.github.wycst.wast.flow.runtime.ProcessInstance;

import java.util.Map;

/**
 * 流程引擎
 */
public interface ProcessEngine {

    /**
     * 启动流程
     *
     * @param processId
     * @return
     */
    public ProcessInstance startProcess(String processId);

    /**
     * 启动流程
     *
     * @param processId
     * @param context
     * @return
     */
    public ProcessInstance startProcess(String processId, Map<String, Object> context);


    /**
     * 终止流程实例
     *
     * @param processInstanceId
     * @param actorId
     * @param note
     */
    public void stopProcess(String processInstanceId, String actorId, String note);
}
