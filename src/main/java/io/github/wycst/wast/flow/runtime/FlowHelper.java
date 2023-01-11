package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.idgenerate.providers.IdGenerator;
import io.github.wycst.wast.flow.definition.FlowResource;
import io.github.wycst.wast.flow.definition.GatewayType;
import io.github.wycst.wast.flow.definition.Node;
import io.github.wycst.wast.flow.deployment.DeploymentConnect;
import io.github.wycst.wast.flow.deployment.DeploymentNode;
import io.github.wycst.wast.flow.deployment.DeploymentProcess;
import io.github.wycst.wast.flow.exception.FlowDeploymentException;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 流程帮助类
 *
 * @Author wangyunchao
 * @Date 2022/11/28 16:21
 */
public class FlowHelper {

    // 已发布流程列表
    private static Map<String, RuleProcessVersions> deploymentProcessList = new ConcurrentHashMap<String, RuleProcessVersions>();

    /**
     * 获取部署的流程模型(最新版本)
     *
     * @param processId
     * @return
     */
    public static RuleProcess getProcess(String processId) {
        RuleProcessVersions versions = deploymentProcessList.get(processId);
        if (versions == null) {
            throw new FlowDeploymentException("RuleProcess['" + processId + "'] is not deployed");
        }
        return versions.latest();
    }

    /**
     * 获取指定版本的流程模型
     *
     * @param processId
     * @return
     */
    public static RuleProcess getProcess(String processId, String version) {
        RuleProcessVersions versions = deploymentProcessList.get(processId);
        if (versions == null) {
            throw new FlowDeploymentException("RuleProcess['" + processId + "'] is not deployed");
        }
        return versions.getVersion(version);
    }

    /**
     * 获取所有部署的流程模型(取最新版本)
     *
     * @return
     */
    public static Collection<RuleProcess> getLatestProcess() {
        Collection<RuleProcessVersions> ruleProcessVersions = deploymentProcessList.values();
        List<RuleProcess> ruleProcesses = new ArrayList<RuleProcess>();
        for (RuleProcessVersions versions : ruleProcessVersions) {
            ruleProcesses.add(versions.latest());
        }
        return ruleProcesses;
    }

    /**
     * 获取指定流程所有版本
     *
     * @return
     */
    public static Collection<RuleProcess> getProcessVersions(String processId) {
        RuleProcessVersions versions = deploymentProcessList.get(processId);
        if (versions == null) {
            throw new FlowDeploymentException("RuleProcess['" + processId + "'] is not deployed");
        }
        return versions.values();
    }


    /**
     * 发布流程
     *
     * @param processId
     * @param flowResource
     */
    public static RuleProcess deployment(String processId, FlowResource flowResource) {
        DeploymentProcess deploymentProcess = flowResource.getDeploymentProcess();
        return deployment(processId, deploymentProcess);
    }

    /**
     * 发布流程
     *
     * @param flowResource
     */
    public static RuleProcess deployment(FlowResource flowResource) {
        DeploymentProcess deploymentProcess = flowResource.getDeploymentProcess();
        String processId = deploymentProcess.getId();
        return deployment(processId, deploymentProcess);
    }

    /**
     * 卸载流程
     *
     * @param flowId
     */
    public static void undeployment(String flowId) {
        deploymentProcessList.remove(flowId);
    }

    /**
     * 非运行态可以直接同步
     *
     * @param processId
     * @param deploymentProcess
     */
    synchronized static RuleProcess deployment(String processId, DeploymentProcess deploymentProcess) {

        RuleProcess process = null;

        // 检查processId是否为空
        if (processId == null || (processId = processId.trim()).isEmpty()) {
            throw new FlowDeploymentException("processId is not defined");
        }

        // 检查流程是否有效
        validateDeploymentProcess(deploymentProcess);

        // 部署
        process = loadProcess(processId, deploymentProcess);

        // 申请版本号
        String version = applyVersion();

        // 设置版本号
        process.setVersion(version);

        deploymentProcess(processId, version, process);

        // 返回
        return process;
    }

    private static void deploymentProcess(String processId, String version, RuleProcess process) {
        // 检查是否已经发布过,考虑到历史待办问题，不能覆盖之前发布的流程
        RuleProcessVersions processVersions = deploymentProcessList.get(processId);
        if (processVersions == null) {
            processVersions = new RuleProcessVersions(processId);
            deploymentProcessList.put(processId, processVersions);
        }
        // 添加新版本到版本库
        processVersions.addVersion(version, process);
    }

