package io.github.wycst.wast.flow.exception;

/**
 * 流程运行时异常
 *
 * @Author wangyunchao
 * @Date 2022/11/29 9:27
 */
public class FlowDeploymentException extends RuntimeException {

//    private String processId;
//    private String processInstanceId;
//    private String nodeId;
//    private String nodeInstanceId;
//    private String nodeName;
//    private String deploymentId;

    public FlowDeploymentException() {
    }

    public FlowDeploymentException(String message) {
        super(message);
    }

    public FlowDeploymentException(String message, Throwable cause) {
        super(message, cause);
    }

    public FlowDeploymentException(Throwable cause) {
        super(cause);
    }
}
