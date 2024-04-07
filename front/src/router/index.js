import { createRouter, createWebHashHistory } from "vue-router";
const routers = [
  {
    path: "/",
    name: "home",
    redirect: "/main/flow",
  },
  {
    path: "/iframe",
    name: "iframe",
    component: () => import("../demo/iframe.vue"),
  },
  {
    path: "/main",
    title: "主页",
    name: "main",
    component: () => import("../demo/main.vue"),
    children: [
      {
        path: "index",
        title: "首页",
        name: "index",
        component: () => import("../demo/index.vue"),
      },
      {
        path: "flow",
        title: "流程",
        name: "flow",
        component: () => import("../demo/flow.vue"),
      },
      {
        path: "flow-custom",
        title: "自定义流程",
        name: "flow-custom",
        component: () => import("../demo/flow-custom.vue"),
      }
    ],
  },
];
const constantRouterMap = routers;

/*
官方文档说明：
新的 history 配置取代 mode#
mode: 'history' 配置已经被一个更灵活的 history 配置所取代。根据你使用的模式，你必须用适当的函数替换它：

"history": createWebHistory()
"hash": createWebHashHistory()
"abstract": createMemoryHistory()

更多内容可以参见官方文档：https://router.vuejs.org/zh/guide/migration/index.html#%E6%96%B0%E7%9A%84-history-%E9%85%8D%E7%BD%AE%E5%8F%96%E4%BB%A3-mode
*/

const router = createRouter({
  history: createWebHashHistory(), // hash模式
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes: constantRouterMap,
});

export default router;
