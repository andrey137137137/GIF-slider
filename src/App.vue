<template lang="pug">
#app.slider
  b-button(
    style='display: block; text-align: center; font-size: 50px; line-height: 100px',
    title='RELOAD',
    @click.prevent='refresh',
    href='#'
  )
    b-icon(icon='cloud-download', aria-hidden='true')
  form.my-form(@submit.prevent='cancelFormSubmit')
    b-button-group.d-flex
      CtrlButton(variant='info', title='-', :handle='onShrinkScale')
      b-form-input(
        v-model='scale',
        type='range',
        :min='minScale',
        :max='maxScale'
      )
      CtrlButton(variant='info', title='+', :handle='onGrowScale')
    b-container#container.pl-0.d-flex.flex-nowrap.justify-content-start.list.slider-frames(
      :style='containerStyle',
      ref='container',
      @wheel.prevent='onWheel'
    )
      b-row.slider-row.mx-0(v-for='(row, rowIndex) in rows', :style='rowStyle')
        DropItem(
          v-for='(item, cellIndex) in itemsByRow(row)',
          :key='item.name',
          :index='indexByRow(row, cellIndex)',
          :items='items',
          :scale='scale',
          :style='elemStyle',
          ref='items'
        )
        DropItem(
          v-if='isAddingItemInRow(rowIndex, rows)',
          :items='items',
          :scale='scale',
          :style='elemStyle'
        )
      b-row.slider-row.mx-0(v-if='areCompleteRows', :style='emptyRowStyle')
        DropItem(:items='items', :scale='scale', :style='elemStyle')
  .slider-main(v-show='toShowLightbox')
    img.slider-main_img(:src='lightBoxSrc', @dblclick='hideLightbox')
    .slider-nav.slider-nav--prev(
      v-show='showPrev',
      :style='slideNavStyles',
      @click='prevSlide'
    )
    .slider-nav.slider-nav--next(
      v-show='showNext',
      :style='slideNavStyles',
      @click='nextSlide'
    )
</template>

