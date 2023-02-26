package io.github.wycst.wast.flow.definition;

/**
 * 事件信息
 *
 * @Author: wangy
 * @Date: 2023/2/26 23:08
 * @Description:
 */
public interface EventContext extends NodeContext {

    /**
     * 获取事件类型
     *
     * @return
     */
    EventType getType();


}
