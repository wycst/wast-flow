//package io.github.wycst.wast.flow.runtime;
//
//import java.util.concurrent.CountDownLatch;
//import java.util.concurrent.atomic.AtomicInteger;
//
///**
// * @Author wangyunchao
// * @Date 2022/12/27 12:43
// */
//public class JoinCountContext {
//
//    private final AtomicInteger count;
//    private final CountDownLatch countDownLatch;
//
//    JoinCountContext(int value) {
//        count = new AtomicInteger(value);
//        countDownLatch = new CountDownLatch(value);
//    }
//
//    int decrementAndGet() {
//        return count.decrementAndGet();
//    }
//
//    /**
//     * 完成当前并等待未完成
//     */
//    void completeAndAwait() {
//        completeOne();
//        await();
//    }
//
//    void completeOne() {
//        countDownLatch.countDown();
//    }
//
//    void await() {
//        try {
//            countDownLatch.await();
//        } catch (InterruptedException e) {
//        }
//    }
//}
