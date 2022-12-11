package io.github.wycst.wast.flow.entitys;

import io.github.wycst.wast.flow.definition.ResourceKind;
import io.github.wycst.wast.flow.deployment.DeploymentProcess;
import io.github.wycst.wast.jdbc.annotations.Column;
import io.github.wycst.wast.jdbc.annotations.Id;
import io.github.wycst.wast.jdbc.annotations.Table;

import java.util.Date;

/**
 * 流程定义维护
 * <p> table: wrf_process_definition
 *
 * @Author wangyunchao
 * @Date 2022/12/2 8:54
 */
@Table(name = "wrf_process_definition")
public class ProcessDefinitionEntity implements IEntity {

    /**
     * 主键
     */
    @Id(strategy = Id.GenerationType.AutoAlg)
    private String id;

    /**
     * 流程标识（processKey, 唯一不能重复）
     */
    @Column
    private String processId;

    /**
     * 流程名称/标题
     */
    private String processName;

    /**
     * 流程状态: 草稿(Draft)/启用(Enabled)/停用(Disabled)
     */
    private Status processStatus = Status.Draft;

    /**
     * 模式: Simple/Standard
     */
    private DeploymentProcess.Mode processMode = DeploymentProcess.Mode.Standard;

    /**
     * 流程描述
     */
    private String processDescribe;

    /**
     * 资源类型：JSON/BPMN2
     */
    private ResourceKind resourceKind = ResourceKind.JSON;

    /**
     * 资源内容（longtext字段）
     */
    private String resourceContent;

    /**
     * 创建时间
     */
    private Date createDate;

    /**
     * 最后一次修改时间
     */
    private Date lastModifyDate;

    /**
     * 创建人
     */
    private String creator;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Status getProcessStatus() {
        return processStatus;
    }

    public void setProcessStatus(Status processStatus) {
        this.processStatus = processStatus;
    }

    public DeploymentProcess.Mode getProcessMode() {
        return processMode;
    }

    public void setProcessMode(DeploymentProcess.Mode processMode) {
        this.processMode = processMode;
    }

    public String getProcessDescribe() {
        return processDescribe;
    }

    public void setProcessDescribe(String processDescribe) {
        this.processDescribe = processDescribe;
    }

    public ResourceKind getResourceKind() {
        return resourceKind;
    }

    public void setResourceKind(ResourceKind resourceKind) {
        this.resourceKind = resourceKind;
    }

    public String getResourceContent() {
        return resourceContent;
    }

    public void setResourceContent(String resourceContent) {
        this.resourceContent = resourceContent;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Date getLastModifyDate() {
        return lastModifyDate;
    }

    public void setLastModifyDate(Date lastModifyDate) {
        this.lastModifyDate = lastModifyDate;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public enum Status {
        Draft, Enabled, Disabled
    }
}
