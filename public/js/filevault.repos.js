/*
 * filevault.model.js
 * module that communicates with server 
 *
 */


filevault.model = (function(){
  'use strict';

  var repo, comment, image, user;

  user = {
    id: null
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
    owner_id: null
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

  //Images repository
  images = (function(){
    var 
      getImages, add, get, getAlbum, getAlbumByUser, fail,
    items: [],
    model = imageModel;

    get = function(){
      if(!items){
        datasource.makeRequest(options, {success: add, fail: fail});
        this.trigger('images.new', items);
      }else{
        this.trigger('images.new', items);  
      };
    };

    add = function(data){
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

