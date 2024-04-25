import {createDomElement} from "./util";
import Paper from "./Paper";

export default class CanvasPaper extends Paper {
    _id;
    _node;
    _removed = false;

    constructor(selector, width, height) {
        super();
        let parentNode;
        if (typeof selector == "string") {
            parentNode = document.querySelector(dom);
        } else {
            parentNode = selector;
        }
        let canvasId = id();
        let canvas = createDomElement('canvas', parentNode, {
            width: width || "100%",
            height: height || "100%",
            "data-id": canvasId,
            style: "overflow: visible; position: relative; user-select: none; cursor: default;"
        });
        this._id = canvasId;
        this._node = canvas;
    }

    get id() {
        return this._id;
    };

    get node() {
        return this._node;
    };

    get removed() {
        return this._removed;
    }
}