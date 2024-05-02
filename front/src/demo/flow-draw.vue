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
                        fontWeight: 'bold',
                        transform: "translate(-50%, calc(-50% + 15px))",
                    });
                }
            },

            onConnectCreated(connect) {
            },

            // others settings
            settings: {
                themeColor: "#A4404A",
                // 这里的item必须是已经注册的自定义节点(html)
                customMenuItems: ["custom-node"],
                // 节点设置信息
                node: {
                    text: {
                        offset: [0, 30]
                    }
                }
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
            return `<div style='height: 100%; width: 100%; background: #fff; border: 2px solid ${themeColor};box-sizing: border-box; color: ${themeColor}; display: flex;align-items: center;justify-content: center;font-size: .9em;font-weight: bold;'>开始</div>`;
        }, {
            width: 180,
            height: 60,
            text: true
        });
        // 自定义结束
        flow.registerHTML("end", (flow, options) => {
            let themeColor = (options && options.color) || flow.themeColor;
            if (options && options.scene == "menu") {
                return `<div style='height: 100%; width: 100%; background: ${themeColor};border-radius: 50%; border: 1px solid ${themeColor}; color: #fff; display: flex;align-items: center;justify-content: center;font-size: 10px;'>结束</div>`;
            }
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff; display: flex;align-items: center;justify-content: center;font-size: .9em;'>结束</div>`;
        });
        // 自定义节点(支持设置初始化大小)
        flow.registerHTML("custom-node", (flow, options, element) => {
            let themeColor = (options && options.color) || flow.themeColor;
            if (options && options.scene == "menu") {
                return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border: 1px solid ghostwhite; box-sizing: border-box; overflow: hidden;display: flex;align-items: center;justify-content: center;'>
                            <span style="font-size: 10px;">节点</span>
                        </div>`;
            }
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border: 1px solid ghostwhite; box-sizing: border-box; overflow: hidden;'>
                          <div style="width: 100%; height: 30px; display: flex; align-items: center;">
                                <img src="${done}" width="18" height="18" style="margin: 0 5px; ">
                                <span style="font-size: 12px;">已执行</span>
                          </div>
                          <div style="width: 100%; height: calc(100% - 30px);background: #fff"></div>
                      </div>`;
        }, {
            width: 180,
            height: 90,
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