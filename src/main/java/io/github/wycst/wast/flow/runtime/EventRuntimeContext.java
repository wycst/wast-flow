package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.EventContext;
import io.github.wycst.wast.flow.definition.EventType;

/**
 * @Author wangyunchao
 * @Date 2023/2/27 14:08
 */
public class EventRuntimeContext extends NodeRuntimeContext implements EventContext {

    private final EventType eventType;

    EventRuntimeContext(EventType eventType, NodeInstance nodeInstance) {
        super(nodeInstance);
        this.eventType = eventType;
    }

    @Override
    public EventType getType() {
        return eventType;
    }
}
