package io.github.wycst.wast.flow.runtime;

/**
 * @Author wangyunchao
 * @Date 2023/2/7 12:13
 */
class DebugProcessInstance extends ProcessInstance {

    DebugProcessInstance(RuleProcess ruleProcess, ProcessInstance parent, FlowEngine executeEngine) {
        super(ruleProcess, parent, executeEngine);
    }

    @Override
    public boolean isDebugMode() {
        return true;
    }
}
