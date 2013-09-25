
$(document).ready(function(){

$('.logout_btn').on('click', function (e){
  e.preventDefault();
  console.log("LOGOUT PRESSED");
  navigator.id.logout();
  window.location.href = "/logout/";

});


});
