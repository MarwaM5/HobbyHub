/* Category template: the URL query (?c=creative) selects which category to display. */
const categoryContent = {
  creative: {
    description: "Make room for imagination. Try something with your hands, find your style, and let small ideas become something wonderful.",
    artTitle: "Make<br>something<br><em>you love.</em>", artEmoji: "🎨", artNoteIcon: "🖌️", artNoteTitle: "Make time to make", collection: "The creative collection",
    intro: "From first sketches to handmade treasures, creative hobbies give your ideas a place to land.",
  },
  musicDance: {
    description: "Find your rhythm, learn a melody or move to the beat. There’s more than one way to make music part of your life.",
    artTitle: "Find your<br>own <em>rhythm.</em>", artEmoji: "🎸", artNoteIcon: "🎵", artNoteTitle: "Follow the feeling", collection: "The music & movement collection",
    intro: "Whether you love the sound of strings or the energy of a dance floor, start with what moves you.",
  },
  outdoorAdventure: {
    description: "Trade the usual view for a new horizon. Find fresh air, small adventures and new ways to explore the world around you.",
    artTitle: "A little<br>closer to <em>wild.</em>", artEmoji: "🥾", artNoteIcon: "🌿", artNoteTitle: "Step outside", collection: "The outdoor & adventure collection",
    intro: "From easy rides to bigger adventures, there’s a way to explore that fits your pace.",
  },
  sportsFitness: {
    description: "Move in a way that feels good to you. Build a skill, find your pace and celebrate progress one session at a time.",
    artTitle: "Move your<br>way. Feel <em>good.</em>", artEmoji: "⚽", artNoteIcon: "🏃", artNoteTitle: "Progress over perfect", collection: "The sports & fitness collection",
    intro: "Find an activity that brings you energy, whether you love friendly competition or moving just for you.",
  },
  foodHome: {
    description: "Make everyday moments a little more delicious and green. Learn a recipe, try a new brew or grow something of your own.",
    artTitle: "Make life<br>a little more <em>lovely.</em>", artEmoji: "🍓", artNoteIcon: "🌱", artNoteTitle: "Good things grow", collection: "The food & home collection",
    intro: "Find joy in small rituals, homemade favourites and the satisfaction of making something yourself.",
  },
  gamesMind: {
    description: "Slow down, think sideways or get everyone around the table. Explore hobbies that keep your mind curious and your time well spent.",
    artTitle: "Play a little.<br>Think a little <em>more.</em>", artEmoji: "♟️", artNoteIcon: "💡", artNoteTitle: "Stay curious", collection: "The games & mind collection",
    intro: "From quiet reading time to friendly strategy, choose the kind of mental reset you’re craving.",
  }
};

const hobbyVisuals = {
  drawing: ["✏️", "Sketch & shade", "peach"], calligraphy: ["✒️", "Letters with flow", "lavender"], photography: ["📷", "Catch the light", "blue"], pottery: ["🏺", "Shape something", "green"], crochet: ["🧶", "Loop by loop", "pink"], tatreez: ["🪡", "Stitch a story", "yellow"], accessoriesHandicrafts: ["🪡", "Make it yours", "peach"],
  guitar: ["🎸", "Find your sound", "peach"], oud: ["🪕", "Strings & stories", "yellow"], singing: ["🎤", "Use your voice", "pink"], piano: ["🎹", "Keys to explore", "blue"], dabke: ["🕺", "Move together", "green"], modernDance: ["💃", "Move your way", "lavender"],
  hiking: ["🥾", "Take the trail", "green"], camping: ["⛺", "Sleep under stars", "yellow"], snorkeling: ["🤿", "Look beneath", "blue"], windsurfing: ["🏄", "Catch the wind", "peach"], cycling: ["🚲", "Find a new route", "lavender"],
  football: ["⚽", "Play together", "green"], running: ["👟", "Find your pace", "peach"], swimming: ["🏊", "Make a splash", "blue"], tennis: ["🎾", "Serve & rally", "yellow"], padel: ["🏓", "Try the rally", "lavender"],
  cooking: ["🍳", "Make something tasty", "peach"], bakingDesserts: ["🥐", "A little sweetness", "pink"], homeGardening: ["🪴", "Grow something", "green"], coffeeBrewing: ["☕", "Brew your ritual", "yellow"],
  chess: ["♟️", "Think ahead", "lavender"], tawleh: ["🎲", "Luck meets strategy", "peach"], reading: ["📚", "Get lost in a story", "blue"], groupBoardGames: ["🎲", "Game night awaits", "green"]
};

