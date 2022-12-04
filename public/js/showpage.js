mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
    container: 'show-map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
    cooperativeGestures: true,
});

map.addControl(new mapboxgl.NavigationControl())
map.addControl(new mapboxgl.FullscreenControl());

const marker = new mapboxgl.Marker({ color: '#d90429',  draggable: true })
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset:25})
    .setHTML(
        `<h4>${campground.title}</h4> <p> ${campground.location} </p>`
    )
)
.addTo(map);

