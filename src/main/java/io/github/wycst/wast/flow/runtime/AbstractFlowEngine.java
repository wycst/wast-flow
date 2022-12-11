package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.defaults.DefaultFlowEntityManager;
import io.github.wycst.wast.flow.defaults.DefaultProcessHook;
import io.github.wycst.wast.flow.definition.FlowEntityManager;
import io.github.wycst.wast.flow.definition.ProcessHook;

import javax.sql.DataSource;

/**
 * @Author wangyunchao
 * @Date 2022/12/1 15:07
 */
class AbstractFlowEngine {

    // 流程生命周期钩子
    private ProcessHook processHook = new DefaultProcessHook();

    public ProcessHook getProcessHook() {
        return processHook;
    }

    // 实体类管理
    protected FlowEntityManager flowEntityManager;

    // 是否持久化实例记录(流程实例和节点实例)
    protected boolean persistenceInstanceLog;

    // 静态资源
    protected String staticResources;

    public void setProcessHook(ProcessHook processHook) {
        if (processHook != null) {
            this.processHook = processHook;
        }
    }

    /**
     * 设置数据源，将使用内置的FlowEntityManager
     *
     * @param dataSource
     */
    public void setDatasource(DataSource dataSource) {
        this.flowEntityManager = new DefaultFlowEntityManager(dataSource);
    }

    /**
     * 使用注入的实体类管理器
     *
     * @param entityManager
     */
    public void setFlowEntityManager(FlowEntityManager entityManager) {
        this.flowEntityManager = entityManager;
    }

    public FlowEntityManager getFlowEntityManager() {
        return flowEntityManager;
    }

    public void setPersistenceInstanceLog(boolean persistenceInstanceLog) {
        this.persistenceInstanceLog = persistenceInstanceLog;
    }

    public void setEnableTransaction(boolean enableTransaction) {
        flowEntityManager.setEnableTransaction(enableTransaction);
    }

    public void setStaticResources(String staticResources) {
        this.staticResources = !staticResources.endsWith("/") ? staticResources + "/" : staticResources;
    }

    protected void endTransaction() {
        if(flowEntityManager != null) {
            flowEntityManager.endTransaction();
        }
    }

    protected void rollbackTransaction() {
        if(flowEntityManager != null) {
            flowEntityManager.rollbackTransaction();
        }
    }

    protected void commitTransaction() {
        if(flowEntityManager != null) {
            flowEntityManager.commitTransaction();
        }
    }

    protected void beginTransaction() {
        if(flowEntityManager != null) {
            flowEntityManager.beginTransaction();
        }
    }

    public void onStarted(ProcessInstance processInstance) {
        processHook.onStarted(processInstance);
    }

    public void onNodeEnter(ProcessInstance processInstance, NodeInstance nodeInstance) {
        processHook.onNodeEnter(processInstance, nodeInstance);
    }

    public void onNodeLeave(ProcessInstance processInstance, NodeInstance nodeInstance) {
        processHook.onNodeLeave(processInstance, nodeInstance);
    }

    public void onCompleted(ProcessInstance processInstance) {
        processHook.onCompleted(processInstance);
    }

}