const categoryDescriptions = {
  creative: "Creative", musicDance: "Music & Dance", outdoorAdventure: "Outdoor & Adventure", sportsFitness: "Sports & Fitness", foodHome: "Food & Home", gamesMind: "Games & Mind"
};

function categoryTags(id, categoryId) {
  const tags = {
    creative: ["Indoor", "Solo", "Low cost"], musicDance: ["Indoor / Outdoor", "Solo or group", "Any level"], outdoorAdventure: ["Outdoor", "Solo or group", "Explore"], sportsFitness: ["Active", "Solo or group", "All levels"], foodHome: ["At home", "Relaxed", "Hands-on"], gamesMind: ["Indoor", "Calm or social", "Curious minds"]
  };
  return tags[categoryId] || ["Try something new", "Your own pace"];
}

function renderHobbyCard(hobby, index, categoryId) {
  const visual = hobbyVisuals[hobby.id] || ["✦", "A new interest", "peach"];
  const tags = categoryTags(hobby.id, categoryId);
  return `<div class="col-12 col-sm-6 col-xl-4 reveal" style="--delay:${(index % 3) * 70}ms"><article class="hobbyCard hobbyTone-${visual[2]}">
    <div class="hobbyCardTop"><span class="hobbyIcon" aria-hidden="true">${visual[0]}</span><span class="hobbyIndex">${String(index + 1).padStart(2, "0")}</span></div>
    <h3>${escapeHtml(hobby.name)}</h3><p class="hobbyCardDescription">${escapeHtml(visual[1])}</p>
    <div class="hobbyTags">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
    <div class="hobbyCardActions"><a class="hobbyActionPrimary" href="${buildUrl("classes", "?hobby=" + encodeURIComponent(hobby.id))}" aria-label="See classes for ${escapeHtml(hobby.name)}">See classes <span aria-hidden="true">↗</span></a><a class="hobbyActionSecondary" href="${buildUrl("groups")}" aria-label="Explore communities for ${escapeHtml(hobby.name)}">Community <span aria-hidden="true">→</span></a></div>
  </article></div>`;
}


async function initCategoryPage() {
  mountSharedUi({ active: null });
  const requestedId = new URLSearchParams(window.location.search).get("c") || "creative";
  const allCategories = await getCategories();
  const category = allCategories.find(item => item.id === requestedId) || allCategories[0];
  const content = categoryContent[category.id] || categoryContent.creative;
  const page = document.getElementById("categoryPage");
  page.dataset.category = category.id;
  document.title = `${category.name} Hobbies | HobbyHub`;
  document.getElementById("categoryTitle").innerHTML = `${escapeHtml(category.name)} <span class="titleSpark" aria-hidden="true">✳</span>`;
  document.getElementById("categoryDescription").textContent = content.description;
  document.getElementById("hobbyCount").textContent = category.hobbies.length;
  document.getElementById("artTitle").innerHTML = content.artTitle;
  document.getElementById("artEmoji").textContent = content.artEmoji;
  document.getElementById("artNoteIcon").textContent = content.artNoteIcon;
  document.getElementById("artNoteTitle").textContent = content.artNoteTitle;
  document.getElementById("collectionBadge").textContent = content.collection;
  document.querySelector(".categorySectionHeader .hhSectionSub").textContent = content.intro;
  document.getElementById("hobbyGrid").innerHTML = category.hobbies.map((hobby, index) => renderHobbyCard(hobby, index, category.id)).join("");
  // Reuse the exact tint assigned to this category on the Home page.
  const categoryPalette = {
    pink: { accent: "#ED7052", tint: "#FBE3DA" },
    orange: { accent: "#F6A15A", tint: "#FCE9D9" },
    green: { accent: "#7DA477", tint: "#E6EEE2" }
  };
  const palette = categoryPalette[category.tint] || categoryPalette.pink;
  document.querySelector(".categoryHero").style.setProperty("--category-accent", palette.accent);
  document.querySelector(".categoryHero").style.setProperty("--category-tint", palette.tint);
  page.dataset.categoryTint = category.tint || "pink";
  initReveal();
  applyRoutes(document);
}

document.addEventListener("DOMContentLoaded", initCategoryPage);
