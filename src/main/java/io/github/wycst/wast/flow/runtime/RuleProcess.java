package io.github.wycst.wast.flow.runtime;

import java.util.*;

/**
 * 规则流程
 *
 * @Author wangyunchao
 * @Date 2022/11/28 16:58
 */
public class RuleProcess {

    /**
     * id
     */
    private String id;

    /**
     * 名称
     */
    private String name;

    /**
     * 开始节点（有且只有一个）
     */
    private StartNode startNode;

    /**
     * 结束节点
     */
    private EndNode endNode;

    /**
     * 节点id映射
     */
    private Map<String, RuntimeNode> nodeMap = new LinkedHashMap<String, RuntimeNode>();

    /**
     * 连线映射表（以源端的id作为key）
     */
    private Map<String, RuntimeConnect> connectMap = new LinkedHashMap<String, RuntimeConnect>();

    /**
     * 汇聚节点的可达路径映射
     */
    private final HashMap<String, List<List<String>>> reachablePathsOfJoinNodeMap = new HashMap<String, List<List<String>>>();

    /**
     * 发布版本
     */
    private String version;

    public final RuleProcess self() {
        return this;
    }

    /**
     * 收集汇聚节点的路径列表
     *
     * @param joinNodeId
     * @param paths
     */
    void setReachablePaths(String joinNodeId, List<List<String>> paths) {
        reachablePathsOfJoinNodeMap.put(joinNodeId, paths);
    }

    boolean existJoinReachablePaths() {
        return reachablePathsOfJoinNodeMap.size() > 0;
    }

    Map<String, List<List<String>>> cloneReachablePaths() {
        Map<String, List<List<String>>> cloneMap = new HashMap<String, List<List<String>>>();
        Set<Map.Entry<String, List<List<String>>>> entries = reachablePathsOfJoinNodeMap.entrySet();
        for (Map.Entry<String, List<List<String>>> entry : entries) {
            String key = entry.getKey();
            List<List<String>> value = entry.getValue();
            cloneMap.put(key, new ArrayList<List<String>>(value));
        }
        return cloneMap;
        // return (Map<String, List<String>>) reachablePathsOfJoinNodeMap.clone();
    }

    void setId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    void setStartNode(StartNode startNode) {
        this.startNode = startNode;
    }

    public StartNode getStartNode() {
        return startNode;
    }

    public EndNode getEndNode() {
        return endNode;
    }

    void setEndNode(EndNode endNode) {
        this.endNode = endNode;
    }

    public Map<String, RuntimeNode> getNodeMap() {
        return nodeMap;
    }

    void setNodeMap(Map<String, RuntimeNode> nodeMap) {
        this.nodeMap = nodeMap;
    }

    public Map<String, RuntimeConnect> getConnectMap() {
        return connectMap;
    }

    void setConnectMap(Map<String, RuntimeConnect> connectMap) {
        this.connectMap = connectMap;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public void destroy() {
        this.startNode = null;
        nodeMap.clear();
        connectMap.clear();
    }
}
