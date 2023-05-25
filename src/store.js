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
    // imageHights: [],
    imagesCount: 0,
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
    setItemWidth(state, value) {
      state.itemWidth = value;
    },
    clearImageHights(state) {
      // state.imageHights = [];
      state.imagesCount = 0;
      state.maxItemHeight = 0;
    },
    addImageHeight(state, { index, value }) {
      // state.imageHights.push(value);

      this.$set(state.items[index], 'height', value);
      state.imagesCount++;

      // if (state.imageHights.length >= state.items.length) {
      if (state.imagesCount >= state.items.length) {
        const TEMP = getMaxHeight(state.items);

        if (state.maxItemHeight < TEMP) {
          state.maxItemHeight = TEMP;
          state.itemProportion = state.maxItemHeight / state.itemWidth;
        }
      }
    },
    resetMaxItemHeight(state) {
      state.maxItemHeight = getMaxHeight(state.items);
    },
    clearMaxItemHeight(state) {
      state.maxItemHeight = 0;
    },
    setMaxItemHeight(state, value) {
      state.maxItemHeight = state.itemProportion * value;
    },
    setScale(state, value) {
      state.maxItemHeight = 0;
      state.scale = value;
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
      if (state.lightboxIndex == state.items.length - 1) {
        state.lightboxIndex--;
      }
      state.items.splice(index, 1);
    },
  },
});
