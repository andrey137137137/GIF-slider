<template lang="pug">
#app.slider
  form.my-form(@submit.prevent='onCancelFormSubmit')
    b-button-group.d-flex.py-4
      CtrlButton(variant='info', title='-', :handle='onShrinkScale')
      b-form-input(
        :value='scale',
        @input='setScale($event)',
        type='range',
        :min='minScale',
        :max='maxScale',
        @keyup.prevent='',
        @keydown.prevent=''
      )
      CtrlButton(variant='info', title='+', :handle='onGrowScale')
    b-container#container.px-0.d-flex.flex-nowrap.justify-content-start.list.slider-frames(
      v-show='items.length',
      fluid,
      :style='containerStyle',
      ref='container',
      @wheel.prevent='onContainerWheel',
      @keyup.prevent='',
      @keydown.prevent=''
    )
      b-row.slider-row.mx-0(
        v-for='(group, groupIndex) in groups',
        :style='groupStyle(groupIndex)'
      )
        DropItem(
          v-for='(item, cellIndex) in itemsByGroup(group)',
          :key='item.name',
          :index='indexByGroup(group, cellIndex)',
          :style='elemStyle',
          ref='items'
        )
        DropItem(
          v-if='isAddingItemInGroup(groupIndex)',
          :style='addingItemStyle'
        )
      b-row.slider-row.mx-0(v-if='isEmptyGroup', :style='emptyGroupStyle')
        DropItem(:style='elemStyle')
  DropItem(v-if='isSingleAddingItem', :isSingle='true')
  .slider-main(v-show='toShowLightbox', @wheel.prevent='onLightboxWheel')
    .slider-main_img_wrap.d-flex.align-items-center(@dblclick='onHideLightbox')
      img.slider-main_img(:src='lightBoxSrc')
    .slider-nav.slider-nav--prev(
      v-show='toShowPrev',
      :style='slideNavStyles',
      @click='onPrevSlide'
    )
    .slider-nav.slider-nav--next(
      v-show='toShowNext',
      :style='slideNavStyles',
      @click='onNextSlide'
    )
</template>

