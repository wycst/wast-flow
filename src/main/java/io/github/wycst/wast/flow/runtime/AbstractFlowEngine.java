package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.utils.StringUtils;
import io.github.wycst.wast.flow.defaults.DefaultFlowEntityManager;
import io.github.wycst.wast.flow.defaults.DefaultProcessHook;
import io.github.wycst.wast.flow.definition.*;
import io.github.wycst.wast.flow.entitys.ProcessDeployEntity;
import io.github.wycst.wast.log.Log;
import io.github.wycst.wast.log.LogFactory;

import javax.sql.DataSource;
import java.io.File;
import java.io.FileInputStream;
import java.net.JarURLConnection;
import java.net.URL;
import java.util.Enumeration;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

/**
 * @Author wangyunchao
 * @Date 2022/12/1 15:07
 */
class AbstractFlowEngine implements NodeEngine {

    // 日志
    private static Log log = LogFactory.getLog(AbstractFlowEngine.class);

    // 节点执行器
    private final NodeHandler[] nodeHandlers = new NodeHandler[Node.Type.values().length];

    // 流程生命周期钩子
    private ProcessHook processHook = new DefaultProcessHook();

    public ProcessHook getProcessHook() {
        return processHook;
    }

    // 实体类管理
    protected FlowEntityManager flowEntityManager;

    // 连线运行handler
    private ConnectHandler[] connectHandlers = new ConnectHandler[ConditionType.values().length];

    // 是否持久化实例记录(流程实例和节点实例)
    protected boolean persistenceInstanceLog;

    // 静态资源
    protected String staticResources = "";

    // 支持设置自定义的业务上下文（生命周期为流程实例调用结束）
    protected final static ThreadLocal<Object> customContextLocal = new ThreadLocal<Object>();

    public void setProcessHook(ProcessHook processHook) {
        if (processHook != null) {
            this.processHook = processHook;
        }
    }

    public static void setCustomContext(Object context) {
        customContextLocal.set(context);
    }

    public static Object getCustomContext() {
        return customContextLocal.get();
    }

    public static void clearCustomContext() {
        customContextLocal.remove();
    }

    /**
     * 设置数据源，将使用内置的FlowEntityManager
     *
     * @param dataSource
     */
    public void setDatasource(DataSource dataSource) {
        this.flowEntityManager = new DefaultFlowEntityManager(dataSource);
        this.flowEntityManager.init();
    }

    /**
     * 使用注入的实体类管理器
     *
     * @param entityManager
     */
    public void setFlowEntityManager(FlowEntityManager entityManager) {
        this.flowEntityManager = entityManager;
        entityManager.init();
    }

    public FlowEntityManager getFlowEntityManager() {
        return flowEntityManager;
    }


    @Override
    public void registerHandler(Node.Type type, NodeHandler nodeHandler) {
        nodeHandlers[type.ordinal()] = nodeHandler;
    }

    @Override
    public NodeHandler getHandler(Node.Type type) {
        return nodeHandlers[type.ordinal()];
    }

    public ConnectHandler getHandler(ConditionType conditionType) {
        return connectHandlers[conditionType.ordinal()];
    }

    public void registerHandler(ConditionType conditionType, ConnectHandler connectHandler) {
        connectHandlers[conditionType.ordinal()] = connectHandler;
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
        if (flowEntityManager != null) {
            flowEntityManager.endTransaction();
        }
    }

    protected void rollbackTransaction() {
        if (flowEntityManager != null) {
            flowEntityManager.rollbackTransaction();
        }
    }

    protected void commitTransaction() {
        if (flowEntityManager != null) {
            flowEntityManager.commitTransaction();
        }
    }

    protected void beginTransaction() {
        if (flowEntityManager != null) {
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
            if (staticResources == null) return;
            log.info("static resources {}", staticResources);
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
                            int index = jarEntryName.indexOf(staticResources);
                            if (jarEntryName.toLowerCase().endsWith(".json") && (index == 0 && index == 1)) {
                                String json = null;
                                try {
                                    json = StringUtils.fromResource(jarEntryName);
                                    FlowHelper.deployment(FlowResource.ofJson(json));
                                } catch (Throwable throwable) {
                                    log.error(throwable.getMessage(), throwable);
                                    log.info("json {}", json);
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
                                String json = null;
                                try {
                                    json = StringUtils.fromStream(new FileInputStream(f));
                                    FlowHelper.deployment(FlowResource.ofJson(json));
                                } catch (Throwable throwable) {
                                    log.error(throwable.getMessage(), throwable);
                                    log.info("json {}", json);
                                }
                            }
                        }
                    }
                }
            }

        } catch (Exception e) {
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
