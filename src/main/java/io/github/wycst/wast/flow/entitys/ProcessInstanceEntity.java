package io.github.wycst.wast.flow.entitys;

import io.github.wycst.wast.flow.definition.Status;
import io.github.wycst.wast.jdbc.annotations.Id;
import io.github.wycst.wast.jdbc.annotations.Table;

import java.util.Date;

/**
 * 流程实例表
 *
 * <p> table: wrf_process_instance
 *
 * @Author wangyunchao
 *
 * @Date 2022/11/29 11:15
 */
@Table(name = "wrf_process_instance")
public class ProcessInstanceEntity implements IEntity {

    // 实例id
    @Id(strategy = Id.GenerationType.AutoAlg)
    private String id;

    // 父流程实例id
    private String parentId;

    // 流程id
    private String processId;

    // 流程名称
    private String processName;

    // 创建时间
    private Date createDate;

    // 启动时间
    private Date completedDate;

    // 最后一次修改时间
    private Date lastModifyDate;

    // 当前状态
    private Status instanceStatus;

    // 创建人id
    private String creator;

    // 流程版本号
    private String processVersion;

//    // 参数
//    private String variables;

    // 上下文
    private String context;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getProcessId() {
        return processId;
    }

    public void setProcessId(String processId) {
        this.processId = processId;
    }

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Date getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(Date completedDate) {
        this.completedDate = completedDate;
    }

    public Date getLastModifyDate() {
        return lastModifyDate;
    }

    public void setLastModifyDate(Date lastModifyDate) {
        this.lastModifyDate = lastModifyDate;
    }

    public Status getInstanceStatus() {
        return instanceStatus;
    }

    public void setInstanceStatus(Status instanceStatus) {
        this.instanceStatus = instanceStatus;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getProcessVersion() {
        return processVersion;
    }

    public void setProcessVersion(String processVersion) {
        this.processVersion = processVersion;
    }

//    public String getVariables() {
//        return variables;
//    }
//
//    public void setVariables(String variables) {
//        this.variables = variables;
//    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }
}
