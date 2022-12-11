package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.idgenerate.providers.IdGenerator;
import io.github.wycst.wast.flow.definition.FlowResource;
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

        // 构建运行时节点
        Map<String, RuntimeNode> nodeMap = new HashMap<String, RuntimeNode>();
        for (DeploymentNode deploymentNode : deploymentNodes) {
            RuntimeNode runtimeNode = toRuntimeNode(deploymentNode, process);
            nodeMap.put(deploymentNode.getId(), runtimeNode);
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

        if(startNode == null) {
            throw new FlowDeploymentException("流程图错误: 未指定开始节点");
        }

        if(startNode.getType() != Node.Type.Start) {
            throw new FlowDeploymentException("流程图错误: 错误的开始节点类型" + startNode.getType());
        }
        
        // prepare
        startNode.prepare();

        process.setNodeMap(nodeMap);
        process.setConnectMap(connectMap);
        process.setStartNode((StartNode) startNode);
        process.setEndNode(null);

        return process;
    }

    private static RuntimeConnect toRuntimeConnect(DeploymentConnect deploymentConnect, Map<String, RuntimeNode> nodeMap) {
        String fromId = deploymentConnect.getFromId();
        String toId = deploymentConnect.getToId();

        RuntimeNode fromNode = nodeMap.get(fromId);
        RuntimeNode toNode = nodeMap.get(toId);

        RuntimeConnect runtimeConnect = new RuntimeConnect(deploymentConnect.getId(), deploymentConnect.getName(), fromNode, toNode);
        runtimeConnect.setMeta(deploymentConnect.getMeta());
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
                runtimeNode = new ManualNode(deploymentNode.getId(), deploymentNode.getName(), process);
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
        }
        runtimeNode.setMeta(deploymentNode.getMeta());
        runtimeNode.setType(type);
        runtimeNode.setHandlerOption(deploymentNode.getHandler());

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
        for(RuleProcessVersions processVersions : processVersionsList) {
            processVersions.destroy();
        }
        deploymentProcessList.clear();
    }
}
