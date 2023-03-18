import {bindDomEvent, createDomElement, pointsToPathD, setDomAttrs, unbindDomEvent} from "./util";

// svg namespace
export const svgNS = "http://www.w3.org/2000/svg";
export const xlinkNS = "http://www.w3.org/1999/xlink";
// default text font style
const textStyle = "font-family: Arial, sans-serif; font-size: 12px; font-weight: normal;";
const functionType = "function";

export const connectArrowPrefix = "connect-arrow-";
// 创建指定颜色的marker
export const createColorMarker = (svgDom, color) => {
    if (!color) return;

    // 箭头
    let id = `${connectArrowPrefix}${color}`;
    let marker = svgDom.querySelector("marker[id='" + id + "']");
    if (!marker) {
        marker = createDomElement("marker", svgDom.querySelector("defs"), {id});
        marker = svgDom.querySelector("marker[id='" + id + "']");
        marker.outerHTML = `<marker id="${id}" fill="${color}" markerHeight="5" markerWidth="5" orient="auto" refX="2.5" refY="2.5"><use xlink:href="#${connectArrowPrefix}path" transform="rotate(180 2.5 2.5) scale(1,1)" stroke-width="1" stroke="none"></use></marker>`;
    }

    // 条件连线样式
    id = `connect-condition-${color}`;
    marker = svgDom.querySelector("marker[id='" + id + "']");
    if (!marker) {
        marker = createDomElement("marker", svgDom.querySelector("defs"), {id});
        marker = svgDom.querySelector("marker[id='" + id + "']");
        marker.outerHTML = `<marker id="${id}" viewBox="0 0 20 20" refX="-15" refY="10" markerWidth="10" markerHeight="10" orient="auto"><path d="M 0 10 L 8 6 L 16 10 L 8 14 Z" fill="#fff" stroke="${color}"  stroke-width="1"></path></marker>`;
    }
}


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

    _id;
    _type;
    _node;
    _datas;
    _attrs;

    #privateValue;

    /**
     * 元素数据构造函数
     */
    constructor(node, type) {
        this._type = type;
        // dom节点
        this._node = node;
        // 数据属性
        this._datas = {};
        // 节点属性（可修改属性）
        this._attrs = {};
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

    // readonly type
    get type() {
        return this._type;
    };

    // Change of response name
    get name() {
        let textEle = this.data("text");
        return textEle && textEle.attr("text");
    }

    // uuid
    get uuid() {
        return this.data("uuid");
    }

    set name(val) {
        let textEle = this.data("text");
        if (textEle) {
            textEle.attr("text", val)
        }
    };

    get node() {
        return this._node;
    }

    get datas() {
        return this._datas;
    }

    get attrs() {
        return this._attrs;
    }

    // meta customobject
    get meta() {
        let meta = this.data("meta");
        if (!meta) {
            this.data("meta", meta = {});
        }
        return meta;
    };

    get privateValue() {
        return this.#privateValue;
    }

    /**
     * is svg
     * @returns {boolean}
     */
    isSvg() {
        return false;
    };

    /**
     * is gateway node
     *
     * @returns {boolean}
     */
    isGateway() {
        return false;
    }

    /**
     * is path
     *
     * @returns {boolean}
     */
    isPath() {
        return false;
    }

    /**
     * is task
     *
     * @returns {boolean}
     */
    isTask() {
        return false;
    }

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
        let result = getOrSetValue(this.attrs || (this._attrs = {}), args);
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
        let result = getOrSetValue(this.datas || (this._datas = {}), args);
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
        this._attrs = null;
        this._datas = null;
        this.removed = true;
    };
}

/**
 * node element data
 */
class NodeElementData extends ElementData {
    constructor(node, type) {
        super(node, type);
    }

    // node handler
    get handler() {
        let handler = this.data("handler");
        if (!handler) {
            this.data("handler", handler = {});
        }
        return handler;
    }

    // Change of response nodeType
    get nodeType() {
        return this.data("nodeType");
    }

    set nodeType(val) {
        if (this.supportedType(val)) {
            this.data("nodeType", val);
        } else {
            throw new Error(`nodeType '${val}' not supported for type '` + this.type + "'");
        }
    }

    supportedType(type) {
        return true;
    }
}

/**
 * html element data
 */
