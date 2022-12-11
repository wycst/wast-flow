package io.github.wycst.wast.flow.definition;

import io.github.wycst.wast.flow.runtime.NodeInstance;
import io.github.wycst.wast.flow.runtime.ProcessInstance;

/**
 * 流程执行钩子接口
 */
public interface ProcessHook {

    /**
     * 启动时触发
     */
    public void onStarted(ProcessInstance processInstance);

    /**
     * 节点到达
     *
     * @param processInstance
     */
    public void onNodeEnter(ProcessInstance processInstance, NodeInstance nodeInstance);

    /**
     * 节点离开时到达
     *
     * @param processInstance
     */
    public void onNodeLeave(ProcessInstance processInstance, NodeInstance nodeInstance);

    /**
     * 流程被终止时
     *
     * @param processInstance
     * @param nodeInstance
     */
    public void onStoped(ProcessInstance processInstance, NodeInstance nodeInstance);

    /**
     * 完成时触发
     */
    public void onCompleted(ProcessInstance processInstance);

}
