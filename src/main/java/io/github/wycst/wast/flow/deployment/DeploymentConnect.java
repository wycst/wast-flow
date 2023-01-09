package io.github.wycst.wast.flow.deployment;

import io.github.wycst.wast.flow.definition.Connect;
import io.github.wycst.wast.flow.definition.Node;

/**
 * 连线对象
 *
 * @Author wangyunchao
 * @Date 2021/12/6 14:59
 */
public class DeploymentConnect extends Connect {

    @Override
    public Node from() {
        return null;
    }

    @Override
    public Node to() {
        return null;
    }

    // 图形属性暂时不考虑（路径列表）
}
