var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    photoSchema;

photoSchema = new Schema({
  gallery_id : { type: Schema.Types.ObjectId, ref: 'Gallery'},
  image_name : String,
  image_created_on : { type: Date, 'default': Date.now},
  image_size : Number,
  image_path : String,
  image_orig_name : String,
  image_mime_type : String,
  image_title : String,
  image_descr: String,
  image_delete_link: String,
  image_publish : { type: Boolean, 'default': false} 
});


module.exports = mongoose.model('Photo', photoSchema);
