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
    //console.log(ctx.day+'_open',current_record['hours'][ctx.day]);
 
    if ( !current_record['hours'] || (current_record['hours'][ctx.day]['is_closed'] == "on")){
      //console.log("IS CLOSED ON THIS DAY", current_record['hours'][ctx.day]['is_closed'] );
      $('#id_hours_'+ctx.day+'_open').timepicker()
      $('#id_hours_'+ctx.day+'_close').timepicker()
      
      $(hours_field).find('input').prop('disabled', true);
      $(hours_field).find('.weekday_closed_checkbox').prop('disabled', false);
      $(hours_field).find('.weekday_closed_checkbox').prop('checked', true);

    }
    else{
      $('#id_hours_'+ctx.day+'_open').timepicker(
          'setTime',
          window.current_record['hours'][ctx.day]['open']
      );
      $('#id_hours_'+ctx.day+'_close').timepicker(
         'setTime',
          window.current_record['hours'][ctx.day]['close']
      );
    }
  };

  if (window.current_record['always_open'] == 'on'){
    console.log("ALWAYS OPEN");
    $('#id_always_open').prop('checked', true);
    $('#opening_hours_fields input').prop('disabled', true);
  }

};





//address iput was changed...trigger map update
var address_component_changed = function(ev){
  console.log("CHANGE", $(this).attr('id'));
  var addr = $("#address").val() +", "+$("#city").val() + ", "+$("#zip").val() + " IA";
  show_address_on_map(addr);
};

