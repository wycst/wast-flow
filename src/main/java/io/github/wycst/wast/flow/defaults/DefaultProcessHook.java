package io.github.wycst.wast.flow.defaults;

import io.github.wycst.wast.flow.definition.ProcessHook;
import io.github.wycst.wast.flow.runtime.NodeInstance;
import io.github.wycst.wast.flow.runtime.ProcessInstance;

/**
 * @Author wangyunchao
 * @Date 2022/12/1 15:02
 */
public class DefaultProcessHook implements ProcessHook {

    @Override
    public void onStarted(ProcessInstance processInstance) {

    }

    @Override
    public void onNodeEnter(ProcessInstance processInstance, NodeInstance nodeInstance) {

    }

    @Override
    public void onNodeLeave(ProcessInstance processInstance, NodeInstance nodeInstance) {

    }

    @Override
    public void onStoped(ProcessInstance processInstance, NodeInstance nodeInstance) {

    }

    @Override
    public void onCompleted(ProcessInstance processInstance) {

    }
}
