package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.HandlerStatus;
import io.github.wycst.wast.flow.definition.Status;
import io.github.wycst.wast.flow.entitys.NodeInstanceEntity;

import java.util.Date;

/**
 * 通过数据库中load实例
 *
 * @Author wangyunchao
 * @Date 2023/1/12 17:33
 */
class PersistenceNodeInstance extends NodeInstance {

    private final NodeInstanceEntity persistenceInstance;

    PersistenceNodeInstance(NodeInstanceEntity persistenceInstance, RuntimeNode node, ProcessInstance processInstance) {
        super(persistenceInstance.getNodeInstanceId(), node, processInstance);
        this.persistenceInstance = persistenceInstance;
    }

    public NodeInstanceEntity getPersistenceInstance() {
        return persistenceInstance;
    }

    @Override
    public NodeInstance getPrev() {
        return null;
    }

    @Override
    public Date getInDate() {
        return persistenceInstance.getInDate();
    }

    @Override
    public Date getOutDate() {
        return persistenceInstance.getOutDate();
    }

    @Override
    public Status getStatus() {
        return persistenceInstance.getInstanceStatus();
    }

    @Override
    public HandlerStatus getHandlerStatus() {
        return persistenceInstance.getHandlerStatus();
    }
}
