<template>

  <div>
    <div>
      测试嵌入grafana
    </div>
    <iframe id="iframe" src="/grafana/d/zn5vmt24z/new-dashboard2222?orgId=1" style="height:800px;width:100%;opacity: 0"
            @load="onLoad">
    </iframe>
  </div>
</template>

<script>
export default {
  name: "iframe",
  methods: {
    // onLoad
    onLoad(dom) {
      console.log("onLoad");
      console.log(dom);
      this.$el.querySelector("iframe").style.opacity = "1";
      this.$el.querySelector("iframe").contentDocument.querySelector("nav").style.display = "none";
    },
  }
}
</script>

<style scoped>

</style>