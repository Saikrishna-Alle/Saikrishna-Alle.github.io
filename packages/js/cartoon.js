/* Cartoon Page Logic with JSON Data Fetching */

document.addEventListener('DOMContentLoaded', () => {
    const seriesJsonUrl = './packages/data/series.json';

    // DOM Elements
    const heroTitle = document.getElementById('hero-title');
    const heroDesc = document.getElementById('hero-desc');
    const seasonSelector = document.getElementById('season-selector');
    const seasonOptions = document.getElementById('season-options');
    const currentSeasonText = document.getElementById('current-season');
    const episodesList = document.getElementById('episodes-list');

    // Create Popup Element
    const popup = document.createElement('div');
    popup.classList.add('download-popup');
    popup.innerHTML = `
        <div class="popup__content">
            <i class="uil uil-cloud-download popup__icon"></i>
            <div class="popup__text">Downloading...</div>
            <div class="popup__subtext">Thanks for your Love 🌹 and Support ✨.</div>
        </div>
    `;
    document.body.appendChild(popup);

    function showPopup() {
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000); // Auto close after 3 seconds
    }

    // Fetch Data
    fetch(seriesJsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            initializePage(data);
        })
        .catch(error => {
            console.error('Error fetching series data:', error);
            episodesList.innerHTML = '<p class="error-msg">Failed to load series data.</p>';
        });

    function initializePage(data) {
        // 1. Populate Hero Section
        if (data.seriesInfo) {
            heroTitle.innerHTML = data.seriesInfo.title;
            heroDesc.textContent = data.seriesInfo.description;

            // Update Cover Image
            if (data.seriesInfo.coverImage) {
                const imgWrapper = document.querySelector('.cartoon__img-wrapper');
                if (imgWrapper) {
                    imgWrapper.innerHTML = `<img src="${data.seriesInfo.coverImage}" alt="${data.seriesInfo.title}" class="cartoon__cover-img">`;
                }
            }
        }

        // 2. Initialize Seasons & Dropdown
        if (data.seasons && data.seasons.length > 0) {
            setupSeasons(data.seasons);
        }
    }

    // Track current active episodes for "Download All"
    let currentActiveEpisodes = [];

    function setupSeasons(seasons) {
        seasonOptions.innerHTML = '';

        seasons.forEach((season, index) => {
            const li = document.createElement('li');
            li.classList.add('season__option');
            if (index === 0) li.classList.add('active');
            li.dataset.seasonId = index;
            li.textContent = season.name;

            li.addEventListener('click', () => {
                document.querySelectorAll('.season__option').forEach(opt => opt.classList.remove('active'));
                li.classList.add('active');
                currentSeasonText.textContent = season.name;

                // Update Active List
                currentActiveEpisodes = season.episodes;
                renderEpisodes(season.episodes);

                seasonSelector.classList.remove('open');
                seasonOptions.classList.remove('show');
            });

            seasonOptions.appendChild(li);
        });

        // Set Initial State
        currentSeasonText.textContent = seasons[0].name;
        currentActiveEpisodes = seasons[0].episodes;
        renderEpisodes(seasons[0].episodes);

        seasonSelector.addEventListener('click', (e) => {
            e.stopPropagation();
            seasonSelector.classList.toggle('open');
            seasonOptions.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!seasonSelector.contains(e.target)) {
                seasonSelector.classList.remove('open');
                seasonOptions.classList.remove('show');
            }
        });
    }

    function renderEpisodes(episodes) {
        episodesList.innerHTML = '';

        episodes.forEach((ep) => {
            const card = document.createElement('div');
            card.classList.add('episode__card');
            card.style.animation = `fadeInUp 0.5s ease forwards ${ep.id * 0.1}s`;

            card.innerHTML = `
                <div class="episode__header">
                    <span class="episode__number">EP ${ep.id}</span>
                    <div class="episode__meta">
                        <i class="uil uil-clock"></i> ${ep.duration}
                    </div>
                </div>
                <h3 class="episode__title">${ep.title}</h3>
                <div class="episode__meta">
                    <i class="uil uil-calendar-alt"></i> ${ep.date}
                </div>
                <!-- Individual Download Button -->
                <button class="episode__download-btn" aria-label="Download Episode ${ep.id}">
                    <i class="uil uil-download-alt"></i>
                </button>
            `;

            const btn = card.querySelector('.episode__download-btn');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                // 1. Show Popup
                showPopup();

                // 2. Trigger Silent Download (Using iframe)
                if (ep.downloadLink) {
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = ep.downloadLink;
                    document.body.appendChild(iframe);
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 60000); // Cleanup after 1 min
                }

                // 3. Animation Logic
                btn.classList.remove('animating');
                void btn.offsetWidth;
                btn.classList.add('animating');

                setTimeout(() => {
                    const icon = btn.querySelector('i');
                    if (icon.classList.contains('uil-download-alt')) {
                        icon.classList.remove('uil-download-alt');
                        icon.classList.add('uil-check');
                        btn.classList.add('loved');
                    }
                }, 250);
            });

            episodesList.appendChild(card);
        });
    }

    /* --- Download Button Animation (Global) --- */
    const downloadBtn = document.getElementById('download-btn');
    const downloadMessage = document.getElementById('download-message');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (downloadBtn.classList.contains('loading') || downloadBtn.classList.contains('success')) return;

            // Start Loading UI
            downloadBtn.classList.add('loading');
            downloadMessage.textContent = 'Preparing downloads...';
            showPopup();

            // Trigger Bulk Download
            if (currentActiveEpisodes && currentActiveEpisodes.length > 0) {
                let delay = 0;
                currentActiveEpisodes.forEach((ep) => {
                    if (ep.downloadLink) {
                        setTimeout(() => {
                            const iframe = document.createElement('iframe');
                            iframe.style.display = 'none';
                            iframe.src = ep.downloadLink;
                            document.body.appendChild(iframe);
                            setTimeout(() => {
                                document.body.removeChild(iframe);
                            }, 60000); // Cleanup
                        }, delay);
                        delay += 1500; // 1.5s delay between each download to prevent blocking
                    }
                });
            }

            // Finish UI Animation
            setTimeout(() => {
                downloadBtn.classList.remove('loading');
                downloadBtn.classList.add('success');

                const icon = downloadBtn.querySelector('.download__icon_btn');
                icon.classList.remove('uil-cloud-download');
                icon.classList.add('uil-check');

                downloadMessage.textContent = 'All downloads started!';

                setTimeout(() => {
                    downloadBtn.classList.remove('success');
                    icon.classList.add('uil-cloud-download');
                    icon.classList.remove('uil-check');
                    downloadMessage.textContent = '';
                }, 5000);

            }, 2000); // UI feedback delay
        });
    }
});
