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
    b-form-input(v-model='scale', type='range', min='2', max='12')
    //- VueSlickCarousel(v-bind='settings')
    b-container.d-flex.flex-nowrap.align-items-center.list.slider-frames(
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
import VueSlickCarousel from 'vue-slick-carousel';
import 'vue-slick-carousel/dist/vue-slick-carousel.css';
// optional style for arrows & dots
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css';
import axios from 'axios';
import dropMixin from '@/dropMixin';
import DropItem from '@components/DropItem';
import CtrlButton from '@components/CtrlButton';

export default {
  name: 'App',
  components: {
    VueSlickCarousel,
    CtrlButton,
    DropItem,
  },
  mixins: [dropMixin],
  data() {
    return {
      items: [],
      showIndex: -1,
      lastTopID: 0,
      settings: {
        lazyLoad: 'ondemand',
        dots: true,
        infinite: false,
        initialSlide: 2,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        swipeToSlide: true,
      },
      containerOuterWidth: 0,
      scale: 6,
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
    onWheel(e) {
      // var containerOuterWidth = $('.container').outerWidth(); // узнаем ширину контейнера (width + padding)

      // var itemOuterWidth = $(this).outerWidth(); // узнаем ширину текущего элемента (width + padding)
      // var itemOffsetLeft = $(this).offset().left; // узнаем значение отступа слева в контейнере у текущего элемента
      // var containerScrollLeft = $('.container').scrollLeft(); // узнаем текущее значение скролла

      // var positionCetner = containerOuterWidth / 2 - itemOuterWidth / 2; // рассчитываем позицию центра

      // var scrollLeftUpd = containerScrollLeft + itemOffsetLeft - positionCetner; // рассчитываем положение скролла относительно разницы отступа элемента и центра контейнера

      // анимируем
      this.$refs.container.scrollLeft += e.deltaY;
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
