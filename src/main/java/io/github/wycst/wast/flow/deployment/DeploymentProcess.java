package io.github.wycst.wast.flow.deployment;

import java.util.ArrayList;
import java.util.List;

/**
 * 定义部署态统一流程模型
 *
 * @Author wangyunchao
 * @Date 2022/11/28 17:04
 */
public class DeploymentProcess {

    /**
     * 流程id
     */
    private String id;

    /**
     * 流程名称
     */
    private String name;

    /**
     * 默认标准模式
     */
    private Mode mode = Mode.Standard;

    /**
     * 流程描述
     */
    private String describe;

    /**
     * 版本号
     */
    private String version;

    /**
     * 节点列表
     */
    private List<DeploymentNode> nodes = new ArrayList<DeploymentNode>();

    /**
     * 连线列表
     */
    private List<DeploymentConnect> connects = new ArrayList<DeploymentConnect>();

    /**
     * 启动节点id（理论上启动id是可以固化）
     */
    private String startNodeId;

    /**
     * 流程模式(主要控制前端设计)
     */
    public enum Mode {

        /**
         * 简单模式
         */
        Simple,

        /**
         * 标准模式
         */
        Standard
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Mode getMode() {
        return mode;
    }

    public void setMode(Mode mode) {
        this.mode = mode;
    }

    public String getDescribe() {
        return describe;
    }

    public void setDescribe(String describe) {
        this.describe = describe;
    }

    public List<DeploymentNode> getNodes() {
        return nodes;
    }

    public void setNodes(List<DeploymentNode> nodes) {
        this.nodes = nodes;
    }

    public List<DeploymentConnect> getConnects() {
        return connects;
    }

    public void setConnects(List<DeploymentConnect> connects) {
        this.connects = connects;
    }

    public String getStartNodeId() {
        return startNodeId;
    }

    public void setStartNodeId(String startNodeId) {
        this.startNodeId = startNodeId;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
