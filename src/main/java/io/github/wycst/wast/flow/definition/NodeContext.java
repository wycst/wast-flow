package io.github.wycst.wast.flow.definition;

import io.github.wycst.wast.flow.runtime.NodeInstance;
import io.github.wycst.wast.flow.runtime.ProcessInstance;
import io.github.wycst.wast.flow.runtime.RuleProcess;

import java.util.List;

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
     * 是否重试
     *
     * @return
     */
    public boolean isRetryMode();

    /**
     * 重试次数
     *
     * @return
     */
    public int getRetryCount();


    /**
     * 当前第几次重试
     *
     * @return
     */
    public int getIndexOfRetry();

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

    /**
     * 获取运行时与指定类型最近的节点实例信息
     *
     * @param type
     * @return
     */
    public List<NodeInstance> getFrontNearestNodeInstances(Node.Type type);
}
