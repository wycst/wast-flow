package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Connect;
import io.github.wycst.wast.flow.definition.ConnectContext;
import io.github.wycst.wast.flow.definition.Node;

import java.util.ArrayList;
import java.util.List;

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

    public List<NodeInstance> getFrontNearestNodeInstances(Node.Type type) {
        List<NodeInstance> resultNodeInstances = new ArrayList<NodeInstance>();
        
        NodeInstance targetInstance = nodeInstance;
        while (targetInstance != null) {
            Node node = targetInstance.getNode();
            if(node.getType() == type) {
                resultNodeInstances.add(targetInstance);
                break;
            }
            targetInstance = targetInstance.getPrev();
        }
        // 一般运行时前置节点只有一个，并行场景需要通过下面数据来获取
        // List<Node> nodes = getNode().getFrontNearestNodes(type);
        // List<NodeInstance> nodeInstances = getProcessInstance().getNodeInstances();
        return resultNodeInstances;
    }
}
