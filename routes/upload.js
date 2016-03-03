var 
  express = require('express'),
  router = express.Router(),
  mmm = require('mmmagic'),
  Magic = mmm.Magic,
  magic = new Magic(mmm.MAGIC_MIME_TYPE | mmm.MAGIC_MIME_ENCODING);
  fs = require('fs-extra');


router.post('/image', function(req, res){
  var
    mime_check = false,
    fstream; 


  req.busboy.on('file'
      ,function(fieldname, stream, filename, transferEncoding, mimetype){
        console.log('uploading %s: %s: %s: %s:', fieldname, filename, transferEncoding, mimetype);

        
        fstream = fs.createWriteStream('uploads/' + filename);
        stream.pipe(fstream);
        fstream.on('close', function () {    
          console.log("Upload Finished of " + filename);              
        });
        //stream.resume();
        stream.on('data', function(data){
          //console.log('File ', fieldname + ' got' + data.length);
          if(!mime_check){
            magic.detect(data, function(err, result){
            console.log(result);
            mime_check = true;
          });
          }
        });
        stream.on('end', function(
  });
  req.busboy.on('finish', function(){
    console.log('Busboy is finished');
    res.writeHead(201, { 'Connection': 'close' });
    res.end('Thats all folks!');
  });
  req.pipe(req.busboy);
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
