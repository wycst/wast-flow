<template>
  <div style="position: relative;">

    <el-button @click="validateProcess">校验</el-button>
    <el-switch v-model="editable" active-text="可编辑" inactive-text="不可编辑" style="margin-left: 10px;"></el-switch>
    <div ref="flow" class="wast-flow" style="width: 100%; height: 75vh; overflow: hidden;">
    </div>
    <!-- 自定义抽屉 -->
    <div
        style="position: fixed; right: 0;width: 30%;transition: all .3s;height:100vh; top: 0px;background: #fff;box-shadow:rgba(0, 0, 0, 0.08) 0px 16px 48px 16px, rgba(0, 0, 0, 0.12) 0px 12px 32px 0px, rgba(0, 0, 0, 0.16) 0px 8px 16px -8px; padding: 5px 20px;z-index: 1000;"
        :style="drawerStyle">
      <h3>
        <label>属性设置</label>
        <label style="float: right; color: red;cursor: pointer;" @click="visible = false">×</label>
      </h3>

      <el-form v-if="selectElement" label-width="150px">
        <el-form-item label="ID">
          <el-input readonly v-model:value="selectElement.id"></el-input>
        </el-form-item>
        <el-form-item label="NAME">
          <el-input v-model="selectElement.name"></el-input>
        </el-form-item>
        <el-form-item v-if="!selectElement.isPath()" label="NodeType">
          <el-input :value="selectElement.nodeType"></el-input>
        </el-form-item>

        <template v-if="selectElement.isTask()">
          <el-form-item label="是否异步">
            <el-switch v-model="selectElement.asynchronous"></el-switch>
          </el-form-item>
          <el-form-item label="超时时间（秒）">
            <el-input-number v-model="selectElement.timeout"></el-input-number>
          </el-form-item>
          <el-form-item label="延迟时间（秒）">
            <el-input-number :value="selectElement.delay"></el-input-number>
          </el-form-item>
          <el-form-item label="失败策略">
            <el-select teleported v-model="selectElement.policy">
              <el-option label="终止" value="Stop"></el-option>
              <el-option label="继续" value="Continue"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否重试">
            <el-switch v-model="selectElement.retryOnError"></el-switch>
          </el-form-item>
          <el-form-item label="重试次数">
            <el-input-number v-model="selectElement.retryCount"></el-input-number>
          </el-form-item>
          <el-form-item label="是否跳过">
            <el-switch v-model="selectElement.skip"></el-switch>
          </el-form-item>
        </template>
        <template v-else-if="selectElement.isPath()">
          <el-form-item label="连线类型">
            <el-select v-model="selectElement.conditionType">
              <el-option label="默认" value="Always"></el-option>
              <el-option label="脚本表达式" value="Script"></el-option>
              <el-option label="业务调用" value="HandlerCall"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item v-if="selectElement.conditionType == 'Script'" label="表达式内容">
            <el-input type="textarea" v-model="selectElement.script"></el-input>
          </el-form-item>
        </template>

        <el-form-item v-if="selectElement.isGateway()" label="网关类型">
          <el-select v-model="selectElement.gateway">
            <el-option label="XOR" value="XOR"></el-option>
            <el-option label="OR" value="OR"></el-option>
            <el-option label="AND" value="AND"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

<!--      <el-form>-->
<!--        <el-form-item label="数据">-->
<!--          <el-button @click="responsive++">刷新</el-button>-->
<!--          <textarea style="width: 100%; height: 300px;overflow: auto;">{{processData}}</textarea>-->
<!--        </el-form-item>-->
<!--      </el-form>-->

    </div>


  </div>
</template>

<script>
// import wrf from "../../dist/wastflow.es"
import {wf} from "../core/index"
import propertyDrawer from "./propertyDrawer.vue"
// import wf from "wastflow"
console.log(wf);

