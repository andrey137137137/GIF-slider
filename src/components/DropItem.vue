<template lang="pug">
b-col(
  :id='id',
  :cols='cols',
  @dblclick='onShowLightbox',
  @dragstart='onDragStart($event)'
)
  b-card.list-item.frame.slider-frame.drop_area(
    :bg-variant='cardBgStyle',
    :text-variant='cardTextStyle',
    ref='dropArea',
    :class='sliderFrameClasses',
    tag='article',
    @dragenter.prevent.stop='onDragEnter',
    @dragover.prevent.stop='onDragOver',
    @dragleave.prevent.stop='onDragLeave',
    @drop.prevent.stop='onDrop($event, index)'
  )
    FileInput(:id='uploadID', @upload='onFiles')
    FileInput(:id='replaceID', @upload='onReplace')
    b-aspect(v-if='!isAddingItem', aspect='16/9')
      b-card-img-lazy(
        :src='"/upload/" + imageName',
        :alt='"Image " + imageName'
      )
    label.button.slider-button(:for='uploadID')
      b-icon(:icon='labelIcon', aria-hidden='true')
      | {{ labelText }}
    b-button-toolbar(v-if='!isAddingItem')
      //- b-button-group.mx-1(v-if='isNotFirst')
      //-   CtrlButton(variant='info', title='<', :handle='onRenameToPrev')
      b-button-group.mx-1
        CtrlButton(
          icon='cloud-upload',
          tag='label',
          :for='replaceID',
          :variant='buttonStyle'
        )
        CtrlButton(
          icon='x-circle',
          scale='2',
          :handle='onDelete',
          :variant='buttonStyle'
        )
      //- b-button-group.mx-1(v-if='isNotLast')
      //-   CtrlButton(variant='info', title='>', :handle='onRenameToNext')
</template>

<script>
import axios from 'axios';
import dropMixin from '@/dropMixin';
import FileInput from '@components/FileInput';
import CtrlButton from '@components/CtrlButton';
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'DropItem',
  components: { FileInput, CtrlButton },
  mixins: [dropMixin],
  props: {
    index: { type: Number, default: -1 },
    isSingle: { type: Boolean, default: false },
  },
  data() {
    return {
      isHighlighted: false,
      isFirstLoading: true,
    };
  },
  computed: {
    // ...mapState(['scale', 'itemWidth', 'items', 'lastTopID']),
    ...mapState(['scale', 'itemWidth']),
    ...mapGetters(['cardBgStyle', 'cardTextStyle', 'buttonStyle']),
    id() {
      if (this.isAddingItem) {
        return 0;
      }
      return this.items[this.index].name;
    },
    cols() {
      return this.isSingle ? 12 : this.scale;
    },
    isNotFirst() {
      return this.index > 0;
    },
    isNotLast() {
      return this.index < this.items.length - 1;
    },
    name() {
      return this.getItemProp(this.index, 'name');
    },
    ext() {
      return this.getItemProp(this.index, 'ext');
    },
    sliderFrameClasses() {
      return {
        highlight: this.isHighlighted,
        'slider-frame--last': this.isAddingItem,
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
  },
  methods: {
    ...mapMutations([
      'setLightboxIndex',
      // 'insertBeforeItem',
      // 'replaceItem',
      // 'addItem',
      // 'deleteItem',
    ]),
    getLabelAttrFor(inputName) {
      return this.isAddingItem ? inputName : inputName + this.index;
    },
    compareDroppingFile(index, name) {
      return this.items[index - 1].name == name;
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
          $vm.$parent.onRefresh();
        })
        .catch(res => {
          console.log(res);
          alert(res);
        });
    },
    onShowLightbox() {
      this.setLightboxIndex(this.index);
      document.body.style.overflow = 'hidden';
      // this.$parent.scrollToLightboxIndex();
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
      this.delete(this.index);
    },
  },
};
</script>
