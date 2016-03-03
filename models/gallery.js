var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    gallerySchema;

gallerySchema = new Schema({
  name : String,
  created_on : { type: Date, 'default': Date.now},
  photos : [ {type: Schema.Types.ObjectId, ref: 'Photo'} ],
  modified_on : { type: Date, 'default': Date.now},
  publish: { type: Boolean, 'default': false}
});


module.exports = mongoose.model('Gallery', gallerySchema);
