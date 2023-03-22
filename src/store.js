import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    items: [],
    lightboxIndex: -1,
    lastTopID: 0,
  },
  mutations: {
    setItems(state, data) {
      state.items = data;
    },
    setLightboxIndex(state, value) {
      state.lightboxIndex = value;
    },
    setLastTopID(state, value) {
      state.lastTopID = value;
    },
    decLastTopID(state) {
      state.lastTopID--;
    },
    insertBeforeItem(state, { name, ext, index }) {
      state.items.splice(index, 0, { name, ext });
    },
    replaceItem(state, { index, ext }) {
      const tempArray = state.items;
      tempArray[index].ext = ext;
      state.items = tempArray;
    },
    addItem(state, { lastTopID, ext }) {
      state.lastTopID = lastTopID;
      state.items.push({ name: lastTopID + '', ext });
    },
    deleteItem(state, index) {
      state.items.splice(index, 1);
    },
  },
});
