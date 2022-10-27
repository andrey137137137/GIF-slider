<template lang="pug">
#app.slider
  a(
    style='display: block; text-align: center; font-size: 50px; line-height: 100px',
    @click.prevent='refresh',
    href='#'
  ) RELOAD
  form.my-form(@submit.prevent='cancelFormSubmit')
    .list.slider-frames
      DropItem(
        v-for='(item, index) in items',
        :key='item.name',
        :index='index',
        :items='items'
      )
      DropItem(:items='items')
  .slider-main(v-show='toShowImg')
    img(style='display: block', :src='lightBoxSrc')
</template>

<script>
import axios from 'axios';
import dropMixin from '@/dropMixin';
import DropItem from '@components/DropItem';

export default {
  name: 'App',
  components: {
    DropItem,
  },
  mixins: [dropMixin],
  data() {
    return {
      items: [],
      showIndex: -1,
      lastTopID: 0,
    };
  },
  computed: {
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
