<template>
    <div style="position: relative;">
        <el-form inline>
            <el-form-item label="主题色">
                <el-color-picker v-model="themeColor"></el-color-picker>
            </el-form-item>
            <el-form-item label="背景色1">
                <el-color-picker v-model="background"></el-color-picker>
            </el-form-item>
        </el-form>
        <div ref="flow" class="wast-flow" style="width: 100%; height: 75vh; overflow: hidden;">
        </div>
    </div>
</template>

<script>
import {wf} from "../core/index"
import flowJson from "./flow.json"
import element from "./element";
export default {
    name: "flow-view.vue",
    props: {
        flowId: String,
        flowName: String,
    },
    data() {
        return {
            flow: null,
            themeColor: '#00CCA7',
            background: '#fff',
            selectElement: null,
        }
    },
    mounted() {
        let flow = this.flow = wf.render(this.$refs.flow, {
            grid: false,
            menu: false,
            panable: true,
            editable: false,
            textEditOnDblClick: false,
            nowrap: false,
            // others settings
            settings: {
                themeColor: "#00CCA7",
            },
            // 自适应后微调
            overviewOffsetTop: -40,
            // 元素的悬浮事件
            mouseoverElement: this.mouseoverElement,
            mouseoutElement: this.mouseoutElement,
            // 元素单击事件
            clickElement: this.clickElement,
            // 元素双击事件
            dblclickElement: this.dblclickElement,
            longtapElement: this.longtapElement,
            // 空白点击事件
            clickBlank: this.clickBlank
        });

        flow.setToolStyle({
            top: '20px',
            right: '20px',
            display: 'flex',
            width: 'auto',
            flexDirection: 'unset'
        });

        // 自定义开始和结束节点覆盖内置
        // 自定义开始
        flow.registerHTML("start", (flow, options) => {
            let themeColor = (options && options.color) || flow.themeColor;
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border-radius: 30px;display: flex;align-items: center;justify-content: center;font-size: .9em;'>开始</div>`;
        });
        // 自定义结束
        flow.registerHTML("end", (flow, options) => {
            let themeColor = (options && options.color) || flow.themeColor;
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff; border-radius: 30px;display: flex;align-items: center;justify-content: center;font-size: .9em;'>结束</div>`;
        });
        // 自定义节点(支持设置初始化大小)
        flow.registerHTML("custom-node", (flow, options) => {
            let themeColor = (options && options.color) || flow.themeColor;
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border: 1px solid ghostwhite; border-radius: 12px;overflow: hidden;'>
                          <div style="width: 100%; height: 20%"></div>
                          <div style="width: 100%; height: 80%;background: #fff"></div>
                      </div>`;
        }, {
            width: 180,
            height: 80,
            text: true
        });

        // 设置数据
        flow.setData(flowJson);

        // 销毁
        // flow.destroy();
        window.flowview = flow;
    },
    beforeUnmount() {
        if(this.flow) {
            this.flow.destroy();
        }
    },
    methods: {
        mouseoverElement(element, evt) {
            // console.log("mouseoverElement ", evt);
        },
        mouseoutElement(element, evt) {
            // console.log("mouseoutElement ", evt);
        },
        clickElement(element, evt) {
            console.log(element);
            this.selectElement = element;
            this.$message.info("点击了" + element);
        },
        dblclickElement(element, evt) {
            this.selectElement = element;
            this.visible = true;
        },
        longtapElement(element, evt) {
            console.log("longtapElement ", element, evt);
        },
        clickBlank() {
            this.visible = false;
        },
        initStartAndEnd() {
            this.flow.createStartNode();
            this.flow.createEndNode();
        },
    },
    watch: {
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

div[data-id] {
    span {
        line-height: 1.5;
    }
}

</style>