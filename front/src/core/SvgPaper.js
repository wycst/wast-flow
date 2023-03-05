import {createDomElementNs, pointsToPathD} from "./util";
import {SvgPathElementData, SvgRectElementData} from "./ElementData"

// svg namespace
const svgNS = "http://www.w3.org/2000/svg";
/**
 * svg paper
 *
 * Note: svg text support capability is not as good as conventional dom nodes, unless foreignObject is used,
 */
export default class SvgPaper {

    constructor(selector) {
        let parentNode;
        if (typeof selector == "string") {
            parentNode = document.querySelector(dom);
        } else {
            parentNode = selector;
        }
        this.$parent = parentNode;
        let svg = createDomElementNs(svgNS, 'svg', parentNode, {
            width: "100%",
            height: "100%",
            version: "1.1",
            xmlns: "http://www.w3.org/2000/svg",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            style: "overflow: visible; position: relative; user-select: none; cursor: default;"
        });
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
        let rectNode = createDomElementNs(svgNS, 'rect', this.svg, {
            x,
            y,
            width,
            height,
            rx: radius,
            ry: radius
        });
        let rectElementData = new SvgRectElementData(rectNode);
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
        return new SvgPathElementData(pathNode);
    };


}