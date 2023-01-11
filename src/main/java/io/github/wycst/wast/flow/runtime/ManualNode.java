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
    private String actorOwnerKey;
    private boolean fixedOwner;

    public ManualNode(String id, String name, RuleProcess process, ManualOption manualOption) {
        super(id, name, process);
        this.manualOption = manualOption == null ? new ManualOption() : manualOption;
        this.setActorOwnerKey(this.manualOption.getActorOwner());
    }

    // if static value or ${key}
    public void setActorOwnerKey(String actorOwner) {
        if (actorOwner == null) {
            actorOwnerKey = null;
        } else {
            if ((actorOwner = actorOwner.trim()).startsWith("${") && actorOwner.endsWith("}")) {
                actorOwnerKey = actorOwner.substring(2, actorOwner.length() - 1);
            } else {
                actorOwnerKey = actorOwner;
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
        super.runIn(nodeInstance, processInstance);
        // init task
        initTask(nodeInstance, processInstance);
    }

    private void initTask(NodeInstance nodeInstance, ProcessInstance processInstance) {
        Task task = new Task();
        task.setId(IdGenerator.hex());
        task.setNodeInstance(nodeInstance);
        // load actorOwnerId and task participants from processInstance
        parseActorOwner(task, processInstance);
        processInstance.addTask(task);
    }

    private void parseActorOwner(Task task, ProcessInstance processInstance) {
        // 初始化状态
        task.setTaskStatus(Status.Ready);
        // 上下文中读取actorOwner
        Map<String, Object> context = processInstance.getContext();
        if (fixedOwner) {
            task.setActorOwnerId(actorOwnerKey);
            task.setTaskStatus(Status.Running);
        } else {
            String swimlane = manualOption.getSwimlane();
            if (swimlane != null) {
                // 如果配置了泳道，优先使用

            } else {
                Object value = context.get(actorOwnerKey);
                if (value == null) {
                    throw new FlowRuntimeException(String.format("Error: value not found for actorOwnerKey '%s', node: %s", actorOwnerKey, nodeToString));
                }
                String actorOwnerValue = null;
                if (value instanceof Collection || (actorOwnerValue = value.toString()).indexOf(",") > -1) {
                    Collection actorOwnerList;
                    if (actorOwnerValue == null) {
                        actorOwnerList = (Collection) value;
                    } else {
                        actorOwnerList = Arrays.asList(actorOwnerValue.split(","));
                    }
                    task.setTaskStatus(Status.Ready);
                    List<TaskParticipant> taskParticipants = new ArrayList<TaskParticipant>();
                    for (Object actorOwner : actorOwnerList) {
                        TaskParticipant taskParticipant = new TaskParticipant();
                        taskParticipant.setTaskId(task.getId());
                        taskParticipant.setParticipant(actorOwner.toString());
                        taskParticipants.add(taskParticipant);
                    }
                    task.setTaskParticipants(taskParticipants);
                } else {
                    task.setTaskStatus(Status.Running);
                    task.setActorOwnerId(actorOwnerValue);
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
