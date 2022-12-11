package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.Status;

import java.util.Date;

/**
 * 待办任务
 *
 * @Author wangyunchao
 * @Date 2022/11/29 18:17
 */
public class Task {

    // 待办id
    private String id;

    // 节点id
    private String nodeId;

    // 节点名称
    private String nodeName;

    // 流程id
    private String processId;

    // 流程实例id
    private String processInstanceId;

    // 流程名称
    private String processName;

    // 到达时间
    private Date arrivalDate;

    // 到达时间
    private Date lastModifyDate;

    // 完成时间
    private Date completeDate;

    // 当前状态
    private Status status;

    // 待办处理人
    private String actorId;
}
