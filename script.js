async function fetchAllCharacters() {
    const allCharacters = [];

    // Boucle pour récupérer chaque page de personnages
    for (let page = 1; page <= 42; page++) {
        const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`);
        const data = await response.json();
        allCharacters.push(...data.results);
    }

    return allCharacters;
}

async function displayCharacters(filter) {
    const charactersContainer = document.getElementById('characters-container');
    charactersContainer.innerHTML = ''; // Effacer les personnages précédents

    const allCharacters = await fetchAllCharacters();

    let filteredCharacters = allCharacters;

    if (filter !== 'all') {
        filteredCharacters = allCharacters.filter(character => character.status.toLowerCase() === filter);
    }

    // Mélanger le tableau de personnages
    filteredCharacters.sort(() => Math.random() - 0.5);

    // Sélectionner uniquement les 12 premiers personnages
    const charactersToShow = filteredCharacters.slice(0, 12);

    charactersToShow.forEach(character => {
        const characterDiv = document.createElement('div');
        characterDiv.classList.add('character');

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

document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', async () => {
        const filter = button.getAttribute('data-filter');
        await displayCharacters(filter);
    });
});

// Au chargement initial de la page, afficher tous les personnages
displayCharacters('all');