package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.*;
import io.github.wycst.wast.flow.exception.FlowRuntimeException;
import io.github.wycst.wast.log.Log;
import io.github.wycst.wast.log.LogFactory;

import java.sql.Timestamp;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * 运行时节点，统一定义为多进多出
 *
 * @Author wangyunchao
 * @Date 2022/11/29 10:26
 */
public class RuntimeNode extends Node {

    // log
    private static Log log = LogFactory.getLog(RuntimeNode.class);

    protected final String id;
    protected final String name;
    private final RuleProcess ruleProcess;

    private RuntimeConnect onlyOneOut;
    private RuntimeNode onlyOneNext;
    private boolean prepared;

    protected HandlerOption handlerOption = new HandlerOption();

    protected final String nodeToString;

    public RuntimeNode(String id, String name, RuleProcess ruleProcess) {
        this.id = id;
        this.name = name;
        this.ruleProcess = ruleProcess.self();
        this.nodeToString = this.toString();
    }

    // 接入此节点的连线
    protected List<RuntimeConnect> inConnects = new ArrayList<RuntimeConnect>();

    // 从此节点出去的连线
    protected List<RuntimeConnect> outConnects = new ArrayList<RuntimeConnect>();

    @Override
    public final String getId() {
        return id;
    }

    @Override
    public final String getName() {
        return name;
    }

    public final RuleProcess getRuleProcess() {
        return ruleProcess;
    }

    public final List<RuntimeConnect> getInConnects() {
        return inConnects;
    }

    public final List<RuntimeConnect> getOutConnects() {
        return outConnects;
    }

    public boolean isStart() {
        return false;
    }

    public boolean isEnd() {
        return false;
    }

    /**
     * 是否网关
     *
     * @return
     */
    public boolean isGateway() {
        return false;
    }

    /**
     * 是否汇聚
     * @return
     */
    public boolean isJoin() {
        return false;
    }

    /**
     * 获取前置节点列表
     *
     * @return
     */
    public final List<Node> frontNodes() {
        List<Node> nodes = new ArrayList<Node>();
        for (RuntimeConnect connect : inConnects) {
            nodes.add(connect.from);
        }
        return nodes;
    }

    /**
     * 获取后置节点列表
     *
     * @return
     */
    @Override
    public final List<Node> nextNodes() {
        List<Node> nodes = new ArrayList<Node>();
        for (RuntimeConnect connect : outConnects) {
            nodes.add(connect.to);
        }
        return nodes;
    }

    @Override
    public List<Node> getFrontNearestNodes(Node.Type type) {
        if (type == null) {
            return frontNodes();
        }
        return getFrontNearestNodes(type, new HashSet<Node>());
    }

    final List<Node> getFrontNearestNodes(Node.Type type, Set<Node> includeNodes) {
        includeNodes.add(this);
        List<Node> nodes = new ArrayList<Node>();
        for (RuntimeConnect connect : inConnects) {
            RuntimeNode node = connect.from;
            if (node.getType() == type) {
                if (!nodes.contains(node)) {
                    nodes.add(node);
                }
            } else {
                if (includeNodes.add(node)) {
                    List<Node> nearestNodes = node.getFrontNearestNodes(type, includeNodes);
                    for (Node nearestNode : nearestNodes) {
                        if (!nodes.contains(nearestNode)) {
                            nodes.add(nearestNode);
                        }
                    }
                }
            }
        }
        return nodes;
    }

    @Override
    public List<Node> getNextNearestNodes(Node.Type type) {
        if (type == null) {
            return nextNodes();
        }
        return getNextNearestNodes(type, new HashSet<Node>());
    }

    final List<Node> getNextNearestNodes(Node.Type type, Set<Node> includeNodes) {
        includeNodes.add(this);
        List<Node> nodes = new ArrayList<Node>();
        for (RuntimeConnect connect : outConnects) {
            RuntimeNode node = connect.to;
            if (node.getType() == type) {
                if (!nodes.contains(node)) {
                    nodes.add(node);
                }
            } else {
                if (includeNodes.add(node)) {
                    List<Node> nearestNodes = node.getNextNearestNodes(type, includeNodes);
                    for (Node nearestNode : nearestNodes) {
                        if (!nodes.contains(nearestNode)) {
                            nodes.add(nearestNode);
                        }
                    }
                }
            }
        }
        return nodes;
    }


    void setHandlerOption(HandlerOption handlerOption) {
        this.handlerOption = handlerOption;
    }

    /**
     * 当发生异常时回滚
     *
     * @return
     */
    protected boolean rollbackIfException() {
        return false;
    }

    /**
     * 准备
     */
    void prepare() {
        if (this.prepared) return;
        int outCount = outConnects.size();
        if (outCount == 1) {
            onlyOneOut = outConnects.get(0);
            onlyOneNext = onlyOneOut.getTo();
            onlyOneNext.prepare();
        } else {
            // 优先级
            Collections.sort(outConnects);
            for (RuntimeConnect runtimeConnect : outConnects) {
                runtimeConnect.prepare();
            }
        }
        prepared = true;
    }

