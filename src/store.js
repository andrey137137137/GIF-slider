import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    lightboxIndex: -1,
  },
  mutations: {
    setLightboxIndex(state, value) {
      state.lightboxIndex = value;
    },
  },
});
