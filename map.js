const JawgAccessToken = '';
const UnsplashClientID = '';

function resetForm(form_element) {
  let inputs = form_element.querySelectorAll('input, textarea');
  inputs.forEach(item => {
    item.value = '';
    item.checked = false;
  });
}

var map = L.map('map').setView([0, 0], 2.5);
L.tileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
  attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 2.5,
	maxZoom: 22,
	subdomains: 'abcd',
	accessToken: JawgAccessToken,
  noWrap: true
}).addTo(map);
map.doubleClickZoom.disable();

var bounds = L.latLngBounds([[85,-180], [-85, 180]]);
map.setMaxBounds(bounds);
map.on('drag', function() {
	map.panInsideBounds(bounds, { animate: false });
});

var geocoder = L.Control.Geocoder.nominatim();
var travel_form = document.querySelector('form#travel_form');
var destination_input = travel_form.querySelector('input[name="destination"]');
var longitude_input = travel_form.querySelector('input[name="longitude"]');
var latitude_input = travel_form.querySelector('input[name="latitude"]');
var error_content = travel_form.querySelector('#error');

map.on('dblclick', function(e){
  travel_form.classList.add('active');
  resetForm(travel_form);
  let coord = e.latlng;
  let lat = coord.lat;
  let lng = coord.lng;
  longitude_input.value = lng;
  latitude_input.value = lat;

  geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), results => {
      var r = results[0];
      if (r) {
        travel_form.querySelector('section#loading').classList.remove('active');
        travel_form.querySelector('section[data-scene="1"]').classList.add('active');
        cityName = r.name.split(',')[0];
        destination_input.value = cityName;
        var url = "https://api.unsplash.com/search/photos?query="+cityName+"&per_page=4&client_id="+UnsplashClientID;
        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(data => {
                  for (let i = 0; i < data.results.length; i++) {
                      let imgSrc = data.results[i].urls.regular;
                      let share_element = document.querySelector('section#sharing ul li:nth-child('+(i+1)+')');
                      share_element.style.backgroundImage = "url('"+imgSrc+"')";
                      share_element.setAttribute('data-image', imgSrc);
                      share_element.querySelector('h4 em').innerHTML = cityName;
                  }
              });
      } else {
        travel_form.querySelector('section.active').classList.remove('active');
        error_content.classList.add('active');
      }
    })
});

var next_button = document.querySelector('span#next');
var prev_button = document.querySelector('span#prev');

next_button.onclick = function() {
  let active_scene = document.querySelector('form section.active');
  let active_scene_number = active_scene.getAttribute('data-scene');
  let required_inputs = active_scene.querySelectorAll('input[required], textarea[required]');
  let required_inputs_filled = true;
  travel_form.classList.remove('shake');
  required_inputs.forEach(item => {
    item.classList.remove('error');
    if(item.value == '') {
      required_inputs_filled = false;
      item.classList.add('error');
    }
  });
  if(!required_inputs_filled) {
    travel_form.classList.add('shake');
    return false;
  }
  if(active_scene_number>4) return false;
  active_scene.classList.remove('active');
  active_scene_number++;
  let next_scene = document.querySelector('form section[data-scene="'+active_scene_number+'"]');
  next_scene.classList.add('active');
};

prev_button.onclick = function() {
  let active_scene = document.querySelector('form section.active');
  let active_scene_number = active_scene.getAttribute('data-scene');
  if(active_scene_number<2) return false;
  active_scene.classList.remove('active');
  active_scene_number--;
  let prev_scene = document.querySelector('form section[data-scene="'+active_scene_number+'"]');
  prev_scene.classList.add('active');
};

function close_the_form() {
  resetForm(travel_form);
  let active_scenes = document.querySelectorAll('form section.active');
  active_scenes.forEach(item => {
    item.classList.remove('active');
  });
  let reset_active_scene = travel_form.querySelector('section#loading');
  if(reset_active_scene) reset_active_scene.classList.add('active');
  travel_form.classList.remove('active');
}

var close_button = document.querySelector('span#close');
close_button.onclick = function() { close_the_form() };

var close_icon_button = document.querySelector('span#close_icon');
close_icon_button.onclick = function() { close_the_form() };

var add_button = document.querySelector('span#add');
var sneaker_image = document.querySelector('img#sneaker').getAttribute('src');
var backpack_image = document.querySelector('img#backpack').getAttribute('src');
var jacket_image = document.querySelector('img#jacket').getAttribute('src');
var accessories_image = document.querySelector('img#accessories').getAttribute('src');

add_button.onclick = function() {
  let destination_input = travel_form.querySelector('input[name="destination"]');
  let longitude_input = travel_form.querySelector('input[name="longitude"]');
  let latitude_input = travel_form.querySelector('input[name="latitude"]');
  let travel_title_input = travel_form.querySelector('input[name="travel_title"]');
  let travel_resolution_input = travel_form.querySelector('textarea[name="travel_resolution"]');
  let traveller_input = travel_form.querySelector('input[name="traveller_name"]');
  let  = travel_form.querySelector('input[name="latitude"]');
  let markerOptions = {
     title: traveller_input.value + ': ' + travel_title_input.value,
     clickable: true
  }
  let marker = L.marker([latitude_input.value, longitude_input.value], markerOptions);
  let gear_HTML = "<ul>";
  let check_gear_sneaker = travel_form.querySelector('input[name="sneaker"]');
  if(check_gear_sneaker.checked) gear_HTML += "<li><img src='"+sneaker_image+"' /></li>";
  let check_gear_backpack = travel_form.querySelector('input[name="backpack"]');
  if(check_gear_backpack.checked) gear_HTML += "<li><img src='"+backpack_image+"' /></li>";
  let check_gear_jacket = travel_form.querySelector('input[name="jacket"]');
  if(check_gear_jacket.checked) gear_HTML += "<li><img src='"+jacket_image+"' /></li>";
  let check_gear_accessories = travel_form.querySelector('input[name="accessories"]');
  if(check_gear_accessories.checked) gear_HTML += "<li><img src='"+accessories_image+"' /></li>";
  gear_HTML += "</ul>";
  let get_first_image = travel_form.querySelector("section#sharing ul li:nth-child("+(Math.floor(Math.random() * (4) ) + 1)+")").getAttribute('data-image');
  marker.bindPopup("<div><h2>"+travel_title_input.value+"</h2><h4>"+traveller_input.value+"</h4><p>"+travel_resolution_input.value+"</p></div><figure style='background-image: url("+get_first_image+");'></figure>"+gear_HTML);
  marker.addTo(map);
  resetForm(travel_form);
  let active_scenes = document.querySelectorAll('form section.active');
  active_scenes.forEach(item => {
    item.classList.remove('active');
  });
  let reset_active_scene = travel_form.querySelector('section#loading');
  if(reset_active_scene) reset_active_scene.classList.add('active');
  travel_form.classList.remove('active');
};

var start_button = document.querySelector('span#start');
var header_popup = document.querySelector('header.popup');

start_button.onclick = function() {
  header_popup.classList.remove('active');
}
