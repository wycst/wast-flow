import {createDomElementNs, pointsToPathD} from "./util";
import {SvgImageElementData, SvgPathElementData, SvgRectElementData, SvgTextElementData} from "./ElementData"

// svg namespace
const svgNS = "http://www.w3.org/2000/svg";
/**
 * svg paper
 *
 * Note: svg text support capability is not as good as conventional dom nodes, unless foreignObject is used,
 */
export default class SvgPaper {

    constructor(selector, width, height) {
        let parentNode;
        if (typeof selector == "string") {
            parentNode = document.querySelector(dom);
        } else {
            parentNode = selector;
        }
        this.$parent = parentNode;
        let svg = createDomElementNs(svgNS, 'svg', parentNode, {
            width: width || "100%",
            height: height || "100%",
            version: "1.1",
            xmlns: "http://www.w3.org/2000/svg",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            style: "overflow: visible; position: relative; user-select: none; cursor: default;"
        });
        createDomElementNs(svgNS, "defs", svg)
        // create svg dom
        // let svg = createDomElement("svg", parentNode, );
        this.svg = svg;
        this.canvas = svg;
    };

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
        let rectNode = createDomElementNs(svgNS, 'rect', this.svg,);
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
        let d = pointsToPathD(data);
        let pathNode = createDomElementNs(svgNS, 'path', this.svg, {
            d
        });
        let pathElementData = new SvgPathElementData(pathNode);
        pathElementData.attr("d", d);
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
        // let imageNode = createDomElementNs("http://www.w3.org/1999/xlink", 'image', this.svg, attrs);
        let imageNode = createDomElementNs(svgNS, 'image', this.svg, attrs);
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
        let textNode = createDomElementNs(svgNS, 'text', this.svg, {
            x,
            y
        });
        return new SvgTextElementData(textNode);
    };

    /**
     * clear
     */
    clear() {
    };

    remove() {
        this.clear();
        this.svg.remove();
    };
}