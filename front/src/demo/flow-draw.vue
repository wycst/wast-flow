<template>
    <div style="position: relative;">

        <div style="margin: 5px 10px;display: flex;">
            <div style="display: flex; align-items: center; justify-content: center;">
                <div style="margin-right: 10px;">主题色</div>
                <el-color-picker size="mini" v-model="themeColor"></el-color-picker>
            </div>
            <div style="width: 20px"></div>
            <div style="display: flex; align-items: center; justify-content: center;">
                <div style="margin-right: 10px;">背景色</div>
                <el-color-picker size="mini" v-model="background"></el-color-picker>
            </div>
        </div>

        <div ref="flow" class="wast-flow" style="width: 100%; height: 75vh; overflow: auto;">
        </div>
        <div
                style="position: fixed; right: 0;width: 30%;transition: all .3s;height:100vh; top: 0px;background: #fff;box-shadow:rgba(0, 0, 0, 0.08) 0px 16px 48px 16px, rgba(0, 0, 0, 0.12) 0px 12px 32px 0px, rgba(0, 0, 0, 0.16) 0px 8px 16px -8px; padding: 5px 20px;z-index: 1000;"
                :style="drawerStyle">
            <h3>
                <label>属性设置</label>
                <label style="float: right; color: red;cursor: pointer;" @click="visible = false">×</label>
            </h3>
            <el-form v-if="selectElement" label-width="150px">
                <el-form-item label="ID">
                    <el-input v-model="selectElement.id"></el-input>
                </el-form-item>
                <el-form-item label="NAME">
                    <el-input v-model="selectElement.name"></el-input>
                </el-form-item>

                <template v-if="selectElement.isPath()">
                    <el-form-item label="连线风格">
                        <el-select v-model="selectElement.pathStyle" @change="onPathStyleChange">
                            <el-option label="折线段" value="broken"></el-option>
                            <el-option label="垂平线" value="hv"></el-option>
                            <el-option label="直线" value="straight"></el-option>
                            <el-option label="二次贝塞尔曲线" value="qbc"></el-option>
                            <el-option label="三次贝塞尔曲线" value="cbc"></el-option>
                        </el-select>
                    </el-form-item>
                </template>
            </el-form>
        </div>
    </div>
</template>

<script>
import {wf} from "../core/index"
import done from "./done.png"
import undo from "./undo.png"

