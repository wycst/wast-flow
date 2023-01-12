package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.entitys.NodeInstanceEntity;

/**
 * @Author wangyunchao
 * @Date 2023/1/12 17:33
 */
class PersistenceNodeInstance extends NodeInstance {

    private NodeInstanceEntity persistenceInstance;

    PersistenceNodeInstance(RuntimeNode node, ProcessInstance processInstance) {
        this(node, null, processInstance);
    }

    PersistenceNodeInstance(RuntimeNode node, NodeInstance prev, ProcessInstance processInstance) {
        super(node, prev, processInstance);
    }

    public NodeInstanceEntity getPersistenceInstance() {
        return persistenceInstance;
    }

    public void setPersistenceInstance(NodeInstanceEntity persistenceInstance) {
        this.persistenceInstance = persistenceInstance;
    }
}
