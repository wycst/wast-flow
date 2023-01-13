package io.github.wycst.wast.flow.test;

import io.github.wycst.wast.flow.definition.*;
import io.github.wycst.wast.flow.deployment.DeploymentConnect;
import io.github.wycst.wast.flow.deployment.DeploymentNode;
import io.github.wycst.wast.flow.deployment.DeploymentProcess;
import io.github.wycst.wast.flow.entitys.ProcessDefinitionEntity;
import io.github.wycst.wast.flow.runtime.FlowEngine;
import io.github.wycst.wast.flow.runtime.ProcessInstance;
import io.github.wycst.wast.jdbc.datasource.SimpleDataSource;

import javax.sql.DataSource;
import java.util.*;

/**
 * @Author wangyunchao
 * @Date 2022/11/28 18:54
 */
public class WastWorkFlowTest {

    private static DataSource getDatasource() {
        //note: 正式使用不要使用SimpleDataSource
        SimpleDataSource simpleDataSource = new SimpleDataSource();
        simpleDataSource.setJdbcUrl("jdbc:mysql://10.1.22.121:3306/monitor-operation-server-hlj?createDatabaseIfNotExist=true&characterEncoding=utf-8&autoReconnect=true&failOverReadOnly=false&pinGlobalTxToPhysicalConnection=true");
        simpleDataSource.setDriverClass("com.mysql.cj.jdbc.Driver");
//        simpleDataSource.setUsername("dev");
//        simpleDataSource.setPassword("dev#000");
        simpleDataSource.setUsername("root");
        simpleDataSource.setPassword("3edc");
        return simpleDataSource;
    }

    public static void main(String[] args) {

        FlowEngine flowEngine = new FlowEngine();
        // 业务节点设置handler
        flowEngine.registerHandler(Node.Type.Business, new NodeHandler() {
            @Override
            public void handle(NodeContext nodeContext) throws Exception {
                System.out.println(nodeContext.getNode().frontNodes());
                System.out.println(nodeContext.getNode().nextNodes());
                String nodeId = nodeContext.getNode().getId();
                String name = nodeContext.getNode().getName();
                if("n1".equals(name)) {
                    System.out.println(nodeContext.getNode().getUuid());
                    throw new RuntimeException("error");
                }
            }
        });
        flowEngine.setDatasource(getDatasource());

        // 设置静态资源目录文件加载： classpath:/flows/sample.json
        flowEngine.setStaticResources("flows");

        // 加载已发布的资源
        flowEngine.loadDeployedProcess();

        // 设置记录持久化日志
        flowEngine.setPersistenceInstanceLog(true);
        // 设置事务
        flowEngine.setEnableTransaction(true);

        Map<String, Object> vars = new HashMap<String, Object>();
        vars.put("num", 111);
        vars.put("a", 11);
        vars.put("actualOwner", "a,b,c");
        // 流程标识
        String processId = "workflow_sample";
        System.out.println("processID " + processId);

        //6 启动流程
        ProcessInstance processInstance = flowEngine.startProcess(processId, vars);
        System.out.println("processInstanceId " + processInstance.getId());

        flowEngine.destroy();
    }

}
