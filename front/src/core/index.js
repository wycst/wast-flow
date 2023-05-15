import FlowDesign from "./flow/"

/**
 * 简化构建实例api
 * example: wf.render(".flow");
 *
 * @type {{render(*, *)}}
 */
export const wf = {

    /**
     * 将流程设计渲染到指定dom
     *
     * @param selector
     * @param option
     * @return GraphicDesign
     */
    render(selector, option) {
        return new FlowDesign(selector, option);
    }
}