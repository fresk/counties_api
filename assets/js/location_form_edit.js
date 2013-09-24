if (typeof console === "undefined"){
    console = function(){
        this.log = function(){
            return;
        }
    }
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
    $("#opening_hours_fieldset").append(hours_field);
    $('#id_hours_'+ctx.day+'_open').timepicker(
        'setTime',
        window.current_record['hours'][ctx.day]['open']
    );
    $('#id_hours_'+ctx.day+'_close').timepicker(
       'setTime',
        window.current_record['hours'][ctx.day]['close']
    );
  };

};





//address iput was changed...trigger map update
var address_component_changed = function(ev){
  console.log("CHANGE", $(this).attr('id'));
  var addr = $("#address").val() +", "+$("#city").val() + ", "+$("#zip").val() + " IA";
  show_address_on_map(addr);
};

//update the map view
var show_address_on_map = function(address) {
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
  ctx = {"url": url};
  var img = ich.tmpl_location_image(ctx);
  console.log("adding image:", ctx, img);
  $("#location-form-images-container").append(img);
};








//submit the form via AJAX / API
var submit_form = function( event, data ) {
  console.log("submit form")

  var data = $("#form").serializeJSON();
  console.log(data);

  data['id'] = current_record.id;

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

  //opening hours input controlls
  init_opening_hours();


  $("#id_name").val(window.current_record['name']);
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
  $("#id_instagram").val(window.current_record['social']['instagram']);
  $("#id_admission_regular").val(window.current_record['admission']['regular']);
  $("#id_admission_students").val(window.current_record['admission']['students']);
  $("#id_admission_children").val(window.current_record['admission']['children']);
  $("#id_admission_seniors").val(window.current_record['admission']['seniors']);
  $("#id_admission_other").val(window.current_record['admission']['other']);

  var list_of_images = window.current_record['image_list'].split(',');
  for (var i in list_of_images){
    add_form_image( list_of_images[i] );
  };
  $("#image_list").val(window.current_record['image_list']);


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


  $("#submit-id-save").on('click', function(ev){
  console.log('submit click', ev, $('form') );
  submit_form();
})


    if (window.current_record.category == "Museum"){
	    $("#id_category_museum").prop("checked", true);
    }
    if (window.current_record.category == "Barn"){
	    $("#id_category_barn").prop("checked", true);
    }
    if (window.current_record.category == "Historic Site"){
	    $("#id_category_historic").prop("checked", true);
    }
    if (window.current_record.category == "Theater"){
	    $("#id_category_theater").prop("checked", true);
    }


});






















