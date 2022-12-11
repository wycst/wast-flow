package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Node;
import io.github.wycst.wast.flow.definition.NodeContext;

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
}
