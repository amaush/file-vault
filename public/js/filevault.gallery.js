/* 
 * Gallery Module for filevault
 *
 */


filevault.model = (function(){
  'use strict';

  var photo, gallery, makePhoto;

  photo = (function(){
    var 
      configMap = {
        core_html : String() 
          + '<div id="filevault-photos"></div>'
          + '<aside id="filevault-side-bar"></aside>'
      },
      stateMap = {
        $container : null,
        photo_db : { }
      },
      jqueryMap = { },
      setJqueryMap, initModule, showPhoto, _renderSideBar, _renderImage,
      getImagePath, onTogglePhoto, onThumbClick, onPhotoClick;

    setJqueryMap = function(){
      jqueryMap = {
        $content : stateMap.$container.find('#filevault-photos'),
        $side_bar : stateMap.$container.find('#filevault-side-bar')
      };
    };

    getImagePath = function(img_url){
      var
        img_name, img_path,
      path_parts = img_url.split('/');

      path_parts.shift();  
      img_name = path_parts.pop();
      img_path = '/' + path_parts.join( '/');
      img_name = img_name.replace('_t', '');

      return { image_path : img_path, image_name : img_name };

    };

    showPhoto = function(img){
      var 
        new_photo,
        path = { };

      path = getImagePath(img);
      new_photo = makePhoto(path);
      //stateMap[path.image_name] = new_photo;
      history.pushState({url: '/' + path.image_name, path: [path.image_path, path.image_name].join('/')}, 'Image', path.image_name);
      _renderImage(new_photo);
    };

    _renderImage = function(photo){
      jqueryMap.$content.empty();
      jqueryMap.$content.append(photo);
      _renderSideBar();
    };

   _renderSideBar = function(){
      var thumbs;
      
      jqueryMap.$side_bar.empty();
      
      console.log('sidebar');
      thumbs = gallery.get_thumbnails();
      thumbs.forEach(function(thumb){
        jqueryMap.$side_bar.append(thumb);
      });
    };

    onPhotoClick = function(evt){
      evt.preventDefault();
      //showPhoto(evt.target.getAttribute('src'));
    };

    onThumbClick = function(evt){
      evt.preventDefault();
      showPhoto(evt.target.getAttribute('src'));
    };

    onTogglePhoto = function(evt, data){
      evt.preventDefault();
      showPhoto(data.getAttribute('src'));
    };

    initModule = function($container){
      stateMap.$container = $container;
      $container.append(configMap.core_html);
      $(document).on('toggleGallery', onTogglePhoto);
      setJqueryMap();
      //jqueryMap.$content.on('click', onPhotoClick);
      jqueryMap.$side_bar.on('click', onThumbClick);
    };

    return {
      initModule : initModule,
      showPhoto : showPhoto
    };
  })();

  makePhoto = function(photo_map){
    var 
      $img, img_path, 
    photo = photo_map;

    img_path =  photo.image_path + '/' + photo.image_name;
    $img = $('<img />');

    $img.attr({
      src : img_path,
      title : 'image',
      "data-lm" : '',
      "data-title" : '',
      "data-lastM" : ''
    });
    return $img;
  };


  gallery = (function(){
    var 
      configMap = {
        core_html : '<div id="filevault-gallery-container"></div>'
      },
    stateMap = {        //dynamic info shared across module 
      $container : null, 
      photo_db : [] 
    },
    jqueryMap = { },      //cache jQuery collections in object
    photo, setJqueryMap, initModule, _renderGallery, updateGallery, get_thumbnails,
    onPhotoClick, onResponseDone, send;

    setJqueryMap = function(){
      var $container = stateMap.$container;
      jqueryMap = {
        $container : stateMap.$container,
        $content : stateMap.$container.find('#filevault-gallery-container')
      };
    };

    send = function(options){
      var file_mode = options.files || null;

      //send request to data layer
      file_mode ? filevault.data.sendFiles(options) : filevault.data.get(options);
    };

    updateGallery = function(evt, data){

      if(!data){
        filevault.data.get({
          event_name : 'updateGallery'
        });
      }else{

      }

      //_renderGallery();
    };

    get_thumbnails = function(){
      return stateMap.photo_db;
    };

    _renderGallery = function(data){
      jqueryMap.$content.detach();
      jqueryMap.$content.empty();
      if(data){
        data.forEach(function(photo, idx){
          var new_img =  makePhoto(photo);
          jqueryMap.$content.append(new_img);
          stateMap.photo_db.push(new_img);
        });
      }else{
        console.log('CACHE HIT');
        photo_db.forEach(function(photo, idx){
          jqueryMap.$content.append(photo);
        });
      }
      jqueryMap.$container.append(jqueryMap.$content);
    };

    onPhotoClick = function(evt){
      var 
        path;
      console.log('toggling gallery');

      //path = evt.target.getAttribute('src').split('/').pop();
      $(document).trigger('toggleGallery', evt.target);
    };

    onResponseDone = function(evt, result){
      var
        success = result.success,
      message = result.message;

      if(success){
        _renderGallery(message);
      }else{
        jqueryMap.$content.html('<div class="error">Message failed with ' + message);
      }
    };

    initModule = function($container){
      stateMap.$container = $container;
      stateMap.$container.html(configMap.core_html);

      setJqueryMap();
      jqueryMap.$content.on('click', onPhotoClick);
      $(document).on('updateGalleryFinished', onResponseDone);
      $(document).on('uploadFinished', onResponseDone);
    };

    return {
      initModule: initModule,
      updateGallery: updateGallery,
      send : send,
      get_thumbnails : get_thumbnails
    };
  })();

  return {
    gallery : gallery,
    photo : photo
  };

})();
