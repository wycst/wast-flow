package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Consts;
import io.github.wycst.wast.flow.definition.GatewayType;

import java.util.ArrayList;
import java.util.List;

/**
 * 聚合节点，多进单出
 *
 * @Author wangyunchao
 * @Date 2021/12/6 16:03
 */
public class JoinNode extends RuntimeNode {

    // Not much use at the moment
    private final GatewayType gatewayType;

    public JoinNode(String id, String name, RuleProcess process, GatewayType gatewayType) {
        super(id, name == null ? Consts.JoinNodeName : name, process);
        this.gatewayType = gatewayType;
    }

    @Override
    public final boolean isJoin() {
        return true;
    }

    /**
     * 处理汇聚逻辑
     *
     * @param processInstance
     * @return
     */
    @Override
    protected boolean beforeRun(ProcessInstance processInstance, NodeInstance prev) {
        RuntimeConnect prevConnect = prev.getNode().getOutConnect(id);
        List<List<String>> unCompletedPaths = processInstance.getJoinPaths(id);
        synchronized (processInstance) {
            completeJoinPaths(prevConnect, unCompletedPaths);
            return unCompletedPaths.isEmpty();
        }
//        JoinCountContext joinCountContext = processInstance.getJoinCountContext(getId());
//        if (joinCountContext == null) return true;
//        int value = joinCountContext.decrementAndGet();
//        // complete current and continue await
//        joinCountContext.completeAndAwait();
//        if (value == 0) {
//            processInstance.removeJoinCountContext(getId());
//            return true;
//        }
//        return false;
    }

    private void completeJoinPaths(RuntimeConnect prevConnect, List<List<String>> joinPaths) {
        String connectId = prevConnect.getId();
        List<List<String>> safelyPaths = new ArrayList<List<String>>(joinPaths);
        for(List<String> path : safelyPaths) {
            if(path.contains(connectId)) {
                joinPaths.remove(path);
            }
        }
    }

    @Override
    public String toString() {
        return "JoinNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
