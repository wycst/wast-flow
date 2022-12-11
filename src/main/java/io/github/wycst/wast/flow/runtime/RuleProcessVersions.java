package io.github.wycst.wast.flow.runtime;

import java.util.Collection;
import java.util.Collections;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 * @Author wangyunchao
 * @Date 2022/12/2 11:15
 */
class RuleProcessVersions {

    // 流程id
    final String processId;

    // 版本号映射
    final SortedMap<String, RuleProcess> versions = new TreeMap<String, RuleProcess>();

    // 构造实例
    public RuleProcessVersions(String processId) {
        this.processId = processId;
    }

    /**
     * 添加版本
     *
     * @param version
     * @param ruleProcess
     */
    public void addVersion(String version, RuleProcess ruleProcess) {
        versions.put(version, ruleProcess);
    }

    /**
     * 移除版本
     *
     * @param version
     */
    public void removeVersion(String version) {
        versions.remove(version);
    }

    /**
     * 最新版本
     *
     * @return
     */
    public RuleProcess latest() {
        String lastVersion = versions.lastKey();
        return versions.get(lastVersion);
    }

    /**
     * 最新版本
     *
     * @return
     */
    public RuleProcess getVersion(String version) {
        return versions.get(version);
    }

    /**
     * 获取所有版本
     *
     * @return
     */
    public Collection<RuleProcess> values() {
        return Collections.unmodifiableCollection(versions.values());
    }

    /**
     * 返回流程标识
     *
     * @return
     */
    public String getProcessId() {
        return processId;
    }

    public void destroy() {
        for(RuleProcess ruleProcess : versions.values()) {
            ruleProcess.destroy();
        }
        versions.clear();
    }
}
