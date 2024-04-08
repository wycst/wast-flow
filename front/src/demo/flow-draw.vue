<template>
    <div style="position: relative;">

        <el-form inline>
            <el-form-item label="主题色">
                <el-color-picker v-model="themeColor"></el-color-picker>
            </el-form-item>
        </el-form>

        <div ref="flow" class="wast-flow" style="width: 100%; height: 75vh; overflow: hidden;">
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
            </el-form>
        </div>
    </div>
</template>

<script>
import {wf} from "../core/index"

export default {
    name: "flow.vue",
    data() {
        return {
            editable: true,
            themeColor: '#00CCA7',
            propertyVisible: false,
            selectElement: null,

            dialogVisible: false,
            responsive: 1,
            visible: false,
        }
    },
    mounted() {
        let flow = this.flow = wf.render(this.$refs.flow, {
            grid: true,
            menu: {
                draggable: true
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

            onConnectCreated(connect) {
            },

            // others settings
            settings: {
                themeColor: "#00CCA7",
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
        flow.registerHTML("start", (flow) => {
            let themeColor = flow.themeColor;
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border-radius: 30px;display: flex;align-items: center;justify-content: center;font-size: .9em;'>开始</div>`;
        });
        // 自定义结束
        flow.registerHTML("end", (flow) => {
            let themeColor = flow.themeColor;
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff; border-radius: 30px;display: flex;align-items: center;justify-content: center;font-size: .9em;'>结束</div>`;
        });
        // 自定义节点(支持设置初始化大小)
        flow.registerHTML("custom-node", (flow) => {
            let themeColor = flow.themeColor;
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border: 1px solid ghostwhite; border-radius: 12px;overflow: hidden;'>
                          <div style="width: 100%; height: 20%"></div>
                          <div style="width: 100%; height: 80%;background: #fff"></div>
                      </div>`;
        }, {
            width: 180,
            height: 80,
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
                this.responsive++;
            },
            deep: true
        },
        themeColor(val) {
            if (this.flow) {
                this.flow.setThemeColor(val);
            }
        }
    }
}
</script>

<style scoped>
</style>