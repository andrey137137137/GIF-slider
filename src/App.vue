<template lang="pug">
#app.slider
  a(
    style='display: block; text-align: center; font-size: 50px; line-height: 100px',
    @click.prevent='refresh',
    href='#'
  ) RELOAD
  .slider-main
  form.my-form(@submit.prevent='cancelFormSubmit')
    .list.slider-frames
      DropItem(
        v-for='(item, index) in items',
        :key='item.name',
        :handle='uploadFiles',
        :index='index',
        :name='item.name',
        :ext='item.ext'
      )
      DropItem(:handle='uploadFiles')
</template>

<script>
import axios from 'axios';
import { SERVER_BASE_URL } from '@helpers';
import DropItem from '@components/DropItem';

export default {
  name: 'App',
  components: {
    DropItem,
  },
  data() {
    return {
      uploadHost: SERVER_BASE_URL,
      items: [],
      lastTopID: 0,
      separator: '.',
      firstIdIndex: '1',
      usingIndex: -1,
    };
  },
  computed: {
    isAddingItem() {
      return this.usingIndex < 0;
    },
  },
  methods: {
    cancelFormSubmit() {},
    uploadFiles(files, index) {
      this.usingIndex = index;
      const filesList = [...files];
      filesList.forEach(this.uploadFile);
    },
    getIdParts(index) {
      return this.items[index].name.split(this.separator);
    },
    calcBeforeID() {
      const idParts = this.getIdParts(this.usingIndex);
      const COUNT_PARTS = idParts.length;
      const PREV_INDEX = this.usingIndex - 1;
      let postfix = this.firstIdIndex;
      let result = '';

      if (PREV_INDEX >= 0) {
        const prevIdParts = this.getIdParts(PREV_INDEX);
        const PREV_COUNT_PARTS = prevIdParts.length;

        if (COUNT_PARTS - PREV_COUNT_PARTS < 0) {
          postfix = parseInt(prevIdParts[PREV_COUNT_PARTS - 1]) + 1;
        }
      }

      for (let index = 0; index < idParts.length; index++) {
        result += idParts[index] + this.separator;
      }

      result += postfix;
      return result;
    },
    insertBeforeItem(name, ext) {
      this.items.splice(this.usingIndex, 0, { name, ext });
    },
    uploadFile(file) {
      const EXT = this.getExt(file.name);
      const TEMP_ID = this.isAddingItem
        ? this.lastTopID + 1
        : this.calcBeforeID();

      const $vm = this;
      const form = new FormData();

      form.append('image', file, TEMP_ID + EXT);
      axios.post(this.uploadHost + 'image/upload', form).then(() => {
        /* Готово. Информируем пользователя */
        if ($vm.isAddingItem) {
          $vm.addItem(TEMP_ID, EXT);
        } else {
          $vm.insertBeforeItem(TEMP_ID, EXT);
        }
      });
    },
    getExt(fileName) {
      const LAST_SEPARATOR = fileName.lastIndexOf('.');
      return fileName.slice(LAST_SEPARATOR);
    },
    addItem(lastTopID, ext) {
      this.lastTopID = lastTopID;
      this.items.push({ name: this.lastTopID + '', ext });
    },
    refresh() {
      const $vm = this;
      axios.get(this.uploadHost + 'image/load').then(res => {
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
