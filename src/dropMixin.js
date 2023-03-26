import { ID_SEPARATOR, getIdParts } from '@apiHelpers';
import { SERVER_BASE_URL } from '@helpers';

export default {
  data() {
    return {
      uploadHost: SERVER_BASE_URL + 'image',
      isHighlighted: false,
      separator: ID_SEPARATOR,
    };
  },
  methods: {
    getIdParts(index) {
      return getIdParts(this.items[index].name);
    },
  },
};
