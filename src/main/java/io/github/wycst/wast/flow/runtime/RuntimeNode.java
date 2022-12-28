package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.*;
import io.github.wycst.wast.flow.exception.FlowRuntimeException;
import io.github.wycst.wast.log.Log;
import io.github.wycst.wast.log.LogFactory;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
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

    private final String nodeToString;

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
    public String getId() {
        return id;
    }

    @Override
    public String getName() {
        return name;
    }

    public RuleProcess getRuleProcess() {
        return ruleProcess;
    }

    public List<RuntimeConnect> getInConnects() {
        return inConnects;
    }

    public List<RuntimeConnect> getOutConnects() {
        return outConnects;
    }

    public boolean isStart() {
        return false;
    }

    public boolean isEnd() {
        return false;
    }

    public boolean isGateway() {
        return false;
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
     * @param processInstance
     */
    final void run(ProcessInstance processInstance, NodeInstance prev) throws Exception {

        // access
        boolean access = beforeRun(processInstance);
        if (!access) {
            return;
        }

        // create instance
        NodeInstance nodeInstance = new NodeInstance(this, prev, processInstance);
        try {
            // in
            runIn(nodeInstance, processInstance);
            long delay = handlerOption.getDelay();
            // sleep
            if (delay > 0) {
                log.debug("{}, about to sleep for {} ms", nodeToString, delay);
                Thread.sleep(delay);
            }
            // 获取handler执行
            NodeHandler nodeHandler = getHandler(processInstance);
            executeHandler(nodeHandler, nodeInstance);

            // processInstance.addNodeInstance();
            nodeInstance.setOutDate(new Timestamp(System.currentTimeMillis()));
            nodeInstance.setStatus(Status.Completed);
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
            return;
        } finally {
            // on Leave
            onNodeLeave(processInstance, nodeInstance);
        }

        //
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
                // stop
                return;
            }
        } finally {
            // save connect
            processInstance.getExecuteEngine().persistenceConnectInstances(nodeInstance);
        }
    }

    protected boolean beforeRun(ProcessInstance processInstance) {
        return true;
    }

    // on Leave if manualNode please override this method
    protected void onNodeLeave(ProcessInstance processInstance, NodeInstance nodeInstance) {
        processInstance.getExecuteEngine().onNodeLeave(processInstance, nodeInstance);
        // persistence
        processInstance.getExecuteEngine().persistenceNodeInstance(nodeInstance);
    }

    protected void executeHandler(final NodeHandler nodeHandler, NodeInstance nodeInstance) throws Exception {
        if (nodeHandler == NodeHandler.UndoHandler) return;
        final NodeRuntimeContext nodeContext = NodeRuntimeContext.of(nodeInstance);
        FlowEngine defaultFlowEngine = nodeInstance.getExecuteEngine();
        boolean asynchronous = handlerOption.isAsynchronous();
        long timeout = handlerOption.getTimeout();
        FailurePolicy policy = handlerOption.getPolicy();
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
                    future.get(timeout, TimeUnit.MILLISECONDS);
                }
            } else {
                callHandler(nodeHandler, nodeContext);
            }
        } catch (Exception exception) {
            if (exception instanceof TimeoutException) {
                log.error("timeout {}", timeout);
            }
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
            if (handlerOption.isRetryOnError() && retryCount > 1) {
                count = Math.min(retryCount, 10);
                log.info("enable retry, retryCount {}", retryCount);
            }
            int actualRetryCount = 0;
            boolean successFlag = false;
            Exception exception = null;
            // 重试处理
            while (count-- > 0 && !successFlag) {
                if (++actualRetryCount > 1) {
                    log.info(String.format("Error: 正在进行第%d次重试", actualRetryCount));
                    long delay = handlerOption.getDelay();
                    if (delay > 0) {
                        log.debug("{}, about to sleep for {} ms", nodeToString, delay);
                        Thread.sleep(delay);
                    }
                }
                exception = null;
                try {
                    nodeHandler.handle(nodeContext);
                    successFlag = true;
                } catch (Exception e) {
                    e.printStackTrace();
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
    private NodeHandler getHandler(ProcessInstance processInstance) {
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
        // 网关类节点需要处理计数问题
        nodeInstance.getExecuteEngine().onNodeEnter(processInstance, nodeInstance);
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
                throw new FlowRuntimeException(String.format("Node[id = '%s', name = '%s'] any branch was not found matched! ", id, name));
            } else {
                nextOut.run(processInstance, nodeInstance);
            }
        }
    }

    @Override
    public String toString() {
        return "RuntimeNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
