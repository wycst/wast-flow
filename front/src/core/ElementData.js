import {bindDomEvent, pointsToPathD, setDomAttrs, unbindDomEvent} from "./util";

// svg namespace
export const svgNS = "http://www.w3.org/2000/svg";
export const xlinkNS = "http://www.w3.org/1999/xlink";
// default text font style
const textStyle = "font-family: Arial, sans-serif; font-size: 12px; font-weight: normal;";
const functionType = "function";

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
const stylePropSet = [
    "x", "y", "width", "height", "cursor", "text-anchor", "font-family", "font-size", "font-style", "left", "top", "width", "height", "opacity", "color", "borderColor", "max-width", "max-height"
];

/**
 * dom设置属性（移除属性）
 *
 * @param domElement
 * @param attrKey
 * @param attrValue
 */
function setAndRemoveAttr(domElement, attrKey, attrValue) {

    // attr中的键值对如果是样式，处理dom的样式
    if (!this.isSvg() && stylePropSet.includes(attrKey)) {
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
    let val = `${styleValue}px`;
    let style = domElement.style;
    switch (styleKey) {
        case 'x': {
            style.left = val;
            break;
        }
        case 'y': {
            style.top = val;
            break;
        }
        case 'width':
        case 'height': {
            style[styleKey] = val;
            break;
        }
        default: {
            style[styleKey] = styleValue;
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
export function id() {
    let time = Date.now(), n = 1000;
    let seconds = time - time % n;
    if (lastSeconds == seconds) {
        if (seq == 999) {
            while (lastSeconds == seconds) {
                time = Date.now();
                seconds = time - time % n;
            }
            seq = 0;
        }
        return (seconds + ++seq).toString(36);
    }
    seq = 0;
    lastSeconds = seconds;
    return seconds.toString(36);
}

/**
 * 获取节点上绑定的默认数据
 *
 * @param element
 * @param datas 默认数据项
 * @returns {{}}
 */
export function getElementDatas(element, datas) {
    let elementDatas = {};
    for (let i in datas) {
        let value = element.data(i);
        if (!value) {
            let defaultValue = datas[i];
            let defaultType = typeof defaultValue;
            if (defaultType == "object") {
                value = {};
            } else if (defaultType == "function") {
                value = defaultValue(element);
            } else {
                value = defaultValue;
            }
        }
        elementDatas[i] = value;
    }
    return elementDatas;
};

/**
 * 设置节点上绑定的指定数据
 *
 * @param element
 * @param datas 指定数据
 * @param node
 */
export function setElementDatas(element, datas, node) {
    for (let i in datas) {
        let value = node[i];
        if (!value) {
            let defaultValue = datas[i];
            let defaultType = typeof defaultValue;
            if (defaultType == "object") {
                value = {};
            } else if (defaultType == "function") {
                value = defaultValue(element);
            } else {
                value = defaultValue;
            }
        }
        element.data(i, value);
    }
};

/**
 * 元素数据类定义对象
 */
class ElementData {

    /**
     * 元素数据构造函数
     */
    constructor(node) {
        // dom节点
        this.node = node;
        // 数据属性
        this.datas = {};
        // 节点属性（可修改属性）
        this.attrs = {};
        // 设置id
        this.id = id();
    };

    // Change of response id
    get id() {
        return this._id;
    };

    // Change of response id
    set id(val) {
        this._id = val;
        setDomAttrs(this.node, {
            "data-id": val
        });
    };

    // Change of response name
    get name() {
        let textEle = this.data("text");
        return textEle && textEle.attr("text");
    };

    set name(val) {
        let textEle = this.data("text");
        if (textEle) {
            textEle.attr("text", val)
        }
    };

    /**
     * is svg
     * @returns {boolean}
     */
    isSvg() {
        return false;
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
        let me = this;
        let dragContext = {};
        // start
        const onDragStart = (event) => {
            const {pageX, pageY} = event;
            Object.assign(dragContext, {pageX, pageY})
            if (typeof startFn == functionType) {
                startFn.call(me, event);
            }
        }
        // move
        const onDragMove = (event) => {
            if (typeof moveFn == functionType) {
                // computer dx, dy
                const {pageX, pageY} = event;
                let {pageX: x1, pageY: y1} = dragContext;
                moveFn.call(me, pageX - x1, pageY - y1, event);
            }
        }
        // up(end)
        const onDragUp = (event) => {
            if (typeof upFn == functionType) {
                upFn.call(me, event);
            }
            delete dragContext.pageX;
            delete dragContext.pageY;
            document.removeEventListener("mousemove", onDragMove);
            document.removeEventListener("mouseup", onDragUp);
        }

        let mousedownFn = function (event) {
            onDragStart(event);
            document.addEventListener("mousemove", onDragMove);
            document.addEventListener("mouseup", onDragUp);
            event.stopPropagation();
            event.preventDefault();
        }
        this.mousedownFn = mousedownFn;

        // 拖动处理
        bindDomEvent(this.node, "mousedown", mousedownFn);
        return this;
    };

    /** unbind drag */
    undrag() {
        unbindDomEvent(this.node, "mousedown", this.mousedownFn);
    };

    /**
     * 绑定点击事件
     *
     * @param func
     */
    click(func) {
        let me = this;
        bindDomEvent(this.node, "click", (event) => {
            func.call(me, event);
        });
        return this;
    };

    /**
     * 双击事件
     *
     * @param func
     */
    dblclick(func) {
        let me = this;
        bindDomEvent(this.node, "dblclick", (event) => {
            func.call(me, event);
        });
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
     * hover组合事件
     *
     * @param mouseoverFn
     * @param mouseoutFn
     * @returns {ElementData}
     */
    hover(mouseoverFn, mouseoutFn) {
        if (typeof mouseoverFn == functionType) {
            this.mouseover(mouseoverFn);
        }
        if (typeof mouseoutFn == functionType) {
            this.mouseout(mouseoutFn);
        }
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
        let args = arguments;
        let len = args.length;
        let p1 = args[0];
        let p2 = args[1];
        let type = typeof p1;
        let setterMode = false;
        if (len == 1) {
            if (type == 'object' && p1) {
                setterMode = true;
                for (let attrKey in p1) {
                    let attrValue = p1[attrKey];
                    // setAndRemoveAttr(this.node, attrKey, attrValue);
                    setAndRemoveAttr.call(this, this.node, attrKey, attrValue);
                }
            }
        } else if (len > 1) {
            if (type == 'string') {
                // setAndRemoveAttr(this.node, p1, p2);
                setAndRemoveAttr.call(this, this.node, p1, p2);
                setterMode = true;
            }
        }
        let result = getOrSetValue(this.attrs || (this.attrs = {}), args);
        return setterMode ? this : result;
    };

    /**
     * 数据属性设置或者读取
     */
    data() {
        let args = arguments;
        let len = args.length;
        let p1 = args[0];
        let setterMode = len > 1 || (p1 && typeof p1 == "object");
        let result = getOrSetValue(this.datas || (this.datas = {}), args);
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
        if (this.data("text")) {
            this.data("text").remove();
        }
        this.node.remove();
        this.attrs = null;
        this.datas = null;
        this.removed = true;
    };
}

/**
 * html element data
 */
export class HtmlElementData extends ElementData {
    constructor(node) {
        super(node);
        this.type = "html";
    };

    /**
     * 更新node的innerHTML
     *
     * @param html
     */
    updateHTML(html) {
        this.node.innerHTML = html;
    };
}

/**
 * html text element data Support line break
 */
export class HtmlTextElementData extends HtmlElementData {
    constructor(node, nowrap) {
        super(node);
        this.nowrap = nowrap;
    };

    // set text
    setText(text) {
        this.node.innerHTML = `<div title="${text}" style="transform: translate(-50%, -50%);text-align: center;overflow: hidden;word-break: break-all;box-sizing: border-box;${textStyle}">${text}</div>`;
        Object.assign(this.attrs, {
            text
        });
        this.setNowrap(this.nowrap);
        return this;
    };

    // set width
    setWidth(width) {
        this.attr("width", width);
    };

    // set whiteSpace if nowrap
    setNowrap(nowrap) {
        let innerHtmlNode = this.node.childNodes[0];
        if (!innerHtmlNode) return;
        if (nowrap) {
            Object.assign(innerHtmlNode.style, {
                maxWidth: "100%",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap"
            })
        } else {
            Object.assign(innerHtmlNode.style, {
                maxWidth: null,
                textOverflow: null,
                overflow: null,
                whiteSpace: null
            })
        }
    };

    // override attr
    attr() {
        let args = arguments;
        let [arg0, arg1] = args;
        let len = args.length;
        if (arg0 == "text" && typeof arg1 == "string") {
            return this.setText(arg1);
        } else {
            if (len == 1 && typeof arg0 == "object") {
                // excludes width and height
                let {text, width, height, ...props} = arg0;
                if (text) {
                    this.setText(text);
                }
                return super.attr({...props});
            }
            return super.attr(...args);
        }
    };

}

/**
 * svg element data
 */
export class SvgElementData extends ElementData {
    constructor(node) {
        super(node);
    };

    /**
     * is svg
     * @returns {boolean}
     */
    isSvg() {
        return true;
    };
}

/**
 * svg rect element data
 */
export class SvgRectElementData extends SvgElementData {
    constructor(node) {
        super(node);
        this.type = "rect";
    };
}

/**
 * svg path element data
 */
export class SvgPathElementData extends SvgElementData {
    constructor(node) {
        super(node);
        this.type = "path";
        setDomAttrs(node, {
            fill: "none"
        });
    };

    // Change of response pathStyle
    get pathStyle() {
        return this.data("pathStyle");
    };

    // broken/straight
    set pathStyle(val) {
        if (!val || ["broken", "straight"].includes(val)) {
            this.data("pathStyle", val);
        } else {
            throw new Error(`pathStyle ${val} not supported`);
        }
    };

    // Change of response script
    get script() {
        return this.data("script");
    };

    set script(val) {
        this.data("script", val);
    }

    // Change of response script
    get script() {
        return this.data("script");
    };

    set script(val) {
        this.data("script", val);
    }

    // override attr
    attr() {
        let args = arguments;
        let [arg0, arg1] = args;
        let len = args.length;
        if (arg0 == "path" && typeof arg1 == "string") {
            return super.attr("d", arg1);
        } else {
            if (typeof arg0 == "object" && arg0 && len == 1) {
                let {path, ...props} = arg0;
                if (path) {
                    let d = pointsToPathD(path);
                    return super.attr({d, ...props});
                }
                return super.attr({...props});
            } else {
                return super.attr(...args);
            }
        }
    };

    /** get getPointAtLength */
    getPointAtLength(lenVal) {
        return this.node.getPointAtLength(lenVal);
    };

    /** get svg rect */
    getBBox() {
        return this.node.getBBox();
    };

}

/**
 * svg image element data
 */
export class SvgImageElementData extends SvgElementData {
    constructor(node) {
        super(node);
        this.type = "image";
    };

    // set image xlink:href
    setHref(src) {
        this.node.setAttributeNS(xlinkNS, "xlink:href", src);
    };
}

/**
 * svg circle element data
 */
export class SvgCircleElementData extends SvgElementData {
    constructor(node) {
        super(node);
        this.type = "circle";
    };
}

/**
 * svg text element data
 */
export class SvgTextElementData extends SvgElementData {
    constructor(node) {
        super(node);
        this.type = "text";
    };

    /**
     * Single-line mode. When there are more text, the appearance may not be friendly
     *
     * @param text
     * @returns {SvgTextElementData}
     */
    setText(text) {
        this.node.innerHTML = `<tspan dy="4">${text}</tspan>`;
        // this.node.innerHTML = `<foreignObject dy="4"><div>${text}</div></foreignObject>`;
        Object.assign(this.attrs, {
            text
        })
        return this;
    };

    // override attr
    attr() {
        let args = arguments;
        let [arg0, arg1] = args;
        let len = args.length;
        if (arg0 == "text" && typeof arg1 == "string") {
            return this.setText(arg1);
        } else {
            if (len == 1 && arg0 && typeof arg0 == "object") {
                let {text, ...props} = arg0;
                if (text) {
                    this.setText(text);
                }
                return super.attr({...props});
            }
            return super.attr(...args);
        }
    };
}







