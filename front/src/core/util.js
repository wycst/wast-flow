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