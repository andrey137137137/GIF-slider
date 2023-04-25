<template lang="pug">
#app.slider
  form.my-form(@submit.prevent='onCancelFormSubmit')
    .d-flex.flex-column(ref='top')
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
      b-form-checkbox#checkbox-1.align-self-center(
        v-model='toShowAddItemInGroup',
        name='checkbox-1'
      ) To show add item in group
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
        :key='groupIndex',
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
  DropItem(v-if='isSingleAddingItem', :isSingle='true', ref='bottom')
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
      containerOuterWidth: 0,
      oneRowHeight: 395,
      curIndex: 0,
      minScale: 1,
      maxScale: 8,
      containerWidth: 0,
      screenHeight: 0,
      tempRows: 1,
      timeoutId: 0,
      toShowAddItemInGroup: false,
    };
  },
  computed: {
    ...mapState(['maxItemHeight', 'scale', 'items', 'lightboxIndex']),
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
      let rows = 0;

      if (!this.screenHeight || !this.maxItemHeight) {
        rows = cols > 3 ? 2 : 1;
      } else {
        const BOTTOM_HEIGHT = this.isSingleAddingItem
          ? this.$refs.bottom.$el.offsetHeight
          : 0;
        const REST_HEIGHT =
          this.screenHeight - this.$refs.top.offsetHeight - BOTTOM_HEIGHT;

        rows = Math.floor(REST_HEIGHT / this.maxItemHeight);
        rows = !rows ? 1 : rows;
      }

      // const TEMP_ROWS = cols > 3 ? 2 : 1;
      // return { rows: TEMP_ROWS, cols };

      return { rows, cols };
    },
    rows() {
      return this.scalesConfig.rows;
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
        // ...this.whenAlignItemsCenter(this.rows),
      };
    },
    groupSize() {
      // return this.rows * this.cols;

      if (this.tempRows == 1) {
        return this.cols;
      }

      // if (this.tempRows > this.rows) {
      //   return this.tempRows * this.cols;
      // }

      return this.rows * this.cols;
    },
    groups() {
      return Math.ceil(this.items.length / this.groupSize);
    },
    areCompleteGroups() {
      const { length } = this.items;
      return length && length % this.groupSize == 0;
    },
    isSingleAddingItem() {
      return !this.toShowAddItemInGroup || !this.items.length;
    },
    isEmptyGroup() {
      return this.toShowAddItemInGroup && this.areCompleteGroups;
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
      const CORRECTION = this.toShowAddItemInGroup ? 1 : 0;
      let width = this.containerInnerWidth;

      if (
        index == this.groups - 1 &&
        this.lastGroupItemsCount < this.cols - CORRECTION
      ) {
        width = this.elemWidth * (this.lastGroupItemsCount + CORRECTION);
      }

      return {
        'min-width': this.withPx(width),
        // ...this.whenAlignItemsCenter(1),
      };
    },
    isAddingItemInGroup(groupIndex) {
      if (this.toShowAddItemInGroup && !this.areCompleteGroups) {
        return groupIndex == this.groups - 1 && this.isNotOneCol;
      } else {
        return false;
      }
    },
    whenAlignItemsCenter(rows) {
      return {
        'align-items': this.rows == rows ? 'center' : 'start',
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
    scrollToLastIndex() {
      console.log('scrollToLastIndex');
      const $container = this.$refs.container;
      console.log($container.scrollWidth);
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
    setTempRows() {
      // const TEMP = Math.floor(
      //   (window.innerHeight - this.$refs.reload.$el.offsetHeight) /
      //     this.oneRowHeight,
      // );
      const TEMP = Math.floor(window.innerHeight / this.oneRowHeight);
      this.tempRows = !TEMP ? 1 : TEMP;
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
    onResize() {
      clearTimeout(this.timeoutId);
      const $vm = this;
      this.timeoutId = setTimeout(() => {
        console.log('RESIZED');
        $vm.setTempRows();
        if ($vm.containerWidth != $vm.$refs.container.offsetWidth) {
          $vm.setScales();
        }
        if ($vm.screenHeight != document.documentElement.clientHeight) {
          $vm.screenHeight = document.documentElement.clientHeight;
        }
      }, 500);
    },
  },
  created() {
    this.onRefresh();
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    document.addEventListener('keydown', this.onKey);
    this.setTempRows();
    this.setScales();
    this.screenHeight = document.documentElement.clientHeight;
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('keydown', this.onKey);
  },
};
</script>

<style lang="scss">
@import '@styles/app';
</style>
