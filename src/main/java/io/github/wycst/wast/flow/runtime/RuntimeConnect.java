package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.expression.Expression;
import io.github.wycst.wast.flow.definition.ConditionType;
import io.github.wycst.wast.flow.definition.Connect;
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

    public RuntimeNode getFrom() {
        return from;
    }

    public RuntimeNode getTo() {
        return to;
    }

    public void prepare() {
        if (prepared) return;
        if (getConditionType() == ConditionType.Script) {
            scriptEL = Expression.parse(getScript());
        }
        to.prepare();
        this.prepared = true;
    }

    public boolean run(ProcessInstance processInstance) {
        if (conditionType == ConditionType.Script) {
            Object result = null;
            try {
                result = scriptEL.evaluate(processInstance.getContext());
            } catch (RuntimeException runtimeException) {
                throw new FlowRuntimeException(String.format("Script[%s] execute error: %s", getScript(), runtimeException.getMessage()), runtimeException);
            }
            if (result instanceof Boolean) {
                return result != null && (Boolean) result;
            }
            return result != null;
        } else {
            return conditionType != ConditionType.Never;
        }
    }
}
