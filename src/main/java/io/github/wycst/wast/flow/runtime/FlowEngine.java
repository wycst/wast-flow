package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.utils.ExecutorServiceUtils;
import io.github.wycst.wast.common.utils.StringUtils;
import io.github.wycst.wast.flow.definition.*;
import io.github.wycst.wast.flow.entitys.NodeInstanceEntity;
import io.github.wycst.wast.flow.entitys.ProcessDefinitionEntity;
import io.github.wycst.wast.flow.entitys.ProcessDeployEntity;
import io.github.wycst.wast.flow.entitys.ProcessInstanceEntity;
import io.github.wycst.wast.flow.exception.FlowRuntimeException;
import io.github.wycst.wast.log.Log;
import io.github.wycst.wast.log.LogFactory;

import javax.annotation.PreDestroy;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.JarURLConnection;
import java.net.URL;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

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
        beginTransaction();
        try {
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
     * （定义）流程部署发布，并持久化
     *
     * @param definedId
     * @return
     */
    public RuleProcess deploymentProcess(String definedId) {
        ProcessDefinitionEntity definitionEntity = flowEntityManager.getEntity(ProcessDefinitionEntity.class, definedId);
        definitionEntity.getClass();

        String processId = definitionEntity.getProcessId();
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

    /**
     * 1、加载部署已发布的流程（db）
     * 2、加载存储在磁盘目录的流程，已后缀名区分Kind（file dir）
     * 3、加载资源目录(resources)
     */
    public void loadDeployedProcess() {
        loadFromDatabase();
        loadFromFileDir();
        loadStaticResources();
    }

    // static
    private void loadStaticResources() {
        try {
            // 约定:注意路径首字母不能是/,否则为空
            Enumeration<URL> urls = this.getClass().getClassLoader().getResources(staticResources);
            while (urls.hasMoreElements()) {
                URL url = urls.nextElement();
                String protocol = url.getProtocol();
                if ("jar".equalsIgnoreCase(protocol)) {
                    JarFile jar = ((JarURLConnection) url.openConnection()).getJarFile();
                    Enumeration<JarEntry> entries = jar.entries();
                    while (entries.hasMoreElements()) {
                        JarEntry jarEntry = entries.nextElement();
                        String jarEntryName = jarEntry.getName();
                        // 排除文件夹或class
                        if (!jarEntry.isDirectory()) {
                            if (jarEntryName.toLowerCase().endsWith(".json")) {
                                try {
                                    String json = StringUtils.fromResource(jarEntryName);
                                    FlowHelper.deployment(FlowResource.ofJson(json));
                                } catch (Throwable throwable) {
                                    log.error(throwable.getMessage(), throwable);
                                }
                            }
                        }
                    }
                } else if ("file".equalsIgnoreCase(protocol)) {
                    String filePath = url.getFile();
                    File file = new File(filePath);
                    if (file.isDirectory()) {
                        File[] files = file.listFiles();
                        for (File f : files) {
                            String path = f.getPath();
                            if (path.toLowerCase().endsWith(".json")) {
                                try {
                                    String json = StringUtils.fromStream(new FileInputStream(f));
                                    FlowHelper.deployment(FlowResource.ofJson(json));
                                } catch (Throwable throwable) {
                                    log.error(throwable.getMessage(), throwable);
                                }
                            }
                        }
                    }
                }
            }

        } catch (IOException e) {
        }

    }

    private void loadFromFileDir() {
    }

    private void loadFromDatabase() {
        if (flowEntityManager == null) {
            log.info("- skip db loading because the flowEntityManager is not initialized.");
            return;
        }
        List<ProcessDeployEntity> deployEntities = flowEntityManager.queryBy(ProcessDeployEntity.class, null);
        for (ProcessDeployEntity deployEntity : deployEntities) {
            FlowResource flowResource = FlowResource.of(deployEntity.getResourceKind(), deployEntity.getResourceContent());
            FlowHelper.loadDeployedProcess(deployEntity.getProcessId(), deployEntity.getVersion(), flowResource);
        }
    }
}
