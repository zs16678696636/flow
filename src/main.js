import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'element-ui/lib/theme-chalk/index.css'
import { Button, Select, Input, Tooltip } from 'element-ui'

Vue.prototype.$ELEMENT = { size: 'mini' }
Vue.use(Button)
Vue.use(Select)
Vue.use(Input)
Vue.use(Tooltip)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
