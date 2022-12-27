package io.github.wycst.wast.flow.runtime;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * @Author wangyunchao
 * @Date 2022/12/27 12:43
 */
public class JoinCountContext {

    private final AtomicInteger count;

    JoinCountContext(int value) {
        count = new AtomicInteger(value);
    }

    int decrementAndGet() {
        return count.decrementAndGet();
    }

}
