<template lang="pug">
#app.slider
  b-button#reload(
    style='display: block; text-align: center; font-size: 50px; line-height: 100px',
    title='RELOAD',
    @click.prevent='refresh',
    ref='reload',
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
      fluid,
      :style='containerStyle',
      ref='container',
      @wheel.prevent='onWheel'
    )
      b-row.slider-row.mx-0(
        v-for='(group, groupIndex) in groups',
        :style='groupStyle'
      )
        DropItem(
          v-for='(item, cellIndex) in itemsByGroup(group)',
          :key='item.name',
          :index='indexByGroup(group, cellIndex)',
          :items='items',
          :scale='scale',
          :style='elemStyle',
          ref='items'
        )
        DropItem(
          v-if='isAddingItemInGroup(groupIndex, groups)',
          :items='items',
          :scale='scale',
          :style='elemStyle'
        )
      b-row.slider-row.mx-0(v-if='areCompleteGroups', :style='emptyGroupStyle')
        DropItem(:items='items', :scale='scale', :style='elemStyle')
  .slider-main(v-show='toShowLightbox')
    .slider-main_img_wrap(@dblclick='hideLightbox')
      img.slider-main_img(:src='lightBoxSrc')
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
      oneRowHeight: 395,
      scale: 8,
      curIndex: 0,
      minScale: 1,
      maxScale: 8,
      scales: [
        { rows: 2, cols: 9 },
        { rows: 2, cols: 8 },
        { rows: 2, cols: 6 },
        { rows: 2, cols: 5 },
        { rows: 2, cols: 4 },
        { rows: 1, cols: 3 },
        { rows: 1, cols: 2 },
        { rows: 1, cols: 1 },
      ],
      containerWidth: 0,
      gutter: 0,
      rows: 1,
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
      return this.scales[this.scale - 1];
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
    groupStyle() {
      return {
        'min-width': this.containerInnerWidth + 'px',
        // ...this.whenAlignItemsCenter(1),
      };
    },
    elemWidth() {
      return Math.floor(this.containerInnerWidth / this.scalesConfig.cols);
    },
    elemStyle() {
      return {
        'min-width': this.withPx(this.elemWidth),
        'max-width': this.withPx(this.elemWidth),
      };
    },
    emptyGroupStyle() {
      return {
        ...this.elemStyle,
        // ...this.whenAlignItemsCenter(this.scalesConfig.rows),
      };
    },
    groupSize() {
      // return this.scalesConfig.rows * this.scalesConfig.cols;
      const { cols } = this.scalesConfig;

      if (this.rows == 1) {
        return cols;
      }

      const { rows } = this.scalesConfig;

      // if (this.rows > rows) {
      //   return this.rows * cols;
      // }

      return rows * cols;
    },
    groups() {
      return Math.ceil(this.items.length / this.groupSize);
    },
    areCompleteGroups() {
      return this.items.length % this.groupSize == 0;
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
    withPx(value) {
      return value + 'px';
    },
    isAddingItemInGroup(groupIndex, groups) {
      if (this.areCompleteGroups) {
        return false;
      }
      return groupIndex == groups - 1 && this.isNotOneCol;
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
    getGroupFinalIndex(groupIndex) {
      return this.groupSize * groupIndex;
    },
    getGroupStartIndex(groupIndex) {
      return this.getGroupFinalIndex(groupIndex - 1);
    },
    itemsByGroup(group) {
      const START = this.getGroupStartIndex(group);
      const GROUP_STEP = this.getGroupFinalIndex(group);
      const END =
        GROUP_STEP > this.items.length ? this.items.length : GROUP_STEP;
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
      const TEMP = Math.floor(
        (window.innerHeight - this.$refs.reload.$el.offsetHeight) /
          this.oneRowHeight,
      );

      this.rows = !TEMP ? 1 : TEMP;
    },
    setContainerWidthAndRows() {
      // console.log(window.innerHeight);
      // console.log(this.$refs.reload);
      // console.log(this.$refs.container);
      this.setRows();
      this.containerWidth = this.$refs.container.offsetWidth;
    },
    onResize() {
      console.log('RESIZED');
      const $vm = this;
      setTimeout(() => {
        $vm.setContainerWidthAndRows();
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

      // console.log('------------------------------------');
      // console.log('scrollLeft: ' + $container.scrollLeft);
      // console.log('ELEM_WIDTH: ' + ELEM_WIDTH);
      // console.log('DIFF:       ' + DIFF);
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
    this.setContainerWidthAndRows();
  },
};
</script>

<style lang="scss">
@import '@styles/app';
</style>
