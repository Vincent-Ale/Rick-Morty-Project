async function fetchAllCharacters() {
    const allCharacters = [];

    // Loop to catch all characters
    for (let page = 1; page <= 42; page++) {
        const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`);
        const data = await response.json();
        allCharacters.push(...data.results);
    }

    return allCharacters;
}

async function displayCharacters(filter) {
    const charactersContainer = document.getElementById('characters-container');
    charactersContainer.innerHTML = ''; // Delete previous character

    const allCharacters = await fetchAllCharacters();

    let filteredCharacters = allCharacters;

    if (filter !== 'all') {
        filteredCharacters = allCharacters.filter(character => character.status.toLowerCase() === filter);
    }

    // Random table of characters
    filteredCharacters.sort(() => Math.random() - 0.5);

    // Select only 12 characters
    const charactersToShow = filteredCharacters.slice(0, 12);

    charactersToShow.forEach(character => {
        const characterDiv = document.createElement('div');
        characterDiv.classList.add('character');
        characterDiv.setAttribute('data-id', character.id); // Add unique id

        const nameElement = document.createElement('h3');
        nameElement.textContent = character.name;
        characterDiv.appendChild(nameElement);

        const imageElement = document.createElement('img');
        imageElement.src = character.image;
        imageElement.alt = character.name;
        characterDiv.appendChild(imageElement);

        const statusElement = document.createElement('p');
        statusElement.textContent = `Status: ${character.status}`;
        characterDiv.appendChild(statusElement);

        const speciesElement = document.createElement('p');
        speciesElement.textContent = `Species: ${character.species}`;
        characterDiv.appendChild(speciesElement);

        charactersContainer.appendChild(characterDiv);
    });
}

async function displayPopup(characterId) {
    const character = await fetch(`https://rickandmortyapi.com/api/character/${characterId}`);
    const characterData = await character.json();

    document.getElementById('popup-name').textContent = characterData.name;
    document.getElementById('popup-status').innerHTML = `<u>Status:</u> ${characterData.status}`;
    document.getElementById('popup-species').innerHTML = `<u>Species:</u> ${characterData.species}`;
    document.getElementById('popup-origin').innerHTML = `<u>Origin:</u> ${characterData.origin.name}`;
    document.getElementById('popup-location').innerHTML = `<u>Last Location:</u> ${characterData.location.name}`;

    const episodesList = document.getElementById('popup-episodes');
    episodesList.innerHTML = ''; // Clear previous episodes

    const episodePromises = characterData.episode.map(async (episodeURL, index) => {
    const episode = await fetch(episodeURL);
    const episodeData = await episode.json();
    return episodeData.id;
    });

    Promise.all(episodePromises)
    .then(episodes => {
        const joinedEpisodes = episodes.join(', ');
        episodesList.textContent = joinedEpisodes;
    })
    .catch(error => {
        console.error('Error fetching episodes:', error);
    });



    document.getElementById('popup').style.display = 'flex';
}

// Close popup when close button is clicked
document.getElementById('popup-close').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'none';
});

// Close popup when clicked outside of the popup
window.addEventListener('click', (event) => {
    const popup = document.getElementById('popup');
    if (event.target !== popup && !popup.contains(event.target)) {
        popup.style.display = 'none';
    }
});

document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', async () => {
        const filter = button.getAttribute('data-filter');
        await displayCharacters(filter);
    });
});

// On initial page load, show all characters
displayCharacters('all');

// Add click event to each character
document.getElementById('characters-container').addEventListener('click', (event) => {
    const characterDiv = event.target.closest('.character');
    if (characterDiv) {
        const characterId = characterDiv.getAttribute('data-id');
        displayPopup(characterId);
    }
});