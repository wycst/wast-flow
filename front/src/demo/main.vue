<template>
  <section class="el-container is-vertical">
    <header class="el-header">
      <el-menu router :default-active="activeIndex" class="el-menu-demo" mode="horizontal">
        <el-menu-item index="/main/index">首页</el-menu-item>
        <el-menu-item index="/main/flow">业务流程</el-menu-item>
        <el-menu-item index="/main/flow-custom">自定义节点流程</el-menu-item>
      </el-menu>
    </header>
    <main class="el-main">
      <router-view></router-view>
    </main>
  </section>
</template>
<script>
export default {
  name: "main.vue",
  data() {
    return {
      activeIndex: '/main/flow-custom'
    }
  }
}
</script>

<style scoped>

</style>