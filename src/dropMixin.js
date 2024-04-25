import axios from 'axios';
import { ID_SEPARATOR, getIdParts } from '@apiHelpers';
import { SERVER_BASE_URL } from '@helpers';
import { mapState, mapMutations } from 'vuex';

export default {
  data() {
    return {
      uploadHost: SERVER_BASE_URL + 'image',
      isHighlighted: false,
      separator: ID_SEPARATOR,
      dataTransferAttrName: 'nameID',
      dataTransferAttrExt: 'ext',
    };
  },
  computed: {
    ...mapState(['items', 'lightboxIndex', 'lastTopID']),
    toShowLightbox() {
      return this.lightboxIndex >= 0;
    },
    curIndex() {
      return this.toShowLightbox ? this.lightboxIndex : this.index;
    },
    isAddingItem() {
      return this.curIndex < 0;
    },
    // name() {
    //   return this.getItemProp(this.curIndex, 'name');
    // },
    // ext() {
    //   return this.getItemProp(this.curIndex, 'ext');
    // },
    imageName() {
      return this.name + this.ext;
    },
  },
  methods: {
    ...mapMutations([
      'insertBeforeItem',
      'replaceItem',
      'addItem',
      'deleteItem',
    ]),
    getItemProp(index, propName) {
      console.log(index);
      if (index < 0) {
        return '';
      }
      return this.items[index][propName];
    },
    getExt(fileName) {
      const LAST_SEPARATOR = fileName.lastIndexOf('.');
      return fileName.slice(LAST_SEPARATOR);
    },
    getIdParts(index) {
      return getIdParts(this.items[index].name);
    },
    calcBeforeID(index = -1) {
      const CUR_INDEX = index < 0 ? this.curIndex : index;
      const idParts = this.getIdParts(CUR_INDEX);
      const COUNT_PARTS = idParts.length;
      const PREV_INDEX = CUR_INDEX - 1;
      let postfix = '1';
      let result = '';

      if (PREV_INDEX >= 0) {
        const prevIdParts = this.getIdParts(PREV_INDEX);
        const PREV_COUNT_PARTS = prevIdParts.length;
        const DIFF = PREV_COUNT_PARTS - COUNT_PARTS;

        if (DIFF == 1) {
          const PART_INDEX = PREV_COUNT_PARTS - DIFF;
          postfix = parseInt(prevIdParts[PART_INDEX]) + 1;
        }
      }

      for (let index = 0; index < idParts.length; index++) {
        result += idParts[index] + this.separator;
      }

      result += postfix;
      return result;
    },
    getTempID(index = -1) {
      const COND = index < 0 ? !this.isAddingItem : this.items[index];
      return COND ? this.calcBeforeID(index) : this.lastTopID + 1;
    },
    refreshDocumentTitle() {
      const NAME = this.toShowLightbox
        ? this.items[this.lightboxIndex].name
        : '';
      document.title = NAME;
    },
    delete(index) {
      if (index < 0) {
        return;
      }

      const { name, ext } = this.items[index];
      const IMAGE_NAME = name + ext;

      if (confirm('To delete ' + IMAGE_NAME + '?')) {
        const $vm = this;
        axios.delete($vm.uploadHost + '/' + IMAGE_NAME).then(() => {
          $vm.deleteItem(index);
          this.refreshDocumentTitle();
        });
      }
    },
    uploadFile(file, isReplacing = false) {
      // const { index } = this;
      const index = this.curIndex;
      const $vm = this;
      const ext = this.getExt(file.name);
      const TEMP_ID = isReplacing ? this.name : this.getTempID();
      const IMAGE_NAME = TEMP_ID + ext;
      const EXIST_NAME = isReplacing ? '' : IMAGE_NAME;
      const form = new FormData();

      console.log(EXIST_NAME);
      form.append('image', file, IMAGE_NAME);
      axios
        .post(this.uploadHost + '/' + EXIST_NAME, form)
        .then(() => {
          if (isReplacing) {
            $vm.replaceItem({ index, ext });
          } else if ($vm.isAddingItem) {
            $vm.addItem({ lastTopID: TEMP_ID, ext });
          } else {
            $vm.insertBeforeItem({ name: TEMP_ID, ext, index });
          }
          if ($vm.isAddingItem) {
            $vm.$nextTick(() => {
              $vm.$parent.scrollToLastIndex();
            });
          }
        })
        .catch(res => {
          console.log(res);
          alert(res);
        });
    },
    uploadFiles(files) {
      const filesList = [...files];
      filesList.forEach(this.uploadFile);
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
    onDrop(e, index) {
      const dt = e.dataTransfer;
      const DT_NAME = dt.getData(this.dataTransferAttrName);
      console.log('Drop targer: ' + this.name);
      console.log('Dropping:    ' + DT_NAME);
      this.isHighlighted = false;

      if (DT_NAME) {
        if (index < 0 && this.compareDroppingFile(this.items.length, DT_NAME)) {
          return;
        }
        if (index > 0 && this.compareDroppingFile(index, DT_NAME)) {
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
  },
};
