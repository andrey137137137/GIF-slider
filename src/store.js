import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

function isLargerFirst(index) {
  return index > 0;
}

function isLessLast(index, array) {
  return index < array.length - 1;
}

function getMaxHeight(array) {
  let temp = 0;

  array.forEach(({ height }) => {
    if (height > temp) {
      temp = height;
    }
  });

  return temp;
}

export default new Vuex.Store({
  strict: true,
  state: {
    imageHeights: [],
    maxItemHeight: 0,
    scale: 2,
    itemWidth: 0,
    itemProportion: 0,
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
    setItemWidth(state, height) {
      state.itemWidth = height;
    },
    clearImageHeights(state) {
      state.imageHeights = [];
      state.maxItemHeight = 0;
    },
    addImageHeight(state, { index, height }) {
      if (state.maxItemHeight) {
        return;
      }

      state.imageHeights.push({ index, height });

      if (state.imageHeights.length >= state.items.length) {
        const TEMP = getMaxHeight(state.imageHeights);

        if (state.maxItemHeight < TEMP) {
          state.maxItemHeight = TEMP;
          state.itemProportion = state.maxItemHeight / state.itemWidth;
        }
      }
    },
    clearMaxItemHeight(state) {
      state.maxItemHeight = 0;
    },
    resetMaxItemHeight(state) {
      state.maxItemHeight = getMaxHeight(state.items);
    },
    setMaxItemHeight(state, height) {
      state.maxItemHeight = state.itemProportion * height;
    },
    setScale(state, height) {
      state.maxItemHeight = 0;
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
