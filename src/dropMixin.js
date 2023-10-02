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
    };
  },
  computed: {
    ...mapState(['items', 'lightboxIndex']),
    toShowLightbox() {
      return this.lightboxIndex >= 0;
    },
  },
  methods: {
    ...mapMutations(['deleteItem']),
    getIdParts(index) {
      return getIdParts(this.items[index].name);
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
  },
};