export class HtmlElementData extends NodeElementData {
    constructor(node) {
        super(node, "html");
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
 * html split element data
 */
export class HtmlSplitElementData extends HtmlElementData {
    constructor(node) {
        super(node);
    };

    // gateway
    get gateway() {
        return this.data("gateway");
    };

    // broken/straight
    set gateway(val) {
        if (["XOR", "OR", "AND"].includes(val)) {
            this.data("gateway", val);
            this.setHtmlType(val.toLowerCase());
            // update view ?
        } else {
            throw new Error(`gateway '${val}' not supported`);
        }
    };

    /**
     * is gateway node
     *
     * @returns {boolean}
     */
    isGateway() {
        return true;
    }
}

/**
 * html text element data Support line break
 */
export class HtmlTextElementData extends ElementData {

    _nowrap;

    constructor(node, nowrap) {
        super(node, "html");
        this._nowrap = nowrap;
        // init style
        Object.assign(node.style, {
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            overflow: "hidden",
            boxSizing: "border-box"
        })
    };

    // set text
    setText(text) {
        this.node.innerHTML = `<span title="${text}" style="word-break: break-all;${textStyle}">${text}</span>`;
        Object.assign(this.attrs, {
            text
        });
        this._updateWhiteSpace();
        return this;
    };

    // set width
    setWidth(width) {
        this.attr("width", width);
    };

    // set whiteSpace if nowrap
    _updateWhiteSpace() {
        let node = this.node;
        if (this._nowrap) {
            Object.assign(node.style, {
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap"
            })
        } else {
            Object.assign(node.style, {
                textOverflow: null,
                overflow: null,
                whiteSpace: null
            })
        }
    };

    // override attr()
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
class SvgElementData extends ElementData {
    constructor(node, type) {
        super(node, type);
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
 * svg node element
 */
class SvgNodeElementData extends NodeElementData {

    constructor(node, type) {
        super(node, type);
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
export class SvgRectElementData extends SvgNodeElementData {
    constructor(node) {
        super(node, "rect");
    };

    /**
     * is task
     *
     * @returns {boolean}
     */
    isTask() {
        return true;
    }

    // // task type
    // set nodeType(val) {
    //     if (["Business", "Service", "Script", "Manual"].includes(val)) {
    //         this.data("nodeType", val);
    //         // update view ?
    //     } else {
    //         throw new Error(`nodeType ${val} not supported`);
    //     }
    // };
    supportedType(type) {
        return ["Business", "Service", "Script", "Manual"].includes(type);
    }

    // Change of response nodeType
    get asynchronous() {
        let handler = this.handler;
        return handler.asynchronous;
    };

    set asynchronous(val) {
        this.handler.asynchronous = !!val;
    };

    // Change of response timeout
    get timeout() {
        let handler = this.handler;
        return handler.timeout;
    };

    set timeout(val) {
        this.handler.timeout = Number(val);
    };

    get delay() {
        let handler = this.handler;
        return handler.delay;
    };

    set delay(val) {
        this.handler.delay = Number(val);
    };

    get iterate() {
        let handler = this.handler;
        return handler.iterate;
    };

    set iterate(val) {
        this.handler.iterate = Number(val);
    };

    get policy() {
        let handler = this.handler;
        return handler.policy;
    };

    set policy(val) {
        if (["Stop", "Continue"].includes(val)) {
            this.handler.policy = val;
        } else {
            throw new Error(`policy ${val} not supported`);
        }
    };

    // if retryOnError
    get retryOnError() {
        let handler = this.handler;
        return handler.retryOnError || false;
    };

    set retryOnError(val) {
        this.handler.retryOnError = !!val;
    };

    // retry count
    get retryCount() {
        let handler = this.handler;
        return handler.retryCount || 0;
    };

    set retryCount(val) {
        this.handler.retryCount = Number(val);
    };

    // if skip handler
    get skip() {
        let handler = this.handler;
        return handler.skip || false;
    };

    set skip(val) {
        this.handler.skip = !!val;
    };
}

/**
 * svg path element data
 */
export class SvgPathElementData extends SvgElementData {
    constructor(node) {
        super(node, "path");
        setDomAttrs(node, {
            fill: "none"
        });
    }

    // Change of response pathStyle
    get pathStyle() {
        return this.data("pathStyle");
    }

    // broken/straight
    set pathStyle(val) {
        if (!val || ["broken", "straight"].includes(val)) {
            this.data("pathStyle", val);
        } else {
            throw new Error(`pathStyle ${val} not supported`);
        }
    }

    // Change of response conditionType
    get conditionType() {
        return this.data("conditionType") || "Always";
    }

    set conditionType(val) {
        if (val) {
            if (["Always", "Script", "HandlerCall", "Never"].includes(val)) {
                this.data("conditionType", val);
                // update view ?
            } else {
                throw new Error(`conditionType '${val}' not supported`);
            }
        }
        this.updatePathView();
    }

    // Change of response script
    get script() {
        return this.data("script");
    }

    set script(val) {
        this.data("script", val);
    }

    // is condition type
    get isCondition() {
        let conditionType = this.conditionType;
        return conditionType == "Script" || conditionType == "HandlerCall";
    }

    get from() {
        return this.data("from");
    }

    get to() {
        return this.data("to");
    }

    /**
     * 针对单分支连线设置条件类型（默认类型/条件类型）
     *
     * @param connect
     * @param type(Always,Script,HandlerCall)
     */
    updatePathView() {
        let stroke = this.attr("stroke");
        let svgNode = this.node.parentNode
        createColorMarker(svgNode, stroke);
        let type = this.conditionType;
        let nodeStyle = this.node.style;
        switch (type) {
            case "Always": {
                nodeStyle.markerStart = null;
                break;
            }
            case "Script":
            case "HandlerCall": {
                nodeStyle.markerStart = `url(#connect-condition-${stroke})`;
                break;
            }
            default: {
                break;
            }
        }
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

    /**
     * is path
     *
     * @returns {boolean}
     */
    isPath() {
        return true;
    }
}

/**
 * svg image element data
 */
export class SvgImageElementData extends SvgElementData {
    constructor(node) {
        super(node, "image");
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
        super(node, "circle");
    };
}

/**
 * svg text element data
 */
export class SvgTextElementData extends SvgElementData {
    constructor(node) {
        super(node, "text");
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







