package io.github.wycst.wast.flow.definition;

/**
 * 节点引擎
 *
 * @Author wangyunchao
 * @Date 2022/11/30 20:39
 */
public interface NodeHandler {

    // undo instance
    NodeHandler UndoHandler = new NodeHandler() {
        @Override
        public void handle(NodeContext nodeContext) throws Exception {
        }
    };

    /**
     * 节点执行实现
     *
     * @param nodeContext
     */
    void handle(NodeContext nodeContext) throws Exception;

}
