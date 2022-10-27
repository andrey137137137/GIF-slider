import { SERVER_BASE_URL } from '@helpers';

export default {
  data() {
    return {
      uploadHost: SERVER_BASE_URL + 'image',
      isHighlighted: false,
      separator: '.',
    };
  },
  methods: {
    getIdParts(index) {
      return this.items[index].name.split(this.separator);
    },
  },
};