<script>
import axios from 'axios';
import dropMixin from '@/dropMixin';
import DropItem from '@components/DropItem';
import CtrlButton from '@components/CtrlButton';
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'App',
  components: {
    CtrlButton,
    DropItem,
  },
  mixins: [dropMixin],
  data() {
    return {
      maxItemHeight: 0,
      containerOuterWidth: 0,
      oneRowHeight: 395,
      curIndex: 0,
      minScale: 1,
      maxScale: 8,
      containerWidth: 0,
      rows: 1,
      timeoutId: 0,
    };
  },
  computed: {
    ...mapState(['scale', 'items', 'lightboxIndex']),
    ...mapGetters(['toShowPrev', 'toShowNext']),
    isNotOneCol() {
      return this.cols > 1;
    },
    toShowLightbox() {
      return this.lightboxIndex >= 0;
    },
    areOddItems() {
      return this.items.length % 2;
    },
    scalesConfig() {
      const cols = this.maxScale - this.scale + 1;
      const rows = cols > 3 ? 2 : 1;
      return { rows: rows, cols };
    },
    cols() {
      return this.scalesConfig.cols;
    },
    containerInnerWidth() {
      const REST = this.containerWidth % this.cols;
      if (REST) {
        return this.containerWidth - REST;
      }
      return this.containerWidth;
    },
    containerStyle() {
      if (!this.items.length) {
        return '';
      }
      return 'overflow-x: scroll';
    },
    lastGroupItemsCount() {
      return this.items.length - (this.groups - 1) * this.groupSize;
    },
    elemWidth() {
      return Math.floor(this.containerInnerWidth / this.cols);
    },
    addingItemStyle() {
      if (this.lastGroupItemsCount < this.cols) {
        return this.elemStyle;
      }

      const ROW_REST = this.items.length % this.groupSize;
      return this.getStyleWidth((this.groupSize - ROW_REST) * this.elemWidth);
    },
    elemStyle() {
      return this.getStyleWidth(this.elemWidth);
    },
    emptyGroupStyle() {
      return {
        ...this.elemStyle,
        // ...this.whenAlignItemsCenter(this.scalesConfig.rows),
      };
    },
    groupSize() {
      // return this.scalesConfig.rows * this.cols;

      if (this.rows == 1) {
        return this.cols;
      }

      // const { rows } = this.scalesConfig;

      // if (this.rows > rows) {
      //   return this.rows * this.cols;
      // }

      return this.scalesConfig.rows * this.cols;
    },
    groups() {
      return Math.ceil(this.items.length / this.groupSize);
    },
    areCompleteGroups() {
      const { length } = this.items;
      // if (!length) {
      //   return false;
      // }
      return length && length % this.groupSize == 0;
    },
    isSingleAddingItem() {
      const { length } = this.items;
      if (!length) {
        return true;
      }
      // if (this.rows > 1) {
      //   return false;
      // }
      return length >= this.cols;
    },
    isEmptyGroup() {
      return !this.isSingleAddingItem && this.areCompleteGroups;
    },
    slideNavStyles() {
      return {
        width: Math.ceil(this.containerInnerWidth / 8) + 'px',
      };
    },
    lightBoxSrc() {
      if (!this.toShowLightbox) {
        return '';
      }
      const { name, ext } = this.items[this.lightboxIndex];
      return '/upload/' + name + ext;
    },
  },
  methods: {
    ...mapMutations([
      'setScale',
      'decScale',
      'incScale',
      'setItems',
      'clearLightboxIndex',
      'decLightboxIndex',
      'incLightboxIndex',
      'setLastTopID',
      'decLastTopID',
    ]),
    withPx(value) {
      return value + 'px';
    },
    getStyleWidth(width) {
      return {
        'min-width': this.withPx(width),
        'max-width': this.withPx(width),
      };
    },
    groupStyle(index) {
      let width = this.containerInnerWidth;

      if (index == this.groups - 1 && this.lastGroupItemsCount < this.cols) {
        width = this.elemWidth * this.lastGroupItemsCount;
      }

      return {
        'min-width': this.withPx(width),
        // ...this.whenAlignItemsCenter(1),
      };
    },
    isAddingItemInGroup(groupIndex) {
      if (this.areCompleteGroups || this.isSingleAddingItem) {
        return false;
      }
      return groupIndex == this.groups - 1 && this.isNotOneCol;
    },
    whenAlignItemsCenter(rows) {
      return {
        'align-items': this.scalesConfig.rows == rows ? 'center' : 'start',
      };
    },
    getGroupFinalIndex(groupIndex) {
      return this.groupSize * groupIndex;
    },
    getGroupStartIndex(groupIndex) {
      return this.getGroupFinalIndex(groupIndex - 1);
    },
    itemsByGroup(group) {
      const START = this.getGroupStartIndex(group);
      const GROUP_END = this.getGroupFinalIndex(group);
      const END = GROUP_END > this.items.length ? this.items.length : GROUP_END;
      const tempArray = [];

      for (let i = START; i < END; i++) {
        tempArray.push(this.items[i]);
      }

      return tempArray;
    },
    indexByGroup(group, index) {
      return index + this.getGroupStartIndex(group);
    },
    setRows() {
      // const TEMP = Math.floor(
      //   (window.innerHeight - this.$refs.reload.$el.offsetHeight) /
      //     this.oneRowHeight,
      // );
      const TEMP = Math.floor(window.innerHeight / this.oneRowHeight);
      this.rows = !TEMP ? 1 : TEMP;
    },
    scrollToLastIndex() {
      console.log('scrollToLastIndex');
      const $container = this.$refs.container;
      $container.scrollLeft = $container.scrollWidth;
    },
    scrollToLightboxIndex() {
      console.log('scrollToLightboxIndex');
      const $container = this.$refs.container;
      const ELEM_WIDTH = this.elemWidth;
      const GROUP_INDEX = Math.floor(this.lightboxIndex / this.groupSize);
      const ELEM_INDEX = this.lightboxIndex % this.cols;
      const MULTIPLIER = GROUP_INDEX * this.cols + ELEM_INDEX;
      let offset = 0;

      if (this.cols > 2) {
        const COND = this.cols % 2;
        let size = this.cols;

        if (COND) {
          size--;
        }

        offset = size / 2;

        if (!COND) {
          offset--;
        }
      }

      $container.scrollLeft = MULTIPLIER * ELEM_WIDTH - offset * ELEM_WIDTH;
    },
    scrollTo(dir) {
      console.log('scrollTo');
      if (!this.items.length) {
        return;
      }

      const $container = this.$refs.container;
      const ELEM_WIDTH = this.elemWidth;
      const DIFF = $container.scrollLeft % ELEM_WIDTH;
      const MULTIPLIER = dir > 0 ? 1 : -1;

      // if (X % COLS_WIDTH <= ELEM_WIDTH) {
      //   DIFF = 0;
      // }

      // console.log('------------------------------------');
      // console.log('scrollLeft: ' + $container.scrollLeft);
      console.log('ELEM_WIDTH: ' + ELEM_WIDTH);
      console.log('DIFF:       ' + DIFF);
      // console.log('X:          ' + X);
      // console.log('MULTIPLIER: ' + MULTIPLIER);

      let step;

      if (!DIFF) {
        step = ELEM_WIDTH;
      } else if (MULTIPLIER < 0) {
        step = DIFF;
      } else {
        step = ELEM_WIDTH - DIFF;
      }

      // console.log('step:       ' + step);

      $container.scrollLeft += MULTIPLIER * step;
    },
    setScales() {
      // console.log(window.innerHeight);
      // console.log(this.$refs.reload);
      // console.log(this.$refs.container);
      this.containerWidth = this.$refs.container.offsetWidth;

      const MIN_ELEM_WIDTH = 200;
      let divider = 1;

      while (this.containerWidth / divider >= MIN_ELEM_WIDTH) {
        divider++;
      }

      this.maxScale = divider;

      if (this.scale > this.maxScale) {
        this.setScale(this.maxScale);
      }
    },
    onHideLightbox() {
      this.clearLightboxIndex();
      document.body.style.overflow = '';
    },
    onPrevSlide() {
      this.decLightboxIndex();
      this.scrollToLightboxIndex();
    },
    onNextSlide() {
      this.incLightboxIndex();
      this.scrollToLightboxIndex();
    },
    onKey(e) {
      e.preventDefault();
      const { key } = e;
      const STEP = 150;

      if (key == 'ArrowUp') {
        if (this.toShowLightbox) {
          this.onHideLightbox();
        } else {
          window.scrollBy(0, -STEP);
        }
        return;
      }

      if (key == 'ArrowDown') {
        if (this.toShowLightbox) {
          this.onHideLightbox();
        } else {
          window.scrollBy(0, STEP);
        }
        return;
      }

      if (key == 'ArrowLeft') {
        if (this.toShowLightbox) {
          this.onPrevSlide();
        } else {
          this.scrollTo(-1);
        }
        return;
      }

      if (key == 'ArrowRight') {
        if (this.toShowLightbox) {
          this.onNextSlide();
        } else {
          this.scrollTo(1);
        }
        return;
      }

      if (key == 'Delete') {
        console.log(key);
        this.delete(this.lightboxIndex);
      }
    },
    onResize() {
      clearTimeout(this.timeoutId);
      const $vm = this;
      this.timeoutId = setTimeout(() => {
        console.log('RESIZED');
        $vm.setRows();
        if ($vm.containerWidth != $vm.$refs.container.offsetWidth) {
          $vm.setScales();
        }
      }, 500);
    },
    onShrinkScale() {
      if (this.scale > this.minScale) {
        this.decScale();
      }
    },
    onGrowScale() {
      if (this.scale < this.maxScale) {
        this.incScale();
      }
    },
    onContainerWheel(e) {
      this.scrollTo(e.deltaY > 0 ? -1 : 1);
    },
    onLightboxWheel(e) {
      if (e.deltaY > 0) {
        this.onPrevSlide();
      } else {
        this.onNextSlide();
      }
    },
    onCancelFormSubmit() {
      return false;
    },
    setMaxItemHeight() {
      const $vm = this;
      $vm.$refs.items.forEach($item => {
        const { offsetHeight } = $item.$el;
        if ($vm.maxItemHeight < offsetHeight) {
          $vm.maxItemHeight = offsetHeight;
        }
      });
    },
    onRefresh() {
      const $vm = this;
      axios.get(this.uploadHost).then(res => {
        $vm.setItems(res.data);

        if (!$vm.items.length) {
          $vm.setLastTopID(0);
          return;
        }

        const LAST_INDEX = $vm.items.length - 1;
        const LAST_LOADED_TOP_ID = $vm.items[LAST_INDEX].name;
        $vm.setLastTopID(parseInt(LAST_LOADED_TOP_ID));

        if ($vm.getIdParts(LAST_INDEX).length > 1) {
          $vm.decLastTopID();
        }
      });
    },
  },
  created() {
    this.onRefresh();
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    document.addEventListener('keydown', this.onKey);
    this.setRows();
    this.setScales();
  },
  // beforeUpdate() {
  //   this.setMaxItemHeight();
  // },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('keydown', this.onKey);
  },
};
</script>

<style lang="scss">
@import '@styles/app';
</style>
