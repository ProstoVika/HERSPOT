
const inputField = document.getElementById('searchBar__text');
const suggestionsList = document.getElementById('suggestions');

const toggleSuggestions = () => {
    if (suggestionsList.style.display === 'none' || suggestionsList.style.display === '') {
        suggestionsList.style.display = 'block';
        suggestionsList.classList.add('fade-in'); // Ensure animation is applied
    } else {
        suggestionsList.style.display = 'none';
        suggestionsList.classList.remove('fade-in'); // Remove animation when hidden
    }
};


inputField.addEventListener('dblclick', toggleSuggestions);

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchBar__text');
    const filter = document.getElementById('filter');
    const suggestionsList = document.getElementById('suggestions');
    let resdata = [];
    let filteredData = [];

    const loadData = async () => {
        try {
            const response = await fetch('data.json');
            resdata = await response.json();
            filteredData = resdata;
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const updateUi = (data) => {
        suggestionsList.innerHTML = "";
        if (data.length === 0) {
            suggestionsList.innerHTML = "<li>No results found...</li>";
            suggestionsList.style.display = 'none';
            return;
        }

        data.forEach(item => {
            let li = document.createElement('li');
            li.innerHTML = `<strong>${item.location_name}</strong> - ${item.rating} (${item.rated_by})<br><em>${item.comment}</em>`;
            li.style.color = item.rating === "Bad" ? "red" : "green";
            suggestionsList.appendChild(li);
        });

        suggestionsList.style.display = 'block';
    };

    const applySearch = () => {
        let query = searchInput.value.trim().toLowerCase();
        filteredData = resdata.filter(item => item.location_name.toLowerCase().includes(query));
        applyFilter();
    };

    const applyFilter = () => {
        let filterValue = filter.value;
        let finalData = filteredData;

        if (filterValue !== "all") {
            finalData = filteredData.filter(item => item.rating.toLowerCase() === filterValue.toLowerCase());
        }

        updateUi(finalData);
    };

    searchInput.addEventListener('keyup', applySearch);

    filter.addEventListener('change', applyFilter);

    await loadData();
});

let map, infoWindow;

function initMap() {
  // Initialize the map but don't set a center until we get the user's location
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6, // Set an initial zoom level
  });
  infoWindow = new google.maps.InfoWindow();

  // Use the geolocation API to get the user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Now that we have the user's location, set the map center
        map.setCenter(pos);
        map.setZoom(15); // Optional: zoom in closer to the location

        // Add a marker at the user's location
        const centralmarker = new google.maps.Marker({
          position: pos,
          map: map,
          title: "You are here!",
          icon: {
              url: './her-spot.png',  // Use a custom image URL
              scaledSize: new google.maps.Size(50, 50),  // Set the size here (width, height)
            }
        });

        locations.forEach((location) => {
          const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.location_name,
            icon: {
              url: location.rating == "bad" ? './danger-marker.png' : './safe-marker.png',  // Use a custom image URL
              scaledSize: new google.maps.Size(100, 100),  // Set the size here (width, height)
            }
          });

          // Add an info window for each marker
          marker.addListener("click", () => {
            infoWindow.setContent(`
              <div style="font-size: 40px; min-height: 10vh; min-width: 40vw; text-align: center">
                <div style="font-weight: bold; color: ${location.rating === "bad" ? 'red' : 'green'}">${location.location_name}</div>
                <div>${location.comment}</div>
              </div>`);
            infoWindow.open(map, marker);
          });
        });
      },
      () => {
        // Handle error if geolocation fails
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Handle the case if geolocation is not supported
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

// Function to handle geolocation errors
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

window.initMap = initMap;
