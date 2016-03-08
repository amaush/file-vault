var 
express = require('express'),
        router = express.Router(),
        fs = require('fs-extra'),
        path = require('path'),
        uuid = require('node-uuid'),
        busboy = require('connect-busboy'),
        sharp = require('sharp'),
        uploads = './public/uploads/',
        Photos = require('../models/photos');


router.use(busboy({limits : { fileSize: 1024 * 1024 * 5}}));

router.route('/')
.get(function(req, res, next){
  var results = [];
  console.log('Requested photos root ');
  Photos.find({},
      '-_id image_path image_name image_mime_type',
      {sort: {images_created_on: -1}, limit: 25},
      function(err, photos){
        photos.forEach(function(photo, index){
          photo.image_path = photo.image_path.replace(/public/, '');
          photo.image_mime_type = photo.image_mime_type.split('/')[1];
          photo.image_name  = photo.image_name + '_t';
          results.push(photo);
          //console.log(photo);
        });
        res.json({success : true, message: results});
      }
      );
})
.post(function(req, res, next){
  var  
    new_file_name, directory, 
  sub_directory, new_path, fstream, saveTo,
  file_size = 0;

  req.busboy.on('file', 
      function(fieldname, file, filename, transferEncoding, mimetype){
        //generate directory name from first octet of uuid e.g
        // '12345678-1469-2154-14321513' to '8765/4321'
        new_file_name = uuid.v1(); 
        directory = new_file_name.split('-', 1)[0];
        directory = directory.split('');
        sub_directory = directory.splice(4);
        sub_directory = sub_directory.join('');
        directory = directory.join('');
        new_path = path.join(uploads, directory, sub_directory);
        new_file_name = new_file_name.replace(/-/g, '');

        //create directory recursively if it doesn't exist 
        fs.mkdirsSync(new_path, function(err){
          if(err) console.error(err);
        });

        //full path to save image
        saveTo = path.join(new_path, new_file_name);
        console.log('new path : ', saveTo);
        fstream = fs.createWriteStream(saveTo);
        file.pipe(fstream);

        file.on('data', function(data){
          //running total in bytes
          file_size += data.length;
        });

        file.on('limit', function(){
          //Restrict file upload limit
          console.log('image Size limit reached');
          file.resume();
          fs.unlink(saveTo);
        });

        fstream.on('close', function () {    
          //save a thumbnail of the image. Never use original image as is!
          console.log('old path' , saveTo);
          sharp(saveTo)
            .resize(180, 180)
            .toFile(saveTo + '_t', function(err, metadata){
              if(err){
                return console.log(err);
              }else{
                console.log(metadata);
              }
            });

          photo = new Photos();
          photo.image_name = new_file_name;
          photo.image_created_on = Date.now();
          photo.image_orig_name = filename;
          photo.image_mime_type = mimetype;
          photo.image_path = new_path;
          photo.image_size = file_size;

          photo.save(function(err, photo){
            if(err){
              Object.keys(err.errors).forEach(function(key){
                var message = err.errors[key].message;
                console.log('Validation error for "%s": %s', key, message);
                //whats the appropriate response to send here??
                res.status(500).json({success: false, message: ''});
              });
            }else{
              console.log("Image %s saved to: ",photo._id, photo.image_path);
              res.json({success: true, message:[ photo.image_path + '/' +  photo.image_name + '.' + photo.image_mime_type.split('/')[1]]});
            }
          });
          console.log("Upload Finished of " + filename);              
        });

      });

  req.busboy.on('finish', function(){
    console.log('Busboy is finished');
    /*
       res.writeHead(201, { 'Connection': 'close' });
       res.end('Thats all folks!');
       */
  });

  req.pipe(req.busboy);

});


router.route('/:id')
.get(function(req, res, next){
  console.log('want photo with id %s?', req.id);
  res.json({success: false, message: req.id});
})
.put(function(req, res, next){
  console.log('want to edit photo %s', req.id);  
})
.delete(function(req, res, next){
  console.log('want to delete photo?');
});


module.exports = router;
