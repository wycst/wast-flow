package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Consts;
import io.github.wycst.wast.flow.definition.GatewayType;

import java.util.ArrayList;
import java.util.List;

/**
 * 聚合节点，多进单出
 *
 * <p> 汇聚目前只会激活一次，如果存在回退的场景汇聚将失效；</p>
 * <p> 需要考虑重新激活的时机； </p>
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
        List<List<String>> unCompletedPaths = processInstance.getJoinPaths(id);
        if(unCompletedPaths.isEmpty()) return true;
        RuntimeConnect prevConnect = prev.getNode().getOutConnect(id);
        synchronized (unCompletedPaths) {
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
//        int len = joinPaths.size();
//        for (int i = len - 1; i > -1; --i) {
//            List<String> path = joinPaths.get(i);
//            if(path.contains(connectId)) {
//                joinPaths.remove(path);
//            }
//        }
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
