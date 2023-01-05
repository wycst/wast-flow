<template>
  <div>
    <el-button @click="validateProcess">校验</el-button>
    <el-switch v-model="editable" active-text="可编辑" inactive-text="不可编辑" style="margin-left: 10px;"></el-switch>
    <div ref="flow" class="wast-flow" style="width: 100%; height: 680px; overflow: hidden;">
    </div>

    <property-drawer :element="selectElement" v-model="propertyVisible"></property-drawer>

  </div>
</template>

<script>
// import wrf from "../../dist/wastflow.es"
import {wf} from "../core/index"
// import wf from "wastflow"
console.log(wf);

import propertyDrawer from "./propertyDrawer.vue"

export default {
  name: "flow.vue",
  components: {propertyDrawer},
  data() {
    return {
      editable: true,
      propertyVisible: false,
      selectElement: null
    }
  },
  mounted() {
    console.log(" mounted ");
    this.graphicDesign = wf.render(this.$refs.flow, {
      grid: true,
      width: "2000px",
      height: "1000px",
      menu: {
        draggable: true
      },
      // background: "lightblue",
      panable: true,

      /** 默认条件类型 */
      defaultConditionType: "HandlerCall",

      alertMessage: (message, level) => {
        this.$message.error(message);
      },

      onConnectCreated(connect) {
      },

      // 元素双击事件
      dblclickElement: this.dblclickElement,

    })
    // 绘制矩形
    // let node = this.graphicDesign.createNode(100, 100, 100, 90, 8);
    // let node2 = this.graphicDesign.createNode(200, 100, 100, 90, 8);

    // let node1 = graphicDesign.createNode(300, 300, 200, 200, 8);
    console.log(this.graphicDesign.getData());
    window.instance = this.graphicDesign;
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
    dblclickElement(element, evt) {
      this.selectElement = element;
      // this.propertyVisible = true;
    },
    validateProcess() {
      let error = this.graphicDesign.validate();
      if(error) {
        this.$message.error(error);
      } else {
        this.$message.success("成功");
      }
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
    renderPath() {

      let path = this.graphicDesign.renderPath("M300,100L100,100L200,200Z", {
        fill: "none",
        stroke: "#000000",
        "stroke-dasharray": "3 2"
      });
      path.node.setAttribute("stroke-dasharray", "2 2");
    },
    exportImage() {
      this.graphicDesign.exportImage();
    },

    setEditable() {
      this.editable = !this.editable;
      this.graphicDesign.setEditable(this.editable);
    }
  },

  watch: {
    editable() {
      if(this.graphicDesign) {
        this.graphicDesign.setEditable(this.editable);
      }
    }
  }
}
</script>

<style scoped>
</style>