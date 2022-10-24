<template lang="pug">
.list-item.frame.slider-frame.drop_area(
  ref='dropArea',
  :class='dropAreaModifs',
  @dragenter.prevent.stop='onDragenter',
  @dragover.prevent.stop='onDragover',
  @dragleave.prevent.stop='onDragleave',
  @drop.prevent.stop='onDrop($event)'
)
  input.file_elem(
    :id='inputID',
    type='file',
    multiple,
    @change.prevent='onFiles($event)',
    accept='image/*'
  )
  img.frame-img(
    v-if='!isAddingItem',
    :src='"/upload/" + imageName',
    :alt='"Image " + imageName'
  )
  label.button(:for='inputID') {{ labelText }}
  div(
    v-if='!isAddingItem',
    style='display: flex; justify-content: space-between'
  )
    CtrlButton(title='<')
    CtrlButton(:title='"DELETE " + name + "!"', :handle='onDelete')
    CtrlButton(title='>')
</template>

<script>
import axios from 'axios';
import { SERVER_BASE_URL } from '@helpers';
import CtrlButton from '@components/CtrlButton';

export default {
  name: 'DropItem',
  components: { CtrlButton },
  props: {
    items: { type: Array, required: true },
    index: { type: Number, default: -1 },
    handle: {
      type: Function,
      default: files => {
        console.log(files);
        return false;
      },
    },
  },
  data() {
    return {
      uploadHost: SERVER_BASE_URL + 'image',
      isHighlighted: false,
    };
  },
  computed: {
    name() {
      return this.getItemProp('name');
    },
    ext() {
      return this.getItemProp('ext');
    },
    dropAreaModifs() {
      return {
        highlight: this.isHighlighted,
      };
    },
    isAddingItem() {
      return this.index < 0;
    },
    inputID() {
      const NAME = 'fileElem';
      if (this.index < 0) {
        return NAME;
      }
      return NAME + this.index;
    },
    labelText() {
      return this.isAddingItem
        ? 'Выбрать изображения'
        : 'Insert before ' + this.name;
    },
    imageName() {
      return this.name + this.ext;
    },
  },
  methods: {
    getItemProp(propName) {
      if (this.isAddingItem) {
        return '';
      }
      return this.items[this.index][propName];
    },
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
      this.handle(e.dataTransfer.files, this.index);
    },
    onFiles(e) {
      this.handle(e.target.files, this.index);
    },
    onDelete() {
      if (confirm('To delete ' + this.imageName + '?')) {
        const $vm = this;
        axios.delete($vm.uploadHost + '/' + $vm.imageName).then(() => {
          $vm.items.splice($vm.index, 1);
        });
      }
    },
  },
};
</script>

<style lang="scss">
</style>