//update the map view
var show_address_on_map = function(address) {

    console.log("show address");
    while (window.marker_list.length > 0) {
      var m = window.marker_list.pop()
        m.setMap(null);
    }

    window.geocoder.geocode( { 'address': address}, function(results, status) {
      if (status != google.maps.GeocoderStatus.OK) {
        console.log('Geocode was not successful for the following reason: ' + status);
        return;
      }
      var marker = new google.maps.Marker({
        map: window.map,
          position: results[0].geometry.location
      });
      map.setCenter(results[0].geometry.location);
      window.marker_list.push(marker);
        console.log('location:', results[0].geometry.location);

      $("#geo_location_coords_lat").val(results[0].geometry.location.lat());
      $("#geo_location_coords_lng").val(results[0].geometry.location.lng());
        console.log($("#geo_location_coords_lng").val());
      console.log($("#geo_location_coords_lat"));
        console.log($("#geo_location_coords_lng"));

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

//serialize to simple texfield, so form serialization ca automatically use it
var update_image_list = function(){
  var images = [];
  $(".location-form-image").each(function(){
    var url = $(this).attr('src');
    images.push( url );
  }); 
  var url_list = images.join();
  $("#image_list").val(url_list);
  //$("form").sisyphus({});

}

//add a single image by its url to teh list of images
var add_form_image = function(url){
  if (url){
    var ctx = {'url':url}; 
    var img = ich.tmpl_location_image(ctx);
    console.log("adding image:", ctx, img);
    $("#location-form-images-container").append(img);
  }
};



var location_form_logo_image = function(event){
  event.preventDefault();
  $("#logo_img_input").val(event.fpfile.url);
  $('.location-form-logo').attr('src',event.fpfile.url );
  //console.log("LOGO_IMG", event);

};







//submit the form via AJAX / API
var submit_form = function( event, data ) {
  console.log("submit form")
  var f = $("#form")[0];
  if (show_form_errors()){
    $('.form-submit-error-notice').show();
    return;
  }
  $('.form-submit-error-notice').hide();

  var data = $("#form").serializeJSON();
  console.log(data);

  if (current_record['id']){
      data['id'] = current_record['id'];
  }

  if (current_record['_id']) {
      data['_id'] = current_record['_id'];
  }

  $.ajax({
      type: "POST",
      url: "/api/locations/",
      // The key needs to match your method's input parameter (case-sensitive).
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data){
        window.location = "/home"
      },
      failure: function(errMsg) {
          alert(errMsg);
      }
  });


} 



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






$(document).ready(function(){
  $('.form-submit-error-notice').hide();
  //form initialization
  var f = $("form");
  f.nod([
    [ '#id_name', 'presence', 'Cannot be empty' ],
    [ '#id_category', 'presence', 'Select at least one category' ],
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
  f.on( 'silentSubmit', submit_form );

  //opening hours input controlls
  init_opening_hours();


  $("#id_name").val(window.current_record['name']);
  $("#logo_img_input").val(window.current_record['logo_img']);
  $('.location-form-logo').attr('src',window.current_record['logo_img']);

  $("#geo_location").val(window.current_record['geo_location']);
  $("#address").val(window.current_record['address']['street']);
  $("#zip").val(window.current_record['address']['zip']);
  $("#city").val(window.current_record['address']['city']);
  $("#id_email").val(window.current_record['contact']['email']);
  $("#id_phone").val(window.current_record['contact']['phone']);
  $("#id_fax").val(window.current_record['contact']['fax']);
  $("#id_website").val(window.current_record['website']);
  $("#id_description").val(window.current_record['description']);
  $("#id_keywords").val(window.current_record['keywords']);
  $("#id_facebook").val(window.current_record['social']['facebook']);
  $("#id_twitter").val(window.current_record['social']['twitter']);
  $("#id_youtube").val(window.current_record['social']['youtube']);

  $("#id_instagram").val(window.current_record['social']['instagram']);
  $("#id_admission_regular").val(window.current_record['admission']['regular']);
  $("#id_admission_students").val(window.current_record['admission']['students']);
  $("#id_admission_children").val(window.current_record['admission']['children']);
  $("#id_admission_seniors").val(window.current_record['admission']['seniors']);
  $("#id_admission_other").val(window.current_record['admission']['other']);

  var list_of_images = window.current_record['images']; //_list'].split(',');
  for (var i=0; i<list_of_images.length; i++){
    console.log("IMAGE ADD ON LOAD", i);// list_of_images[i] , list_of_images);
    add_form_image( list_of_images[i] );
  };
  $("#image_list").val(list_of_images.join(','));


  //hookup image remove buttons to let user delete images form teh list
  $(".remove_image_btn").on('click', function(){
    var img_url = $(this).parent().remove();
    update_image_list();
  });


  //google maps API
window.marker_list = [];
window.geocoder = new google.maps.Geocoder();
window.map_container = document.getElementById('address-map-container');
window.map = new google.maps.Map(map_container, {
  zoom: 7,
  center: new google.maps.LatLng(41.59, -93.62),
  mapTypeId: google.maps.MapTypeId.ROADMAP
});
  address_component_changed();
    $("#address").change(address_component_changed);
  $("#city").change(address_component_changed);
  $("#zip").change(address_component_changed);


var _admission_categories = [
	'regular',
	'children',
	'students',
	'seniors',
];


for (var cat in window.current_record['admission']){
	if ($.inArray(cat, _admission_categories) != -1){
		console.log("skipping category", cat);
		continue;
		
	}
	console.log("adding category", cat, $.inArray(cat, _admission_categories), _admission_categories);
	var price = window.current_record['admission'][cat];
	ich.tmpl_admission_type({'title':cat, 'price':price}).insertBefore($('#add_admission_category_btn'));
}


$('#add_admission_category_btn').on('click', function(ev){
	var title = window.prompt("Title:","");
	if($.inArray(title, _admission_categories) != -1){
		alert("An Admission Category with that title already exists!");
		return;
	}
	if (title){
		_admission_categories.push(title);
		ich.tmpl_admission_type({'title':title, 'price':''}).insertBefore($('#add_admission_category_btn'));	
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



$("#id_category option").each(function(){
   var option = $(this);
   var cat_selected = $.inArray(option.val(), current_record.category);
            console.log(option, cat_selected);
   if (cat_selected != -1){
       var selected_elem = $('<option selected>'+option.val()+'</option>');
       option.replaceWith(selected_elem);

       //$(option[0]).replaceWith
   };
});


$("select[multiple]").bsmSelect({
        addItemTarget: 'bottom',
        animate: true,
        highlight: true,
        plugins: [
          $.bsmSelect.plugins.compatibility()
        ]
      });






});






















