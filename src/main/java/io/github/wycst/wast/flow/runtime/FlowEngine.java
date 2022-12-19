package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.utils.ExecutorServiceUtils;
import io.github.wycst.wast.flow.definition.*;
import io.github.wycst.wast.flow.entitys.NodeInstanceEntity;
import io.github.wycst.wast.flow.entitys.ProcessDefinitionEntity;
import io.github.wycst.wast.flow.entitys.ProcessDeployEntity;
import io.github.wycst.wast.flow.entitys.ProcessInstanceEntity;
import io.github.wycst.wast.flow.exception.FlowDeploymentException;
import io.github.wycst.wast.flow.exception.FlowRuntimeException;
import io.github.wycst.wast.log.Log;
import io.github.wycst.wast.log.LogFactory;

import javax.annotation.PreDestroy;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/**
 * 流程引擎（会话，服务）
 *
 * @Author wangyunchao
 * @Date 2022/11/29 22:05
 */
public class FlowEngine extends AbstractFlowEngine implements ProcessEngine, TaskEngine, NodeEngine {

    // 日志
    private static Log log = LogFactory.getLog(FlowEngine.class);

    // 节点执行器
    private final NodeHandler[] nodeHandlers = new NodeHandler[Node.Type.values().length];

    // 线程池
    private ExecutorService executorService = Executors.newCachedThreadPool();

    public FlowEngine() {
    }

    /**
     * 启动流程(无入参)
     *
     * @param processId
     * @return
     */
    public ProcessInstance startProcess(String processId) {
        return startProcess(processId, new HashMap<String, Object>());
    }

    /**
     * 启动流程
     *
     * @param processId
     * @param context
     * @return
     */
    public ProcessInstance startProcess(String processId, Map<String, Object> context) {
        return startProcess(processId, null, context);
    }

    /**
     * 启动流程
     *
     * @param processId
     * @param parent
     * @param context
     * @return
     */
    ProcessInstance startProcess(String processId, ProcessInstance parent, Map<String, Object> context) {
        // get flow
        RuleProcess ruleProcess = FlowHelper.getProcess(processId);
        try {
            beginTransaction();
            // create instance and set context
            ProcessInstance processInstance = ProcessInstance.createInstance(ruleProcess, parent, this);
            processInstance.setContextValues(context);
            // Synchronous blocking execution
            onStarted(processInstance);
            // start
            ruleProcess.getStartNode().start(processInstance);
            persistenceProcessInstance(processInstance);
            commitTransaction();
            return processInstance;
        } catch (Throwable throwable) {
            // 发生了未捕获的异常回滚数据
            rollbackTransaction();
            // 回滚事务
            if (throwable instanceof RuntimeException) {
                throw (RuntimeException) throwable;
            }
            throw new FlowRuntimeException(throwable.getMessage(), throwable);
        } finally {
            endTransaction();
        }
    }

    @Override
    public void complete(String taskId, String actorId, Map<String, Object> context) {

    }

    @Override
    public void stopProcess(String processInstanceId, String actorId, String note) {

    }

    @Override
    public Task getTask(String taskId) {
        return null;
    }

    @Override
    public void startTask(String taskId, String actorId) {

    }

    @Override
    public void suspendTask(String taskId, String actorId, String note) {

    }

    @Override
    public void resumeTask(String taskId, String actorId, String note) {

    }

    @Override
    public void claimTask(String taskId, String actorId) {

    }

    @Override
    public void giveupTask(String taskId, String actorId) {

    }

    @Override
    public void skipTask(String taskId, String actorId) {

    }

    @Override
    public void registerHandler(Node.Type type, NodeHandler nodeHandler) {
        nodeHandlers[type.ordinal()] = nodeHandler;
    }

    @Override
    public NodeHandler getHandler(Node.Type type) {
        return nodeHandlers[type.ordinal()];
    }

    @PreDestroy
    public void destroy() {
        if (flowEntityManager != null) {
            flowEntityManager.close();
        }
        if (executorService != null) {
            ExecutorServiceUtils.shutdownExecutorService(executorService);
        }
        // 后续拓展命名空间，只销毁命名空间下的流程
        FlowHelper.destroy();
    }

    /**
     * 异步执行任务
     *
     * @param callable
     * @return
     */
    Future submitRunnable(Callable callable) {
        return executorService.submit(callable);
    }

    /**
     * 流程定义保存或者更新
     *
     * @param definitionEntity
     */
    public ProcessDefinitionEntity saveOrUpdateDefinition(ProcessDefinitionEntity definitionEntity) {
        if (definitionEntity.getId() != null) {
            flowEntityManager.update(definitionEntity);
        } else {
            flowEntityManager.insert(definitionEntity);
        }
        return definitionEntity;
    }

    /**
     * 根据流程标识删除流程定义信息
     *
     * @param processId
     */
    public void deleteDefinition(String processId) {
        ProcessDefinitionEntity definitionEntity = getProcessDefinition(processId);
        if (definitionEntity != null) {
            flowEntityManager.deleteEntity(ProcessDefinitionEntity.class, definitionEntity.getId());
        }
    }

