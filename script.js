// Clean, conflict-free script
const searchInput = document.getElementById("search-input");
const searchCount = document.getElementById("search-count");
const episodeSelector = document.getElementById("episode-selector");
let allEpisodes = [];

function setup() {
  allEpisodes = getAllEpisodes();
  createDropdownOptions(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  const container = document.getElementById("episodes");
  container.innerHTML = "";
  if (!episodeList || episodeList.length === 0) return;

  const episodeCards = episodeList.map(createEpisodeCard);
  container.append(...episodeCards);
}

function createEpisodeCard(episode) {
  const episodeCode = createEpisodeCode(episode);
  const episodeCard = document
    .getElementById("episode-card-template")
    .content.cloneNode(true);

  const section = episodeCard.querySelector("section");
  section.id = `ep-${episode.id}`;

  const img = episodeCard.querySelector("img");
  if (episode.image && episode.image.medium) img.src = episode.image.medium;
  img.alt = episode.name || "Episode image";

  episodeCard.querySelector("h3").textContent = `${episodeCode} - ${episode.name}`;
  episodeCard.querySelector("p").textContent = episode.summary || "";

  return episodeCard;
}

function createEpisodeCode(episode) {
  const seasonNum = String(episode.season);
  const episodeNum = String(episode.number);
  return `S${seasonNum.padStart(2, 0)}E${episodeNum.padStart(2, 0)}`;
}

function createDropdownOptions(episodes) {
  if (!episodeSelector) return;
  episodeSelector.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All episodes";
  episodeSelector.appendChild(allOption);

  episodes.forEach((ep) => {
    const opt = document.createElement("option");
    opt.value = String(ep.id);
    opt.textContent = `${createEpisodeCode(ep)} - ${ep.name}`;
    episodeSelector.appendChild(opt);
  });

  episodeSelector.addEventListener("change", function (e) {
    const val = e.target.value;
    if (!val) {
      makePageForEpisodes(allEpisodes);
      if (searchCount) searchCount.textContent = `Displaying ${allEpisodes.length} / ${allEpisodes.length} episodes`;
      return;
    }

    const selected = allEpisodes.find((a) => String(a.id) === String(val));
    if (!selected) return;

    makePageForEpisodes([selected]);

    const el = document.getElementById(`ep-${selected.id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (searchCount) searchCount.textContent = `Displaying 1 / ${allEpisodes.length} episodes`;
  });
}

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(function (episode) {
      return (
        (episode.name || "").toLowerCase().includes(searchTerm) ||
        (episode.summary || "").toLowerCase().includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);

    if (searchCount) searchCount.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
  });
}

window.onload = setup;
  });
}

window.onload = setup;

//You can edit ALL of the code here
const searchInput = document.getElementById("search-input");
const searchCount = document.getElementById("search-count");
const episodeSelector = document.getElementById("episode-selector");
let allEpisodes = [];

function setup() {
  allEpisodes = getAllEpisodes();
  createDropdownOptions(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  const container = document.getElementById("episodes");
  container.innerHTML = "";
  if (!episodeList || episodeList.length === 0) return;

  const episodeCards = episodeList.map(createEpisodeCard);
  container.append(...episodeCards);
}

function showAllEpisodes(allEpisodes) {
  const episodeCards = allEpisodes.map(createEpisodeCard);
  document.getElementById("episodes").append(...episodeCards);
}

function createEpisodeCard(episode) {
  const episodeCode = createEpisodeCode(episode);
  const episodeCard = document
    .getElementById("episode-card-template")
    .content.cloneNode(true);

  const section = episodeCard.querySelector("section");
  section.id = `ep-${episode.id}`;

  episodeCard.querySelector("img").src = episode.image.medium;
  episodeCard.querySelector("h3").textContent =
    `${episodeCode} - ${episode.name}`;
  episodeCard.querySelector("p").textContent = episode.summary;

  return episodeCard;
}

function createEpisodeCode(episode) {
  const seasonNum = String(episode.season);
  const episodeNum = String(episode.number);
  return `S${seasonNum.padStart(2, 0)}E${episodeNum.padStart(2, 0)}`;
}

function createDropdownOptions(episodes) {
  if (!episodeSelector) return;
  episodeSelector.innerHTML = "";

  // Add a default option to show all episodes
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All episodes";
  episodeSelector.appendChild(allOption);

  episodes.forEach((ep) => {
    const opt = document.createElement("option");
    opt.value = String(ep.id);
    opt.textContent = `${createEpisodeCode(ep)} - ${ep.name}`;
    episodeSelector.appendChild(opt);
  });

  // When the user selects an episode, either show just that episode (bonus)
  // or show all episodes again when the default option is selected.
  episodeSelector.addEventListener("change", function (e) {
    const val = e.target.value;
    if (!val) {
      // show all
      makePageForEpisodes(allEpisodes);
      // keep search count in sync
      searchCount.textContent = `Displaying ${allEpisodes.length} / ${allEpisodes.length} episodes`;
      return;
    }

    const selected = allEpisodes.find((a) => String(a.id) === String(val));
    if (!selected) return;

    // Bonus behavior: show only the selected episode
    makePageForEpisodes([selected]);

    // Scroll the selected episode into view (the element id is set in createEpisodeCard)
    const el = document.getElementById(`ep-${selected.id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    searchCount.textContent = `Displaying 1 / ${allEpisodes.length} episodes`;
  });
}

searchInput.addEventListener("input", function () {
  const searchTerm = searchInput.value.toLowerCase();

  const filteredEpisodes = allEpisodes.filter(function (episode) {
    return (
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
    );
  });

  makePageForEpisodes(filteredEpisodes);

  searchCount.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
});

window.onload = setup;

/*


   4. The medium-sized image for the episode
   5. The summary text of the episode

  */
//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

window.onload = setup;