    static RuleProcess loadProcess(String processId, DeploymentProcess deploymentProcess) {

        RuleProcess process = new RuleProcess();
        process.setId(processId);
        process.setName(deploymentProcess.getName());

        // 发布节点列表
        List<DeploymentNode> deploymentNodes = deploymentProcess.getNodes();
        // 连线列表
        List<DeploymentConnect> deploymentConnects = deploymentProcess.getConnects();

        // 非xor分支map集合
        Map<String, SplitNode> splitNodes = new HashMap<String, SplitNode>();
        // 网关聚合节点
        Map<String, JoinNode> joinNodes = new HashMap<String, JoinNode>();

        // 构建运行时节点
        Map<String, RuntimeNode> nodeMap = new HashMap<String, RuntimeNode>();
        for (DeploymentNode deploymentNode : deploymentNodes) {
            RuntimeNode runtimeNode = toRuntimeNode(deploymentNode, process);
            nodeMap.put(deploymentNode.getId(), runtimeNode);

            if (runtimeNode instanceof SplitNode && ((SplitNode) runtimeNode).getGatewayType() != GatewayType.XOR) {
                splitNodes.put(runtimeNode.getId(), ((SplitNode) runtimeNode));
            } else if (runtimeNode instanceof JoinNode) {
                joinNodes.put(runtimeNode.getId(), (JoinNode) runtimeNode);
            }
        }

        // 构建运行时连线
        Map<String, RuntimeConnect> connectMap = new HashMap<String, RuntimeConnect>();
        for (DeploymentConnect deploymentConnect : deploymentConnects) {
            RuntimeConnect runtimeConnect = toRuntimeConnect(deploymentConnect, nodeMap);
            connectMap.put(deploymentConnect.getId(), runtimeConnect);
        }

        // 开始节点id
        String startNodeId = deploymentProcess.getStartNodeId();
        RuntimeNode startNode = nodeMap.get(startNodeId);

        if (startNode == null) {
            throw new FlowDeploymentException("流程图错误: 未指定开始节点");
        }

        if (startNode.getType() != Node.Type.Start) {
            throw new FlowDeploymentException("流程图错误: 错误的开始节点类型" + startNode.getType());
        }

        // prepare
        startNode.prepare();

        // check gateways
        checkAndSetGateways(process, splitNodes, joinNodes);

        process.setNodeMap(nodeMap);
        process.setConnectMap(connectMap);
        process.setStartNode((StartNode) startNode);
        process.setEndNode(null);

        return process;
    }

    private static void checkAndSetGateways(RuleProcess process, Map<String, SplitNode> splitNodes, Map<String, JoinNode> joinNodes) {
        // 配对网关校验
        for (SplitNode splitNode : splitNodes.values()) {
            JoinNode joinNode = matchJoinNode(splitNode, joinNodes);
            String id = splitNode.getId();
            if (joinNode == null) {
                throw new FlowDeploymentException(String.format("并行分支节点[id=%s]没有匹配到相对应的聚合网关。", id));
            }
            splitNode.setJoinNodeId(joinNode.getId());
            // Ensure branch gateway and aggregation gateway are one-to-one
            joinNodes.remove(joinNode.getId());
        }
    }

    private static JoinNode matchJoinNode(SplitNode splitNode, Map<String, JoinNode> joinNodes) {

        if (joinNodes == null || joinNodes.size() == 0) return null;
        // 获取所有出口进行网关配对
        List<List<String>> exitPaths = getExitPaths(splitNode, null);
        // 多个路径取最近
        List<MatchedNode> matchedNodes = new ArrayList<MatchedNode>();
        try {
            for (JoinNode joinNode : joinNodes.values()) {
                // 检查splitElement和joinElement是否配对
                // 检查从splitElement开始的所有出口路径中是否存在一条路径不经过joinElement；
                // 如果所有的路径都经过joinElement，说明配对成功，否则配对失败；
                // 如果匹配到多个joinElement说明路径存在包含关系，取离分支元素最近的一个聚合网关作为配对网关
                String joinElementId = joinNode.getId();
                boolean mismatch = false;
                int maxIndex = 0;
                for (List<String> exitPath : exitPaths) {
                    int joinIndex = exitPath.indexOf(joinElementId);
                    if (joinIndex == -1) {
                        mismatch = true;
                        break;
                    }
                    maxIndex = Math.max(maxIndex, joinIndex);
                }
                if (mismatch) continue;
                matchedNodes.add(new MatchedNode(maxIndex, joinNode));
            }

            if (matchedNodes.size() == 0) return null;
            Collections.sort(matchedNodes);
            // 返回maxIndex最小的网关
            return matchedNodes.get(0).joinNode;
        } finally {

        }
    }

    private static List<List<String>> getExitPaths(RuntimeNode node, List<String> excludeKeys) {
        if (node == null) return null;
        Node.Type nodeType = node.getType();
        String id = node.getId();
        List<List<String>> exitPaths = new ArrayList<List<String>>();
        if (nodeType == Node.Type.End || nodeType == Node.Type.Termination) {
            List<String> exitPath = new ArrayList<String>();
            exitPath.add(id);
            exitPaths.add(exitPath);
            return exitPaths;
        }
        List<RuntimeConnect> outConnects = node.getOutConnects();
        if (outConnects == null || outConnects.size() == 0) {
            // 理论上代码不可达，没有出口的节点视为出口
            List<String> exitPath = new ArrayList<String>();
            exitPath.add(id);
            exitPaths.add(exitPath);
            return exitPaths;
        }
        if (excludeKeys == null) {
            excludeKeys = new ArrayList<String>();
        }
        for (RuntimeConnect connect : outConnects) {
            String connectId = connect.getId();
            RuntimeNode toNode = connect.getTo();
            if (!excludeKeys.contains(connectId)) {
                List<String> nextExcludeKeys = new ArrayList<String>(excludeKeys);
                nextExcludeKeys.add(connectId);
                List<List<String>> toNodeExitPaths = getExitPaths(toNode, nextExcludeKeys);
                for (List<String> toNodeExitPath : toNodeExitPaths) {
                    toNodeExitPath.add(0, id);
                    exitPaths.add(toNodeExitPath);
                }
            }
        }
        return exitPaths;
    }