    /**
     * 根据流程标识查询流程定义实体类
     *
     * @param processId
     * @return
     */
    public ProcessDefinitionEntity getProcessDefinition(String processId) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("processId", processId);
        List<ProcessDefinitionEntity> definitionEntityList = flowEntityManager.queryBy(ProcessDefinitionEntity.class, params);
        return definitionEntityList.size() == 0 ? null : definitionEntityList.get(0);
    }

    /**
     * 根据流程标识获取最新部署的版本实体
     *
     * @param processId
     * @return
     */
    public ProcessDeployEntity getDeploymentProcess(String processId) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("processId", processId);
        List<ProcessDeployEntity> deployEntities = flowEntityManager.queryBy(ProcessDeployEntity.class, params);
        if (deployEntities.size() > 1) {
            Collections.sort(deployEntities);
        }
        return deployEntities.size() == 0 ? null : deployEntities.get(deployEntities.size() - 1);
    }

    /**
     * 根据流程标识(唯一)查询在流程定义表中的流程并发布一个新版本
     *
     * @param processId
     * @return
     */
    public RuleProcess deploymentProcess(String processId) {

        // query entity
        ProcessDefinitionEntity definitionEntity = getProcessDefinition(processId);
        if (definitionEntity == null) {
            throw new FlowDeploymentException("process[processId = '" + processId + "'] is not defined.");
        }

        // String processId = definitionEntity.getProcessId();
        FlowResource flowResource = FlowResource.of(definitionEntity.getResourceKind(), definitionEntity.getResourceContent());

        RuleProcess ruleProcess = FlowHelper.deployment(processId, flowResource);
        ProcessDeployEntity deployEntity = new ProcessDeployEntity();
        deployEntity.setProcessId(processId);
        deployEntity.setProcessName(definitionEntity.getProcessName());
        deployEntity.setResourceKind(definitionEntity.getResourceKind());
        deployEntity.setResourceContent(definitionEntity.getResourceContent());
        deployEntity.setDeployDate(new Date());
        deployEntity.setVersion(ruleProcess.getVersion());
        deployEntity.setCreator(definitionEntity.getCreator());

        // 持久化已发布的流程
        flowEntityManager.insert(deployEntity);
        return ruleProcess;
    }

    /**
     * 根据流程资源直接发布（跳过流程定义表）并持久化到数据库
     *
     * @param flowResource
     * @return
     */
    public RuleProcess deploymentResource(FlowResource flowResource) {
        RuleProcess ruleProcess = FlowHelper.deployment(flowResource);
        ProcessDeployEntity deployEntity = new ProcessDeployEntity();
        deployEntity.setProcessId(ruleProcess.getId());
        deployEntity.setProcessName(ruleProcess.getName());
        deployEntity.setResourceKind(flowResource.getResourceKind());
        deployEntity.setResourceContent(flowResource.getSource());
        deployEntity.setDeployDate(new Date());
        deployEntity.setVersion(ruleProcess.getVersion());
        deployEntity.setCreator(null);

        // 持久化已发布的流程
        flowEntityManager.insert(deployEntity);
        return ruleProcess;
    }

    void persistenceProcessInstance(ProcessInstance processInstance) {
        if (flowEntityManager == null || !persistenceInstanceLog) {
            return;
        }
        ProcessInstanceEntity instanceEntity = new ProcessInstanceEntity();
        instanceEntity.setProcessId(processInstance.getRuleProcess().getId());
        if (processInstance.getParent() != null) {
            instanceEntity.setParentId(processInstance.getParent().getId());
        }
        instanceEntity.setProcessName(processInstance.getRuleProcess().getName());
        instanceEntity.setInstanceStatus(processInstance.getStatus());
        instanceEntity.setProcessVersion(processInstance.getRuleProcess().getVersion());
        instanceEntity.setCreateDate(processInstance.getCreateDate());
        instanceEntity.setCompletedDate(processInstance.getCompletedDate());
        instanceEntity.setInstanceStatus(processInstance.getStatus());
        instanceEntity.setVariables(processInstance.serializeVariables());
        instanceEntity.setLastModifyDate(processInstance.getLastModifyDate());
        flowEntityManager.insert(instanceEntity);
    }

    /**
     * 保存运行实例
     *
     * @param nodeInstance
     */
    void persistenceNodeInstance(NodeInstance nodeInstance) {
        if (flowEntityManager == null || !persistenceInstanceLog) return;

        NodeInstanceEntity instanceEntity = new NodeInstanceEntity();
        instanceEntity.setInstanceStatus(nodeInstance.getStatus());
        instanceEntity.setNodeId(nodeInstance.getNode().getId());
        instanceEntity.setNodeName(nodeInstance.getNode().getName());
        instanceEntity.setNodeInstanceId(nodeInstance.getId());
        instanceEntity.setNodeType(nodeInstance.getNode().getType());

        if (nodeInstance.getPrev() != null) {
            instanceEntity.setPrevNodeInstanceId(nodeInstance.getPrev().getId());
        } else {
            instanceEntity.setPrevNodeInstanceId(-1);
        }

        RuleProcess ruleProcess = nodeInstance.getProcessInstance().getRuleProcess();
        instanceEntity.setProcessId(ruleProcess.getId());
        instanceEntity.setProcessName(ruleProcess.getName());
        instanceEntity.setProcessInstanceId(nodeInstance.getProcessInstance().getId());

        instanceEntity.setInDate(nodeInstance.getInDate());
        instanceEntity.setOutDate(nodeInstance.getOutDate());

        flowEntityManager.insert(instanceEntity);
    }
}
