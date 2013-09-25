

// login via oauth2 popup ////////////////////////////////////////
var oauth2_login = function(backend_url) {
  var url = backend_url + "?next=/close_login_popup/";
  var w = "500";
  var h = "500";
  if ( backend_url.search("facebook") > -1 ){
    w = "400";
    h = "200";
  }
  var settings = [ 'width='+w, "height="+h, "left=100", "top=100",
      'resizable=yes', 'scrollbars=yes', 'toolbar=no', 'menubar=no',
      'location=no', 'directories=no', 'status=no', 'titlebar=no'
        ];
  var settings_str = settings.join();
  window.open(url, "login", settings_str)
}

$(".oauth2_login_btn").on('click', function(e){
  e.preventDefault();
  oauth2_login( this.href );
});





// login using browserID / mozilla persona ///////////////////////
var persona_login_verify = function (assertion){

   console.log("ON LOGIN ");

  $.ajax({  
      type: 'POST', 
      url: '/complete/browserid/', 
      data: {assertion: assertion}
    }
  ).success( function(response) {

       window.location.reload();
    }
  ).error( function(xhr, status, err) {
      console.log(xhr, status, err );
      alert("Login failure: " + err);
      navigator.id.logout();
    }
  );
};

var persona_logout_finalize = function(){

   console.log("ON LOGOUT ");
    $.ajax({ 
        type: 'GET', 
        url: '/logout/'
      }
    ).success( function(xhr, status, err) {
        console.log("logout success...would reload now");
      }
    ).error( function(xhr, status, err) { 
      alert("Logout failure: " + err);
      }
    );
}

navigator.id.watch({
  loggedInUser: null,
  onlogin: persona_login_verify,
  onlogout: persona_logout_finalize
});

$('.persona_login_btn').on('click', function (e){
  e.preventDefault();
    console.log("LOGIN PRESSED");
  //navigator.id.get(persona_login_verify);
    navigator.id.request();
});

$('.persona_logout_btn').on('click', function (e){
  e.preventDefault();
  console.log("LOGOUT PRESSED");
  navigator.id.logout(); 
  persona_logout_finalize();
});

