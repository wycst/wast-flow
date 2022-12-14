package io.github.wycst.wast.flow.definition;

import io.github.wycst.wast.common.utils.StringUtils;
import io.github.wycst.wast.flow.deployment.DeploymentProcess;
import io.github.wycst.wast.json.JSON;

/**
 * @Author wangyunchao
 * @Date 2022/11/29 14:11
 */
public abstract class FlowResource {

    final protected ResourceKind resourceKind;
    final protected String source;
    protected DeploymentProcess deploymentProcess;

    FlowResource(ResourceKind resourceKind, String source) {
        this.resourceKind = resourceKind;
        this.source = source;
    }

    public ResourceKind getResourceKind() {
        return resourceKind;
    }

    public String getSource() {
        return source;
    }

    public DeploymentProcess getDeploymentProcess() {
        return deploymentProcess;
    }

    public static FlowResource ofJson(String json) {
        return new JsonFlowResource(json);
    }

    public static FlowResource of(ResourceKind resourceKind, String resourceContent) {
        if(StringUtils.isEmpty(resourceContent)) {
            throw new RuntimeException("content is null");
        }
        switch (resourceKind) {
            case JSON:
                return FlowResource.ofJson(resourceContent);
            default: {
                throw new UnsupportedOperationException();
            }
        }
    }

    /**
     * JSON 格式源
     */
    static class JsonFlowResource extends FlowResource {

        public JsonFlowResource(String json) {
            super(ResourceKind.JSON, json);
            deploymentProcess = JSON.parseObject(json, DeploymentProcess.class);
        }
    }

}
