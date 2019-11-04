// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import vueAxios from 'vue-axios'
import store from './store/index'
import 'datatables/media/css/jquery.dataTables.min.css'
import 'datatables/media/js/jquery.dataTables.min.js'
import 'datatables.net-bs';
import jsZip from 'jszip';
import 'datatables.net-buttons-bs';
import 'datatables.net-buttons/js/buttons.colVis.min';
import 'datatables.net-buttons/js/dataTables.buttons.min';
import 'datatables.net-buttons/js/buttons.flash.min';
import 'datatables.net-buttons/js/buttons.html5.min';
window.JSZip = jsZip;
// 国际化
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
const i18n = new VueI18n({
  // locale: LangStorage.getLang('zh'),  // 语言标识，后面会用做切换和将用户习惯存储到本地浏览器
  locale: localStorage.language?localStorage.language:'zh', // 语言标识
  messages: {
    'zh': require('./common/lang/zh'),
    'en': require('./common/lang/en')
  }
})
Vue.use(ElementUI)
Vue.use(vueAxios, axios)

if (sessionStorage.username) {
  store.state.username = sessionStorage.username
}

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: { App },
  template: '<App/>'
})
