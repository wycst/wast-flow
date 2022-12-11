package io.github.wycst.wast.flow.runtime;

/**
 * 服务节点
 *
 * @Author wangyunchao
 * @Date 2021/12/6 16:04
 */
public class ServiceNode extends RuntimeNode {

    public ServiceNode(String id, String name, RuleProcess process) {
        super(id, name, process);
    }

    @Override
    public String toString() {
        return "ServiceNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
