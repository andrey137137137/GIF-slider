<template lang="pug">
#app.slider
  .slider-main
  .list.slider-frames
    .list-item.frame.slider-frame(
      v-for='(item, index) in items',
      :key='item.name'
    )
      a.frame-add_prev(@click.prevent='insertBeforeImage(index)', href='#') Insert before {{ item.name }}
      .frame-img(
        :src='getImageName(item.name, item.ext)',
        :alt='"Image " + getImageName(item.name, item.ext)'
      )
    div
      a(
        style='display: block; text-align: center; font-size: 50px; line-height: 100px',
        @click.prevent='refresh',
        href='#'
      ) RELOAD
      #drop-area.slider-frame_add_next(
        ref='dropArea',
        :class='dropAreaModifs',
        @dragenter.prevent.stop='onDragenter',
        @dragover.prevent.stop='onDragover',
        @dragleave.prevent.stop='onDragleave',
        @drop.prevent.stop='onDrop($event)'
      )
        form.my-form(@submit.prevent='cancelFormSubmit')
          p Загрузите изображения с помощью диалога выбора файлов или перетащив нужные изображения в выделенную область
          input#fileElem(
            type='file',
            multiple,
            @change.prevent='onFiles($event)',
            accept='image/*'
          )
          label.button(for='fileElem') Выбрать изображения
          progress#progress-bar(ref='progressBar', max=100, value=0)
        #gallery
          img(ref='preview')
</template>

<script>
import axios from 'axios';
import { SERVER_BASE_URL } from '@helpers';

export default {
  name: 'App',
  data() {
    return {
      uploadHost: SERVER_BASE_URL,
      isHighlighted: false,
      filesDone: 0,
      filesToDo: 0,
      items: [],
      lastTopID: 0,
      separator: '.',
      firstIdIndex: '1',
    };
  },
  computed: {
    dropAreaModifs() {
      return {
        highlight: this.isHighlighted,
      };
    },
  },
  methods: {
    onDragenter() {
      this.isHighlighted = true;
    },
    onDragover() {
      this.isHighlighted = true;
    },
    onDragleave() {
      this.isHighlighted = false;
    },
    onDrop(e) {
      this.isHighlighted = false;
      this.uploadFiles(e.dataTransfer.files);
    },
    onFiles(e) {
      this.uploadFiles(e.target.files);
    },
    cancelFormSubmit() {},
    uploadFiles(files) {
      const filesList = [...files];
      this.initializeProgress(filesList.length); // <- Добавили эту строку
      filesList.forEach(this.uploadFile);
      filesList.forEach(this.previewFile);
    },
    getExt(fileName) {
      const LAST_SEPARATOR = fileName.lastIndexOf('.');
      return fileName.slice(LAST_SEPARATOR);
    },
    uploadFile(file) {
      const EXT = this.getExt(file.name);
      const $vm = this;
      const form = new FormData();
      this.addImage(EXT);
      form.append('image', file, this.items[this.items.length - 1].name + EXT);
      axios.post(this.uploadHost + 'image/upload', form).then(() => {
        /* Готово. Информируем пользователя */
        $vm.progressDone();
      });
    },
    previewFile(file) {
      const $vm = this;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        $vm.$refs.preview.src = reader.result;
      };
    },
    initializeProgress(numfiles) {
      this.$refs.progressBar.value = 0;
      this.filesDone = 0;
      this.filesToDo = numfiles;
    },
    progressDone() {
      this.filesDone++;
      this.$refs.progressBar.value = (this.filesDone / this.filesToDo) * 100;
    },
    getIdParts(index) {
      return this.items[index].name.split(this.separator);
    },
    insertBeforeImage(nextIndex) {
      const idParts = this.getIdParts(nextIndex);
      const COUNT_PARTS = idParts.length;
      const PREV_INDEX = nextIndex - 1;
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
      this.items.splice(nextIndex, 0, { name: result, ext: '' });
    },
    addImage(ext) {
      this.lastTopID++;
      this.items.push({ name: this.lastTopID + '', ext });
    },
    getImageName(name, ext) {
      return name + ext;
    },
    refresh() {
      const $vm = this;
      axios.get(this.uploadHost + 'image/load').then(res => {
        $vm.items = res.data;

        if (!$vm.items.length) {
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
