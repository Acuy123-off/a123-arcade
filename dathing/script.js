document.addEventListener('DOMContentLoaded', () => {
  const gamesGrid = document.getElementById('gamesGrid');
  const gameFrame = document.getElementById('gameFrame');

  fetch('games.json')
    .then(res => res.json())
    .then(games => {
      if (gamesGrid) initCatalogPage(games);
      if (gameFrame) initPlayerPage(games);
    })
    .catch(err => {
      console.error('Gagal memuat games.json:', err);
      if (gamesGrid) {
        gamesGrid.innerHTML = '<div class="col-12"><p class="text-danger">Gagal memuat daftar game. Jalankan menggunakan Live Server atau GitHub Pages.</p></div>';
      }
    });
});

// Helper untuk mengubah array kategori menjadi teks rapi
function formatCategories(category) {
  return Array.isArray(category) ? category.join(', ') : category;
}

// ==========================================
// LOGIKA HALAMAN KATALOG (index.html)
// ==========================================
function initCatalogPage(allGames) {
  let currentCategory = 'All';
  const gamesGrid = document.getElementById('gamesGrid');
  const searchInput = document.getElementById('searchInput');
  const catButtons = document.querySelectorAll('.cat-btn');

  function renderGames() {
    const keyword = searchInput.value.toLowerCase();

    const filtered = allGames.filter(game => {
      const matchCat =
        currentCategory === 'All' ||
        (Array.isArray(game.category)
          ? game.category.includes(currentCategory)
          : game.category === currentCategory);

      const matchSearch = game.title.toLowerCase().includes(keyword);
      return matchCat && matchSearch;
    });

    gamesGrid.innerHTML = filtered.map(game => `
      <div class="col">
        <a href="play.html?id=${game.id}" class="card h-100 text-decoration-none text-white game-card">
          <img src="${game.thumbnail}" class="card-img-top" alt="${game.title}" loading="lazy" />
          <div class="card-body p-2 px-3">
            <h6 class="card-title fw-bold mb-0 text-truncate">${game.title}</h6>
            <small class="text-accent d-block text-truncate mb-1" style="font-size: 0.75rem;">
              By ${game.creator || 'Unknown'}
            </small>
            <small class="text-secondary d-block text-truncate" style="font-size: 0.75rem;">
              ${formatCategories(game.category)}
            </small>
          </div>
        </a>
      </div>
    `).join('');
  }

  searchInput.addEventListener('input', renderGames);

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => {
        b.classList.remove('btn-accent', 'active');
        b.classList.add('bg-surface', 'text-secondary');
      });
      btn.classList.remove('bg-surface', 'text-secondary');
      btn.classList.add('btn-accent', 'active');

      currentCategory = btn.dataset.cat;
      renderGames();
    });
  });

  renderGames();
}

// ==========================================
// LOGIKA HALAMAN PEMUTAR (play.html)
// ==========================================
function initPlayerPage(games) {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('id');

  const gameFrame = document.getElementById('gameFrame');
  const gameTitle = document.getElementById('gameTitle');
  const gameCreator = document.getElementById('gameCreator');
  const gameCategory = document.getElementById('gameCategory');
  const gameGuide = document.getElementById('gameGuide');
  const nextGamesGrid = document.getElementById('nextGamesGrid');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const gameContainer = document.getElementById('gameContainer');

  const activeGame = games.find(g => g.id === gameId) || games[0];

  if (activeGame) {
    document.title = `${activeGame.title} - A123ARCADE`;
    gameTitle.textContent = activeGame.title;
    gameCreator.textContent = activeGame.creator || 'Unknown';
    gameCategory.textContent = formatCategories(activeGame.category);
    gameFrame.src = activeGame.embedUrl;

    // Render Guide / Cara Bermain
    if (Array.isArray(activeGame.guide)) {
      gameGuide.innerHTML = activeGame.guide.map(step => `<li>${step}</li>`).join('');
    } else if (activeGame.guide) {
      gameGuide.innerHTML = `<li>${activeGame.guide}</li>`;
    } else {
      gameGuide.innerHTML = '<li>Tidak ada instruksi khusus untuk game ini.</li>';
    }
  }

  const otherGames = games.filter(g => g.id !== activeGame.id);
  nextGamesGrid.innerHTML = otherGames.map(game => `
    <div class="col">
      <a href="play.html?id=${game.id}" class="card text-decoration-none text-white game-card next-card">
        <img src="${game.thumbnail}" class="card-img-top" alt="${game.title}" loading="lazy" />
        <div class="card-body p-2">
          <p class="card-text small fw-semibold text-truncate mb-0">${game.title}</p>
        </div>
      </a>
    </div>
  `).join('');

  fullscreenBtn.addEventListener('click', () => {
    if (gameContainer.requestFullscreen) {
      gameContainer.requestFullscreen();
    } else if (gameContainer.webkitRequestFullscreen) {
      gameContainer.webkitRequestFullscreen();
    }
  });
}