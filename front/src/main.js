import { createApp } from 'vue'
import ElementPlus from "element-plus"
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import "element-plus/dist/index.css"
import App from './App.vue'
const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

import './index.css'
import router from "./router/";

app.config.productionTip = false;
app.use(ElementPlus)
app.use(router)
app.mount('#app')

