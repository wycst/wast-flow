package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.GatewayType;

/**
 * 聚合节点，多进单出
 *
 * @Author wangyunchao
 * @Date 2021/12/6 16:03
 */
public class JoinNode extends RuntimeNode {

    private final GatewayType gatewayType;

    public JoinNode(String id, String name, RuleProcess process, GatewayType gatewayType) {
        super(id, name, process);
        this.gatewayType = gatewayType;
    }

    @Override
    public boolean isGateway() {
        return true;
    }

    @Override
    public String toString() {
        return "JoinNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
