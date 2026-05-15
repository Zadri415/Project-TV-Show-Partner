// ----- DOM elements
const searchInput = document.getElementById("search-input");
const searchCount = document.getElementById("search-count");
const showSelect = document.getElementById("show-select");
const episodeSelect = document.getElementById("episode-select");
const statusMessage = document.getElementById("status-message");
const homeLink = document.getElementById("home-link");
const allEpisodes = document.getElementById("episodes");
const allShows = document.getElementById("shows");
const showSelectContainer = document.getElementById("show-select-container");
const episodeSelectContainer = document.getElementById(
  "episode-select-container",
);

// ----- state and cache
const state = {
  shows: [],
  episodes: [],
  episodeCache: {},
  searchTerm: "",
};

// -----setup function
function setup() {
  fetchTvShows()
    .then(function (tvShows) {
      statusMessage.textContent = "";
      // sort shows alphabetically, case-insensitive
      state.shows = tvShows.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
      populateShowSelect(state.shows);
      return makePageForShows(state.shows);
    })
    .catch(function (error) {
      // Requirement 5: Handle errors for the user
      statusMessage.textContent =
        "Failed to load episodes. Please try again later.";
      console.error(error);
    });
}

// ================================== DROPDOWNS ==================================

// ----- show select dropdown
function populateShowSelect(shows) {
  showSelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a show...";
  showSelect.appendChild(defaultOption);

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

// ----- episode select Dropdown
function populateEpisodeSelect(episodes) {
  // episodes: array of episode objects for the currently selected show
  const select = episodeSelect;
  // default option to show all
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Show all episodes";
  select.appendChild(defaultOption);

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${createEpisodeCode(episode)} - ${episode.name}`;
    select.appendChild(option);
  });
}

// ================================== EVENT LISTENERS==================================

// ----- event listener search show and episode
searchInput.addEventListener("input", function () {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const isViewingEpisodes = episodeSelectContainer.style.display === "block";

  if (isViewingEpisodes) {
    const filteredEpisodes = state.episodes.filter(function (episode) {
      const name = (episode.name || "").toLowerCase();
      const summary = (episode.summary || "").toLowerCase();
      return name.includes(searchTerm) || summary.includes(searchTerm);
    });

    makePageForEpisodes(filteredEpisodes);
    searchCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
  } else {
    const filteredShows = state.shows.filter(function (show) {
      const name = (show.name || "").toLowerCase();
      const summary = (show.summary || "").toLowerCase();
      const genres = show.genres.join(" ").toLowerCase();

      return (
        name.includes(searchTerm) ||
        summary.includes(searchTerm) ||
        genres.includes(searchTerm)
      );
    });

    makePageForShows(filteredShows);
    searchCount.textContent = `Displaying ${filteredShows.length} / ${state.shows.length} shows`;
  }
});

// ----- event listener episode dropdown
episodeSelect.addEventListener("change", (event) => {
  const targetId = `ep-${event.target.value}`;
  // if user chose the empty option, show all episodes for the current show
  if (!event.target.value) {
    makePageForEpisodes(state.episodes);
    return;
  }

  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

// ----- event listener show dropdown
showSelect.addEventListener("change", function (e) {
  const showId = e.target.value;
  if (!showId) return;
  loadEpisodesForShow(showId);
  allShows.innerHTML = "";
});

// ----- event listener hyperlink home
homeLink.addEventListener("click", function (event) {
  event.preventDefault();
  searchInput.value = "";
  makePageForShows(state.shows);
});

// ==================================== EPISODES ====================================

// ----- setup for episodes
function makePageForEpisodes(episodeList) {
  episodeSelectContainer.style.display = "block";
  episodeSelect.innerHTML = "";
  document.getElementById("episodes").innerHTML = "";
  document.getElementById("shows").innerHTML = "";
  populateEpisodeSelect(episodeList);
  showAllEpisodes(episodeList);
  searchCount.textContent = `Displaying ${episodeList.length} / ${state.episodes.length} episodes`;
  homeLink.textContent = "<<< Return to Title Page of Shows";
}
// ----- appends episodes
function showAllEpisodes(episodes) {
  const episodeCards = episodes.map(createEpisodeCard);
  document.getElementById("episodes").append(...episodeCards);
}
// ----- creates episode cards
function createEpisodeCard(episode) {
  const episodeCode = createEpisodeCode(episode);
  const episodeCard = document
    .getElementById("episode-card-template")
    .content.cloneNode(true);

  const section = episodeCard.querySelector("section");
  section.id = `ep-${episode.id}`;

  const img = episodeCard.querySelector("img");
  if (episode.image && episode.image.medium) {
    img.src = episode.image.medium;
  } else {
    img.remove();
  }

  episodeCard.querySelector("h3").textContent =
    `${episodeCode} - ${episode.name}`;
  episodeCard.querySelector("p").innerHTML =
    episode.summary || "<em>No summary available.</em>";

  return episodeCard;
}

// ----- creates episode code e.g. S01E05
function createEpisodeCode(episode) {
  const seasonNum = String(episode.season);
  const episodeNum = String(episode.number);
  return `S${seasonNum.padStart(2, 0)}E${episodeNum.padStart(2, 0)}`;
}

// -- gets from cache or fetches episodes for show
function loadEpisodesForShow(showId) {
  const showName = state.shows.find((show) => show.id === Number(showId)).name;
  // do not fetch if cached
  if (state.episodeCache[showId]) {
    state.episodes = state.episodeCache[showId];
    console.log(`got ${showName} episodes from cache`);
    makePageForEpisodes(state.episodes);
    return Promise.resolve(state.episodes);
  }

  statusMessage.textContent = "Loading episodes...";
  const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch episodes: ${res.status}`);
      return res.json();
    })
    .then((episodes) => {
      console.log(`fetched ${showName} episodes from tvMaze`);
      state.episodeCache[showId] = episodes;
      state.episodes = episodes;
      makePageForEpisodes(episodes);
      statusMessage.textContent = "";
      return episodes;
    })
    .catch((err) => {
      console.error(err);
      statusMessage.textContent = "Failed to load episodes for that show.";
    });
}

