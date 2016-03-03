var 
  express = require('express'),
  router = express.Router();


router.route('/:gallery_id?')
  .get(function(req, res, next){
    var results; 

    console.log('Gallery Endpoint');
    if(req.params.gallery_id)console.log('ID received : %s', req.params.gallery_id);
    Gallery.find({},
      '-_id name',
      {sort: {created_on: -1}, limit: 5},
        function(err, gallery){
          gallery.forEach(function(gallery, index){
            results[index] = gallery[index];
            console.log(results[index]);
          });
          res.json(results);
        }
    );
  })
  .post(function(req, res, next){
  //test params

  gallery = new Gallery();
  gallery.name = new_file_name;
  gallery.created_on = Date.now();
  gallery.modified_on = Date.now();

  gallery.save(function(err, gallery){
    if(err){
      Object.keys(err.errors).forEach(function(key){
        var message = err.errors[key].message;
        console.log('Validation error for "%s": %s', key, message);
        res.status(500).json({success: false, message: 'Something is broken. We are aware of it and are tireless working to fix it'});
      });
    }else{
      console.log("Gallery %s created: ",gallery.name);
      res.json({success: true, message: gallery.name });
    }
  });
  
});

router.post('/gallery/:gallery_id?', function(req, res, next){

  res.json({'index' : 'gallery collection created'});
});
router.delete('/gallery/:gallery_id?', function(req, res, next){

  res.json({'index' : 'gallery collection deleted'});
});


module.exports = router;
