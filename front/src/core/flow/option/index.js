export const DefaultSettings = {
    linkName: "",
    nodeName: "节点名称",
    nodeBackgroundColor: "#fff",
    nodeStrokeWith: "3",
    themeColor: "#409eff",
}

/**
 * 默认配置项
 *
 * @type {{toolbar: boolean, dblclickElement(*=, *=): void, grid: boolean, background: null, clickElement(*, *), menu: boolean}}
 */
export default {

    /** 显示网格背景 */
    grid: true,

    /** 自定义背景 */
    background: null,

    /** 画布宽度 */
    width: "100%",

    /** 画布高度 */
    height: "100%",

    /** 显示节点拖拽菜单 */
    menu: true,

    /** 显示工具栏 */
    toolbar: false,

    /**
     * 启用属性的弹出框维护
     * 如果需要自定义维护，设置为false
     * */
    enablePropertyPop: true,

    /**
     * 连线风格： 折线段
     */
    pathStyle: "broken",

    /**
     * path中文本最大宽度（像素）
     */
    maxPathTextWidth: 100,

    /** 如果配置了true,文本将不会换行，超出宽度范围将使用省略号截断,默认false */
    nowrap: false,

    /**
     * 是否支持平移
     */
    panable: true,

    /**
     * 是否可编辑
     */
    editable: true,

    /**
     * 是否生成UUID
     */
    uuid: true,

    /**
     * 禁用辅助对齐线
     */
    disableAlignLine: false,

    /**
     * 启用历史记录
     */
    enableHistory: true,

    /**
     * 默认条件类型
     */
    defaultConditionType: "Script",

    /**
     * 是否支持缩放
     */
    zoomable: true,

    /**
     * 大纲视图左右抵消的宽度
     */
    overviewOffsetWidth: 60,

    /**
     * 大纲视图上下抵消的高度
     */
    overviewOffsetHeight: 20,

    /**
     * 单击时启用编辑文本，默认false
     */
    textEditOnClick: false,

    /**
     * 双击编辑文本
     */
    textEditOnDblClick: true,

    /***
     * 排除的节点类型
     */
    excludeTypes: [],

    /**
     * 提示信息，默认使用window.alert
     *
     * @param message
     */
    alertMessage(message) {
        alert(message);
    },

    /**
     * 单击事件（可覆盖）
     * @param element
     * @param evt
     */
    clickElement(element, evt) {
    },

    /**
     * 双击元素事件可覆盖
     *
     * @param element
     * @param evt
     */
    dblclickElement(element, evt) {
    },

    /**
     * 点击空白
     * @param evt
     */
    clickBlank(evt) {
    },

    /**
     * 双击空白
     * @param evt
     */
    dblclickBlank(evt) {
    },

    /**
     * 右键事件
     *
     * @param evt
     */
    onContextMenu(evt) {
    },

    /**
     * 连线创建时触发
     *
     * @param connect
     */
    onConnectCreated(connect) {
    },

    /**
     * 节点创建时触发
     *
     * @param node
     */
    onNodeCreated(node) {
    },

    /**
     * 元素删除时触发
     */
    onRemoveElement(element) {
    },

    /***
     * 配置项
     */
    settings: DefaultSettings
}