export default {
  name: "flow.vue",
  components: {propertyDrawer},
  data() {
    return {
      editable: true,
      propertyVisible: false,
      selectElement: null,

      dialogVisible: false,
      responsive: 1,
      visible: false,

      businessSvg: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M91.18976 196.096v631.808h841.62048V196.096H91.18976z m35.84 214.016H289.28v176.351232H127.02976V410.112zM325.12 410.112h571.85024v176.351232H325.12V410.112z m-198.09024 212.191232H289.28V792.064H127.02976v-169.760768z m198.09024 0h571.85024V792.064H325.12v-169.760768z"></path></svg>`,
      serviceSvg: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M688 80v44.992a180.672 180.672 0 0 0-72.992 30.016l-33.024-31.008-44 47.008 32 29.984a180 180 0 0 0-28.992 71.008H496v64h44.992c4.672 26.528 15.168 50.752 30.016 72l-34.016 32.992 46.016 46.016 32.992-34.016a179.776 179.776 0 0 0 72 30.016V528h64v-44.992a180 180 0 0 0 71.008-28.992l29.984 32 47.008-44.032-31.008-32.96c15.072-21.44 25.28-46.24 30.016-73.024H944v-64h-44.992a179.776 179.776 0 0 0-30.016-72l30.016-30.016-45.024-44.992-29.984 30.016a179.776 179.776 0 0 0-72-30.016V80h-64z m32 106.016A117.248 117.248 0 0 1 838.016 304a117.248 117.248 0 0 1-118.016 118.016A117.248 117.248 0 0 1 601.984 304 117.248 117.248 0 0 1 720 185.984zM304.992 374.976l-59.008 24 23.04 57.984a221.12 221.12 0 0 0-75.04 74.016l-56.96-23.008-24 59.008 56.96 22.976a216.832 216.832 0 0 0-6.976 53.024c0 18.24 2.72 36.032 6.976 52.992l-56.96 23.008 24 58.976 56.96-22.976a219.872 219.872 0 0 0 75.008 74.976l-23.008 57.024 59.008 24 23.008-57.024a215.36 215.36 0 0 0 52.992 7.04c18.24 0 36.096-2.752 52.992-7.04l23.04 57.024 58.976-24-23.008-57.024a221.12 221.12 0 0 0 74.016-74.976l57.984 22.976 24-58.976-57.984-23.008c4.224-16.96 6.976-34.784 6.976-52.992 0-18.24-2.752-36.096-6.976-53.024l57.984-22.976-24-59.008-57.984 23.008a220 220 0 0 0-74.016-74.016l23.008-57.984-59.008-24-23.008 57.984a216.896 216.896 0 0 0-52.992-7.008c-18.24 0-36.032 2.784-52.992 7.04l-23.008-58.016z m76 115.008a152.096 152.096 0 0 1 152.992 152.96c0 85.248-67.776 154.016-152.96 154.016a153.792 153.792 0 0 1-154.016-153.984c0-85.216 68.8-153.024 153.984-153.024z"></path></svg>`
    }
  },
  mounted() {
    console.log(" mounted ");
    this.graphicDesign = wf.render(this.$refs.flow, {
      grid: true,
      // width: "2000px",
      // height: "1000px",
      menu: {
        draggable: true
      },
      // background: "lightblue",
      panable: true,

      textEditOnDblClick: false,

      nowrap: false,

      // excludeTypes: ["manual"],

      /** 默认条件类型 */
      defaultConditionType: "HandlerCall",

      alertMessage: (message, level) => {
        this.$message.error(message);
      },

      onConnectCreated(connect) {
      },

      // 元素双击事件
      clickElement: this.clickElement,
      dblclickElement: this.dblclickElement,
      clickBlank: this.clickBlank
    })

    console.log(this.graphicDesign.getData());
    window.instance = this.graphicDesign;
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
      if(this.visible) {
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
    }
  }
}
</script>

<style scoped>
</style>