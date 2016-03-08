/* 
 * Gallery Module for filevault
 *
 */


filevault.model = (function(){
  'use strict';

  var photo, gallery, makePhoto, user;

  user = (function(){
    var 
      configMap = {
        is_anon: true,
        token : ''
      },
    initModule, request, onCompleteLogin, logout;

    request = function(request_data){
      console.log('BODY: ', request_data);
      var 
        event_name,
        myre = /\/\w+\/(\w+)$/, 
        request = { };
      
      if(request_data.password_confirm){
        request.url = '/user/register';
      }else if(request_data.password){
        request.url = '/user/login';
      }else if(request_data.logout){
        request.url = '/user/logout';
      }

      //request.url = '/user/register';
      request.method =  'POST';
      event_name = myre.exec(request.url);
      event_name.shift();
      console.log('eventname ', event_name);

      request.event_name = event_name.pop();

      request.body = request_data;

      console.log('REQUEST: ', request);
      filevault.data.send(request);
     
    };

    onCompleteLogin = function(evt){
      console.log('LOGIN RESPONSE', evt.response);
      
    };

    initModule = function(){
      $(document).on('loginFinished', onCompleteLogin);

    };


    return {
      request: request,
      initModule: initModule
    };



  })();

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
      //jqueryMap.$content.css({'background-image': photo});
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
    //console.log('photo map', photo_map);
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
      is_initial_load : true,
      photo_db : [] 
    },
    jqueryMap = { },      //cache jQuery collections in object
    setJqueryMap, initModule, _renderGallery, get_thumbnails,
    onGalleryLoad , onPhotoClick, onResponseDone, send;

    setJqueryMap = function(){
      var $container = stateMap.$container;
      jqueryMap = {
        $container : stateMap.$container,
        $content : stateMap.$container.find('#filevault-gallery-container')
      };
    };

    send = function(request_data){
      //var file_mode = request_body.files || null;
      var 
        request_options = { }, 
        request = { };

      request.url = '/image';
      request.method = request_data? 'POST' : 'GET';
      request.event_name = request.method === 'POST' ? 'upload' : 'populateGallery';

      console.log('request options: ', request_options);
      if(request_data && request_data.is_file_request){
        request_data.files.forEach(function(file){
          request.body = file;
          filevault.data.send(request);
        });
      }else{
        request.body = request_data;
        filevault.data.send(request);
      }
    };

    get_thumbnails = function(){
      return stateMap.photo_db;
    };

    _renderGallery = function(){
      jqueryMap.$content.detach();
      jqueryMap.$content.empty();
      if(stateMap.photo_db.length){
        stateMap.photo_db.forEach(function(photo, idx){
          var new_img =  makePhoto(photo);
          jqueryMap.$content.append(new_img);
          stateMap.photo_db.push(new_img);
        });
      }else{
        jqueryMap.$content.html('<div class="error">Content failed to load</div>');
      }
      jqueryMap.$container.append(jqueryMap.$content);
    };

    onPhotoClick = function(evt){
      var $target;
      //console.log('toggling gallery');
      $target = $(evt.target);
      if($target.is('img')){
        $(document).trigger('toggleGallery', evt.target);
      }
      //path = evt.target.getAttribute('src').split('/').pop();
    };

    onGalleryLoad = function(evt){
     _renderGallery(); 
    };

    onResponseDone = function(evt){
      var
        success =  evt.response.success,
        message = evt.response.message;

      console.log('response done');
      console.log(evt.response.success);
      if(success){
        message.forEach(function(image, idx){
          stateMap.photo_db.push(image);
        });
      }
      if(stateMap.is_initial_load){
        _renderGallery();
        stateMap.is_initial_load = false;
      }
    };

    initModule = function($container){
      stateMap.$container = $container;
      stateMap.$container.html(configMap.core_html);

      setJqueryMap();

      //populate gallery on initial application load
      send();
      jqueryMap.$content.on('click', onPhotoClick);
      $(document).on('populateGalleryFinished', onResponseDone);
      $(document).on('galleryShow', onGalleryLoad);
    };

    return {
      initModule: initModule,
      send : send,
      get_thumbnails : get_thumbnails
    };
  })();

  return {
    gallery : gallery,
    photo : photo,
    user: user
  };

})();
