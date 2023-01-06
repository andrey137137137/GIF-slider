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
    b-container#container.d-flex.flex-nowrap.align-items-center.justify-content-start.list.slider-frames(
      :style='containerStyle',
      ref='container',
      @wheel.prevent='onWheel'
    )
      DropItem(
        v-for='(item, index) in items',
        :key='item.name',
        :index='index',
        :items='items',
        :scale='scale',
        ref='items'
      )
    DropItem(:items='items')
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
      scale: 6,
      curIndex: 0,
      minScale: 2,
      maxScale: 12,
    };
  },
  computed: {
    containerStyle() {
      return this.items.length ? { 'overflow-x': 'scroll' } : '';
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
};
</script>

<style lang="scss">
@import '@styles/app';
</style>
