<template lang="pug">
b-col
  b-card.list-item.frame.slider-frame.drop_area(
    ref='dropArea',
    :class='dropAreaModifs',
    tag='article',
    @dragenter.prevent.stop='onDragenter',
    @dragover.prevent.stop='onDragover',
    @dragleave.prevent.stop='onDragleave',
    @drop.prevent.stop='onDrop($event)'
  )
    input.file_elem(
      :id='uploadID',
      type='file',
      multiple,
      @change.prevent='onFiles($event)',
      accept='image/*'
    )
    input.file_elem(
      :id='replaceID',
      type='file',
      multiple,
      @change.prevent='onReplace($event)',
      accept='image/*'
    )
    b-aspect(v-if='!isAddingItem', aspect='16/9')
      b-card-img-lazy(
        :src='"/upload/" + imageName',
        :alt='"Image " + imageName'
      )
    label.button(:for='uploadID')
      b-icon(:icon='labelIcon', aria-hidden='true')
      | {{ labelText }}
    b-button-toolbar(v-if='!isAddingItem')
      b-button-group.mx-1(v-if='isNotFirst')
        CtrlButton(variant='info', title='<', :handle='onRenameToPrev')
      b-button-group.mx-1
        //- CtrlButton(:variant='' :title='"Replace " + name', :handle='onReplace')
        b-button(:for='replaceID', tag='label')
          b-icon(icon='cloud-upload', aria-hidden='true')
        CtrlButton(variant='danger', :handle='onDelete')
          b-icon(icon='x-circle', scale='2', variant='white')
      b-button-group.mx-1(v-if='isNotLast')
        CtrlButton(variant='info', title='>', :handle='onRenameToNext')
</template>

<script>
import axios from 'axios';
import dropMixin from '@/dropMixin';
import CtrlButton from '@components/CtrlButton';

export default {
  name: 'DropItem',
  components: { CtrlButton },
  mixins: [dropMixin],
  props: {
    items: { type: Array, required: true },
    index: { type: Number, default: -1 },
  },
  data() {
    return {
      isHighlighted: false,
    };
  },
  computed: {
    isNotFirst() {
      return this.index > 0;
    },
    isNotLast() {
      return this.index < this.items.length - 1;
    },
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
    uploadID() {
      return this.getLabelAttrFor('upload');
    },
    replaceID() {
      return this.getLabelAttrFor('replace');
    },
    labelIcon() {
      return this.isAddingItem ? 'cloud-upload' : 'arrow-bar-right';
    },
    labelText() {
      return this.isAddingItem ? '' : ' ' + this.name;
    },
    imageName() {
      return this.name + this.ext;
    },
  },
  methods: {
    getLabelAttrFor(inputName) {
      return this.isAddingItem ? inputName : inputName + this.index;
    },
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
      console.log(e.dataTransfer);
      this.isHighlighted = false;
      this.uploadFiles(e.dataTransfer.files);
    },
    onFiles(e) {
      this.uploadFiles(e.target.files);
    },
    onRenameToPrev() {
      this.onRenameFile(-1);
    },
    onRenameToNext() {
      this.onRenameFile();
    },
    onReplace(e) {
      this.uploadFile(e.target.files[0], true);
    },
    onDelete() {
      if (confirm('To delete ' + this.imageName + '?')) {
        const $vm = this;
        axios.delete($vm.uploadHost + '/' + $vm.imageName).then(() => {
          $vm.items.splice($vm.index, 1);
        });
      }
    },
    getExt(fileName) {
      const LAST_SEPARATOR = fileName.lastIndexOf('.');
      return fileName.slice(LAST_SEPARATOR);
    },
    uploadFiles(files) {
      const filesList = [...files];
      filesList.forEach(this.uploadFile);
    },
    uploadFile(file, isReplacing = false) {
      const EXT = this.getExt(file.name);
      let tempID;

      if (isReplacing) {
        tempID = this.name;
      } else {
        tempID = this.isAddingItem
          ? this.$parent.$data.lastTopID + 1
          : this.calcBeforeID();
      }

      const $vm = this;
      const form = new FormData();

      form.append('image', file, tempID + EXT);
      axios.post(this.uploadHost, form).then(() => {
        /* Готово. Информируем пользователя */
        if (isReplacing) {
          $vm.$parent.replace($vm.index, EXT);
        } else if ($vm.isAddingItem) {
          $vm.$parent.addItem(tempID, EXT);
        } else {
          $vm.$parent.insertBeforeItem(tempID, EXT, $vm.index);
        }
      });
    },
    onRenameFile(dir = 1) {
      const $vm = this;
      const STEP = dir > 0 ? 2 : -1;
      const TEMP_ID = this.calcBeforeID(this.index + STEP);
      axios
        .get(this.uploadHost + '/' + this.imageName + '/' + TEMP_ID + this.ext)
        .then(() => {
          $vm.$parent.refresh();
        });
    },
    calcBeforeID(index = -1) {
      const CUR_INDEX = index < 0 ? this.index : index;
      const idParts = this.getIdParts(CUR_INDEX);
      const COUNT_PARTS = idParts.length;
      const PREV_INDEX = CUR_INDEX - 1;
      let postfix = '1';
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
  },
};
</script>

<style lang="scss">
</style>
