package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.ConnectStatus;
import io.github.wycst.wast.flow.definition.Consts;
import io.github.wycst.wast.flow.definition.EventType;
import io.github.wycst.wast.flow.definition.GatewayType;
import io.github.wycst.wast.flow.exception.FlowRuntimeException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * 分支节点
 * <p> 分支XOR，有且只有一个分支通过(无须配对网关)；
 * <p> 并行AND，所有的连线必须通过；必须配对网关(1对1)；
 * <p> 分支并行OR，满足条件的连线通过；必须配对网关(1对1)；
 *
 * @Author wangyunchao
 * @Date 2021/12/6 16:02
 */
public class SplitNode extends RuntimeNode {

    private final GatewayType gatewayType;

    // 配对join
    private String joinNodeId;

    public SplitNode(String id, String name, RuleProcess process, GatewayType gatewayType) {
        super(id, name == null ? Consts.SplitNodeName : name, process);
        this.gatewayType = gatewayType == null ? GatewayType.XOR : gatewayType;
    }

    @Override
    public final boolean isGateway() {
        return true;
    }

    public GatewayType getGatewayType() {
        return gatewayType;
    }

    void setJoinNodeId(String joinNodeId) {
        this.joinNodeId = joinNodeId;
    }

    @Override
    protected void runOut(ProcessInstance processInstance, NodeInstance nodeInstance) throws Exception {
        switch (gatewayType) {
            case XOR: {
                super.runOut(processInstance, nodeInstance);
                break;
            }
            case OR: {
                runOutOr(processInstance, nodeInstance);
                break;
            }
            case AND: {
                runOutAnd(processInstance, nodeInstance);
                break;
            }
            default: {
                throw new UnsupportedOperationException("unknown gateway for " + gatewayType);
            }
        }
    }

    // 网关or
    private void runOutOr(final ProcessInstance processInstance, final NodeInstance nodeInstance) throws Exception {
        List<RuntimeNode> passNextOuts = new ArrayList<RuntimeNode>();
        for (RuntimeConnect runtimeConnect : outConnects) {
            ConnectInstance connectInstance = new ConnectInstance(runtimeConnect);
            nodeInstance.addConnectInstance(connectInstance);
            boolean result = runtimeConnect.run(processInstance, nodeInstance);
            connectInstance.setConnectStatus(result ? ConnectStatus.Pass : ConnectStatus.Reject);
            connectInstance.setExecuteTime(new Date());
            if (result) {
                passNextOuts.add(runtimeConnect.getTo());
            } else {
                runtimeConnect.handleRejectJoinPath(processInstance);
            }
        }
        final int nextOutsSize = passNextOuts.size();
        if (nextOutsSize == 0) {
            this.handleEvent(EventType.GatewayError, processInstance, nodeInstance);
            throw new FlowRuntimeException(String.format("Gateway Error: SplitNode[id = '%s', name = '%s'] no branch passes through.", id, name));
        } else {
//            final JoinCountContext joinCountContext = new JoinCountContext(nextOutsSize);
//            processInstance.setJoinCountContext(joinNodeId, joinCountContext);
            // 暂时按异步处理
            final boolean asynchronous = nextOutsSize > 1;
            FutureList futureList = new FutureList();
            for (RuntimeNode nextOut : passNextOuts) {
                final RuntimeNode nextNode = nextOut;
                if (asynchronous) {
                    futureList.add(processInstance.getExecuteEngine().submitRunnable(new Callable() {
                        @Override
                        public Object call() throws Exception {
                            try {
                                nextNode.run(processInstance, nodeInstance);
                            } finally {
                                // complete one
//                                joinCountContext.completeOne();
                            }
                            return null;
                        }
                    }));
                } else {
                    nextNode.run(processInstance, nodeInstance);
                }
            }
            if(asynchronous) {
                futureList.await();
            }
        }
    }

    // 网关and
    private void runOutAnd(final ProcessInstance processInstance, final NodeInstance nodeInstance) throws Exception {
        int outConnectCount = outConnects.size();
//        final JoinCountContext joinCountContext = new JoinCountContext(outConnectCount);
//        processInstance.setJoinCountContext(joinNodeId, joinCountContext);
        // 暂时使用异步
        final boolean asynchronous = outConnectCount > 1; // handlerOption.isAsynchronous();
        FutureList futureList = new FutureList();
        for (RuntimeConnect runtimeConnect : outConnects) {
            ConnectInstance connectInstance = new ConnectInstance(runtimeConnect);
            nodeInstance.addConnectInstance(connectInstance);
            // and force true skip run
            boolean result = true; //runtimeConnect.run(processInstance, nodeInstance);
            connectInstance.setConnectStatus(result ? ConnectStatus.Pass : ConnectStatus.Reject);
            connectInstance.setExecuteTime(new Date());

            final RuntimeNode nextNode = runtimeConnect.getTo();
            if (asynchronous) {
                futureList.add(processInstance.getExecuteEngine().submitRunnable(new Callable() {
                    @Override
                    public Object call() throws Exception {
                        try {
                            nextNode.run(processInstance, nodeInstance);
                        } finally {
                            // complete one
//                            joinCountContext.completeOne();
                        }
                        return null;
                    }
                }));
            } else {
                nextNode.run(processInstance, nodeInstance);
            }
        }
        if(asynchronous) {
             futureList.await();
        }
    }

    @Override
    public String toString() {
        return "SplitNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