// ==================================== SHOWS ====================================

// ----- setup for shows
function makePageForShows(showList) {
  allEpisodes.innerHTML = "";
  episodeSelectContainer.style.display = "none";
  homeLink.textContent = "";
  showSelect.innerHTML = "";
  document.getElementById("shows").innerHTML = "";
  populateShowSelect(showList);
  showAllShows(showList);
  searchCount.textContent = `Displaying ${showList.length} / ${state.shows.length} shows`;
}
// ----- appends shows
function showAllShows(shows) {
  const showCards = shows.map(createShowCard);
  document.getElementById("shows").append(...showCards);
}

// ----- creates show cards
function createShowCard(show) {
  const showCard = document
    .getElementById("show-card-template")
    .content.cloneNode(true);

  const section = showCard.querySelector("section");
  section.id = `ep-${show.id}`;

  const img = showCard.querySelector("img");
  if (show.image && show.image.medium) {
    img.src = show.image.medium;
  } else {
    img.remove();
  }

  showCard.querySelector("a").textContent = `${show.name}`;
  showCard.querySelector("p[summary]").innerHTML =
    `${show.summary || "<em>Unavailable.</em>"}`;
  showCard.querySelector("p[genres]").innerHTML =
    `<b>Genres:</b> ${show.genres.join(" - ") || "Unavailable."}`;
  showCard.querySelector("p[status]").innerHTML =
    `<b>Status:</b> ${show.status || "Unavailable."}`;
  showCard.querySelector("p[rating]").innerHTML =
    `<b>Rating:</b> ${show.rating.average || "Unavailable."}`;
  showCard.querySelector("p[runtime]").innerHTML =
    `<b>Runtime:</b> ${show.runtime || "Unavailable."}`;

  // ----- event listener hyperlink show
  showCard.querySelector("a").addEventListener("click", function (event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    searchInput.value = "";
    loadEpisodesForShow(show.id);
  });

  return showCard;
}

// ----- fetches shows
function fetchTvShows() {
  const tvShowURL = "https://api.tvmaze.com/shows";
  return fetch(tvShowURL).then(function (data) {
    console.log("fetched shows from tvMaze");
    return data.json();
  });
}

// ==================================== PAGE LOAD ====================================

// wire show select change after DOM load
window.onload = function () {
  setup();
};