    /**
     * run node
     *
     * @param processInstance
     */
    final void run(ProcessInstance processInstance, NodeInstance prev) throws Exception {
        // access
        boolean access = beforeRun(processInstance);
        if (!access) {
            // exit
            checkExitStack(processInstance);
            return;
        }
        // create instance && run in
        NodeInstance nodeInstance = new NodeInstance(this, prev, processInstance);
        processInstance.addNodeInstance(nodeInstance);

        runIn(nodeInstance, processInstance);
        if (isAutoCompleted()) {
            // handle complete
            complete(nodeInstance, processInstance);
        } else {
            // exit
            checkExitStack(processInstance);
        }
    }

    protected boolean isAutoCompleted() {
        return true;
    }

    protected boolean beforeRun(ProcessInstance processInstance) {
        return true;
    }

    /**
     * 完成
     *
     * @param nodeInstance
     * @param processInstance
     */
    protected void complete(NodeInstance nodeInstance, ProcessInstance processInstance) throws Exception {
        try {
            if (handlerOption.isSkip()) {
                // handler skip
                nodeInstance.setHandlerStatus(HandlerStatus.Skip);
            } else {
                long delay = handlerOption.getDelay();
                // sleep
                if (delay > 0) {
                    log.debug("{}, about to sleep for {} s", nodeToString, delay);
                    Thread.sleep(delay * 1000);
                }
                // get handler to execute
                NodeHandler nodeHandler = getHandler(processInstance);
                executeHandler(nodeHandler, nodeInstance);
            }

            // processInstance.addNodeInstance();
            nodeInstance.setOutDate(new Timestamp(System.currentTimeMillis()));
            nodeInstance.setStatus(Status.Completed);

            // fire on Leave if success
            onNodeLeave(processInstance, nodeInstance);

        } catch (Exception exception) {
            // node instance Error
            nodeInstance.setStatus(Status.Error);
            // process instance Error
            processInstance.setStatus(Status.Error);
            // log time
            processInstance.setLastModifyDate(new Timestamp(System.currentTimeMillis()));
            if (rollbackIfException()) {
                // continue throw up
                throw exception;
            }
            // print exception
            exception.printStackTrace();
            // Exit current stack
            checkExitStack(processInstance);
            return;
        } finally {
            // complete
            afterComplete(processInstance, nodeInstance);
        }

        // out
        try {
            // chain call
            runOut(processInstance, nodeInstance);
        } catch (Exception exception) {
            // process instance Error
            processInstance.setStatus(Status.Error);
            // log time
            processInstance.setLastModifyDate(new Timestamp(System.currentTimeMillis()));
            if (rollbackIfException()) {
                // continue throw up
                throw exception;
            } else {
                exception.printStackTrace();
                return;
            }
        } finally {
            // save connect
            processInstance.getExecuteEngine().persistenceConnectInstances(nodeInstance);
        }
    }

    /**
     * 通常情况下在节点完成时保存节点实例对象
     *
     * @param processInstance
     * @param nodeInstance
     */
    protected void afterComplete(ProcessInstance processInstance, NodeInstance nodeInstance) {
        // persistence
        processInstance.getExecuteEngine().persistenceNodeInstance(nodeInstance);
    }

    protected final void onNodeEnter(ProcessInstance processInstance, NodeInstance nodeInstance) {
        processInstance.getExecuteEngine().onNodeEnter(processInstance, nodeInstance);
    }

    // on Leave if manualNode please override this method
    protected final void onNodeLeave(ProcessInstance processInstance, NodeInstance nodeInstance) {
        processInstance.getExecuteEngine().onNodeLeave(processInstance, nodeInstance);
    }

    protected void executeHandler(final NodeHandler nodeHandler, NodeInstance nodeInstance) throws Exception {
        if (nodeHandler == NodeHandler.UndoHandler) return;
        final NodeRuntimeContext nodeContext = NodeRuntimeContext.of(nodeInstance);
        FlowEngine defaultFlowEngine = nodeInstance.getExecuteEngine();
        boolean asynchronous = handlerOption.isAsynchronous();
        long timeout = handlerOption.getTimeout();
        FailurePolicy policy = handlerOption.getPolicy();

        // init success
        nodeInstance.setHandlerStatus(HandlerStatus.Success);
        try {
            if (asynchronous || timeout > 0) {
                Future future = defaultFlowEngine.submitRunnable(new Callable() {
                    @Override
                    public Object call() throws Exception {
                        callHandler(nodeHandler, nodeContext);
                        return null;
                    }
                });
                if (!asynchronous) {
                    future.get(timeout * 1000, TimeUnit.MILLISECONDS);
                }
            } else {
                callHandler(nodeHandler, nodeContext);
            }
        } catch (Exception exception) {
            if (exception instanceof TimeoutException) {
                log.error("timeout {}(s)", timeout);
            }
            nodeInstance.setHandlerStatus(HandlerStatus.Failure);
            if (policy == FailurePolicy.Stop) {
                throw exception;
            } else {
                exception.printStackTrace();
                log.error(exception.getMessage(), exception);
            }
        }
    }

