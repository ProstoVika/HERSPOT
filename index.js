
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