    // 临时数据结构类
    static class MatchedNode implements Comparable<MatchedNode> {
        private final int maxIndex;
        private final JoinNode joinNode;

        MatchedNode(int maxIndex, JoinNode joinNode) {
            this.maxIndex = maxIndex;
            this.joinNode = joinNode;
        }

        @Override
        public int compareTo(MatchedNode o) {
            return Integer.valueOf(maxIndex).compareTo(o.maxIndex);
        }
    }

    private static RuntimeConnect toRuntimeConnect(DeploymentConnect deploymentConnect, Map<String, RuntimeNode> nodeMap) {
        String fromId = deploymentConnect.getFromId();
        String toId = deploymentConnect.getToId();

        RuntimeNode fromNode = nodeMap.get(fromId);
        RuntimeNode toNode = nodeMap.get(toId);

        RuntimeConnect runtimeConnect = new RuntimeConnect(deploymentConnect.getId(), deploymentConnect.getName(), fromNode, toNode);
        runtimeConnect.setMeta(deploymentConnect.getMeta());
        runtimeConnect.setUuid(deploymentConnect.getUuid());
        runtimeConnect.setConditionType(deploymentConnect.getConditionType());
        runtimeConnect.setScript(deploymentConnect.getScript());
        runtimeConnect.setPriority(deploymentConnect.getPriority());

        fromNode.getOutConnects().add(runtimeConnect);
        toNode.getInConnects().add(runtimeConnect);

        return runtimeConnect;
    }

    private static RuntimeNode toRuntimeNode(DeploymentNode deploymentNode, RuleProcess process) {
        RuntimeNode runtimeNode = null;
        Node.Type type = deploymentNode.getType();
        if (type == null) {
            // add Unknown
            type = Node.Type.Unknown;
        }
        switch (type) {
            case Start:
                runtimeNode = new StartNode(deploymentNode.getId(), deploymentNode.getName(), process);
                break;
            case End:
                runtimeNode = new EndNode(deploymentNode.getId(), deploymentNode.getName(), process);
                break;
            case Termination:
                runtimeNode = new TerminationNode(deploymentNode.getId(), deploymentNode.getName(), process);
                break;
            case Script:
                runtimeNode = new ScriptNode(deploymentNode.getId(), deploymentNode.getName(), process);
                break;
            case Service:
                runtimeNode = new ServiceNode(deploymentNode.getId(), deploymentNode.getName(), process);
                break;
            case Business:
                runtimeNode = new BusinessNode(deploymentNode.getId(), deploymentNode.getName(), process);
                break;
            case Manual:
                runtimeNode = new ManualNode(deploymentNode.getId(), deploymentNode.getName(), process, deploymentNode.getManual());
                break;
            case Message:
                runtimeNode = new MessageNode(deploymentNode.getId(), deploymentNode.getName(), process);
                break;
            case Split:
                runtimeNode = new SplitNode(deploymentNode.getId(), deploymentNode.getName(), process, deploymentNode.getGateway());
                break;
            case Join:
                runtimeNode = new JoinNode(deploymentNode.getId(), deploymentNode.getName(), process, deploymentNode.getGateway());
                break;
            case SubProcess:
                runtimeNode = new SubProcessNode(deploymentNode.getId(), deploymentNode.getName(), process);
                break;
            default: {
                // Unknown
                runtimeNode = new RuntimeNode(deploymentNode.getId(), deploymentNode.getName(), process);
            }
        }
        runtimeNode.setMeta(deploymentNode.getMeta());
        runtimeNode.setType(type);
        runtimeNode.setHandlerOption(deploymentNode.getHandler());
        runtimeNode.setUuid(deploymentNode.getUuid());

        return runtimeNode;
    }

    private static void validateDeploymentProcess(DeploymentProcess deploymentProcess) {
        // todo
    }

    private static String applyVersion() {
        return IdGenerator.hex();
    }

    /**
     * 加载DeployedProcess
     *
     * @param processId
     * @param version
     * @param flowResource
     */
    static void loadDeployedProcess(String processId, String version, FlowResource flowResource) {
        RuleProcess ruleProcess = loadProcess(processId, flowResource.getDeploymentProcess());
        ruleProcess.setVersion(version);
        deploymentProcess(processId, version, ruleProcess);
    }

    /**
     * 卸载所有流程
     */
    public static void destroy() {
        Collection<RuleProcessVersions> processVersionsList = deploymentProcessList.values();
        for (RuleProcessVersions processVersions : processVersionsList) {
            processVersions.destroy();
        }
        deploymentProcessList.clear();
    }
}
