<template lang="pug">
#app.slider
  #drop-area(
    ref='dropArea',
    :class='dropAreaModifs',
    @dragenter.prevent.stop='onDragenter',
    @dragover.prevent.stop='onDragover',
    @dragleave.prevent.stop='onDragleave',
    @drop.prevent.stop='onDrop($event)'
  )
    form.my-form
      p Загрузите изображения с помощью диалога выбора файлов или перетащив нужные изображения в выделенную область
      input#fileElem(
        type='file',
        multiple,
        @change='onFiles($event)',
        accept='image/*'
      )
      label.button(for='fileElem') Выбрать изображения
      progress#progress-bar(ref='progressBar', max=100, value=0)
    #gallery
      img(ref='preview')
  .slider-main
  ul.list.slider-frames
    li.list-item.frame.slider-frame(
      v-for='(item, index) in items',
      :key='item'
    )
      a.frame-add_prev(@click.prevent='insertBeforeImage(index)', href='#') Insert before {{ item }}
      .frame-img(:src='item', :alt='"Image " + item')
    li
      a.slider-frame_add_next(@click.prevent='addImage', href='#') Add image
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
    uploadFiles(files) {
      const filesList = [...files];
      this.initializeProgress(filesList.length); // <- Добавили эту строку
      filesList.forEach(this.uploadFile);
      filesList.forEach(this.previewFile);
    },
    uploadFile(file) {
      const $vm = this;
      const form = new FormData();
      this.addImage();
      form.append('image', file, this.items[this.items.length - 1]);
      axios.post(this.uploadHost + 'image/avatar', form).then(() => {
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
    getIdParts(id) {
      return id.split(this.separator);
    },
    insertBeforeImage(nextIndex) {
      const idParts = this.getIdParts(this.items[nextIndex]);
      const COUNT_PARTS = idParts.length;
      const PREV_INDEX = nextIndex - 1;
      let postfix = this.firstIdIndex;
      let result = '';

      if (PREV_INDEX >= 0) {
        const prevIdParts = this.getIdParts(this.items[PREV_INDEX]);
        const PREV_COUNT_PARTS = prevIdParts.length;

        if (COUNT_PARTS - PREV_COUNT_PARTS < 0) {
          postfix = parseInt(prevIdParts[PREV_COUNT_PARTS - 1]) + 1;
        }
      }

      for (let index = 0; index < idParts.length; index++) {
        result += idParts[index] + this.separator;
      }

      result += postfix;
      this.items.splice(nextIndex, 0, result);
    },
    addImage() {
      this.lastTopID++;
      this.items.push(this.lastTopID + '');
    },
  },
};
</script>

<style lang="scss">
@import '@styles/app';
</style>
