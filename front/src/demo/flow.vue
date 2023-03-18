<template>
  <div style="position: relative;">
    <el-button @click="validateProcess">校验</el-button>
    <el-button @click="pop">多实例（弹出框）</el-button>
    <el-switch v-model="editable" active-text="可编辑" inactive-text="不可编辑" style="margin-left: 10px;"></el-switch>
    <div ref="flow" class="wast-flow" style="width: 100%; height: 75vh; overflow: hidden;">
    </div>
    <el-dialog title="测试" v-model="dialogVisible" :before-close="handleClose">
      <div ref="flow2" class="wast-flow" style="width: 100%; height: 75vh; overflow: hidden;">
      </div>
    </el-dialog>

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
      visible: false
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

      nowrap: false,

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