var 
express = require('express'),
        router = express.Router(),
        fs = require('fs-extra'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        crypto = require('crypto'),
        uploads = './uploads/',
        Photo = require('../models/photos');



router.post('/image', function(req, res, next){
  var  
    new_file_name, top_level, 
  mid_level, new_path, fstream, 
  file_size = 0,
  files_uploaded = []; 

  req.busboy.on('file',function(fieldname, file, filename, transferEncoding, mimetype){
    console.log('uploading %s: %s: %s: %s:', fieldname, filename, transferEncoding, mimetype);

    new_file_name = crypto.createHash('md5').update(filename).digest('hex');
    top_level = new_file_name.slice(0,3).toString();
    mid_level = new_file_name.slice(3,6).toString();
    new_path = path.join(uploads,top_level, mid_level);

    console.log('NEW PATH: %s NEW FILENAME: %s ', new_path, new_file_name );


    fs.mkdirsSync(new_path, function(err){
      if(err) console.error(err)
      else console.log('Booyah dir exists')
    });
    fstream = fs.createWriteStream(new_path + '/' + new_file_name);
    file.pipe(fstream);

    fstream.on('close', function () {    
      files_uploaded.push({filename: filename, mimetype: mimetype, new_file_name: new_file_name, file_path : new_path, file_size: file_size/1024});
      console.log("Upload Finished of " + filename);              
      console.log(files_uploaded);
    });

    file.on('data', function(data){
      file_size += data.length;
    });

    file.on('limit', function(){
      console.log('image Size limit reached');
      file.resume();
      fs.unlink(new_path + '/' + new_file_name);
      //res.json({success: false, message: 'Image Size limit Reached'});
    });

    file.on('end', function(){
      console.log('File size: ', file_size/1024);
      /*
         photo = new Photo();
         photo.name = new_file_name;
         photo.original_name = filename;
         photo.type = mimetype;
         photo.path = new_path + new_filename;
         photo.size = file_size;
         photo.created_on = Date.now();
         photo.save(function(err, res){
         if(err){
         res.json({ success: false, message: 'photo could not be saved'});
         }else{
         res.json({ success: true, message: 'uploads/'+ new_path + new_file_name});
         }
         });
         */
    });
  });

  req.busboy.on('finish', function(){
    console.log('Busboy is finished');
    /*
       res.writeHead(201, { 'Connection': 'close' });
       res.end('Thats all folks!');
       */
    files_uploaded = [];
    res.json({success: true, message: 'Image upload OK'});
  });

  req.pipe(req.busboy);
})
.get('/image', function(req, res, next){
  Photos.find().select().exec(function(err, results){

  });
});

/*
   fs.writeFile(__dirname + '/uploads' + req.name, req.data, 
   { flag : 'wx'
   }, function(error){
   if(error){ 
   return console.error(error.message);
   }
   });
   */

module.exports = router;