    protected void callHandler(NodeHandler nodeHandler, NodeRuntimeContext nodeContext) throws Exception {
        int iterate = handlerOption.getIterate();
        if (iterate <= 1) {
            int count = 1;
            int retryCount = handlerOption.getRetryCount();
            if (handlerOption.isRetryOnError() && retryCount > 0) {
                // 默认执行1次，实际最多执行次数为1 + retryCount
                count = Math.min(retryCount + 1, 10);
                log.info("enable retry, retryCount {}", retryCount);
                nodeContext.setRetryMode(true);
                nodeContext.setRetryCount(retryCount);
            }
            int actualCount = 0;
            boolean successFlag = false;
            Exception exception = null;
            // 重试处理
            while (count-- > 0 && !successFlag) {
                // log Retry index
                nodeContext.setIndexOfRetry(actualCount);
                if (++actualCount > 1) {
                    log.info(String.format("Error: 正在进行第%d次重试", actualCount - 1));
                    long delay = handlerOption.getDelay();
                    if (delay > 0) {
                        log.debug("{}, about to sleep for {} s", nodeToString, delay);
                        Thread.sleep(delay * 1000);
                    }
                }
                exception = null;
                try {
                    nodeHandler.handle(nodeContext);
                    successFlag = true;
                } catch (Exception e) {
                    exception = e;
                }
            }
            if (exception != null) {
                throw exception;
            }
        } else {
            log.debug("{}, begin loop, count {}", nodeToString, iterate);
            nodeContext.setLoop(true);
            nodeContext.setLoopCount(iterate);
            for (int i = 0; i < iterate; ++i) {
                log.debug("{}, loop at index {}", nodeToString, i);
                nodeContext.setLoopIndex(i);
                nodeHandler.handle(nodeContext);
            }
        }
    }

    // getHandler
    NodeHandler getHandler(ProcessInstance processInstance) {
        NodeHandler nodeHandler = processInstance.getExecuteEngine().getHandler(type);
        if (nodeHandler != null) {
            return nodeHandler;
        }
        return NodeHandler.UndoHandler;
    }

    /**
     * 执行入口
     *
     * @param processInstance
     */
    protected void runIn(NodeInstance nodeInstance, ProcessInstance processInstance) {
        onNodeEnter(processInstance, nodeInstance);
    }

    /**
     * 执行出口
     *
     * @param processInstance
     */
    protected void runOut(ProcessInstance processInstance, NodeInstance nodeInstance) throws Exception {

        // 是否对非网关类的节点进行排除？
        if (onlyOneNext != null) {
            ConnectInstance connectInstance = new ConnectInstance(onlyOneOut);
            nodeInstance.addConnectInstance(connectInstance);
            boolean result = onlyOneOut.passedIfOnlyOne() || onlyOneOut.run(processInstance, nodeInstance);
            connectInstance.setConnectStatus(result ? ConnectStatus.Pass : ConnectStatus.Reject);
            connectInstance.setExecuteTime(new Date());
            if (result) {
                onlyOneNext.run(processInstance, nodeInstance);
            } else {
                processInstance.setStatus(Status.Stop);
            }
        } else {
            // 如果存在多出口,以xor逻辑处理
            // gateway节点会override此方法
            RuntimeNode nextOut = null;
            for (RuntimeConnect runtimeConnect : outConnects) {
                ConnectInstance connectInstance = new ConnectInstance(runtimeConnect);
                nodeInstance.addConnectInstance(connectInstance);
                boolean result = runtimeConnect.run(processInstance, nodeInstance);
                connectInstance.setConnectStatus(result ? ConnectStatus.Pass : ConnectStatus.Reject);
                connectInstance.setExecuteTime(new Date());
                if (result) {
                    nextOut = runtimeConnect.getTo();
                    break;
                }
            }
            if (nextOut == null) {
                this.handleEvent(EventType.GatewayError, processInstance, nodeInstance);
                throw new FlowRuntimeException(String.format("Node[id = '%s', name = '%s'] any branch was not found matched! ", id, name));
            } else {
                nextOut.run(processInstance, nodeInstance);
            }
        }
    }

    void handleEvent(EventType eventType, ProcessInstance processInstance, NodeInstance nodeInstance) throws Exception {
        EventRuntimeContext eventRuntimeContext = new EventRuntimeContext(eventType, nodeInstance);
        processInstance.getExecuteEngine().eventHandler().handle(eventRuntimeContext);
    }

    /**
     * 检查流程当前调用栈是否结束，处理异步线程下数据持久化问题
     *
     * @param processInstance
     */
    void checkExitStack(ProcessInstance processInstance) {
//        if (processInstance.isAsyncMode()) {
//            int count = processInstance.decrementStackCount();
//            if (count == 0) {
//                // unlock
//                processInstance.unlock();
//            }
//        }
    }

    @Override
    public String toString() {
        return "RuntimeNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
