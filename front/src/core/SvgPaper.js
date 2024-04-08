import {createDomElementNs, pointsToPathD, id} from "./util";
import {
    SvgCircleElementData,
    SvgImageElementData,
    svgNS,
    SvgPathElementData,
    SvgRectElementData,
    SvgTextElementData,
    xlinkNS
} from "./ElementData"

/**
 * svg paper
 *
 * Note: svg text support capability is not as good as conventional dom nodes, unless foreignObject is used,
 */
export default class SvgPaper {
    _id;
    _node;
    _removed = false;

    constructor(selector, width, height) {
        let parentNode;
        if (typeof selector == "string") {
            parentNode = document.querySelector(dom);
        } else {
            parentNode = selector;
        }
        let svgId = id();
        let svg = createDomElementNs(svgNS, 'svg', parentNode, {
            width: width || "100%",
            height: height || "100%",
            version: "1.1",
            xmlns: svgNS,
            "xmlns:xlink": xlinkNS,
            "data-id": svgId,
            style: "overflow: visible; position: relative; user-select: none; cursor: default;"
        });
        // create svg dom
        createDomElementNs(svgNS, "defs", svg)
        this._id = svgId;
        this._node = svg;
    };
    get id() {
      return this._id;
    };
    get node() {
        return this._node;
    };
    get removed() {
        return this._removed;
    }

    /**
     * draw rect
     *
     * @param x
     * @param y
     * @param width
     * @param height
     * @param radius
     */
    rect(x, y, width, height, radius) {
        let attrs = {
            x,
            y,
            width,
            height,
            rx: radius,
            ry: radius
        };
        let rectNode = createDomElementNs(svgNS, 'rect', this.node);
        let rectElementData = new SvgRectElementData(rectNode);
        rectElementData.attr(attrs);
        return rectElementData;
    };

    /**
     * draw path
     *
     * @param pathD Two-dimensional array
     * @returns {SvgPathElementData}
     */
    path(data) {
        let pathNode = createDomElementNs(svgNS, 'path', this.node);
        let pathElementData = new SvgPathElementData(pathNode);
        pathElementData.attr("d", pointsToPathD(data));
        return pathElementData;
    };

    /**
     * draw image
     *
     * @param src
     * @param x
     * @param y
     * @param width
     * @param height
     */
    image(src, x, y, width, height, radius) {
        let attrs = {
            x,
            y,
            width,
            height,
            rx: radius,
            ry: radius
        };
        let imageNode = createDomElementNs(svgNS, 'image', this.node, attrs);
        let imageElementData = new SvgImageElementData(imageNode);
        imageElementData.setHref(src);
        return imageElementData;
    };

    /**
     * draw text
     * @param x
     * @param y
     */
    text(x, y) {
        // if use foreignObject ?
        let textNode = createDomElementNs(svgNS, 'text', this.node, {x, y});
        return new SvgTextElementData(textNode);
    };

    /**
     * draw svg circle
     *
     * @param x
     * @param y
     * @param r
     * @returns {SvgCircleElementData}
     */
    circle(x, y, r) {
        let circleNode = createDomElementNs(svgNS, 'circle', this.node);
        let circleElementData = new SvgCircleElementData(circleNode);
        circleElementData.attr({x, y, r});
        return circleElementData;
    };

    /**
     * clear elements
     */
    clear() {
        let elements = this.node.querySelectorAll("*[data-id]");
        elements.forEach(element => {
            element.remove();
        })
    };

    /**
     * remove
     */
    remove() {
        this.clear();
        this.node.remove();
        this._node = null;
        this._removed = true;
    };
}