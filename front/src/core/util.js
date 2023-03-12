const userAgent = navigator.userAgent;
/**
 * browser env
 *
 * @type {{isEdge: boolean, isIE: boolean, isFF: boolean, isChrome: boolean}}
 */
export const browser = {
    isFF: userAgent.indexOf("Firefox") > -1,// Firefox
    isChrome: userAgent.indexOf("Chrome") > -1,// Chrome
    isIE: userAgent.indexOf("MSIE") > -1,
    isEdge: userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1
}

/**
 * create dom element
 *
 * @param tagName
 * @param parent
 * @param attrs
 */
export const createDomElement = function (tagName, parent, attrs) {
    let dom = document.createElement(tagName);
    parent.appendChild(dom);
    setDomAttrs(dom, attrs)
    return dom;
}

/**
 * create dom namespace element
 *
 * @param tagName
 * @param ns
 * @param parent
 * @param attrs
 */
export const createDomElementNs = function (ns, tagName, parent, attrs) {
    let dom = document.createElementNS(ns, tagName);
    parent.appendChild(dom);
    setDomAttrs(dom, attrs)
    return dom;
}

/**
 * set dom attrs
 *
 * @param dom
 * @param attrs
 */
export const setDomAttrs = function (dom, attrs) {

    let argsLen = arguments.length;
    if (argsLen == 3) {
        let key = arguments[1];
        let value = arguments[2];
        if (key) {
            if (value) {
                dom.setAttribute(key, value);
            } else {
                dom.removeAttribute(key);
            }
        }
    } else {
        if (!attrs || !typeof attrs == 'object') return;
        for (let attrKey in attrs) {
            let value = attrs[attrKey];
            if (value) {
                dom.setAttribute(attrKey, value);
            } else {
                dom.removeAttribute(attrKey);
            }
        }
    }
}

/**
 * 将路径d数据转化为points数据
 *
 * @param pathD
 */
export const pathDToPoints = function (pathD) {
    if (Array.isArray(pathD)) {
        return pathD;
    }
    // example: M225.51392757660167,141L265.5,471L598.3565459610028,383L558.8636330931555,157
    let points = [];
    try {
        if (typeof pathD == "string") {
            let symbol = null, value = [];
            let offset = -1;
            for (let i = 0, len = pathD.length; i < len; ++i) {
                let code = pathD.charAt(i);
                switch (code) {
                    case "M":
                    case "L":
                    case "H":
                    case "V":
                    case "h":
                    case "v": {
                        if (symbol) {
                            value.push(parseFloat(pathD.substring(offset, i).trim()));
                            points.push([
                                symbol,
                                ...value
                            ])
                        }
                        value = [];
                        symbol = code;
                        offset = i + 1;
                        break;
                    }
                    case ",": {
                        value.push(parseFloat(pathD.substring(offset, i).trim()));
                        offset = i + 1;
                        break;
                    }
                    default: {
                    }
                }
            }
            if (symbol) {
                value.push(parseFloat(pathD.substring(offset).trim()));
                let point = [symbol];
                point.push(...value);
                points.push(point);
            }
        }
    } catch (err) {
        console.error(err);
    }

    return points;
}

/**
 * 将points数据生成路径d
 * @param points
 */
export const pointsToPathD = function (points) {
    if (typeof points == "string") return points;
    if (!Array.isArray(points)) return null;
    let pathD = [];
    for (let point of points) {
        let [v1, v2, v3] = point;
        pathD.push(v1);
        pathD.push(v2);
        if (v3) {
            pathD.push(",");
            pathD.push(v3);
        }
    }
    console.log(pathD);
    return pathD.join("");
}

/**
 * 给dom绑定事件
 *
 * @param dom         节点对象（dom）
 * @param eventName   事件名称（不要带on）,比如click
 * @param fn          事件函数
 */
export const bindDomEvent = (dom, eventName, eventFn) => {
    let onEventName = `on${eventName}`;
    if (dom.addEventListener) {
        dom.addEventListener(eventName, eventFn);
    } else if (dom.attachEvent) {
        dom.attachEvent(onEventName, eventFn);
    } else {
        dom[onEventName] = eventFn;
    }
}

/**
 * 给dom解绑事件（除非业务逻辑需要解绑，一般没有必要解绑）
 *
 * @param dom         节点对象（dom）
 * @param eventName   事件名称（不要带on）,比如click
 * @param fn          事件函数
 */
export const unbindDomEvent = (dom, eventName, eventFn) => {
    let onEventName = `on${eventName}`;
    if (dom.removeEventListener) {
        dom.removeEventListener(eventName, eventFn);
    } else if (dom.deachEvent) {
        dom.deachEvent(onEventName, eventFn);
    } else {
        dom[onEventName] = null;
    }
}


/**
 * 下载/导出文本
 *
 * @param text
 * @param downloadName
 */
export const exportTextFile = (text, downloadName) => {
    // 将text转化为blob
    let blob = new Blob([text]);
    let filename = '导出文件';
    if (typeof downloadName == "string") {
        filename = downloadName;
    }
    exportBlob(blob, filename);
}

/**
 * 下载/导出文件
 *
 * @param blob
 * @param filename
 */
export const exportBlob = (blob, filename) => {
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement("a");
        a.style.display = "none";
        a.download = filename;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

/**
 * 阻止事件冒泡
 *
 * @param evt
 */
export const preventDefault = (evt) => {
    // 阻止默认行为
    evt.preventDefault();
    // 阻止冒泡
    evt.stopPropagation();
}