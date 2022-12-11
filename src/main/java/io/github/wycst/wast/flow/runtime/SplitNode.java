package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.GatewayType;
import io.github.wycst.wast.flow.definition.NodeHandler;

/**
 * 分支节点，单进多出
 *
 * @Author wangyunchao
 * @Date 2021/12/6 16:02
 */
public class SplitNode extends RuntimeNode {

    private final GatewayType gatewayType;

    public SplitNode(String id, String name, RuleProcess process, GatewayType gatewayType) {
        super(id, name, process);
        this.gatewayType = gatewayType;
    }

    @Override
    public boolean isGateway() {
        return true;
    }

    @Override
    public String toString() {
        return "SplitNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
