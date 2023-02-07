package io.github.wycst.wast.flow.test;

import io.github.wycst.wast.common.utils.StringUtils;
import io.github.wycst.wast.flow.defaults.DefaultProcessHook;
import io.github.wycst.wast.flow.definition.*;
import io.github.wycst.wast.flow.deployment.DeploymentConnect;
import io.github.wycst.wast.flow.deployment.DeploymentNode;
import io.github.wycst.wast.flow.deployment.DeploymentProcess;
import io.github.wycst.wast.flow.entitys.ProcessDefinitionEntity;
import io.github.wycst.wast.flow.runtime.FlowEngine;
import io.github.wycst.wast.flow.runtime.FlowHelper;
import io.github.wycst.wast.flow.runtime.NodeInstance;
import io.github.wycst.wast.flow.runtime.ProcessInstance;
import io.github.wycst.wast.jdbc.datasource.SimpleDataSource;

import javax.sql.DataSource;
import java.util.*;

/**
 * @Author wangyunchao
 * @Date 2022/11/28 18:54
 */
public class WastFlowTest {

    private static DataSource getDatasource() {
        //note: 正式使用不要使用SimpleDataSource
        SimpleDataSource simpleDataSource = new SimpleDataSource();
        simpleDataSource.setJdbcUrl("jdbc:mysql://localhost:3306/wtf_flow?createDatabaseIfNotExist=true&characterEncoding=utf-8&autoReconnect=true&failOverReadOnly=false&pinGlobalTxToPhysicalConnection=true");
        simpleDataSource.setDriverClass("com.mysql.cj.jdbc.Driver");
        simpleDataSource.setUsername("dev");
        simpleDataSource.setPassword("dev#000");
        return simpleDataSource;
    }

    public static DeploymentProcess mockDeploymentProcess() {

        DeploymentProcess definedProcess = new DeploymentProcess();
        definedProcess.setId("test");
        definedProcess.setName("test");
        definedProcess.setStartNodeId("1");
        definedProcess.setDescribe("this is a test flow");

        List<DeploymentNode> nodeList = new ArrayList<DeploymentNode>();
        DeploymentNode definedNode = new DeploymentNode();
        definedNode.setId("1");
        definedNode.setName("启动");
        definedNode.setType(Node.Type.Start);
        nodeList.add(definedNode);

        definedNode = new DeploymentNode();
        definedNode.setId("2");
        definedNode.setName("分支1");
        definedNode.setType(Node.Type.Business);
//        definedNode.getHandlerOption().setTimeout(110);
//        definedNode.getHandlerOption().setAsynchronous(true);

        definedNode.setMetaAttr("hello", "msg");
        nodeList.add(definedNode);

        definedNode = new DeploymentNode();
        definedNode.setId("3");
        definedNode.setName("分支2");
        definedNode.setType(Node.Type.Business);
        definedNode.setMetaAttr("hello", "msg2");
        nodeList.add(definedNode);

        definedNode = new DeploymentNode();
        definedNode.setId("4");
        definedNode.setName("结束");
        definedNode.setType(Node.Type.End);
        nodeList.add(definedNode);
        definedProcess.setNodes(nodeList);

        List<DeploymentConnect> definedConnects = new ArrayList<DeploymentConnect>();
        DeploymentConnect definedConnect = new DeploymentConnect();
        definedConnect.setId("1_2");
        definedConnect.setFromId("1");
        definedConnect.setToId("2");
        definedConnect.setConditionType(ConditionType.Script);
        definedConnect.setScript("num > 10");
        definedConnect.setPriority(1);
        definedConnects.add(definedConnect);

        definedConnect = new DeploymentConnect();
        definedConnect.setId("1_3");
        definedConnect.setFromId("1");
        definedConnect.setToId("3");
        definedConnect.setConditionType(ConditionType.Script);
        definedConnect.setScript("num <= 10");
        definedConnect.setPriority(2);
        definedConnects.add(definedConnect);

        definedConnect = new DeploymentConnect();
        definedConnect.setId("2_4");
        definedConnect.setFromId("2");
        definedConnect.setToId("4");
        definedConnect.setConditionType(ConditionType.Always);
        definedConnects.add(definedConnect);

        definedConnect = new DeploymentConnect();
        definedConnect.setId("3_4");
        definedConnect.setFromId("3");
        definedConnect.setToId("4");
        definedConnect.setConditionType(ConditionType.Always);
        definedConnects.add(definedConnect);

        // 连线
        definedProcess.setConnects(definedConnects);

        return definedProcess;
    }


    private static ProcessDefinitionEntity mockProcessDefinitionEntity(String content) {
        ProcessDefinitionEntity definitionEntity = new ProcessDefinitionEntity();
        definitionEntity.setProcessMode(DeploymentProcess.Mode.Simple);
        definitionEntity.setProcessName("test");
        definitionEntity.setProcessStatus(ProcessDefinitionEntity.Status.Draft);
        definitionEntity.setProcessId("test_one");
        definitionEntity.setResourceKind(ResourceKind.JSON);
        definitionEntity.setResourceContent(content);
        definitionEntity.setCreateDate(new Date());
        return definitionEntity;
    }

    public static void main(String[] args) {

        FlowEngine flowEngine = new FlowEngine();
        // 业务节点设置handler
        flowEngine.registerHandler(Node.Type.Business, new NodeHandler() {
            @Override
            public void handle(NodeContext nodeContext) throws Exception {
//                System.out.println(nodeContext.getNode().frontNodes());
//                System.out.println(nodeContext.getNode().nextNodes());
//                String nodeId = nodeContext.getNode().getId();
                String name = nodeContext.getNode().getName();
                nodeContext.isDebugMode();
                if("n6".equals(name)) {
                    System.out.println(nodeContext.getNode().getUuid());
                    throw new RuntimeException("error");
                }
                Thread.sleep(1000);
            }
        });
        flowEngine.setDatasource(getDatasource());

        // 设置静态资源目录文件加载： classpath:/flows/sample.json
        flowEngine.setStaticResources("flows");

        // 加载已发布的资源
        flowEngine.loadDeployedProcess();

//        // 模拟前端发起定义保存
//        ProcessDefinitionEntity processDefinitionEntity = mockProcessDefinitionEntity(content);
////
//        //1 测试流程定义保存接口
//        flowEngine.saveOrUpdateDefinition(processDefinitionEntity);
//        String definedId = processDefinitionEntity.getId();
//
//        //2 查询流程定义
//        processDefinitionEntity = flowEngine.getFlowEntityManager().getEntity(ProcessDefinitionEntity.class, definedId);
//        System.out.println(processDefinitionEntity);
//
//        //3 启用/停用流程（暂时忽略）
//
//        //4 发布流程,并持久化, 参数为定义的主键id
//        RuleProcess deploymentProcess = flowEngine.deploymentProcess(definedId);

        //5 删除流程版本（暂不提供）

        // 设置记录持久化日志
        flowEngine.setPersistenceInstanceLog(true);
        // 设置事务
        flowEngine.setEnableTransaction(true);

        Map<String, Object> vars = new HashMap<String, Object>();
        vars.put("num", 111);
        vars.put("a", 11);

        // 流程标识
        String processId = "a";
        System.out.println("processID " + processId);

        Connect connect = null;

        String flowSource = StringUtils.fromResource("flows/gateway.json");
        ProcessInstance debugProcessInstance = flowEngine.debugProcess(flowSource, vars);


        //6 启动流程
        ProcessInstance processInstance = flowEngine.startProcess(processId, vars);
        System.out.println("processInstanceId " + processInstance.getId());

        flowEngine.destroy();
    }

}
