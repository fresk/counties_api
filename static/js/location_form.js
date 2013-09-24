if (typeof console === "undefined"){
    console = function(){
        this.log = function(){
            return;
        }
    }
}



Array.prototype.remove= function(){
    var what, a= arguments, L= a.length, ax;
    while(L && this.length){
        what= a[--L];
        while((ax= this.indexOf(what))!= -1){
            this.splice(ax, 1);
        }
    }
    return this;
}



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
    $("#opening_hours_fields").append(hours_field);
  };

  $(".opening-hours-hours-field").timepicker();
  $('html, body').scrollTop(0)
};


//google maps API
  window.marker_list = [];
  window.geocoder = new google.maps.Geocoder()
  window.map_container = document.getElementById('address-map-container');
  window.map = new google.maps.Map(map_container, {
    zoom: 7,
      center: new google.maps.LatLng(41.59, -93.62),
      mapTypeId: google.maps.MapTypeId.ROADMAP
  });


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
  console.log(event)
  for(var i=0;i<event.fpfiles.length;i++){
    add_form_image(event.fpfiles[i].url);
  }
  update_image_list();
};


var location_form_logo_image = function(event){

  event.preventDefault();
  $("#logo_img_input").val(event.fpfile.url);
  $('.location-form-logo').attr('src',event.fpfile.url );
  console.log("LOGO_IMG", event);

};


//serialize to simple texfield, so form serialization ca automatically use it
var update_image_list = function(){
  var images = [];
  $(".location-form-image").each(function(){
    var url = $(this).attr('src');
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
  var img = ich.tmpl_location_image2(ctx);
  $("#location-form-images-container").append(img);
};



//restore form from localstorage
var restore_from_localstorage = function(){
  //restore images from csv urlsin hiden image_list textfield
  var f = this.targets[0];
  for (var i=0; i< f.length; i++){
    var t = $(f[i]);
    if(t.attr('name') == "logo_img"){
      console.log("restoring logo image", t.val(), $('#location-form-logo-img'));
      
      $('#location-form-logo-img').attr('src', t.val());
    }
    if (t.attr('name') == "image_list"){
      var images = t.val().split(',');
      $.each(images, function(idx, img_url){
        console.log("adding image:", img_url);
        
        if (img_url)
        add_form_image(img_url);
      });
    }
  }

  address_component_changed();

  console.log("RESTORED");
};


// called when form has been changed and is stored to locastorage
var persist_to_localstorage = function(){
  console.log("saving form");
};


var show_form_errors = function(){
  console.log("SHOWING ERRORS");
  var f = $("#form")[0];

  for(var i in f.__nod.listeners ){
    var l = f.__nod.listeners[i];
    console.log(l, l.status);
    if (l.status == false){
      $('html, body').animate({
          scrollTop: l.$el.offset().top -100
      }, 400);
      return true;
    }
  }
  return false;
}


//submit the form via AJAX / API
var submit_form = function( event, data ) {
  console.log("SUBMIT FORM");
  var f = $("#form")[0];
  if (show_form_errors()){
    return;
  }

  var data = $("#form").serializeJSON();
  console.log(data);

  $.ajax({
      type: "POST",
      url: "/api/locations/",
      // The key needs to match your method's input parameter (case-sensitive).
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data){
        console.log("OK");
        form_cache.manuallyReleaseData();
        window.location = "/home";
      },
      failure: function(errMsg) {
          alert(errMsg);
      }
  });


} 



var init_form_validation = function(){

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
    ], { "silentSubmit": true, 'broadcastError' : true, 'disableSubmitBtn': false}
  );
  f.on('silentSubmit', submit_form );

  $( window ).on( 'nod_error_fired', function(ev, data){
    console.log("NOD ERROR", ev, data);

  } );




};


var disable_all_opening_hours = function(){
  console.log("disable opening hours");
  $("#opening_hours_fields input").prop('disabled', true);

};


var enable_all_opening_hours = function(){
  console.log("enable opening hours");

  $("#opening_hours_fields input").prop('disabled', false);

};


var weekday_closed_changed = function(){
  $(this).parent().parent().find("input").prop('disabled', this.checked);
  $(this).prop('disabled', false);

};


$(document).ready(function(){
 
 
  var f = $("form");
  //needa reference to force serialization on some hidden fields used for 
  //serializing non standard form fields
  window.form_cache = f.sisyphus({
    locationBased: true,
    autoRelease: false,
    onSave: persist_to_localstorage,
    onRestore: restore_from_localstorage,
  });


  //init the map view next to address
  init_opening_hours();

  init_form_validation();


  //hookup image remove buttons to let user delete images form teh list
  $(".remove_image_btn").on('click', function(){
    var img_url = $(this).parent().remove();
    update_image_list();
  });

  //opening hours input controlls
  $('html, body').scrollTop(0)

  $("#address").change(address_component_changed);
  $("#city").change(address_component_changed);
  $("#zip").change(address_component_changed);


var _admission_categories = [
	'regular',
	'children',
	'students',
	'seniors',
];

$('#add_admission_category_btn').on('click', function(ev){
	var title = window.prompt("Title:","");
	if($.inArray(title, _admission_categories) != -1){
		alert("An Admission Category with that title already exists! "+title);
		return;
	}
	if (title){
		_admission_categories.push(title);
		ich.tmpl_admission_type({'title':title}).insertBefore($('#add_admission_category_btn'));	
	}	
});

$('#admission_fieldset').on('click', function(ev){
	var t = $(ev.target);
	if (t.hasClass('remove_admission_type')){
		var cat = t.data('title');
		_admission_categories.remove(cat);
		t.parent().parent().remove();
	}
	//$('.remove_admission_type').parent().remove();
	
});



$("#id_always_open").change(function(){
  if (this.checked){
    disable_all_opening_hours();
  }
  else{
    enable_all_opening_hours();
  }
});


$('.weekday_closed_checkbox').change(weekday_closed_changed)



$("#submit-id-save").on('click', function(ev){
  console.log('submit click', ev, $('form') );
  submit_form();
})


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






