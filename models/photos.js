var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    photoSchema;

photoSchema = new Schema({
  album_id: { type: Schema.Types.ObjectId, ref: 'Gallery'},
  name: String,
  created_on : { type: Date, 'default': Date.now},
  size: Number,
  path: String,
  original_name: String,
  mime_type: String,
  title: String,
  description: String,
  link: String,
  delete_link: String,
  publish: { type: Boolean, 'default': false} 
});


module.exports = mongoose.model('Photo', photoSchema);
