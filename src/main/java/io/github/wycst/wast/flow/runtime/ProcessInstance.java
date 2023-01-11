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
    private final Date createDate;

    // 启动时间
    private Date completedDate;

    // 最后一次修改时间
    private Date lastModifyDate;

    // 当前状态
    private Status status = Status.Ready;

    // 创建人id
    private String creator;

    // 上下文信息（含历史）
    private Map<String, Object> context = new HashMap<String, Object>();

    // 参数上下文（不含历史）
    private Map<String, Object> params;

    private List<NodeInstance> nodeInstances = new ArrayList<NodeInstance>();
    private Map<String, Task> tasks = new LinkedHashMap<String, Task>();

    // If the process instance loaded from the database is initialized to the value with the largest ID in the node instance list
    private long nextId;

    // 网关聚合信息
    private Map<String, JoinCountContext> joinCountContextMap = new HashMap<String, JoinCountContext>();

    // 自定义对象
    private Object customContext;

    ProcessInstance(RuleProcess ruleProcess, ProcessInstance parent, FlowEngine executeEngine) {
        this.id = IdGenerator.hex();
        this.ruleProcess = ruleProcess.self();
        this.parent = parent;
        this.executeEngine = executeEngine;
        this.createDate = new Timestamp(System.currentTimeMillis());
    }

    ProcessInstance(String id, RuleProcess ruleProcess, ProcessInstance parent, Date createDate, FlowEngine executeEngine) {
        this.id = id;
        this.ruleProcess = ruleProcess.self();
        this.parent = parent;
        this.executeEngine = executeEngine;
        this.createDate = createDate;
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

    /**
     * 实例加载
     *
     * @param id
     * @param ruleProcess
     * @param parent
     * @param createDate
     * @param executeEngine
     * @return
     */
    static ProcessInstance of(String id, RuleProcess ruleProcess, ProcessInstance parent, Date createDate, FlowEngine executeEngine) {
        return new ProcessInstance(id, ruleProcess, parent, createDate, executeEngine);
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
        this.params = vars == null ? new HashMap<String,Object>() : vars;
        context.putAll(vars);
    }

    public Object getContextValue(String key) {
        return context.get(key);
    }

    public Object setContextValue(String key, Object value) {
        return context.put(key, value);
    }

    public Map<String, Object> getContext() {
        return context;
    }

    public Map<String, Object> getParams() {
        return context;
    }

    void addNodeInstance(NodeInstance nodeInstance) {
        nodeInstances.add(nodeInstance);
    }

    public List<NodeInstance> getNodeInstances() {
        return nodeInstances;
    }

    public Collection<Task> getTasks() {
        return tasks.values();
    }

    synchronized long nextNodeInstanceId() {
        return ++nextId;
    }

    FlowEngine getExecuteEngine() {
        return executeEngine;
    }

    public String serializeVariables() {
        return JSON.toJsonString(context);
    }

    void setJoinCountContext(String joinNodeId, JoinCountContext joinCountContext) {
        joinCountContextMap.put(joinNodeId, joinCountContext);
    }

    JoinCountContext getJoinCountContext(String joinNodeId) {
        return joinCountContextMap.get(joinNodeId);
    }

    void removeJoinCountContext(String joinNodeId) {
        joinCountContextMap.remove(joinNodeId);
    }

    public Object getCustomContext() {
        return customContext;
    }

    public void setCustomContext(Object customContext) {
        this.customContext = customContext;
    }

    void addTask(Task task) {
        tasks.put(task.getId(), task);
    }
}
