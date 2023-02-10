package io.github.wycst.wast.flow.definition;

import io.github.wycst.wast.flow.runtime.NodeInstance;
import io.github.wycst.wast.flow.runtime.ProcessInstance;
import io.github.wycst.wast.flow.runtime.RuleProcess;

/**
 * 节点执行上下文
 *
 * @Author wangyunchao
 * @Date 2022/11/30 20:39
 */
public interface NodeContext {


    /**
     * 获取当前节点实例
     *
     * @return
     */
    public NodeInstance getNodeInstance();

    /**
     * 获取node
     *
     * @return
     */
    public Node getNode();

    /**
     * 获取流程
     *
     * @return
     */
    public RuleProcess getRuleProcess();

    /**
     * 获取流程实例
     *
     * @return
     */
    public ProcessInstance getProcessInstance();

    /**
     * 是否迭代
     *
     * @return
     */
    public boolean isLoop();

    /**
     * 迭代总数
     *
     * @return
     */
    public int loopCount();

    /**
     * 迭代位置
     *
     * @return
     */
    public int loopIndex();

    /**
     * 是否调试模式（忽略不持久）
     *
     * @return
     */
    public boolean isDebugMode();

    /**
     * 获取自定义上下文
     *
     * @return
     */
    public Object getCustomContext();
}
