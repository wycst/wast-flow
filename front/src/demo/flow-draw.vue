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
                <el-form-item label="编号">
                    <el-input v-model="selectElement.id"></el-input>
                </el-form-item>
                <el-form-item label="名称">
                    <el-input v-model="selectElement.name"></el-input>
                </el-form-item>

                <template v-if="selectElement.isPath()">
                    <el-form-item label="连线风格">
                        <el-select v-model="selectElement.pathStyle">
                            <el-option label="折线段" value="broken"></el-option>
                            <el-option label="垂平线" value="hv"></el-option>
                            <el-option label="直线" value="straight"></el-option>
                        </el-select>
                    </el-form-item>
                </template>

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
            // 是否显示网格
            grid: true,

            // 是否开启菜单(编辑模式)
            menu: {
                draggable: true
            },

            // 是否支持平移
            panable: true,

            // 双击文本是否开启编辑
            textEditOnDblClick: false,

            // 是否单行显示（如果超长使用三个点风格的省略号）
            nowrap: false,

            /**
             * 默认连线风格:
             *  hv:         垂平线(垂直+水平)
             *  broken:     自由的折线段(折线段个数没有限制)
             *  straight:   开始节点和结束节点直连风格
             */
            pathStyle: "hv",

            /**
             * 拖拽菜单中排除哪些类型不显示
             */
            excludeTypes: ["manual", "message", "service", "businessTask", "or", "join"],

            /** 默认条件类型 */
            defaultConditionType: "Always",

            /** 导出时忽略校验 */
            ignoreValidateOnExport: true,

            /** 默认快捷追加的节点函数 */
            defaultNextNodeFn: (flow, x, y) => {
                return flow.createCustomHtmlNode("custom-node", x, y);
            },

            alertMessage: (message, level) => {
                this.$message.error(message);
            },
            /**
             * others settings
             *
             */
            settings: {
                // 主题色
                themeColor: "#00CCA7",
                // 这里的item必须是已经注册的自定义节点(html)
                customMenuItems: ["custom-node"],
            },
            /**
             * 当连线被创建时
             *
             * @param connect
             */
            onConnectCreated(connect) {
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