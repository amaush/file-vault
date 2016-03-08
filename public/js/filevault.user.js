filevault.user = (function(){
  var 
    configMap = {
      is_anon: true,
      token : ''
    },
    stateMap = {
      $container: null
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
    sessionStorage.setItem('x-token', evt.response.token);
    stateMap.$container.empty();
    stateMap.$container.text('Anon-User');

  };

  initModule = function($container){
    stateMap.$container = $container;
    $(document).on('loginFinished', onCompleteLogin);

  };
  return {
    request: request,
    initModule: initModule
  };

})();


