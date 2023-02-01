import {bindDomEvent} from "./util";

/***
 * set or get prop value
 *
 * @param target
 * @param args
 * @returns {null|*}
 */
function getOrSetValue(target, args) {
    let len = args.length;
    if (len == 0) return target;
    let key = args[0];
    let value = args[1];
    if (!key) return null;
    if (typeof key == 'string') {
        return len == 2 ? (target[key] = value) : target[key];
    }
    if (typeof key == 'object' && len == 1) {
        for (let i in key) {
            target[i] = key[i];
        }
        return key;
    }
    return null;
}

// 维护样式key
const stylePropSet = ["x", "y", "width", "height", "cursor", "text-anchor", "font-family", "font-size", "font-style", "left", "top", "width", "height", "opacity", "color"];

/**
 * dom设置属性（移除属性）
 *
 * @param domElement
 * @param attrKey
 * @param attrValue
 */
function setAndRemoveAttr(domElement, attrKey, attrValue) {
    // attr中的键值对如果是样式，处理dom的样式
    if (stylePropSet.includes(attrKey)) {
        setAndRemoveStyle(domElement, attrKey, attrValue);
        return;
    }
    // 设置dom的属性
    if (attrValue) {
        domElement.setAttribute(attrKey, attrValue.toString());
    } else {
        domElement.removeAttribute(attrKey);
    }
}

/**
 * dom设置样式
 *
 * @param domElement
 * @param styleKey
 * @param styleValue
 */
function setAndRemoveStyle(domElement, styleKey, styleValue) {
    switch (styleKey) {
        case 'x': {
            domElement.style.left = `${styleValue}px`;
            break;
        }
        case 'y': {
            domElement.style.top = `${styleValue}px`;
            break;
        }
        case 'width': {
            domElement.style.width = `${styleValue}px`;
            break;
        }
        case 'height': {
            domElement.style.height = `${styleValue}px`;
            break;
        }
        default: {
            domElement.style[styleKey] = styleValue ? styleValue.toString() : null;
        }
    }
}

// ID使用长整数序列（时间戳/1000+序号（小于1000））转36进制字符串

let lastSeconds = -1;
let seq = 0;

/**
 * 生成唯一id（每秒生成1000个id在单线程UI前端已够用）
 *
 * @returns {string}
 */
function id() {
    let time = Date.now();
    let seconds = time - time % 1000;
    if (lastSeconds == seconds) {
        if (seq == 1000) {
            while (lastSeconds == seconds) {
                time = Date.now();
                seconds = time - time % 1000;
            }
            seq = 0;
        }
        return (seconds + seq++).toString(36);
    }
    seq = 0;
    lastSeconds = seconds;
    return seconds.toString(36);
}

/**
 * 元素数据类定义对象
 */
class ElementData {

    /**
     * 元素数据构造函数
     */
    constructor(node) {
        // 生成id
        this.id = id();
        // dom节点
        this.node = node;
        // 类型： html
        this.type = "html";
        // 数据属性
        this.datas = {};
        // 节点属性（可修改属性）
        this.attrs = {};
    };

    /**
     * 更新node内容
     *
     * @param html
     */
    updateHTML(html) {
        this.node.innerHTML = html;
    };

    /**
     * 提供元素拖动api
     *
     * @param moveFn
     * @param startFn
     * @param upFn
     * @returns {ElementData}
     */
    drag(moveFn, startFn, upFn) {
        // context
        let dragContext = {};
        // start
        const onDragStart = (event) => {
            const {pageX, pageY} = event;
            Object.assign(dragContext, {pageX, pageY})
            if (typeof startFn == 'function') {
                startFn(event);
            }
        }
        // move
        const onDragMove = (event) => {
            if (typeof moveFn == 'function') {
                // computer dx, dy
                const {pageX, pageY} = event;
                let {pageX: x1, pageY: y1} = dragContext;
                moveFn(pageX - x1, pageY - y1, event);
            }
        }
        // up(end)
        const onDragUp = (event) => {
            if (typeof upFn == 'function') {
                upFn(event);
            }
            delete dragContext.pageX;
            delete dragContext.pageY;
            document.removeEventListener("mousemove", onDragMove);
            document.removeEventListener("mouseup", onDragUp);
        }
        // 拖动处理
        bindDomEvent(this.node, "mousedown", function (event) {
            onDragStart(event);
            document.addEventListener("mousemove", onDragMove);
            document.addEventListener("mouseup", onDragUp);
            event.stopPropagation();
            event.preventDefault();
        });
        return this;
    };

    /**
     * 绑定点击事件
     *
     * @param func
     */
    click(func) {
        bindDomEvent(this.node, "click", func);
        return this;
    };

    /**
     * 双击事件
     *
     * @param func
     */
    dblclick(func) {
        bindDomEvent(this.node, "dblclick", func);
        return this;
    };

    /**
     * 绑定鼠标over事件
     *
     * @param func
     * @returns {ElementData}
     */
    mouseover(func) {
        let me = this;
        bindDomEvent(this.node, "mouseover", (event) => {
            func.call(me, event);
        });
        return this;
    };

    /**
     * 绑定鼠标out事件
     *
     * @param func
     * @returns {ElementData}
     */
    mouseout(func) {
        let me = this;
        bindDomEvent(this.node, "mouseout", (event) => {
            func.call(me, event);
        });
        return this;
    };

    /**
     * 隐藏元素
     *
     * @returns {ElementData}
     */
    hide() {
        setAndRemoveStyle(this.node, "display", "none");
        this.hidden = true;
        return this;
    };

    /**
     * 显示元素
     *
     * @returns {ElementData}
     */
    show() {
        setAndRemoveStyle(this.node, "display", null);
        this.hidden = false;
        return this;
    };

    /**
     * 是否隐藏
     *
     * @returns {boolean|*}
     */
    isHidden() {
        return this.hidden;
    };

    /**
     * 元素（节点属性）属性设置获取读取,并更新节点的属性列表
     */
    attr() {
        let len = arguments.length;
        let p1 = arguments[0];
        let p2 = arguments[1];
        let type = typeof p1;
        let setterMode = false;
        if (len == 1) {
            if (type == 'object' && p1) {
                setterMode = true;
                for (let attrKey in p1) {
                    let attrValue = p1[attrKey];
                    setAndRemoveAttr(this.node, attrKey, attrValue);
                }
            }
        } else if (len > 1) {
            if (type == 'string') {
                setAndRemoveAttr(this.node, p1, p2);
                setterMode = true;
            }
        }
        let result = getOrSetValue(this.attrs || (this.attrs = {}), arguments);
        return setterMode ? this : result;
    };

    /**
     * 数据属性设置或者读取
     */
    data() {
        let len = arguments.length;
        let p1 = arguments[0];
        let setterMode = len > 1 || (p1 && typeof p1 == "object");
        let result = getOrSetValue(this.datas || (this.datas = {}), arguments);
        return setterMode ? this : result;
    };

    /**
     * 移除一个data属性
     *
     * @param key
     */
    removeData(key) {
        delete this.datas[key];
    };

    /**
     * 移除元素,并释放内存
     */
    remove() {
        this.node.remove();
        this.attrs = null;
        this.datas = null;
        this.removed = true;
    };
}

export {ElementData};