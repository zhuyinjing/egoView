import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'list',
      component: resolve => require(['@/views/list'], resolve)
    },
    {
      path: '/plot',
      name: 'plot',
      component: resolve => require(['@/views/plot'], resolve)
    },
    {
      path: '/list',
      name: 'list',
      component: resolve => require(['@/views/list'], resolve)
    },
  ]
})
