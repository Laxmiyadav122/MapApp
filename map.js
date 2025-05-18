mapboxgl.accessToken = 'pk.eyJ1IjoiZ2F1cmF2bmciLCJhIjoiY20xdGx3ODhuMDNzNTJ0cHI2YWphY2p1ZCJ9.DCncOYgA91GXOkejz0CilQ'; // Replace with your Mapbox access token

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [83.8908, 22.8898], 
  zoom: 14 
});

function searchLocation() {
  const location = document.getElementById('location').value;
  
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?proximity=83.8908,22.8898&access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
      const coordinates = data.features[0].geometry.coordinates;
      map.flyTo({ center: coordinates, zoom: 14 });

      new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);
    })
    .catch(error => console.error('Error:', error));
}

function filterPlaces() {
    const placeType = document.getElementById('place-type').value;
    const bounds = map.getBounds();
    const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${placeType}.json?bbox=${bbox}&types=poi&access_token=${mapboxgl.accessToken}`)
      .then(response => response.json())
      .then(data => {
        const markers = document.querySelectorAll('.mapboxgl-marker');
        markers.forEach(marker => marker.remove());

        data.features.forEach(place => {
          const coordinates = place.geometry.coordinates;
          new mapboxgl.Marker({ color: 'blue' })
            .setLngLat(coordinates)
            .addTo(map);
        });

        if (data.features.length === 0) {
          alert("No places found for the selected type.");
        }
      })
      .catch(error => console.error('Error:', error));
  }


function calculateDistance() {
    const locationA = document.getElementById('locationA').value;
    const locationB = document.getElementById('locationB').value;
    const transportMode = document.getElementById('transport-mode').value;

    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationA}.json?proximity=83.8908,22.8898&access_token=${mapboxgl.accessToken}`)
      .then(response => response.json())
      .then(dataA => {
        const coordinatesA = dataA.features[0].geometry.coordinates;
  
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationB}.json?proximity=83.8908,22.8898&access_token=${mapboxgl.accessToken}`)
          .then(response => response.json())
          .then(dataB => {
            const coordinatesB = dataB.features[0].geometry.coordinates;

            fetch(`https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${coordinatesA[0]},${coordinatesA[1]};${coordinatesB[0]},${coordinatesB[1]}?access_token=${mapboxgl.accessToken}`)
              .then(response => response.json())
              .then(data => {
                const distance = data.routes[0].distance / 1000; 
                const duration = data.routes[0].duration / 60;   
                document.getElementById('distance-result').innerHTML = `Mode: ${transportMode}, Distance: ${distance.toFixed(2)} km, Duration: ${duration.toFixed(2)} min`;

                const route = data.routes[0].geometry.coordinates;
                const geojson = {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: route
                  }
                };

                if (map.getSource('route')) {
                  map.getSource('route').setData(geojson);
                } else {
                  map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: {
                      type: 'geojson',
                      data: geojson
                    },
                    layout: {
                      'line-join': 'round',
                      'line-cap': 'round'
                    },
                    paint: {
                      'line-color': '#ff8c00',
                      'line-width': 4
                    }
                  });
                }
              })
              .catch(error => console.error('Error calculating distance:', error));
          })
          .catch(error => console.error('Error fetching location B:', error));
      })
      .catch(error => console.error('Error fetching location A:', error));
  }






