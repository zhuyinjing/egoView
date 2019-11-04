import 'es6-promise/auto'
import Vuex from 'vuex'
import Vue from 'vue'
import * as getters from './getters.js'
import * as mutations from './mutations.js'
import * as actions from './actions.js'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    username: 'test',
    count: 0,
    todos: [
      { id: 1, text: '1', done: true },
      { id: 2, text: '2', done: false }
    ]
  },
  getters,
  mutations,
  actions
})
