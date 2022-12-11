package io.github.wycst.wast.flow.definition;

/**
 * @Author wangyunchao
 * @Date 2021/12/6 15:26
 */
public class ConnectPath {

    // base
    private Point start;
    private Point end;

    // 路径类型：
    private int type;
    // 二次贝塞尔曲线指令 (Q,T)
    // M10 80 Q 52.5 10, 95 80 T 180 80
    // start - M
    // qs = 52.5 10
    // qn = 95 80
    // end = 180 80
    private Point qs;
    private Point qn;

    public Point getStart() {
        return start;
    }

    public void setStart(Point start) {
        this.start = start;
    }

    public Point getEnd() {
        return end;
    }

    public void setEnd(Point end) {
        this.end = end;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }

    public Point getQs() {
        return qs;
    }

    public void setQs(Point qs) {
        this.qs = qs;
    }

    public Point getQn() {
        return qn;
    }

    public void setQn(Point qn) {
        this.qn = qn;
    }


}
