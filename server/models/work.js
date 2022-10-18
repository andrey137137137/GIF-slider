const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkSchema = new Schema({
  names: {
    type: Array,
    default: ['', '', ''],
  },
});

mongoose.model('work', WorkSchema);
