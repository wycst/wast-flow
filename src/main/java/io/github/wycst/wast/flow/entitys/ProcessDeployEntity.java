package io.github.wycst.wast.flow.entitys;

import io.github.wycst.wast.flow.definition.ResourceKind;
import io.github.wycst.wast.jdbc.annotations.Id;
import io.github.wycst.wast.jdbc.annotations.Table;

import java.util.Date;

/**
 * 发布流程实体信息
 * <p> table: wrf_process_deploy
 *
 * @Author wangyunchao
 * @Date 2022/12/1 21:51
 */
@Table(name = "wrf_process_deploy")
public class ProcessDeployEntity implements IEntity, Comparable<ProcessDeployEntity> {

    // 主键(部署id)
    @Id(strategy = Id.GenerationType.AutoAlg)
    private String id;

    // 流程id（存在相同多个processId的不同版本）
    private String processId;

    // 流程名称
    private String processName;

    /**
     * 资源类型：JSON/BPMN2
     */
    private ResourceKind resourceKind = ResourceKind.JSON;

    /**
     * 资源内容（longtext字段）
     */
    private String resourceContent;

    // 发布版本（自动生成唯一编号）
    private String version;

    // 创建时间/发布时间
    private Date deployDate;

    // 创建人/发布人
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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Date getDeployDate() {
        return deployDate;
    }

    public void setDeployDate(Date deployDate) {
        this.deployDate = deployDate;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    @Override
    public int compareTo(ProcessDeployEntity o) {
        return version.compareTo(o.getVersion());
    }
}
