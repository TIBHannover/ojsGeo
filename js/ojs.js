const lat = 51.96;
const lon = 7.59;
const start_latlng = [lat, lon];

console.log("Hello"); 

var map = L.map("mapdiv").setView(start_latlng, 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

