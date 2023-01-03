package io.github.wycst.wast.flow.definition;

/**
 * @Author wangyunchao
 * @Date 2022/12/1 13:56
 */
public class HandlerOption {

    /**
     * 需要延迟的场景下可以配置延迟执行，单位: 毫秒
     */
    private long delay;

    /**
     * 启用脚本
     *
     */
    private boolean enableScript;

    /**
     * 脚本内容
     */
    private String script;

    /**
     * 迭代次数,大于1时启用循环迭代
     */
    private int iterate;

    /**
     * 超时配置,单位：毫秒
     */
    private int timeout;

    /**
     * 是否异步
     */
    private boolean asynchronous;

    /**
     * 错误时重试
     */
    private boolean retryOnError;

    /**
     * 重试次数
     */
    private int retryCount;

    /**
     * 失败策略(捕获异常).默认终止
     */
    private FailurePolicy policy = FailurePolicy.Stop;

    /**
     * 是否跳过
     * */
    private boolean skip;

    public long getDelay() {
        return delay;
    }

    public void setDelay(long delay) {
        this.delay = delay;
    }

    public boolean isEnableScript() {
        return enableScript;
    }

    public void setEnableScript(boolean enableScript) {
        this.enableScript = enableScript;
    }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }

    public int getIterate() {
        return iterate;
    }

    public void setIterate(int iterate) {
        this.iterate = iterate;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public boolean isAsynchronous() {
        return asynchronous;
    }

    public void setAsynchronous(boolean asynchronous) {
        this.asynchronous = asynchronous;
    }

    public FailurePolicy getPolicy() {
        return policy;
    }

    public void setPolicy(FailurePolicy policy) {
        this.policy = policy;
    }

    public boolean isRetryOnError() {
        return retryOnError;
    }

    public void setRetryOnError(boolean retryOnError) {
        this.retryOnError = retryOnError;
    }

    public int getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(int retryCount) {
        this.retryCount = retryCount;
    }

    public boolean isSkip() {
        return skip;
    }

    public void setSkip(boolean skip) {
        this.skip = skip;
    }
}
