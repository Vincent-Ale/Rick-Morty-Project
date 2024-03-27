// Global variable to store character data once fetched
let allCharactersData = [];

// Function to fetch all characters from the API
async function fetchAllCharacters() {
    try {
        // Check if characters have already been fetched
        if (allCharactersData.length === 0) {
            const response = await fetch('https://rickandmortyapi.com/api/character');
            const data = await response.json();
            const totalPages = data.info.pages;

            // Fetch all pages concurrently
            const pageRequests = [];
            for (let page = 1; page <= totalPages; page++) {
                pageRequests.push(fetch(`https://rickandmortyapi.com/api/character?page=${page}`));
            }
            const responses = await Promise.all(pageRequests);

            // Aggregate data from all pages
            allCharactersData = [];
            for (const response of responses) {
                const pageData = await response.json();
                allCharactersData.push(...pageData.results);
            }
        }

        return allCharactersData;
    } catch (error) {
        console.error('Error fetching characters:', error);
        return [];
    }
}

// Function to display characters based on filter
async function displayCharacters(filter) {
    const charactersContainer = document.getElementById('characters-container'); // Get the container where characters will be displayed
    charactersContainer.innerHTML = ''; // Clear previous characters from the container

    const allCharacters = await fetchAllCharacters();// Fetch all characters
    let filteredCharacters = allCharacters; // Set filtered characters to all characters initially

    if (filter !== 'all') { // Apply filter if specified
        filteredCharacters = allCharacters.filter(character => character.status.toLowerCase() === filter); // Filter characters based on status
    }

    // Shuffle characters randomly
    filteredCharacters.sort(() => Math.random() - 0.5);

    // Select only 12 characters to display
    const charactersToShow = filteredCharacters.slice(0, 12);

    // Display characters in the UI
    charactersToShow.forEach(character => {
        // Create a container for each character
        const characterDiv = document.createElement('div');
        characterDiv.classList.add('character');
        characterDiv.setAttribute('data-id', character.id); // Add unique id

        // Create element for character name and append it to the container
        const nameElement = document.createElement('h3');
        nameElement.textContent = character.name;
        characterDiv.appendChild(nameElement);

        // Create element for character image and append it to the container
        const imageElement = document.createElement('img');
        imageElement.src = character.image;
        imageElement.alt = character.name;
        characterDiv.appendChild(imageElement);

        // Create element for character status and append it to the container
        const statusElement = document.createElement('p');
        statusElement.textContent = `Status: ${character.status}`;
        characterDiv.appendChild(statusElement);

        // Create element for character species and append it to the container
        const speciesElement = document.createElement('p');
        speciesElement.textContent = `Species: ${character.species}`;
        characterDiv.appendChild(speciesElement);

        // Append the character container to the characters container in the UI
        charactersContainer.appendChild(characterDiv);
    });
}

// Function to display popup with character details
async function displayPopup(characterId) {
    try {
        // Fetch details of the character with the provided ID
        const character = await fetch(`https://rickandmortyapi.com/api/character/${characterId}`);
        const characterData = await character.json();

        // Populate popup with character details
        document.getElementById('popup-name').textContent = characterData.name;
        document.getElementById('popup-image').src = characterData.image;
        document.getElementById('popup-status').innerHTML = `<u>Status:</u> ${characterData.status}`;
        document.getElementById('popup-species').innerHTML = `<u>Species:</u> ${characterData.species}`;
        document.getElementById('popup-origin').innerHTML = `<u>Origin:</u> ${characterData.origin.name}`;
        document.getElementById('popup-location').innerHTML = `<u>Last Location:</u> ${characterData.location.name}`;

        // Fetch and display episode list
        const episodesList = document.getElementById('popup-episodes');
        episodesList.innerHTML = ''; // Clear previous episodes
        const episodePromises = characterData.episode.map(async (episodeURL, index) => {
            // Fetch details of each episode
            const episode = await fetch(episodeURL);
            const episodeData = await episode.json();
            return episodeData.id;
        });

        // Populate episode list
        Promise.all(episodePromises)
            .then(episodes => {
                const joinedEpisodes = episodes.join(', ');
                episodesList.textContent = joinedEpisodes;
            })
            .catch(error => {
                console.error('Error fetching episodes:', error);
            });

        document.getElementById('popup').style.display = 'flex'; // Display the popup
    } catch (error) {
        console.error('Error displaying popup:', error);
    }
}

// Close popup when close button is clicked
document.getElementById('popup-close').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'none';
});

// Close popup when clicked outside of the popup
window.addEventListener('click', (event) => {
    const popup = document.getElementById('popup');

    if (event.target !== popup && !popup.contains(event.target)) { // Check if the click event occurred outside of the popup
        popup.style.display = 'none';// Hide the popup
    }
});

// Add click event to filter buttons
document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', async () => {
        const filter = button.getAttribute('data-filter'); // Get the filter value from the button's data attribute
        await displayCharacters(filter); // Display characters based on the selected filter
    });
});

// Initially display all characters
displayCharacters('all');

// Add click event to each character for displaying popup
document.getElementById('characters-container').addEventListener('click', (event) => {
    const characterDiv = event.target.closest('.character'); // Find the closest ancestor element with the class 'character'

    if (characterDiv) { // If a character element is clicked
        const characterId = characterDiv.getAttribute('data-id'); // Get the ID of the clicked character
        displayPopup(characterId);// Display popup with details of the clicked character
    }
});
