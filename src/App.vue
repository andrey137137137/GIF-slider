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
      b-row.mx-0(v-for='row in rows', :style='rowStyle')
        //- div(
        //-   v-for='(item, index) in itemsByRow(row)',
        //-   :key='item.name',
        //-   :style='rowContentStyle'
        //- )
        DropItem(
          v-for='(item, index) in itemsByRow(row)',
          :index='indexByRow(row, index)',
          :items='items',
          :scale='scale',
          :style='elemStyle',
          ref='items'
        )
      //-   DropItem(
      //-     v-if='indexByRow(row, index) == items.length - 1 && areOddItems',
      //-     :items='items'
      //-   )
      //- b-row.mx-0(v-if='!areOddItems', :style='rowStyle')
    DropItem(:items='items')
    //- DropItem(
    //-   v-for='(item, index) in items',
    //-   :key='item.name',
    //-   :index='index',
    //-   :items='items',
    //-   :scale='scale',
    //-   :style='elemStyle',
    //-   ref='items'
    //- )
  .slider-main(v-show='toShowImg')
    img(style='display: block', :src='lightBoxSrc')
</template>

<script>
import axios from 'axios';
import dropMixin from '@/dropMixin';
import DropItem from '@components/DropItem';
import CtrlButton from '@components/CtrlButton';

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
      showIndex: -1,
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

      return {
        'overflow-x': 'scroll',
      };
    },
    rowStyle() {
      return {
        outline: '1px red dotted',
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
    rowSize() {
      return this.scalesConfig.rows * this.scalesConfig.cols;
    },
    rows() {
      return Math.ceil(this.items.length / this.rowSize);
    },
    toShowImg() {
      return this.showIndex >= 0;
    },
    lightBoxSrc() {
      if (!this.toShowImg) {
        return '';
      }
      const { name, ext } = this.items[this.showIndex];
      return '/upload/' + name + ext;
    },
  },
  methods: {
    show(index) {
      console.log(index);
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
