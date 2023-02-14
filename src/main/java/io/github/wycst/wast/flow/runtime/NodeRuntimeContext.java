package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Node;
import io.github.wycst.wast.flow.definition.NodeContext;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author wangyunchao
 * @Date 2022/12/1 8:11
 */
class NodeRuntimeContext implements NodeContext {

    final NodeInstance nodeInstance;

    private boolean loop;
    private int loopCount;
    private int loopIndex;

    static NodeRuntimeContext of(NodeInstance nodeInstance) {
        return new NodeRuntimeContext(nodeInstance);
    }

    private NodeRuntimeContext(NodeInstance nodeInstance) {
        this.nodeInstance = nodeInstance;
    }

    @Override
    public NodeInstance getNodeInstance() {
        return nodeInstance;
    }

    @Override
    public Node getNode() {
        return nodeInstance.getNode();
    }

    @Override
    public RuleProcess getRuleProcess() {
        return nodeInstance.getProcessInstance().getRuleProcess();
    }

    @Override
    public ProcessInstance getProcessInstance() {
        return nodeInstance.getProcessInstance();
    }

    void setLoopCount(int loopCount) {
        this.loopCount = loopCount;
    }

    void setLoopIndex(int loopIndex) {
        this.loopIndex = loopIndex;
    }

    void setLoop(boolean loop) {
        this.loop = loop;
    }

    @Override
    public boolean isLoop() {
        return loop;
    }

    @Override
    public int loopCount() {
        return loopCount;
    }

    @Override
    public int loopIndex() {
        return loopIndex;
    }

    @Override
    public boolean isDebugMode() {
        return nodeInstance.getProcessInstance().isDebugMode();
    }

    @Override
    public Object getCustomContext() {
        return getProcessInstance().getCustomContext();
    }

    public List<NodeInstance> getFrontNearestNodeInstances(Node.Type type) {
        List<NodeInstance> resultNodeInstances = new ArrayList<NodeInstance>();
        NodeInstance prevInstance = nodeInstance.getPrev();
        while (prevInstance != null) {
            Node node = prevInstance.getNode();
            if(node.getType() == type) {
                resultNodeInstances.add(prevInstance);
                break;
            }
            prevInstance = prevInstance.getPrev();
        }
        // 一般运行时前置节点只有一个，并行场景需要通过下面数据来获取
        // List<Node> nodes = getNode().getFrontNearestNodes(type);
        // List<NodeInstance> nodeInstances = getProcessInstance().getNodeInstances();
        return resultNodeInstances;
    }

}
