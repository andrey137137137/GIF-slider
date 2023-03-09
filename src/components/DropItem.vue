<template lang="pug">
b-col(
  :id='id',
  :cols='scale',
  @dragstart='onDragStart($event)',
  @dblclick='showLightbox'
)
  b-card.list-item.frame.slider-frame.drop_area(
    ref='dropArea',
    :class='dropAreaModifs',
    tag='article',
    @dragenter.prevent.stop='onDragEnter',
    @dragover.prevent.stop='onDragOver',
    @dragleave.prevent.stop='onDragLeave',
    @drop.prevent.stop='onDrop($event)'
  )
    FileInput(:id='uploadID', @upload='onFiles')
    FileInput(:id='replaceID', @upload='onReplace')
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
        CtrlButton(:for='replaceID', tag='label', icon='cloud-upload')
        CtrlButton(
          icon='x-circle',
          scale='2',
          variant='danger',
          :handle='onDelete'
        )
      b-button-group.mx-1(v-if='isNotLast')
        CtrlButton(variant='info', title='>', :handle='onRenameToNext')
</template>

<script>
import axios from 'axios';
import dropMixin from '@/dropMixin';
import FileInput from '@components/FileInput';
import CtrlButton from '@components/CtrlButton';
import { mapMutations } from 'vuex';

export default {
  name: 'DropItem',
  components: { FileInput, CtrlButton },
  mixins: [dropMixin],
  props: {
    items: { type: Array, required: true },
    index: { type: Number, default: -1 },
    scale: { default: 12 },
  },
  data() {
    return {
      isHighlighted: false,
      dataTransferAttrName: 'nameID',
      dataTransferAttrExt: 'ext',
    };
  },
  computed: {
    id() {
      if (this.isAddingItem) {
        return 0;
      }
      return this.items[this.index].name;
    },
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
    ...mapMutations(['setLightboxIndex']),
    showLightbox() {
      this.setLightboxIndex(this.index);
    },
    getLabelAttrFor(inputName) {
      return this.isAddingItem ? inputName : inputName + this.index;
    },
    getItemProp(propName) {
      if (this.isAddingItem) {
        return '';
      }
      return this.items[this.index][propName];
    },
    compareDroppingFile(index, name) {
      return this.items[index - 1].name == name;
    },
    onDragStart(e) {
      const dt = e.dataTransfer;
      dt.dropEffect = 'move';
      dt.effectAllowed = 'move';
      dt.setData(this.dataTransferAttrName, this.name);
      dt.setData(this.dataTransferAttrExt, this.ext);
    },
    onDragEnd() {
      this.isTransporting = false;
    },
    onDragEnter() {
      this.isHighlighted = true;
    },
    onDragOver() {
      this.isHighlighted = true;
    },
    onDragLeave() {
      this.isHighlighted = false;
    },
    onDrop(e) {
      const dt = e.dataTransfer;
      const DT_NAME = dt.getData(this.dataTransferAttrName);
      console.log('Drop targer: ' + this.name);
      console.log('Dropping:    ' + DT_NAME);
      this.isHighlighted = false;

      if (DT_NAME) {
        if (
          this.isAddingItem &&
          this.compareDroppingFile(this.items.length, DT_NAME)
        ) {
          return;
        }
        if (this.index > 0 && this.compareDroppingFile(this.index, DT_NAME)) {
          return;
        }
        if (this.name != DT_NAME) {
          this.renameFile({
            name: DT_NAME,
            ext: dt.getData(this.dataTransferAttrExt),
          });
        }
        return;
      }

      this.uploadFiles(dt.files);
    },
    onFiles(e) {
      this.uploadFiles(e.target.files);
    },
    onRenameToPrev() {
      this.renameFile(-1);
    },
    onRenameToNext() {
      this.renameFile();
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
    getTempID(index = -1) {
      const COND = index < 0 ? !this.isAddingItem : this.items[index];
      return COND ? this.calcBeforeID(index) : this.$parent.$data.lastTopID + 1;
    },
    uploadFiles(files) {
      const filesList = [...files];
      filesList.forEach(this.uploadFile);
    },
    uploadFile(file, isReplacing = false) {
      const $vm = this;
      const EXT = this.getExt(file.name);
      const TEMP_ID = isReplacing ? this.name : this.getTempID();
      const form = new FormData();
      form.append('image', file, TEMP_ID + EXT);
      axios.post(this.uploadHost, form).then(() => {
        /* Готово. Информируем пользователя */
        if (isReplacing) {
          $vm.$parent.replace($vm.index, EXT);
        } else if ($vm.isAddingItem) {
          $vm.$parent.addItem(TEMP_ID, EXT);
        } else {
          $vm.$parent.insertBeforeItem(TEMP_ID, EXT, $vm.index);
        }
      });
    },
    renameFile(objOrDir = 1) {
      const $vm = this;
      const IS_TRANSPORTED = !Number.isInteger(objOrDir);
      const STEP = !IS_TRANSPORTED && objOrDir > 0 ? 2 : -1;
      const NEW_INDEX = IS_TRANSPORTED ? -1 : this.index + STEP;
      const EXT = IS_TRANSPORTED ? objOrDir.ext : this.ext;
      const IMAGE_NAME = IS_TRANSPORTED ? objOrDir.name + EXT : this.imageName;
      const TEMP_ID = this.getTempID(NEW_INDEX);
      axios
        .get(this.uploadHost + '/' + IMAGE_NAME + '/' + TEMP_ID + EXT)
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
