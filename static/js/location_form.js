//global settings/function
google.maps.visualRefresh = true;
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};


//opening hours controlls
var init_opening_hours = function(){
  var WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", 
      "saturday", "sunday"];
  for (var i = 0; i  < WEEKDAYS.length; i++) {
    var ctx = {"Day": WEEKDAYS[i].capitalize(), "day": WEEKDAYS[i]};
    var hours_field = ich.tmpl_opening_hours(ctx);
    $("#opening_hours_fieldset").append(hours_field);
  };

  $(".opening-hours-hours-field").timepicker();
};


//google maps API
var init_google_maps_view = function(){
  var marker_list = [];
  var geocoder = new google.maps.Geocoder()
    var map_container = document.getElementById('address-map-container');
  var map = new google.maps.Map(map_container, {
    zoom: 7,
      center: new google.maps.LatLng(41.59, -93.62),
      mapTypeId: google.maps.MapTypeId.ROADMAP
  });
};


//address iput was changed...trigger map update
var address_component_changed = function(ev){
  console.log("CHANGE", $(this).attr('id'));
  var addr = $("#address").val() +", "+$("#city").val() + ", "+$("#zip").val() + " IA";
  show_address_on_map(addr);
};

//update the map view
var show_address_on_map = function(address) {
    while (marker_list.length > 0) {
      var m = marker_list.pop()
        m.setMap(null);
    }
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status != google.maps.GeocoderStatus.OK) {
        console.log('Geocode was not successful for the following reason: ' + status);
        return;
      }
      var marker = new google.maps.Marker({
        map: map,
          position: results[0].geometry.location
      });
      map.setCenter(results[0].geometry.location);
      marker_list.push(marker);
      $("#geo_location_input").val(results[0].geometry.location);
    });
  };




// thumnail / images from filepicker.io widget
var location_form_add_images = function(event){
  event.preventDefault();
  for(var i=0;i<event.fpfiles.length;i++){
    add_form_image(event.fpfiles[i].url);
  }
  update_image_list();
};

//serialize to simple texfield, so form serialization ca automatically use it
var update_image_list = function(){
  var images = [];
  $(".location-form-image").each(function(){
    var url = $(this).attr('src');
    console.log("url:", url)
    images.push( url );
  }); 
  var url_list = images.join();
  $("#image_list").val(url_list);
  window.form_cache.saveAllData();
  //$("form").sisyphus({});

}

//add a single image by its url to teh list of images
var add_form_image = function(url){
  ctx = {"url": url};
  var img = ich.tmpl_location_image(ctx);
  $("#location-form-images-container").append(img);
};



//restore form from localstorage
var restore_from_localstorage = function(){
  
  //restore images from csv urlsin hiden image_list textfield
  var f = this.targets[0];
  for (var i=0; i< f.length; i++){
    var t = $(f[i]);
    if (t.attr('name') == "image_list"){
      var images = t.val().split(',');
      $.each(images, function(idx, img_url){
        add_form_image(img_url);
      });
    }
  }

};


// called when form has been changed and is stored to locastorage
var persist_to_localstorage = function(){
  console.log("saving form");
};


//submit the form via AJAX / API
var submit_form = function( event, data ) {
  var data = $("#form").serializeJSON();
  console.log(data);
} 


$(document).ready(function(){

  //form initialization
  var f = $("form");
  f.nod([
    [ '#id_name', 'presence', 'Cannot be empty' ],
    [ '#id_email', 'presence', 'Cannot be empty' ],
    [ '#id_phone', 'presence', 'Cannot be empty' ],
    [ '#id_description', 'presence', 'Cannot be empty' ],
    [ '#id_keywords', 'presence', 'Cannot be empty' ],
    [ '#address', 'presence', 'Cannot be empty' ],
    [ '#city', 'presence', 'Cannot be empty' ],
    [ '#zip', 'presence', 'Must be a 5-digit zipcode' ],
    [ '#zip', 'integer', 'Must be a 5-digit zipcode' ],
    [ '#zip', 'presence', 'Must be a 5-digit zipcode' ],
    [ '#zip', 'exact-length:5', '' ],
    ], { "silentSubmit": true}
  );
  f.on( 'silentSubmit', submit_form );

  //needa reference to force serialization on some hidden fields used for 
  //serializing non standard form fields
  window.form_cache = f.sisyphus({
    locationBased: true,
    autoRelease: false,
    onSave: persist_to_localstorage,
    onRestore: restore_from_localstorage
  });


  //init the map view next to address
  init_google_maps_view();
  $("#address").change(address_component_changed);
  $("#city").change(address_component_changed);
  $("#zip").change(address_component_changed);

  //hookup image remove buttons to let user delete images form teh list
  $(".remove_image_btn").on('click', function(){
    var img_url = $(this).parent().remove();
    update_image_list();
  });

  //opening hours input controlls
  init_opening_hours();

});














//opening hours
/*
   var opening_hours = {
   "monday": {"open": "9:00 AM", "close": "5:00 PM", "notes": ""},
   "tuesday": {"open": "9:00 AM", "close": "5:00 PM", "notes": ""},
   "wednesday": {"open": "9:00 AM", "close": "5:00 PM", "notes": ""},
   "thursday": {"open": "9:00 AM", "close": "5:00 PM", "notes": ""},
   "friday": {"open": "9:00 AM", "close": "5:00 PM", "notes": ""},
   "saturday": {"open": "9:00 AM", "close": "5:00 PM", "notes": ""},
   "sunday": {"open": "9:00 AM", "close": "5:00 PM", "notes": ""}
   };


   serialize_opening_hours = function(ev){
   var field_id = this.id;
   if (field_id){
   var tokens = field_id.split('-');
   console.log(tokens);
   slot = tokens.pop(); // "open" or "close"
   day = tokens.pop(); 
   opening_hours[day][slot] = $(this).val();
   }
   oh_serialized.val( JSON.stringify(opening_hours) );
   };
   var oh_serialized = $("#opening-hours-hours");
   $(".opening-hours-hours-field").timepicker();

   for (day in opening_hours){
   var open_field_id = "#opening-hours-hours-"+day+"-open";
   $(open_field_id).val(opening_hours[day]['open']);
   var close_field_id = "#opening-hours-hours-"+day+"-close";
   $(close_field_id).val(opening_hours[day]['close']);
   }


   serialize_opening_hours();
   $(".opening-hours-hours-field").change(serialize_opening_hours);
   */


//form validation






