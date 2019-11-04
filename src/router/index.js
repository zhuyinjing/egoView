import Vue from 'vue'
import Router from 'vue-router'
const home = resolve => require(['@/views/home'], resolve)

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: home
    },
    {
      path: '/home',
      name: 'home',
      component: home
    },
  ]
})
