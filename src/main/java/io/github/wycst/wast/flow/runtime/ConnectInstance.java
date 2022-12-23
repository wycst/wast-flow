package io.github.wycst.wast.flow.runtime;

import io.github.wycst.wast.flow.definition.ConnectStatus;

import java.util.Date;

/**
 * 连线实例
 *
 * @Author wangyunchao
 * @Date 2022/12/23 10:30
 */
public class ConnectInstance {

    private final RuntimeConnect connect;
    private ConnectStatus connectStatus;
    private Date executeTime;

    public ConnectInstance(RuntimeConnect connect) {
        this.connect = connect;
    }

    public RuntimeConnect getConnect() {
        return connect;
    }

    public ConnectStatus getConnectStatus() {
        return connectStatus;
    }

    public void setConnectStatus(ConnectStatus connectStatus) {
        this.connectStatus = connectStatus;
    }

    public Date getExecuteTime() {
        return executeTime;
    }

    public void setExecuteTime(Date executeTime) {
        this.executeTime = executeTime;
    }
}