<script>
import axios from 'axios';
import dropMixin from '@/dropMixin';
import DropItem from '@components/DropItem';
import CtrlButton from '@components/CtrlButton';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'App',
  components: {
    CtrlButton,
    DropItem,
  },
  mixins: [dropMixin],
  data() {
    return {
      items: [],
      lastTopID: 0,
      containerOuterWidth: 0,
      scale: 3,
      curIndex: 0,
      minScale: 2,
      maxScale: 12,
      scales: [
        { rows: 2, cols: 6 },
        { rows: 2, cols: 4 },
        { rows: 2, cols: 3 },
        { rows: 1, cols: 2 },
        { rows: 1, cols: 2 },
        { rows: 1, cols: 2 },
        { rows: 1, cols: 1 },
        { rows: 1, cols: 1 },
        { rows: 1, cols: 1 },
        { rows: 1, cols: 1 },
        { rows: 1, cols: 1 },
      ],
      containerWidth: 0,
      gutter: 0,
    };
  },
  computed: {
    ...mapState(['lightboxIndex']),
    isNotOneCol() {
      return this.scalesConfig.cols > 1;
    },
    toShowLightbox() {
      return this.lightboxIndex >= 0;
    },
    areOddItems() {
      return this.items.length % 2;
    },
    scalesConfig() {
      return this.scales[this.scale - 2];
    },
    containerInnerWidth() {
      return this.containerWidth - this.gutter * 2;
    },
    containerStyle() {
      if (!this.items.length) {
        return '';
      }
      return 'overflow-x: scroll';
    },
    rowStyle() {
      return {
        'min-width': this.containerInnerWidth + 'px',
        ...this.whenAlignItemsCenter(1),
      };
    },
    rowContentStyle() {
      return {
        display: 'flex',
        width: '100%',
        ...this.whenAlignItemsCenter(1),
      };
    },
    elemStyle() {
      return {
        'min-width':
          Math.ceil(this.containerInnerWidth / this.scalesConfig.cols) + 'px',
      };
    },
    emptyRowStyle() {
      return {
        ...this.elemStyle,
        ...this.whenAlignItemsCenter(this.scalesConfig.rows),
      };
    },
    rowSize() {
      return this.scalesConfig.rows * this.scalesConfig.cols;
    },
    rows() {
      return Math.ceil(this.items.length / this.rowSize);
    },
    areCompleteRows() {
      return this.items.length % this.rowSize == 0;
    },
    toShowImg() {
      return this.showIndex >= 0;
    },
    slideNavStyles() {
      return {
        width: Math.ceil(this.containerInnerWidth / 8) + 'px',
      };
    },
    showPrev() {
      return this.lightboxIndex > 0;
    },
    showNext() {
      return this.lightboxIndex < this.items.length - 1;
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
    ...mapMutations(['setLightboxIndex']),
    isAddingItemInRow(rowIndex, rows) {
      if (this.areCompleteRows) {
        return false;
      }
      return rowIndex == rows - 1 && this.isNotOneCol;
    },
    hideLightbox() {
      this.setLightboxIndex(-1);
    },
    prevSlide() {
      this.setLightboxIndex(this.lightboxIndex - 1);
    },
    nextSlide() {
      this.setLightboxIndex(this.lightboxIndex + 1);
    },
    whenAlignItemsCenter(rows) {
      return {
        'align-items': this.scalesConfig.rows == rows ? 'center' : 'start',
      };
    },
    getRowFinalIndex(rowIndex) {
      return this.rowSize * rowIndex;
    },
    getRowStartIndex(rowIndex) {
      return this.getRowFinalIndex(rowIndex - 1);
    },
    itemsByRow(row) {
      const START = this.getRowStartIndex(row);
      const ROW_STEP = this.getRowFinalIndex(row);
      const END = ROW_STEP > this.items.length ? this.items.length : ROW_STEP;
      const tempArray = [];

      for (let i = START; i < END; i++) {
        tempArray.push(this.items[i]);
      }

      return tempArray;
    },
    indexByRow(row, index) {
      return index + this.getRowStartIndex(row);
    },
    onResize() {
      console.log('RESIZED');
      const $vm = this;
      setTimeout(() => {
        $vm.containerWidth = $vm.$refs.container.offsetWidth;
      }, 500);
    },
    onShrinkScale() {
      if (this.scale > this.minScale) {
        this.scale--;
      }
    },
    onGrowScale() {
      if (this.scale < this.maxScale) {
        this.scale++;
      }
    },
    onWheel(e) {
      if (!this.items.length) {
        return;
      }

      const $container = this.$refs.container;
      const ELEM_WIDTH = this.$refs.items[0].$el.offsetWidth;
      const DIFF = $container.scrollLeft % ELEM_WIDTH;
      const MULTIPLIER = e.deltaY > 0 ? 1 : -1;

      let step;

      if (!DIFF) {
        step = ELEM_WIDTH;
      } else if (MULTIPLIER < 0) {
        step = DIFF;
      } else {
        step = ELEM_WIDTH - DIFF;
      }

      $container.scrollLeft += MULTIPLIER * step;
    },
    cancelFormSubmit() {
      return false;
    },
    insertBeforeItem(name, ext, index) {
      this.items.splice(index, 0, { name, ext });
    },
    replace(index, ext) {
      const tempArray = this.items;
      tempArray[index].ext = ext;
      this.items = tempArray;
    },
    addItem(lastTopID, ext) {
      this.lastTopID = lastTopID;
      this.items.push({ name: this.lastTopID + '', ext });
    },
    refresh() {
      const $vm = this;
      axios.get(this.uploadHost).then(res => {
        $vm.items = res.data;

        if (!$vm.items.length) {
          $vm.lastTopID = 0;
          return;
        }

        const LAST_INDEX = $vm.items.length - 1;
        const LAST_LOADED_TOP_ID = $vm.items[LAST_INDEX].name;
        $vm.lastTopID = parseInt(LAST_LOADED_TOP_ID);

        if ($vm.getIdParts(LAST_INDEX).length > 1) {
          $vm.lastTopID--;
        }
      });
    },
  },
  created() {
    this.refresh();
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    this.containerWidth = this.$refs.container.offsetWidth;
  },
};
</script>

<style lang="scss">
@import '@styles/app';
</style>
