package io.github.wycst.wast.flow.definition;

import io.github.wycst.wast.flow.runtime.NodeInstance;

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
}
