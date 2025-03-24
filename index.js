
const inputField = document.getElementById('searchBar__text');
const suggestionsList = document.getElementById('suggestions');
let filteredData = [];
let marker = [];
let map, infoWindow;

let testData = [ 
  { "location_name": "Rose Alley", "lat": 51.517248, "long":  -0.079060, "rating": "Bad", "rated_by": "Anonymous Weasel", "comment": "This place made me feel really safe" },
  { "location_name": "Brillo", "lat": 51.51672766397006, "long":  -0.07672969332724565, "rating": "Good", "rated_by": "Sneaky Fox", "comment": "This place made me feel really safe" },
  { "location_name": "Royal Festival Hall, South Bank", "lat": 51.5159371078966, "long":  -0.07768248959984869, "rating": "Bad", "rated_by": "Lonely Capybara", "comment": "AVOID! I was harrassed by a man in a red coat, I would never walk here again" },
  { "location_name": "Katsute 100, Islington", "lat": 51.515758175272325, "long":  -0.08072948465124012, "rating": "Bad", "rated_by": "Inquisitive Mouse", "comment": "I walked past this place between 10pm-12am and I felt very unsafe, I was harrased by men lurking on the corner" },
  { "location_name": "Hayward Gallery, Waterloo", "lat": 51.51475574293641, "long":  -0.0808086022584772, "rating": "Good", "rated_by": "Short Giraffe", "comment": "This place made me feel really safe" },
  { "location_name": "Theatre Deli", "lat": 51.513636091947674, "long":  -0.08075880426188974, "rating": "Bad", "rated_by": "Speedy Lizard", "comment": "Please watch out when you walk down the alley in the evenings" }
]
 
function initMap() {
  // Initialize the map but don't set a center until we get the user's location
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16, // Set an initial zoom level
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

        // Add a marker at the user's location
        const centralmarker = new google.maps.Marker({
          position: pos,
          map: map,
          icon: {
              url: './her-spot.png',  // Use a custom image URL
              scaledSize: new google.maps.Size(50, 50),  // Set the size here (width, height)
            }
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
  console.log("pos", pos)
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

window.initMap = initMap;

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

    const loadData = async () => {
        try {
            const response = await fetch('data.json');
            resdata = await response.json();
            filteredData = resdata;
            console.log(filteredData);
            console.log(resdata);
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
    console.log(filteredData)
    testData.forEach((location) => {
      marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.long },
        map: map,
        title: location.location_name,
        icon: {
          url: location.rating == "Bad" ? './danger-marker.png' : './safe-marker.png',  // Use a custom image URL
          scaledSize: new google.maps.Size(100, 100),  // Set the size here (width, height)
        }
      });
      console.log(marker)

      // Add an info window for each marker
      marker.addListener("click", () => {
        infoWindow.setContent(`
          <div style="font-size: 20px; min-height: 100px; min-width: 100px; text-align: center">
            <div style="font-weight: bold; color: ${location.rating === "bad" ? 'red' : 'green'}">${location.location_name}</div>
            <div style="color: black; text-wrap: wrap; height: 90%">${location.comment}</div>
          </div>`);
        infoWindow.open(map, marker);
      });
    });
});