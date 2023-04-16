package io.github.wycst.wast.flow.runtime;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * Future 集合
 */
public class FutureList {

    final List<Future> futures = new ArrayList<Future>();

    public void add(Future future) {
        futures.add(future);
    }

    public void await() {
        if (futures.isEmpty()) return;
        for (Future future : futures) {
            try {
                future.get();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        futures.clear();
    }

    public void await(long timeout, TimeUnit timeUnit) {
        for (Future future : futures) {
            try {
                future.get(timeout, timeUnit);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        futures.clear();
    }

}
