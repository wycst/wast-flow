package io.github.wycst.wast.flow.runtime;

/**
 * 开始节点（单出）
 *
 * @Author wangyunchao
 * @Date 2021/12/6 14:48
 */
public class StartNode extends RuntimeNode {

    public StartNode(String id, String name, RuleProcess process) {
        super(id, name, process);
    }

    @Override
    public boolean isStart() {
        return true;
    }

    /**
     * 启动
     *
     * @param processInstance
     */
    void start(ProcessInstance processInstance) throws Exception {
        run(processInstance, null);
    }

    @Override
    public String toString() {
        return "StartNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
