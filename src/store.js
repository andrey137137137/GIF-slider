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
  strict: true,
  state: {
    scale: 2,
    items: [],
    lightboxIndex: -1,
    lastTopID: 0,
    isBlackTheme: false,
  },
  getters: {
    buttonStyle(state) {
      return state.isBlackTheme ? 'dark' : 'secondary';
    },
    cardBgStyle(state) {
      return state.isBlackTheme ? 'dark' : 'light';
    },
    cardTextStyle(state) {
      return state.isBlackTheme ? 'white' : 'black';
    },
    toShowPrev(state) {
      return isLargerFirst(state.lightboxIndex);
    },
    toShowNext(state) {
      const { lightboxIndex, items } = state;
      return isLessLast(lightboxIndex, items);
    },
  },
  mutations: {
    toggleTheme(state) {
      state.isBlackTheme = !state.isBlackTheme;
    },
    setScale(state, height) {
      state.scale = height;
    },
    decScale(state) {
      state.scale--;
    },
    incScale(state) {
      state.scale++;
    },
    setItems(state, data) {
      state.items = data;
    },
    setLightboxIndex(state, index) {
      state.lightboxIndex = index;
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
    setLastTopID(state, height) {
      state.lastTopID = height;
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
      if (state.lightboxIndex == state.items.length - 1) {
        state.lightboxIndex--;
      }
      state.items.splice(index, 1);
    },
  },
});
