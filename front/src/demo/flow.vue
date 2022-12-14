<template>
  <div>
    <el-button @click="validateProcess">校验</el-button>
    <div ref="flow" class="wast-flow" style="width: 100%; height: 680px; overflow: hidden;">
    </div>
  </div>
</template>

<script>
// import wrf from "../../dist/wastflow.es"
import {wf} from "../core/index"
// import wf from "wastflow"
console.log(wf);
export default {
  name: "flow.vue",
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
      panable: true
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
    }
  }
}
</script>

<style scoped>
</style>