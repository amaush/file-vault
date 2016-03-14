var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    commentSchema;

commentSchema = new Schema({
  image_id: { type: Schema.Types.ObjectId, ref: 'Image'},
  comment: String,
  comment_created_on : { type: Date, 'default': Date.now},
  comment_author: { type: Schema.Types.ObjectId, ref: 'User'},
  children: [{ type: Schema.Types.ObjectId, ref: 'Comment'}]
});


module.exports = mongoose.model('Comment', commentSchema);
