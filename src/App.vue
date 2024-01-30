<template lang="pug">
#app.slider(:class='sliderThemeClass')
  form.my-form(@submit.prevent='onCancelFormSubmit')
    b-container(fluid)
      b-row
        b-col
          //- b-form-input(v-model='rows', type='number')
          b-form-select.slider-select(
            v-model='selectedRows',
            :options='rowsOptions'
          )
        b-col(cols='2')
          b-form-checkbox#checkbox-1(
            v-model='toShowAddItemInGroup',
            name='checkbox-1',
            button,
            :button-variant='buttonStyle'
          )
            | To show add item in group
        b-col(cols='1')
          b-form-checkbox#checkbox-2(
            switch,
            :value='isBlackTheme',
            @change='toggleTheme',
            name='checkbox-2',
            button,
            :button-variant='buttonStyle'
          )
            | Toggle theme on {{ themeCheckboxText }}
    .d-flex.flex-column(ref='top')
      b-button-group.d-flex.py-4
        CtrlButton(variant='info', title='-', :handle='onShrinkScale')
        b-form-input(
          :value='scale',
          @input='onRange($event)',
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
        :key='groupIndex',
        :style='groupStyle(groupIndex)'
      )
        DropItem(
          v-for='(item, cellIndex) in itemsByGroup(group)',
          :key='item.name',
          :index='indexByGroup(group, cellIndex)',
          :style='elemStyle'
        )
        DropItem(
          v-if='isAddingItemInGroup(groupIndex)',
          :style='addingItemStyle'
        )
      b-row.slider-row.mx-0(v-if='isEmptyGroup', :style='emptyGroupStyle')
        DropItem(:style='elemStyle')
  DropItem(v-show='isSingleAddingItem', :isSingle='true', ref='bottom')
  .slider-main(
    v-show='toShowLightbox',
    @wheel.prevent='onLightboxWheel',
    @dragstart='onDragStart($event)'
  )
    .slider-main_img_wrap.d-flex.align-items-center(
      @dblclick='onHideLightbox',
      @dragenter.prevent.stop='onDragEnter',
      @dragover.prevent.stop='onDragOver',
      @dragleave.prevent.stop='onDragLeave',
      @drop.prevent.stop='onDrop($event, lightboxIndex)'
    )
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
      // curIndex: 0,
      minScale: 1,
      maxScale: 8,
      containerWidth: 0,
      screenHeight: 0,
      // rows: 1,
      selectedRows: null,
      rowsOptions: [],
      vertStep: 150,
      resizeId: 0,
      loadingId: 0,
      toShowAddItemInGroup: false,
      scrollShift: 0,
      diffScrollShift: 0,
      isLoading: false,
    };
  },
  computed: {
    // ...mapState(['isBlackTheme', 'scale', 'items', 'lightboxIndex']),
    ...mapState(['isBlackTheme', 'scale']),
    ...mapGetters(['buttonStyle', 'toShowPrev', 'toShowNext']),
    sliderThemeClass() {
      return this.isBlackTheme ? 'slider--black' : '';
    },
    themeCheckboxText() {
      return this.isBlackTheme ? 'white' : 'black';
    },
    isNotOneCol() {
      return this.cols > 1;
    },
    areOddItems() {
      return this.items.length % 2;
    },
    rows() {
      // return 1;
      return !this.selectedRows ? 1 : this.selectedRows;
    },
    cols() {
      return this.maxScale - this.scale + 1;
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
      return this.rows * this.cols;
    },
    floatGroups() {
      return this.items.length / this.groupSize;
    },
    groups() {
      return Math.ceil(this.floatGroups);
    },
    fullGroups() {
      return Math.floor(this.floatGroups);
    },
    areCompleteGroups() {
      const { length } = this.items;
      return length && length % this.groupSize == 0;
    },
    fullGroupItems() {
      return this.fullGroups * this.groupSize;
    },
    colsInLastGroup() {
      const DIFF = this.items.length - this.fullGroupItems;
      return DIFF > this.cols ? this.cols : DIFF;
    },
    maxScrollShift() {
      return (
        (this.fullGroupItems - this.groupSize) / this.rows +
        this.colsInLastGroup
      );
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
    name() {
      return this.getItemProp(this.lightboxIndex, 'name');
    },
    ext() {
      return this.getItemProp(this.lightboxIndex, 'ext');
    },
  },
  methods: {
    ...mapMutations([
      'toggleTheme',
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
    // whenAlignItemsCenter(rows) {
    //   return {
    //     'align-items': this.rows == rows ? 'center' : 'start',
    //   };
    // },
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
      // console.log('scrollToLastIndex');
      const $container = this.$refs.container;
      // console.log($container.scrollWidth);
      $container.scrollLeft = $container.scrollWidth;
      this.setScrollShift(this.maxScrollShift);
    },
    scrollToLightboxIndex() {
      // console.log('scrollToLightboxIndex');
      const $container = this.$refs.container;
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

      const TEMP = MULTIPLIER - offset;
      $container.scrollLeft = TEMP * this.elemWidth;

      this.setScrollShift(TEMP);
    },
    scrollTo(dir) {
      // console.log('scrollTo');
      if (!this.items.length) {
        return;
      }

      const $container = this.$refs.container;
      const DIFF = $container.scrollLeft % this.elemWidth;
      const MULTIPLIER = dir > 0 ? 1 : -1;

      // if (X % COLS_WIDTH <= this.elemWidth) {
      //   DIFF = 0;
      // }

      // console.log('------------------------------------');
      // console.log('scrollLeft: ' + $container.scrollLeft);
      // console.log('ELEM_WIDTH: ' + this.elemWidth);
      // console.log('DIFF:       ' + DIFF);
      // console.log('X:          ' + X);
      // console.log('MULTIPLIER: ' + MULTIPLIER);

      let step;

      if (!DIFF) {
        step = this.elemWidth;
      } else if (MULTIPLIER < 0) {
        step = DIFF;
      } else {
        step = this.elemWidth - DIFF;
      }

      // console.log('step:       ' + step);

      let temp = MULTIPLIER * step;
      $container.scrollLeft += temp;

      console.log(DIFF);
      console.log(step == this.elemWidth);

      if (step == this.elemWidth) {
        this.setScrollShift(this.scrollShift + MULTIPLIER);
      }

      console.log(this.scrollShift);
    },
    setScrollShift(value) {
      if (value < 0) {
        this.scrollShift = 0;
      } else if (value > this.maxScrollShift) {
        this.scrollShift = this.maxScrollShift;
      } else {
        this.scrollShift = value;
      }
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
    getWheelDirect(delta) {
      return delta > 0 ? 1 : -1;
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
      console.log(key);

      if (key == 'Escape' && this.toShowLightbox) {
        this.onHideLightbox();
      } else if (key == 'ArrowUp') {
        if (this.toShowLightbox) {
          this.onHideLightbox();
        } else {
          window.scrollBy(0, -this.vertStep);
        }
      } else if (key == 'ArrowDown') {
        if (this.toShowLightbox) {
          this.onHideLightbox();
        } else {
          window.scrollBy(0, this.vertStep);
        }
      } else if (key == 'ArrowLeft') {
        if (this.toShowLightbox) {
          this.onPrevSlide();
        } else {
          this.scrollTo(-1);
        }
      } else if (key == 'ArrowRight') {
        if (this.toShowLightbox) {
          this.onNextSlide();
        } else {
          this.scrollTo(1);
        }
      } else if (key == 'Delete') {
        this.delete(this.lightboxIndex);
      }
    },
    onContainerWheel(e) {
      this.scrollTo(this.getWheelDirect(e.deltaY));
    },
    onLightboxWheel(e) {
      if (this.getWheelDirect(e.deltaY) < 0) {
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
        console.log(res.data);
        $vm.setItems(res.data.items);

        if (!$vm.items.length) {
          $vm.setLastTopID(0);
          return;
        }

        let topID;

        for (let index = $vm.items.length - 1; index >= 0; index--) {
          topID = parseInt($vm.items[index].name);

          if (!isNaN(topID)) {
            if ($vm.getIdParts(index).length > 1) {
              topID--;
            }
            break;
          } else if (index == 0) {
            topID = 0;
          }
        }

        $vm.setLastTopID(topID);

        // const LAST_INDEX = $vm.items.length - 1;
        // const LAST_LOADED_TOP_ID = $vm.items[LAST_INDEX].name;

        // $vm.setLastTopID(parseInt(LAST_LOADED_TOP_ID));

        // if ($vm.getIdParts(LAST_INDEX).length > 1) {
        //   $vm.decLastTopID();
        // }

        $vm.isLoading = false;
      });
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
    onRange(value) {
      this.setScale(parseInt(value));
    },
    onResize() {
      clearTimeout(this.resizeId);
      const $vm = this;

      $vm.resizeId = setTimeout(() => {
        console.log('RESIZED');

        if ($vm.containerWidth != $vm.$refs.container.offsetWidth) {
          $vm.setScales();
        }

        if ($vm.screenHeight != document.documentElement.clientHeight) {
          $vm.screenHeight = document.documentElement.clientHeight;
        }

        clearTimeout(this.resizeId);
      }, 500);
    },
  },
  watch: {
    scrollShift(newValue, oldValue) {
      // clearTimeout(this.loadingId);
      // const $vm = this;

      // if (newValue > oldValue) {
      //   this.diffScrollShift++;
      // } else if (newValue < oldValue) {
      //   this.diffScrollShift--;
      // }

      // if (this.diffScrollShift < 0) {
      //   this.diffScrollShift = 0;
      // } else if (!this.isLoading && this.diffScrollShift > this.groupSize) {
      //   this.diffScrollShift = 0;
      //   // this.loadingId = setTimeout(() => {
      //   $vm.isLoading = true;
      //   $vm.onRefresh();
      //   //   clearTimeout($vm.loadingId);
      //   // }, 500);
      // }
      console.log(newValue - oldValue);
    },
    lightboxIndex() {
      this.refreshDocumentTitle();
    },
  },
  created() {
    for (let row = 1; row < 11; row++) {
      this.rowsOptions.push({ value: row, text: row });
    }
    this.selectedRows = this.rowsOptions[0].value;
    this.onRefresh();
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    document.addEventListener('keydown', this.onKey);
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
