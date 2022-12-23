package io.github.wycst.wast.flow.definition;

/**
 * 连线运行handler
 */
public interface ConnectHandler {

    /**
     * 根据连线的信息业务自行判断是通过还是拒绝
     *
     * @param connectContext
     * @return true/通过； false拒绝；
     * @throws Exception
     */
    boolean handle(ConnectContext connectContext) throws Exception;

}
