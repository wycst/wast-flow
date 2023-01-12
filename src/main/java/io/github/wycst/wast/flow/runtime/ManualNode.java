package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.common.idgenerate.providers.IdGenerator;
import io.github.wycst.wast.flow.definition.ManualOption;
import io.github.wycst.wast.flow.definition.Status;
import io.github.wycst.wast.flow.exception.FlowRuntimeException;

import java.util.*;

/**
 * 人工节点（工作流场景生成待办）
 *
 * @Author wangyunchao
 * @Date 2021/12/6 14:52
 */
public class ManualNode extends RuntimeNode {

    private final ManualOption manualOption;
    private String actualOwnerKey;
    private boolean fixedOwner;

    public ManualNode(String id, String name, RuleProcess process, ManualOption manualOption) {
        super(id, name, process);
        this.manualOption = manualOption == null ? new ManualOption() : manualOption;
        this.setActualOwnerKey(this.manualOption.getActualOwner());
    }

    // if static value or ${key}
    public void setActualOwnerKey(String actualOwner) {
        if (actualOwner == null) {
            actualOwnerKey = null;
        } else {
            if ((actualOwner = actualOwner.trim()).startsWith("${") && actualOwner.endsWith("}")) {
                actualOwnerKey = actualOwner.substring(2, actualOwner.length() - 1);
            } else {
                actualOwnerKey = actualOwner;
                fixedOwner = true;
            }
        }
    }

    /**
     * 工作流发生异常时需要回滚操作
     *
     * @return
     */
    @Override
    protected boolean rollbackIfException() {
        return true;
    }

    @Override
    protected boolean isAutoCompleted() {
        return manualOption.isAutoComplete();
    }

    @Override
    protected void runIn(NodeInstance nodeInstance, ProcessInstance processInstance) {
        try {
            super.runIn(nodeInstance, processInstance);
            // init node instance
            initNodeInstance(nodeInstance, processInstance);
            // init task
            initTask(nodeInstance, processInstance);
        } catch (Throwable throwable) {
            processInstance.setThrowableAndRollback(throwable, true);
        }
    }

    /**
     * 更新实例对象
     *
     * @param processInstance
     * @param nodeInstance
     */
    @Override
    protected void afterComplete(ProcessInstance processInstance, NodeInstance nodeInstance) {
        processInstance.getExecuteEngine().completeNodeInstance(nodeInstance);
    }

    private void initNodeInstance(NodeInstance nodeInstance, ProcessInstance processInstance) {
        // node status
        nodeInstance.setStatus(Status.Running);
        // save nodeInstance
        processInstance.getExecuteEngine().persistenceNodeInstance(nodeInstance);
    }

    private void initTask(NodeInstance nodeInstance, ProcessInstance processInstance) {
        Task task = new Task();
        task.setId(IdGenerator.hex());
        task.setNodeInstance(nodeInstance);
        // load actualOwnerId and task participants from processInstance
        resolveActualOwner(task, nodeInstance, processInstance);
        processInstance.addTask(task);
    }

    private void resolveActualOwner(Task task, NodeInstance nodeInstance, ProcessInstance processInstance) {
        // 初始化状态
        task.setTaskStatus(Status.Ready);
        if (fixedOwner) {
            task.setActualOwnerId(actualOwnerKey);
            task.setTaskStatus(Status.Running);
            // 记录当前受理人
            processInstance.recordActorOwner(nodeInstance.getNode().getId(), actualOwnerKey);
        } else {
            String swimlane = manualOption.getSwimlane();
            if (swimlane != null) {
                // 如果配置了泳道，优先使用
                // 实例上下文记录了每个环节的历史受理人，根据节点环节id去查找
                String actualOwnerValue = processInstance.historyActorOwner(nodeInstance.getNode().getId());
                task.setActualOwnerId(actualOwnerValue);
                task.setTaskStatus(Status.Running);
            } else {
                // 上下文中读取actualOwner
                Map<String, Object> context = processInstance.getVariables();
                Object value = context.get(actualOwnerKey);
                if (value == null) {
                    throw new FlowRuntimeException(String.format("Error: Task ActualOwner not found for key '%s' by context, %s", actualOwnerKey, nodeToString));
                }
                String actualOwnerValue = null;
                if (value instanceof Collection || (actualOwnerValue = value.toString()).indexOf(",") > -1) {
                    Collection actualOwnerList;
                    if (actualOwnerValue == null) {
                        actualOwnerList = (Collection) value;
                    } else {
                        actualOwnerList = Arrays.asList(actualOwnerValue.split(","));
                    }
                    List<TaskParticipant> taskParticipants = new ArrayList<TaskParticipant>();
                    for (Object actualOwner : actualOwnerList) {
                        TaskParticipant taskParticipant = new TaskParticipant();
                        taskParticipant.setTaskId(task.getId());
                        taskParticipant.setParticipant(actualOwner.toString());
                        taskParticipants.add(taskParticipant);
                    }
                    task.setTaskParticipants(taskParticipants);
                } else {
                    task.setTaskStatus(Status.Running);
                    task.setActualOwnerId(actualOwnerValue);
                    processInstance.recordActorOwner(nodeInstance.getNode().getId(), actualOwnerValue);
                }
            }
        }
    }

    @Override
    public String toString() {
        return "ManualNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
