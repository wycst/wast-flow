<template>
  <el-drawer v-model="visible">
    <template #header>
      <h4>set title by slot</h4>
    </template>
    <template #default>
      <div>
          <el-form>
            <el-form-item label="元素名称">
              <el-input v-model="elementName"></el-input>
            </el-form-item>

            <el-form-item v-if="isGateway" label="网关类型">
              <el-select v-model="gatewayType">
                <el-option value="XOR">XOR</el-option>
                <el-option value="OR">OR</el-option>
                <el-option value="AND">AND</el-option>
              </el-select>
            </el-form-item>

            <el-form-item v-if="isConnect" label="连线类型">
              <el-select v-model="conditionType">
                <el-option value="Always" label="默认">默认</el-option>
                <el-option value="HandlerCall" label="条件">条件</el-option>
              </el-select>
            </el-form-item>

            <el-form-item v-if="isCondition" label="条件配置">
              <div>xxxx-条件配置</div>
            </el-form-item>

          </el-form>
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        footer
      </div>
    </template>
  </el-drawer>
</template>

<script>

import element from "./element";
export default {
  name: "property.vue",
  props: {
    drawer: Boolean
  },
  data() {
    return {
      visible: false
    }
  },
  mixins: [element],
  watch: {
    drawer: {
      handler(val) {
        this.visible = val;
      },
      immediate: true
    }
  }
}
</script>

<style scoped>

</style>