
if (!customElements.get('destination-explorer')) {
  const DEFAULT_FACT_ICONS = {
    1: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>`,
    2: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
          <path d="M12 18v3"></path>
          <path d="M10 21h4"></path>
        </svg>`,
    3: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>`,
    4: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
        </svg>`
  };

  const PLACEHOLDER_SVG_HTML = `
    <div class="destination-explorer__card-img-placeholder" data-destination-placeholder aria-label="No image available">
      <svg class="placeholder-svg" viewBox="0 0 525 525" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="525" height="525" fill="#E2E8F0" rx="14" />
        <path d="M262.5 190c-33 0-60 27-60 60s27 60 60 60 60-27 60-60-27-60-60-60zm0 96c-19.9 0-36-16.1-36-36s16.1-36 36-36 36 16.1 36 36-16.1 36-36 36z" fill="#A0AEC0"/>
        <path d="M375 375H150c-8.3 0-15-6.7-15-15 0-4.1 1.7-8.1 4.7-11l65-62.5c5.9-5.7 15.3-5.7 21.2 0l44.1 42.4 84.1-80.9c5.9-5.7 15.3-5.7 21.2 0l74 71c3 2.9 4.7 6.9 4.7 11 0 8.3-6.7 15-15 15z" fill="#CBD5E0"/>
      </svg>
    </div>
  `;

  customElements.define(
    'destination-explorer',
    class DestinationExplorer extends HTMLElement {
      constructor() {
        super();
        this.destinations = [];
        this.activeIndex = 0;
        this.activeGalleryIndex = -1;
      }

      connectedCallback() {
        this.loadDestinationsData();
        this.cacheElements();
        this.bindEvents();
        this.setupThemeEditorEvents();

        if (this.destinations.length > 0) {
          this.setActiveDestination(0, false);
        }
      }

      loadDestinationsData() {
        const jsonScript = this.querySelector('[data-destinations-json]');
        if (!jsonScript) return;
        try {
          this.destinations = JSON.parse(jsonScript.textContent.trim()) || [];
        } catch (e) {
          console.error('Failed to parse destination data JSON:', e);
          this.destinations = [];
        }
      }

      cacheElements() {
        this.pins = Array.from(this.querySelectorAll('.destination-explorer__pin'));
        this.capsuleTrack = this.querySelector('[data-carousel-track]');
        this.capsuleItems = Array.from(this.querySelectorAll('.destination-explorer__capsule-item'));
        this.capsulePrev = this.querySelector('[data-carousel-prev]');
        this.capsuleNext = this.querySelector('[data-carousel-next]');

        this.card = this.querySelector('.destination-explorer__card');
        this.cardTitle = this.querySelector('[data-destination-title]');
        this.cardCategory = this.querySelector('[data-destination-category]');
        this.cardMedia = this.querySelector('[data-destination-media]');
        this.cardGallery = this.querySelector('[data-destination-gallery]');
        this.cardDesc = this.querySelector('[data-destination-desc]');
        this.cardBtn = this.querySelector('[data-destination-btn]');
        this.cardBtnText = this.querySelector('[data-destination-btn-text]');
        this.wishlistBtn = this.querySelector('[data-wishlist-button]');


        this.factIcons = {
          1: this.querySelector('[data-fact-icon="1"]'),
          2: this.querySelector('[data-fact-icon="2"]'),
          3: this.querySelector('[data-fact-icon="3"]'),
          4: this.querySelector('[data-fact-icon="4"]')
        };
        this.factLabels = {
          1: this.querySelector('[data-fact-label="1"]'),
          2: this.querySelector('[data-fact-label="2"]'),
          3: this.querySelector('[data-fact-label="3"]'),
          4: this.querySelector('[data-fact-label="4"]')
        };
        this.factValues = {
          1: this.querySelector('[data-fact-val="1"]'),
          2: this.querySelector('[data-fact-val="2"]'),
          3: this.querySelector('[data-fact-val="3"]'),
          4: this.querySelector('[data-fact-val="4"]')
        };
      }

      bindEvents() {
        this.pins.forEach((pin, index) => {
          pin.addEventListener('click', (e) => {
            e.preventDefault();
            this.setActiveDestination(index, true);
          });
          pin.addEventListener('keydown', (e) => this.handleKeyNavigation(e, index, this.pins));
        });

        this.capsuleItems.forEach((item, index) => {
          item.addEventListener('click', (e) => {
            e.preventDefault();
            this.setActiveDestination(index, true);
          });
          item.addEventListener('keydown', (e) => this.handleKeyNavigation(e, index, this.capsuleItems));
        });

        if (this.capsulePrev) {
          this.capsulePrev.addEventListener('click', () => {
            if (this.capsuleTrack) {
              this.capsuleTrack.scrollBy({ left: -160, behavior: 'smooth' });
            }
          });
        }

        if (this.capsuleNext) {
          this.capsuleNext.addEventListener('click', () => {
            if (this.capsuleTrack) {
              this.capsuleTrack.scrollBy({ left: 160, behavior: 'smooth' });
            }
          });
        }
        if (this.cardGallery) {
          this.cardGallery.addEventListener('click', (e) => {
            const thumbBtn = e.target.closest('[data-gallery-index]');
            if (!thumbBtn) return;
            e.preventDefault();
            const galleryIndex = parseInt(thumbBtn.dataset.galleryIndex, 10);
            this.setActiveGalleryImage(galleryIndex);
          });
        }

        if (this.wishlistBtn) {
          this.wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.wishlistBtn.classList.toggle('is-favorited');
            const isFav = this.wishlistBtn.classList.contains('is-favorited');
            this.wishlistBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
          });
        }
      }

      setupThemeEditorEvents() {
        document.addEventListener('shopify:block:select', (event) => {
          if (!this.contains(event.target)) return;
          const blockId = event.detail.blockId;
          const targetIndex = this.destinations.findIndex((item) => item.id === blockId);
          if (targetIndex !== -1) {
            this.setActiveDestination(targetIndex, true);
          }
        });
      }

      handleKeyNavigation(event, currentIndex, itemsArray) {
        let newIndex = currentIndex;
        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault();
            newIndex = (currentIndex + 1) % itemsArray.length;
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault();
            newIndex = (currentIndex - 1 + itemsArray.length) % itemsArray.length;
            break;
          case 'Home':
            event.preventDefault();
            newIndex = 0;
            break;
          case 'End':
            event.preventDefault();
            newIndex = itemsArray.length - 1;
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            this.setActiveDestination(currentIndex, true);
            return;
          default:
            return;
        }

        if (newIndex !== currentIndex) {
          itemsArray[newIndex]?.focus();
          this.setActiveDestination(newIndex, true);
        }
      }

      setActiveDestination(index, shouldScrollCapsule = true) {
        if (!this.destinations[index]) return;
        this.activeIndex = index;
        const data = this.destinations[index];

        this.pins.forEach((pin, i) => {
          const isActive = i === index;
          pin.classList.toggle('is-active', isActive);
          pin.setAttribute('aria-selected', isActive ? 'true' : 'false');
          pin.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        this.capsuleItems.forEach((item, i) => {
          const isActive = i === index;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
          item.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        if (shouldScrollCapsule && this.capsuleTrack && this.capsuleItems[index]) {
          const activeItem = this.capsuleItems[index];
          const trackRect = this.capsuleTrack.getBoundingClientRect();
          const itemRect = activeItem.getBoundingClientRect();
          const offset = itemRect.left - trackRect.left - trackRect.width / 2 + itemRect.width / 2;
          this.capsuleTrack.scrollBy({ left: offset, behavior: 'smooth' });
        }

        if (this.cardTitle) this.cardTitle.textContent = data.title || '';
        if (this.cardCategory) this.cardCategory.textContent = data.subtitle || '';
        if (this.cardDesc) {
          this.cardDesc.innerHTML = data.description || '';
        }

        for (let factNum = 1; factNum <= 4; factNum++) {
          const iconEl = this.factIcons[factNum];
          const labelEl = this.factLabels[factNum];
          const valEl = this.factValues[factNum];

          const iconSrc = data[`fact${factNum}Icon`];
          const labelText = data[`fact${factNum}Label`];
          const valText = data[`fact${factNum}Value`];

          if (labelEl) labelEl.textContent = labelText || '';
          if (valEl) valEl.textContent = valText || '';

          if (iconEl) {
            if (iconSrc) {
              iconEl.innerHTML = `<img class="destination-explorer__fact-img" src="${iconSrc}" alt="${labelText || ''}" loading="lazy" />`;
            } else {
              iconEl.innerHTML = DEFAULT_FACT_ICONS[factNum] || '';
            }
          }
        }

        if (this.cardBtn) {
          this.cardBtn.setAttribute('href', data.buttonLink || '#');
        }
        if (this.cardBtnText) {
          this.cardBtnText.textContent = data.buttonLabel || 'EXPLORE DESTINATION';
        }

        if (this.wishlistBtn) {
          this.wishlistBtn.classList.remove('is-favorited');
          this.wishlistBtn.setAttribute('aria-pressed', 'false');
        }

        this.renderGalleryAndMedia(data);
      }

      renderGalleryAndMedia(data) {
        if (!this.cardMedia) return;

        const mainImageUrl = data.mainImage;
        const galleryItems = Array.isArray(data.gallery) ? data.gallery.filter((g) => g && g.src) : [];
        this.activeGalleryIndex = -1;

        if (mainImageUrl) {
          this.cardMedia.innerHTML = `
            <img
              class="destination-explorer__card-main-img"
              src="${mainImageUrl}"
              alt="${data.mainImageAlt || data.title || ''}"
              loading="lazy"
            />
          `;
        } else if (galleryItems.length > 0 && galleryItems[0].src) {
          this.activeGalleryIndex = 0;
          this.cardMedia.innerHTML = `
            <img
              class="destination-explorer__card-main-img"
              src="${galleryItems[0].src}"
              alt="${galleryItems[0].alt || data.title || ''}"
              loading="lazy"
            />
          `;
        } else {
          this.cardMedia.innerHTML = PLACEHOLDER_SVG_HTML;
        }

        if (this.cardGallery) {
          if (galleryItems.length > 0) {
            let galleryHtml = '';
            galleryItems.forEach((item, thumbIndex) => {
              const isActive = thumbIndex === this.activeGalleryIndex ? ' is-active' : '';
              galleryHtml += `
                <button
                  type="button"
                  class="destination-explorer__gallery-thumb${isActive}"
                  data-gallery-index="${thumbIndex}"
                  aria-label="View gallery photo ${thumbIndex + 1} of ${data.title}"
                  aria-pressed="${thumbIndex === this.activeGalleryIndex ? 'true' : 'false'}"
                >
                  <img src="${item.thumb || item.src}" alt="${item.alt || data.title}" loading="lazy" />
                </button>
              `;
            });
            this.cardGallery.innerHTML = galleryHtml;
            this.cardGallery.style.display = 'grid';
          } else {
            this.cardGallery.innerHTML = '';
            this.cardGallery.style.display = 'none';
          }
        }
      }

      setActiveGalleryImage(thumbIndex) {
        const currentData = this.destinations[this.activeIndex];
        if (!currentData) return;

        const galleryItems = Array.isArray(currentData.gallery) ? currentData.gallery.filter((g) => g && g.src) : [];

        if (this.activeGalleryIndex === thumbIndex && currentData.mainImage) {
          this.activeGalleryIndex = -1;
          this.updateLargeImage(currentData.mainImage, currentData.mainImageAlt || currentData.title);

          if (this.cardGallery) {
            this.cardGallery.querySelectorAll('[data-gallery-index]').forEach((thumb) => {
              thumb.classList.remove('is-active');
              thumb.setAttribute('aria-pressed', 'false');
            });
          }
          return;
        }

        if (!galleryItems[thumbIndex] || !galleryItems[thumbIndex].src) return;

        this.activeGalleryIndex = thumbIndex;
        const photo = galleryItems[thumbIndex];

        this.updateLargeImage(photo.src, photo.alt || currentData.title);

        if (this.cardGallery) {
          const thumbs = this.cardGallery.querySelectorAll('[data-gallery-index]');
          thumbs.forEach((thumb) => {
            const idx = parseInt(thumb.dataset.galleryIndex, 10);
            const isActive = idx === thumbIndex;
            thumb.classList.toggle('is-active', isActive);
            thumb.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          });
        }
      }

      updateLargeImage(src, alt) {
        if (!this.cardMedia) return;

        let mainImg = this.cardMedia.querySelector('.destination-explorer__card-main-img');
        if (mainImg) {
          mainImg.classList.add('is-fading');
          setTimeout(() => {
            mainImg.removeAttribute('srcset');
            mainImg.src = src;
            mainImg.alt = alt || '';
            mainImg.classList.remove('is-fading');
          }, 100);
        } else {
          this.cardMedia.innerHTML = `
            <img
              class="destination-explorer__card-main-img"
              src="${src}"
              alt="${alt || ''}"
              loading="lazy"
            />
          `;
        }
      }
    }
  );
}
