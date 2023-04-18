package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.idgenerate.providers.IdGenerator;
import io.github.wycst.wast.flow.definition.Status;
import io.github.wycst.wast.json.JSON;

import java.sql.Timestamp;
import java.util.*;

/**
 * @Author wangyunchao
 * @Date 2022/11/29 11:15
 */
public class ProcessInstance {

    // 实例id
    private final String id;

    // 流程所属
    private final RuleProcess ruleProcess;

    // 父流程实例
    private final ProcessInstance parent;

    // 引擎
    private final FlowEngine executeEngine;

    // 创建时间
    private Date createDate;

    // 启动时间
    private Date completedDate;

    // 最后一次修改时间
    private Date lastModifyDate;

    // 当前状态
    private Status status = Status.Ready;

    // 创建人id
    private String creator;

    // 上下文信息（含历史）
    //    private Map<String, Object> variables = new HashMap<String, Object>();

    // 实例上下文
    private ProcessInstanceContext processInstanceContext = new ProcessInstanceContext();

    // 提交参数（合并到variables中）
    private Map<String, Object> params;

    // 节点实例列表
    private List<NodeInstance> nodeInstances = new ArrayList<NodeInstance>();
    // 待办列表
    private List<Task> tasks = new ArrayList<Task>();
    private Throwable throwable;
    private boolean rollback;

    // 自定义对象(不参与持久化存储)
    private Object customContext;

    // join 可达路径映射
    private final Map<String, List<List<String>>> joinReachablePaths;

    ProcessInstance(RuleProcess ruleProcess, ProcessInstance parent, FlowEngine executeEngine) {
        this(IdGenerator.hex(), ruleProcess.self(), parent, executeEngine);
        this.createDate = new Timestamp(System.currentTimeMillis());
    }

    ProcessInstance(String id, RuleProcess ruleProcess, ProcessInstance parent, FlowEngine executeEngine) {
        this.id = id;
        this.ruleProcess = ruleProcess.self();
        this.parent = parent;
        this.executeEngine = executeEngine;

        Map<String, List<List<String>>> joinReachablePaths = null;
        if (ruleProcess.existJoinReachablePaths()) {
            joinReachablePaths = ruleProcess.cloneReachablePaths();
        }
        this.joinReachablePaths = joinReachablePaths;
    }

    /**
     * 创建新的实例
     *
     * @param ruleProcess
     * @param parent
     * @param executeEngine
     * @return
     */
    static ProcessInstance createInstance(RuleProcess ruleProcess, ProcessInstance parent, FlowEngine executeEngine) {
        return new ProcessInstance(ruleProcess, parent, executeEngine);
    }

    public String getId() {
        return id;
    }

    public ProcessInstance getParent() {
        return parent;
    }

    public RuleProcess getRuleProcess() {
        return ruleProcess;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public Date getCompletedDate() {
        return completedDate;
    }

    void setCompletedDate(Date completedDate) {
        this.completedDate = completedDate;
    }

    public Date getLastModifyDate() {
        return lastModifyDate;
    }

    void setLastModifyDate(Date lastModifyDate) {
        this.lastModifyDate = lastModifyDate;
    }

    public Status getStatus() {
        return status;
    }

    void setStatus(Status status) {
        this.status = status;
    }

    public String getCreator() {
        return creator;
    }

    void setCreator(String creator) {
        this.creator = creator;
    }

    void setContextValues(Map<String, Object> vars) {
        this.params = vars == null ? new HashMap<String, Object>() : vars;
        processInstanceContext.getVariables().putAll(vars);
    }

    public Object getVariable(String key) {
        return processInstanceContext.getVariable(key);
    }

    public void setVariable(String key, Object value) {
        processInstanceContext.setVariable(key, value);
    }

    public Object removeVariable(String key) {
        return processInstanceContext.removeVariable(key);
    }

    public Map<String, Object> getVariables() {
        return processInstanceContext.getVariables();
    }

    public Map<String, Object> getParams() {
        return params;
    }

    synchronized void addNodeInstance(NodeInstance nodeInstance) {
        nodeInstances.add(nodeInstance);
    }

    public List<NodeInstance> getNodeInstances() {
        return nodeInstances;
    }

    public Collection<Task> getTasks() {
        return tasks; // .values();
    }

    synchronized long nextNodeInstanceId() {
        return processInstanceContext.nextNodeInstanceId();
    }

    FlowEngine getExecuteEngine() {
        return executeEngine;
    }

    public String serializeVariables() {
        return JSON.toJsonString(getVariables());
    }

    public String serializeInstanceContext() {
        return JSON.toJsonString(processInstanceContext);
    }

//    void setJoinCountContext(String joinNodeId, JoinCountContext joinCountContext) {
//        processInstanceContext.setJoinCountContext(joinNodeId, joinCountContext);
//    }
//
//    JoinCountContext getJoinCountContext(String joinNodeId) {
//        return processInstanceContext.getJoinCountContext(joinNodeId);
//    }

//    void removeJoinCountContext(String joinNodeId) {
//        processInstanceContext.removeJoinCountContext(joinNodeId);
//    }

    public Object getCustomContext() {
        return customContext;
    }

    public void setCustomContext(Object customContext) {
        this.customContext = customContext;
    }

    void addTask(Task task) {
//        tasks.put(task.getId(), task);
        tasks.add(task);
    }

    public void recordActorOwner(String nodeId, String actualOwnerId) {
        processInstanceContext.recordActorOwner(nodeId, actualOwnerId);
    }

    public String historyActorOwner(String nodeId) {
        return processInstanceContext.historyActorOwner(nodeId);
    }

    public Throwable getThrowable() {
        return throwable;
    }

    public boolean isRollback() {
        return rollback;
    }

    void setThrowableAndRollback(Throwable throwable, boolean rollback) {
        this.throwable = throwable;
        this.rollback = rollback;
    }

    void setAsyncMode(boolean asyncMode) {
        processInstanceContext.setAsyncMode(asyncMode);
    }

    public boolean isAsyncMode() {
        return processInstanceContext.isAsyncMode();
    }

    public boolean isDebugMode() {
        return false;
    }

    void completedInstance() throws Exception {
        setStatus(Status.Completed);
        setCompletedDate(new Timestamp(System.currentTimeMillis()));
    }

    void stopInstance() throws Exception {
        setStatus(Status.Stop);
        setCompletedDate(new Timestamp(System.currentTimeMillis()));
    }

    List<List<String>> getJoinPaths(String joinNodeId) {
        return joinReachablePaths.get(joinNodeId);
    }
}
