/*
 * filevault.model.js
 * module that communicates with server 
 *
 */


filevault.model = (function(){
  'use strict';

  var repo, comment, image, user;

  sucessLogin = function(status, response, jqXHR){

  };

  failedLogin = function(status, response, jqXHR){

  };

  events = {
    obj: $({}),
    on: function(){
      this.obj.on.apply(this.obj, arguments);
    },
    off: function(){
      this.obj.off.apply(this.obj, arguments);
    },
    trigger: function(){
      this.obj.trigger.apply(this.obj, arguments);
    }
  };

  Image.create(data){
      };
  imageModel = {
    id: null,
    title: null,
    original_name: null,
    description: null,
    created_on: null,
    mime_type: null,
    path: null,
    width: null,
    height: null,
    size: null,
    deleteLink: null,
    link: null,
    comment_preview: null,
    comment_count: null,
    owner_id: null,
    create: function(data){
      
    }
  };

  commentModel = {
    id: null,
    image_id: null,
    comment: null,
    author: null,
    author_id: null,
    date: null,
    children: null
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
    renderImage(new_photo);
  };


  makePhoto = function(json_obj){
    var 
      $img, img_path, photo;

    photo = $.extend({}, imageModel, json_obj);
    //photo.path= photo.path.replace(/public/, '');
    photo.mime_type = photo.mime_type.split('/')[1];

    //img_path =  photo.path + '/' + photo.name;
    $img = $('<img />');
    $img.attr({
      src : photo.path,
    });
    photo.$img = $img;

    return photo;
  };

  urlMap = {
    root: '/',
    album: '/album',
    album_by_id: '/album/:id',
    user: '/user/',
    authenticate: '/user/auth',
    login: '/user/login',
    user_albums: '/user/album',
    album_by_user: '/user/album/:id',
    image_by_id: '/image/:id',
    comment: '/comments/:id',
    description: '/image/:id/description',
    title: '/image/:id/title'
  };
  user = {
    id: null,
    login: function(){
      return $.post({
        url: '/login', 
        method: 'POST', 
        dataType: 'json',
        success: successLogin,
        error: failedLogin
      });
    },
    register: function(){
      return $.post('/register', 'POST', 'json');
    },

  };
  


  user = {
    login : function(){
      return $.ajax({
        url: '/user/login', 
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(request.body) 
      });
    },
    register : function(){
      return $.ajax({
        url: 'user/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(request.body)
      });
    },
    logout : function(){
       return $.ajax({
        url: 'user/logout',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(request.body)
      });
    }
  };

    
  ajaxService = function(){
    var ajaxResponse = $.ajax({
      url: '/',
      method: 'GET',
      dataType: 'json',
      data: '',
      headers: {
        auth_token: ''
      },
      ifModified: false
    });

    return promise;
  };
  //Images repository
  images = (function(){
    var 
      images: [],
      model = imageModel,
      getImages, add, get, getAlbum, getAlbumByUser, fail;


    get = function(){
      if(!items){
        datasource.makeRequest(options, {success: add, fail: fail});
      }else{
        this.trigger('images.new', items);  
      };
    };

    add = function(data){
      data.forEach(function(json_data){
        images.push(makePhoto(json_data));
      });

      if(Array.isArray(data){
        data.forEach(function(item){
          this.items.push(makePhoto(item));
        });
      }else{
        this.items.push(makePhoto(data));
      }
      };

      fail = function(data){
        alert('request failed');
      };

      getAlbum = function(album_id){
        if(!album_id){
          return false;
        }
        var results = items.filter(function(item){
          return item.id = album_id;
        });
        return results;
      };
      getAlbumByUser = function(user_id){
        if(!user_ij){
          return false;
        }
        var results = items.filter(function(item){
          return item.id = user_id;
        });
        return results;
      };

      getImages = function(){
        for(var i = 0; i < stateMap.load_size; i++){
          results.push(items[i]);
        }
        return results;
      };

      return {
        getAlbum: null,
        getImages: null,
        getComments: null,
        getAlbumByUser: null
      };
  })();

  initModule = function(){

    return {
      images: images
    };
  };

})();

