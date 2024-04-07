<template>
    <div style="position: relative;">

        <div style="display: flex; align-items: center;">
            <!--            <el-switch v-model="editable" active-text="可编辑" inactive-text="不可编辑"-->
            <!--                       style="margin-left: 10px;"></el-switch>-->
            主题色:
            <el-color-picker v-model="themeColor"></el-color-picker>
        </div>


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
        console.log(" mounted ");
        let flow = this.graphicDesign = wf.render(this.$refs.flow, {
            grid: false,
            // width: "2000px",
            // height: "1000px",
            menu: {
                draggable: true
            },
            // background: "lightblue",
            panable: true,

            textEditOnDblClick: false,

            nowrap: false,

            // 拖拽菜单中排除哪些类型不显示
            excludeTypes: ["manual", "message", "service", "businessTask", "or", "join"],

            /** 默认条件类型 */
            defaultConditionType: "HandlerCall",

            alertMessage: (message, level) => {
                this.$message.error(message);
            },

            onConnectCreated(connect) {
            },

            // others settings
            settings: {
                themeColor: "#00CCA7",
                customHtmlTypes: ["custom-node"]
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
        // 自定义节点
        flow.registerHTML("custom-node", (flow) => {
            let themeColor = flow.themeColor;
            return  `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border: 1px solid ghostwhite; border-radius: 12px;overflow: hidden;'>
                          <div style="width: 100%; height: 20%"></div>
                          <div style="width: 100%; height: 80%;background: #fff"></div>
                      </div>`;
        });

        console.log(this.graphicDesign.getData());
        window.instance = this.graphicDesign;
        this.graphicDesign.processId = "test";
        this.graphicDesign.processName = "test";

        this.responsive++;
    },
    beforeUnmount() {
        this.graphicDesign.destroy();
    },
    methods: {
        getData() {
            this.tmpData = this.graphicDesign.getData();
            console.log(this.tmpData);
            console.log(JSON.stringify(this.tmpData, null, 4));
        },
        clickElement(element, evt) {
            console.log(element);
            console.log(element.id);
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
        validateProcess() {
            let error = this.graphicDesign.validate();
            if (error) {
                this.$message.error(error);
            } else {
                this.$message.success("成功");
            }
        },
        pop() {
            this.dialogVisible = true;
            this.$nextTick(() => {
                if (!this.flowInstance) {
                    console.log(this.$refs.flow2);
                    this.flowInstance = wf.render(this.$refs.flow2, {
                        grid: true,
                        editable: true
                    })
                }
            })
        },
        clearData() {
            this.graphicDesign.reset();
        },
        setData() {
            this.graphicDesign.setData(this.tmpData, true);
        },
        initStartAndEnd() {
            this.graphicDesign.createStartNode();
            this.graphicDesign.createEndNode();
        },
        createNode() {
            this.graphicDesign.createNode(100, 100, 100, 80, 8);
        },
        exportImage() {
            this.graphicDesign.exportImage();
        },
        setEditable() {
            this.editable = !this.editable;
            this.graphicDesign.setEditable(this.editable);
        },
        handleClose() {
            console.log("==== ");
            this.dialogVisible = false;
        }
    },
    computed: {
        processData() {
            return this.responsive && this.graphicDesign ? this.graphicDesign.getData() : null
        },
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
        editable() {
            if (this.graphicDesign) {
                this.graphicDesign.setEditable(this.editable);
            }
        },
        selectElement: {
            handler(val) {
                this.responsive++;
            },
            deep: true
        },
        themeColor(val) {
            if (this.graphicDesign) {
                this.graphicDesign.setThemeColor(val);
            }
        }
    }
}
</script>

<style scoped>
</style>