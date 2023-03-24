import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

function isLargerFirst(index) {
  return index > 0;
}

function isLessLast(index, array) {
  return index < array.length - 1;
}

export default new Vuex.Store({
  state: {
    items: [],
    lightboxIndex: -1,
    lastTopID: 0,
  },
  getters: {
    toShowPrev(state) {
      return isLargerFirst(state.lightboxIndex);
    },
    toShowNext(state) {
      const { lightboxIndex, items } = state;
      return isLessLast(lightboxIndex, items);
    },
  },
  mutations: {
    setItems(state, data) {
      state.items = data;
    },
    setLightboxIndex(state, value) {
      state.lightboxIndex = value;
    },
    clearLightboxIndex(state) {
      state.lightboxIndex = -1;
    },
    decLightboxIndex(state) {
      if (isLargerFirst(state.lightboxIndex)) {
        state.lightboxIndex--;
      }
    },
    incLightboxIndex(state) {
      const { lightboxIndex, items } = state;
      if (isLessLast(lightboxIndex, items)) {
        state.lightboxIndex++;
      }
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
