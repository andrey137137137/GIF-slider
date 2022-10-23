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
</template>

<script>
export default {
  name: 'DropItem',
  props: {
    index: { type: Number, default: -1 },
    name: { type: String, default: '' },
    ext: { type: String, default: '' },
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
      isHighlighted: false,
    };
  },
  computed: {
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
  },
};
</script>

<style lang="scss">
</style>
