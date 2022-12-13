package io.github.wycst.wast.flow.runtime;

/**
 * 人工节点（工作流场景生成待办）
 *
 * @Author wangyunchao
 * @Date 2021/12/6 14:52
 */
public class ManualNode extends RuntimeNode {

    public ManualNode(String id, String name, RuleProcess process) {
        super(id, name, process);
    }

    /**
     * 工作流发生异常时必须回滚操作
     *
     * @return
     */
    @Override
    protected boolean rollbackIfException() {
        return true;
    }

    @Override
    public String toString() {
        return "ManualNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
