package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.entitys.ProcessInstanceEntity;

/**
 * @Author wangyunchao
 * @Date 2023/1/12 17:50
 */
class PersistenceProcessInstance extends ProcessInstance {

    private ProcessInstanceEntity persistenceInstance;

    PersistenceProcessInstance(String id, RuleProcess ruleProcess, ProcessInstance parent, FlowEngine executeEngine) {
        super(id, ruleProcess, parent, executeEngine);
    }

    public ProcessInstanceEntity getPersistenceInstance() {
        return persistenceInstance;
    }

    public void setPersistenceInstance(ProcessInstanceEntity persistenceInstance) {
        this.persistenceInstance = persistenceInstance;
    }
}
