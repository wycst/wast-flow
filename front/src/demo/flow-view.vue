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

<!--        <div style="display: flex; position: absolute; top: 10px; right: 10px; width: 108px; align-items: center; justify-content: space-around; z-index: 100000;cursor: pointer;">-->
<!--            <img width="32" src="./overview.png" @click="flow.overview()" style="background: #fff;">-->
<!--            <img width="32" src="./zoom_in.png" @click="flow.zoomIn()" style="background: #fff;">-->
<!--            <img width="32" src="./zoom_out.png" @click="flow.zoomOut()" style="background: #fff;">-->
<!--        </div>-->

        <div ref="flow" class="wast-flow" style="width: 100%; height: 75vh; overflow: hidden;">
        </div>
    </div>
</template>

<script>
import {wf} from "../core/index"
import flowJson from "./flow.json"
import zoom_out from "./zoom_out.png"
import zoom_in from "./zoom_in.png"
import overview from "./overview.png"
export default {
    name: "flow-view.vue",
    props: {
        flowId: String,
        flowName: String,
    },
    data() {
        return {
            flow: null,
            themeColor: '#C0C5C4',
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
                themeColor: "#C0C5C4",
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

        // 工具栏设置
        flow.setToolStyle({
            top: '20px',
            right: '10px',
            display: 'flex',
            width: '123px',
            justifyContent: 'space-around',
            flexDirection: 'unset'
        });

        // 自定义缩放图标
        flow.registerHTML("zoomReset", ``);
        flow.registerHTML("zoomIn", `<img width="36" src="${zoom_in}">`);
        flow.registerHTML("zoomOut", `<img width="36" src="${zoom_out}">`);
        flow.registerHTML("overview", `<img width="36" src="${overview}">`);

        // 自定义开始和结束节点覆盖内置
        // 自定义开始
        flow.registerHTML("start", (flow, options, element) => {
            let themeColor = (options && options.color) || flow.themeColor;
            if (options && options.scene == "menu") {
                return `<div style='height: 100%; width: 100%; background: #fff;border-radius: 50%; border: 1px solid ${themeColor}; color: ${themeColor}; display: flex;align-items: center;justify-content: center;font-size: 10px;'>开始</div>`;
            }
            let status = element && element.data("status");
            let color = themeColor;
            return `<div style='height: 100%; width: 100%; background: #fff; border: 2px solid ${themeColor}; box-sizing: border-box; color: ${color}; display: flex;align-items: center;justify-content: center;font-size: .9em;'>开始</div>`;
        }, {
            width: 180,
            height: 60,
            text: true
        });
        // 自定义结束
        flow.registerHTML("end", (flow, options, element) => {
            let themeColor = (options && options.color) || flow.themeColor;
            if (options && options.scene == "menu") {
                return `<div style='height: 100%; width: 100%; background: ${themeColor};border-radius: 50%; border: 1px solid ${themeColor}; color: #fff; display: flex;align-items: center;justify-content: center;font-size: 10px;'>结束</div>`;
            }
            let color = "#fff";
            return `<div style='height: 100%; width: 100%; background: ${themeColor};color: ${color}; display: flex;align-items: center;justify-content: center;font-size: .9em;'>结束</div>`;
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
                return `<div style='height: 100%; width: 100%; background: #ECECEC;border: 1px solid #BDBDBD; box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.11); box-sizing: border-box; overflow: hidden;'>
                          <div style="width: 100%; height: 20px; display: flex; align-items: center;border-bottom: 1px solid #BDBDBD;">
                                <svg width="15px" height="15px" style="margin: 0 5px;"  viewBox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <g transform="translate(-0.000000, 0.000000)" fill="#797979" fill-rule="nonzero" id="形状">
                                            <path d="M7.29329427,0.0130208333 C3.26660156,0.0130208333 0.00162760417,3.27799479 0.00162760417,7.3046875 C0.00162760417,11.3313802 3.26660156,14.5963542 7.29329427,14.5963542 C11.319987,14.5963542 14.5849609,11.3313802 14.5849609,7.3046875 C14.5849609,3.27799479 11.319987,0.0130208333 7.29329427,0.0130208333 Z M11.4599609,7.82552083 L3.125,7.82552083 L3.125,6.78385417 L11.4599609,6.78385417 L11.4599609,7.82552083 Z"></path>
                                        </g>
                                    </g>
                                </svg>
                                <span style="font-family: PingFangSC-Semibold;font-size: 12px;color: #797979;font-weight: 600;">不涉及</span>
                                <div style="flex: 2;">
                                    <div class="execute-tag" style="float: right;border-left: 1px solid #BDBDBD;height: 100%; cursor: pointer;" title="执行">
                                        <svg style="pointer-events: none;" width="18px" height="18px" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g>
                                                    <rect x="0" y="0" width="20" height="20"></rect>
                                                    <polygon fill="#B50B14" transform="translate(11.333333, 10.000000) rotate(90.000000) translate(-11.333333, -10.000000) " points="11.3333333 6 16.6666667 14 6 14"></polygon>
                                                </g>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                          </div>
                          <div style="width: 100%; height: calc(100% - 20px);background: #fff"></div>
                      </div>`;
            } else {
                return `<div style='height: 100%; width: 100%; background: ${themeColor};color: #fff;border: 1px solid #BDBDBD; box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.11); box-sizing: border-box; overflow: hidden;'>
                          <div style="width: 100%; height: 20px; display: flex; align-items: center;">
                                <svg width="15px" height="15px" style="margin: 0 5px; " viewBox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <g id="dagou-4" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <g fill="#FFFFFF" fill-rule="nonzero">
                                            <path d="M7.48104559,0.0158428012 C3.3586701,0.0158428012 0.0161238514,3.35772473 0.0161238514,7.48093488 C0.0161238514,11.6033274 3.3586701,14.9453797 7.48104559,14.9453797 C11.6037617,14.9453797 14.9454733,11.6033274 14.9454733,7.48093488 C14.9454733,3.35772473 11.6037788,0.0158428012 7.48104559,0.0158428012 Z M6.80243183,9.85575088 L6.8026192,9.85609156 L6.12400543,10.5343987 L5.44505099,9.85609156 L5.44539166,9.85575088 L3.40936302,7.81990959 L4.08795974,7.14129582 L6.12381807,9.17713711 L10.8744721,4.42667042 L11.5527111,5.10560782 L6.80243183,9.85575088 Z"></path>
                                        </g>
                                    </g>
                                </svg>
                                <span style="font-size: 12px;">已执行</span>
                          </div>
                          <div style="width: 100%; height: calc(100% - 20px);background: #fff"></div>
                      </div>`;
            }
        });

        // 设置数据
        flow.setData(flowJson);

        // 初始化
        flow.resetStatus("init");

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
            console.log(evt.target);
            console.log(element);
            this.selectElement = element;
            if(evt.target.classList.contains("execute-tag")) {
                this.$message.info("点击了手动运行图标");
            } else {
                this.$message.info("点击了" + element);
            }
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