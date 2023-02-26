package io.github.wycst.wast.flow.definition;

/**
 * 消息事件处理器
 *
 * @Author: wangy
 * @Date: 2023/2/26 23:04
 * @Description:
 */
public interface EventHandler {

    // undo instance
    EventHandler UndoHandler = new EventHandler() {
        @Override
        public void handle(EventContext eventContext) throws Exception {
        }
    };

    /**
     * 执行实现
     *
     * @param eventContext
     */
    void handle(EventContext eventContext) throws Exception;
}
