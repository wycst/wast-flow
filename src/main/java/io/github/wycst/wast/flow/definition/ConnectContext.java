package io.github.wycst.wast.flow.definition;

import io.github.wycst.wast.flow.runtime.NodeInstance;

import java.util.List;

public interface ConnectContext {

    /**
     * 获取连线对象
     *
     * @return
     */
    public Connect getConnect();

    /**
     * 获取来源节点实例
     *
     * @return
     */
    public NodeInstance getNodeInstance();

    /**
     * 获取连线来源节点
     *
     * @return
     */
    public Node getFromNode();

    /**
     * 获取连线指向
     *
     * @return
     */
    public Node getToNode();

    /**
     * 是否调试模式（忽略不持久数据）
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
