package io.github.wycst.wast.flow.runtime;

import java.util.HashMap;
import java.util.Map;

/**
 * @Author wangyunchao
 * @Date 2023/1/12 13:24
 */
class ProcessInstanceContext {

    // If the process instance loaded from the database is initialized to the value with the largest ID in the node instance list
    private long nextId;

    // 每个环节受理人信息记录（节点->受理人）
    private Map<String, String> actualOwners = new HashMap<String, String>();

    // 参数信息
    private Map<String, Object> variables = new HashMap<String, Object>();

//    // 聚合信息
//    private Map<String, JoinCountContext> joinCountContexts = new HashMap<String, JoinCountContext>();

    // 异步模式
    private boolean asyncMode;

    public long getNextId() {
        return nextId;
    }

    public void setNextId(long nextId) {
        this.nextId = nextId;
    }

    public Map<String, String> getActorOwners() {
        return actualOwners;
    }

    public void setActorOwners(Map<String, String> actualOwners) {
        this.actualOwners = actualOwners;
    }

    public Map<String, Object> getVariables() {
        return variables;
    }

    public void setVariables(Map<String, Object> variables) {
        this.variables = variables;
    }

//    public Map<String, JoinCountContext> getJoinCountContexts() {
//        return joinCountContexts;
//    }
//
//    public void setJoinCountContexts(Map<String, JoinCountContext> joinCountContexts) {
//        this.joinCountContexts = joinCountContexts;
//    }

    public Object getVariable(String key) {
        return variables.get(key);
    }

    public void setVariable(String key, Object value) {
        variables.put(key, value);
    }

    public Object removeVariable(String key) {
        return variables.remove(key);
    }

    public long nextNodeInstanceId() {
        return ++nextId;
    }

//    public void setJoinCountContext(String joinNodeId, JoinCountContext joinCountContext) {
//        joinCountContexts.put(joinNodeId, joinCountContext);
//    }
//
//    public JoinCountContext getJoinCountContext(String joinNodeId) {
//        return joinCountContexts.get(joinNodeId);
//    }

//    public void removeJoinCountContext(String joinNodeId) {
//        joinCountContexts.remove(joinNodeId);
//    }

    public void recordActorOwner(String nodeId, String actualOwnerId) {
        actualOwners.put(nodeId, actualOwnerId);
    }

    public String historyActorOwner(String nodeId) {
        return actualOwners.get(nodeId);
    }

    public boolean isAsyncMode() {
        return asyncMode;
    }

    public void setAsyncMode(boolean asyncMode) {
        this.asyncMode = asyncMode;
    }
}
