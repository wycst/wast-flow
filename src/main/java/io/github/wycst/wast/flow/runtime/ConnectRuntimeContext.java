package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Connect;
import io.github.wycst.wast.flow.definition.ConnectContext;
import io.github.wycst.wast.flow.definition.Node;

/**
 * 连线上下文对象
 *
 * @Author wangyunchao
 * @Date 2022/12/23 14:44
 */
class ConnectRuntimeContext implements ConnectContext {

    final RuntimeConnect connect;
    final NodeInstance nodeInstance;
    final ProcessInstance processInstance;

    ConnectRuntimeContext(RuntimeConnect connect, ProcessInstance processInstance, NodeInstance nodeInstance) {
        this.connect = connect;
        this.nodeInstance = nodeInstance;
        this.processInstance = processInstance;
    }

    @Override
    public Connect getConnect() {
        return connect;
    }

    @Override
    public NodeInstance getNodeInstance() {
        return nodeInstance;
    }

    @Override
    public Node getFromNode() {
        return connect.getFrom();
    }

    @Override
    public Node getToNode() {
        return connect.getTo();
    }

    @Override
    public boolean isDebugMode() {
        return processInstance.isDebugMode();
    }

    @Override
    public Object getCustomContext() {
        return processInstance.getCustomContext();
    }
}
