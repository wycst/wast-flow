package io.github.wycst.wast.flow.definition;

/**
 * 节点引擎
 *
 * @Author wangyunchao
 * @Date 2022/11/30 20:39
 */
public interface NodeEngine {

    /**
     * 注册handler进行自定义处理
     * note: 会覆盖缺省handler
     *
     * @param type
     * @param nodeHandler
     */
    public void registerHandler(Node.Type type, NodeHandler nodeHandler);

    /**
     * 获取指定节点类型的handler
     *
     * @param type
     */
    public NodeHandler getHandler(Node.Type type);

}
