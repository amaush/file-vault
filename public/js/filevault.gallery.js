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
        $container : null
      },
      jqueryMap = { },
      setJqueryMap, initModule, showPhoto, renderSideBar,
      onTogglePhoto, onThumbClick, onPhotoClick;

    setJqueryMap = function(){
      jqueryMap = {
        $content : stateMap.$container.find('#filevault-photos'),
        $side_bar : stateMap.$container.find('#filevault-side-bar')
      };
    };

    showPhoto = function(img){
      var
        image_path, image_name, new_photo, path_sections,
        path = img;
      
      console.log('path : ', path);
      path_sections = path.split('/');

      path_sections.shift();  
      image_name = path_sections.pop();
      image_path = '/' + path_sections.join( '/');
      image_name = image_name.replace('_t', '');
      //console.log('showPhoto image is %s: %s', image_path, image_name);
      new_photo = makePhoto({
        image_path : image_path,
        image_name : image_name 
       });
      //new_photo = makePhoto(new_photo);
      history.pushState({url: '/' + image_name, path: img}, 'image', image_name);
      jqueryMap.$content.empty();
      jqueryMap.$content.append(new_photo);
      renderSideBar();
    };

    renderSideBar = function(){
      var thumbs = gallery.get_thumbnails();
      thumbs.forEach(function(thumb){
        jqueryMap.$side_bar.append(thumb);
      });
    };

    onPhotoClick = function(evt){
      evt.preventDefault();
      showPhoto(evt.target.getAttribute('src'));
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
      jqueryMap.$content.on('click', onPhotoClick);
      jqueryMap.$side_bar.on('click', onThumbClick);
    };

    return {
      initModule : initModule,
      showPhoto : showPhoto
    };
  })();


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

  return {
    gallery : gallery,
    photo : photo
  };

})();
