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
        dom.addEventListener(onEventName, eventFn);
    } else {
        dom[onEventName] = eventFn;
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