export default {
    name: "flow-draw.vue",
    data() {
        return {
            themeColor: '#A4404A',
            background: '#F0F0F0',
            propertyVisible: false,
            selectElement: null,

            dialogVisible: false,
            responsive: 1,
            visible: false,
        }
    },
    mounted() {
        let flow = this.flow = wf.render(this.$refs.flow, {
            background: "#F0F0F0",
            menu: {
                draggable: false
            },
            panable: true,

            textEditOnDblClick: false,

            nowrap: false,

            // 拖拽菜单中排除哪些类型不显示
            excludeTypes: ["manual", "message", "service", "businessTask", "or", "join"],

            /** 默认条件类型 */
            defaultConditionType: "Always",

            /** 默认快捷追加的节点函数 */
            defaultNextNodeFn: (flow, x, y) => {
                return flow.createCustomHtmlNode("custom-node", x, y);
            },

            alertMessage: (message, level) => {
                this.$message.error(message);
            },

            onNodeCreated(node, flow) {
                if(node.text) {
                    Object.assign(node.text.node.style, {
                        fontFamily: 'PingFangSC-Regular',
                        fontSize: '12px',
                        color: '#000000',
                        transform: "translate(-50%, calc(-50% + 10px))",
                    });
                }
            },

            onConnectCreated(connect) {
            },

            // others settings
            settings: {
                themeColor: "#B50B14",
                // 这里的item必须是已经注册的自定义节点(html)
                customMenuItems: ["custom-node"],
            },

            // 元素单击事件
            clickElement: this.clickElement,
            // 元素双击事件
            dblclickElement: this.dblclickElement,
            // 空白点击事件
            clickBlank: this.clickBlank
        })

        // 自定义开始和结束节点覆盖内置
        // 自定义开始
        flow.registerHTML("start", (flow, options) => {
            let themeColor = (options && options.color) || flow.themeColor;
            if (options && options.scene == "menu") {
                return `<div style='height: 100%; width: 100%; background: #fff;border-radius: 50%; border: 1px solid ${themeColor}; color: ${themeColor}; display: flex;align-items: center;justify-content: center;font-size: 10px;'>开始</div>`;
            }
            return `<div style='height: 100%; width: 100%; background: #fff;box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.11); border: 2px solid ${themeColor};box-sizing: border-box; color: ${themeColor}; display: flex;align-items: center;justify-content: center;font-family: PingFangSC-Semibold;font-size: 12px;font-weight: 600;'>开始</div>`;
        }, {
            width: 137,
            height: 46,
            text: true
        });
        // 自定义结束
        flow.registerHTML("end", (flow, options) => {
            let themeColor = (options && options.color) || flow.themeColor;
            if (options && options.scene == "menu") {
                return `<div style='height: 100%; width: 100%; background: ${themeColor};border-radius: 50%; border: 1px solid ${themeColor}; color: #fff; display: flex;align-items: center;justify-content: center;font-size: 10px;'>结束</div>`;
            }
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.11);display: flex;align-items: center;justify-content: center;font-family: PingFangSC-Regular;font-size: 12px;font-weight: 400;'>结束</div>`;
        }, {
            width: 137,
            height: 46,
            text: true
        });
        // 自定义节点(支持设置初始化大小)
        flow.registerHTML("custom-node", (flow, options, element) => {
            let themeColor = (options && options.color) || flow.themeColor;
            if (options && options.scene == "menu") {
                return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border: 1px solid ghostwhite; box-sizing: border-box; overflow: hidden;display: flex;align-items: center;justify-content: center;'>
                            <span style="font-size: 10px;">节点</span>
                        </div>`;
            }
            let status = element && element.data("status");
            console.log("status", status);
            if(status == "init") {
                // 未完成
                return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border: 1px solid #BDBDBD; box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.11); box-sizing: border-box; overflow: hidden;'>
                          <div style="width: 100%; height: 20px; display: flex; align-items: center;">
                                <svg width="15px" height="15px" style="margin: 0 5px; " viewBox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <title>dagou-4</title>
                                    <g id="dagou-4" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <g fill="#FFFFFF" fill-rule="nonzero" id="形状">
                                            <path d="M7.48104559,0.0158428012 C3.3586701,0.0158428012 0.0161238514,3.35772473 0.0161238514,7.48093488 C0.0161238514,11.6033274 3.3586701,14.9453797 7.48104559,14.9453797 C11.6037617,14.9453797 14.9454733,11.6033274 14.9454733,7.48093488 C14.9454733,3.35772473 11.6037788,0.0158428012 7.48104559,0.0158428012 Z M6.80243183,9.85575088 L6.8026192,9.85609156 L6.12400543,10.5343987 L5.44505099,9.85609156 L5.44539166,9.85575088 L3.40936302,7.81990959 L4.08795974,7.14129582 L6.12381807,9.17713711 L10.8744721,4.42667042 L11.5527111,5.10560782 L6.80243183,9.85575088 Z"></path>
                                        </g>
                                    </g>
                                </svg>
                                <span style="font-size: 12px;">已执行</span>
                          </div>
                          <div style="width: 100%; height: calc(100% - 20px);background: #fff"></div>
                      </div>`;
            } else {
                return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border: 1px solid #BDBDBD; box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.11); box-sizing: border-box; overflow: hidden;'>
                          <div style="width: 100%; height: 20px; display: flex; align-items: center;">
                                <svg width="15px" height="15px" style="margin: 0 5px; " viewBox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <title>dagou-4</title>
                                    <g id="dagou-4" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <g fill="#FFFFFF" fill-rule="nonzero" id="形状">
                                            <path d="M7.48104559,0.0158428012 C3.3586701,0.0158428012 0.0161238514,3.35772473 0.0161238514,7.48093488 C0.0161238514,11.6033274 3.3586701,14.9453797 7.48104559,14.9453797 C11.6037617,14.9453797 14.9454733,11.6033274 14.9454733,7.48093488 C14.9454733,3.35772473 11.6037788,0.0158428012 7.48104559,0.0158428012 Z M6.80243183,9.85575088 L6.8026192,9.85609156 L6.12400543,10.5343987 L5.44505099,9.85609156 L5.44539166,9.85575088 L3.40936302,7.81990959 L4.08795974,7.14129582 L6.12381807,9.17713711 L10.8744721,4.42667042 L11.5527111,5.10560782 L6.80243183,9.85575088 Z"></path>
                                        </g>
                                    </g>
                                </svg>
                                <span style="font-size: 12px;">已执行</span>
                          </div>
                          <div style="width: 100%; height: calc(100% - 20px);background: #fff"></div>
                      </div>`;
            }
        }, {
            width: 137,
            height: 66,
            text: true
        });
        window.instance = this.flow;
        this.flow.processId = "test";
        this.flow.processName = "test";

        this.responsive++;
    },
    beforeUnmount() {
        this.flow.destroy();
    },
    methods: {
        getData() {
            this.tmpData = this.flow.getData();
            console.log(this.tmpData);
            console.log(JSON.stringify(this.tmpData, null, 4));
        },
        clickElement(element, evt) {
            this.selectElement = element;
        },
        dblclickElement(element, evt) {
            this.selectElement = element;
            // this.propertyVisible = true;
            this.visible = true;
        },
        clickBlank() {
            this.visible = false;
        },
        onPathStyleChange(pathStyle) {
            if(this.selectElement && this.selectElement.isPath()) {
                this.flow.updatePath(this.selectElement) ;
            }
        },
    },
    computed: {
        drawerStyle() {
            if (this.visible) {
                return {
                    transform: "translate(0px, 0px)"
                }
            } else {
                return {
                    transform: "translate(100%, 0px)"
                }
            }
        }
    },
    watch: {
        selectElement: {
            handler(val) {
                console.log("=========== " + this.responsive);
                this.responsive++;
            }
        },
        themeColor(val) {
            if (this.flow) {
                this.flow.setThemeColor(val);
            }
        },
        background(val) {
            if (this.flow) {
                this.flow.setBackground(val);
            }
        },
    }
}
</script>

<style scoped>
</style>