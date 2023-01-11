package io.github.wycst.wast.flow.deployment;

import io.github.wycst.wast.flow.definition.GatewayType;
import io.github.wycst.wast.flow.definition.HandlerOption;
import io.github.wycst.wast.flow.definition.ManualOption;
import io.github.wycst.wast.flow.definition.Node;

/**
 * 定义节点
 *
 * @Author wangyunchao
 * @Date 2022/11/28 17:06
 */
public class DeploymentNode extends Node {

    // 除网关节点的外的节点默认网关为XOR
    private GatewayType gateway = GatewayType.XOR;

    // handler配置选项
    private HandlerOption handler = new HandlerOption();

    // 人工节点配置项
    private ManualOption manual = new ManualOption();

    public GatewayType getGateway() {
        return gateway;
    }

    public void setGateway(GatewayType gateway) {
        this.gateway = gateway;
    }

    public HandlerOption getHandler() {
        return handler;
    }

    public void setHandler(HandlerOption handler) {
        this.handler = handler;
    }

    public ManualOption getManual() {
        return manual;
    }

    public void setManual(ManualOption manual) {
        this.manual = manual;
    }

    public void setMetaAttr(String key, Object value) {
        meta.put(key, value);
    }
}
