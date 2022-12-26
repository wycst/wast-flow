package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.expression.Expression;
import io.github.wycst.wast.common.utils.StringUtils;
import io.github.wycst.wast.flow.definition.ConditionType;
import io.github.wycst.wast.flow.definition.Connect;
import io.github.wycst.wast.flow.definition.ConnectHandler;
import io.github.wycst.wast.flow.exception.FlowRuntimeException;

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
                        result = scriptEL.evaluate(processInstance.getContext());
                    } catch (RuntimeException runtimeException) {
                        throw new FlowRuntimeException(String.format("Script[%s] execute error: %s", getScript(), runtimeException.getMessage()), runtimeException);
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
                        return connectHandler.handle(new ConnectRuntimeContext(this, fromNodeInstance));
                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
                        return false;
                    }
                }
            }
        }
    }
}
