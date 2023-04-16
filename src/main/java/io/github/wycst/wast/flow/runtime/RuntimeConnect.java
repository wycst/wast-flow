package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.expression.Expression;
import io.github.wycst.wast.common.utils.StringUtils;
import io.github.wycst.wast.flow.definition.ConditionType;
import io.github.wycst.wast.flow.definition.Connect;
import io.github.wycst.wast.flow.definition.ConnectHandler;
import io.github.wycst.wast.flow.definition.Node;
import io.github.wycst.wast.flow.exception.FlowRuntimeException;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author wangyunchao
 * @Date 2022/11/29 10:42
 */
public class RuntimeConnect extends Connect {

    // 唯一id
    protected final String id;
    // 名称
    protected final String name;
    protected final RuntimeNode from;
    protected final RuntimeNode to;

    private Expression scriptEL;
    private boolean prepared;

    // 是否影响汇聚路径
    private boolean impactJoinPath;

    public RuntimeConnect(String id, String name, RuntimeNode from, RuntimeNode to) {
        this.id = id;
        this.name = name;
        this.from = from;
        this.to = to;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public String getName() {
        return name;
    }

    public RuntimeNode getFrom() {
        return from;
    }

    public RuntimeNode getTo() {
        return to;
    }

    public void prepare() {
        if (prepared) return;
        if (getConditionType() == ConditionType.Script && !StringUtils.isEmpty(getScript())) {
            scriptEL = Expression.parse(getScript());
        }
        to.prepare();
        this.prepared = true;
    }

    public boolean run(ProcessInstance processInstance, NodeInstance fromNodeInstance) {
        if (conditionType == null) {
            throw new UnsupportedOperationException("conditionType is null ");
        } else {
            switch (conditionType) {
                case Script: {
                    Object result;
                    try {
                        result = scriptEL.evaluate(processInstance.getVariables());
                    } catch (RuntimeException runtimeException) {
                        throw new FlowRuntimeException(String.format("ScriptEl: '%s' execute error: %s", getScript(), runtimeException.getMessage()), runtimeException);
                    }
                    if (result instanceof Boolean) {
                        return result != null && (Boolean) result;
                    }
                    return result != null;
                }
                case Never:
                    return false;
                case Always:
                    return true;
                default: {
                    ConnectHandler connectHandler = processInstance.getExecuteEngine().getHandler(conditionType);
                    if (connectHandler == null) {
                        throw new UnsupportedOperationException("unregister connect handler for " + conditionType);
                    }
                    try {
                        return connectHandler.handle(new ConnectRuntimeContext(this, processInstance, fromNodeInstance));
                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
                        return false;
                    }
                }
            }
        }
    }

    public boolean passedIfOnlyOne() {
        return conditionType == ConditionType.Script || conditionType == ConditionType.Always;
    }

    @Override
    public Node from() {
        return from;
    }

    @Override
    public Node to() {
        return to;
    }

    /**
     * 判断连线的目的节点为汇聚节点
     *
     * @return
     */
    boolean toJoinNode() {
        return to.isJoin();
    }

    @Override
    public List<Node> getFrontNearestNodes(Node.Type type) {
        List<Node> nodes = null;
        if (from.getType() == type) {
            nodes = new ArrayList<Node>();
            nodes.add(from);
            return nodes;
        }
        return from.getFrontNearestNodes(type);
    }

    @Override
    public List<Node> getNextNearestNodes(Node.Type type) {
        List<Node> nodes = null;
        if (to.getType() == type) {
            nodes = new ArrayList<Node>();
            nodes.add(to);
            return nodes;
        }
        return to.getNextNearestNodes(type);
    }

    boolean isImpactJoinPath() {
        return impactJoinPath;
    }

    void setImpactJoinPath(boolean impactJoinPath) {
        this.impactJoinPath = impactJoinPath;
    }
}
