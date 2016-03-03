/*
 * filevault.model.js
 * module that contains the data
 * can transform Model JSON in order to store in backend
 * validates the data
 *
 */


filevault.model = (function(){

  var 
    configMap = {
      anon_id : 'a0',
    },
    stateMap = {
      $container: null,
      anon_user   : null,
      photo_db    : null,
      gallery_db  : null,
      user        : null
    },
    gallery, photo, login, logout,
    configModule, initModule, photoProto;

  
  gallery = (function(){
    var addPhoto;

    addPhoto = function(photo_list){
      var
        photo,  photo_db = [];
            
      photo_db = photo_list.map(makePhoto);
   /*   photo = photo_db[photo_map.src];
   /*   if(!!photo){ 
   /*     console.log("Photo already exists");
   /*   }else{
   /*     /*
   /*     photo = makePhoto(photo_map);
   /*     photo_db[photo.src] = photo;
   /*     */
   /*     console.log("Photo doesn't exist");
   /*   }
    */
      return photo_db;
     };
      
    return {
      add : addPhoto
    };
  })();

  onFilesUpload = function(evt, imgList){
    console.log("Called onFilesUpload handler");
    imgList.forEach(function(img, idx){
      jqueryMap.$img_box.append(img);
    });
  };
  //----END MODULE SCOPE VARIABLE
   makePhoto = function(data_obj){
    var
      photo, photoProto = { };

      photo = Object.create(photoProto);
      photo.name = data_obj.name;
      photo.lastModified = data_obj.lastModified;
      photo.size = data_obj.size;
      photo.type = data_obj.type;
      photo.src = data_obj.src;  //can be used for cache?? destroyed later??
      
      return photo;
   };


  initModule = function(){
    //stateMap.gallery = makeGallery({});

  };

  return {
    initModule : initModule,
    gallery    : gallery ,
  };

})();
