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
const {floor, random} = Math;
export const uuid = () => {
    let s = [];
    let hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(floor(random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
    return s.join("");
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
    setDomAttrs(dom, attrs)
    parent.appendChild(dom);
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
    setDomAttrs(dom, attrs)
    parent.appendChild(dom);
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
 * 计算点（x0,y0）到line(x1, y1, x2, y2)的垂直距离
 *
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {number}
 */
export const distanceToLine = (x0, y0, x1, y1, x2, y2) => {
    // 求3个边长
    let a = sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
    let b = sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    let c = sqrt((x2 - x0) * (x2 - x0) + (y2 - y0) * (y2 - y0));
    // 根据海伦公式求3个点围成的面积
    // S=√[p(p-a)(p-b)(p-c)]
    let halfP = (a + b + c) / 2;
    let s = sqrt(halfP * (halfP - a) * (halfP - b) * (halfP - c));
    let h = 2 * s / b;
    return h;
};

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