
class VideoMomentsCard extends HTMLElement {
  constructor() {
    super();
    this.video = null;
    this.iframe = null;
    this.isPlaying = false;
  }

  connectedCallback() {
    this.video = this.querySelector('video');
    this.iframe = this.querySelector('iframe');
    this.addEventListener('mouseenter', () => this.play());
    this.addEventListener('mouseleave', () => this.pause());

    this.addEventListener('click', (e) => {
      if (window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      }
    });
  }

  play() {
    this.isPlaying = true;
    this.classList.add('is-playing');

    if (this.video) {
      try {
        this.video.currentTime = 0;
        const playPromise = this.video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } catch (err) {}
    } else if (this.iframe && this.iframe.contentWindow) {
      try {
        this.iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: '' }),
          '*'
        );
        this.iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        );
        this.iframe.contentWindow.postMessage(
          JSON.stringify({ method: 'play' }),
          '*'
        );
      } catch (err) {}
    }
  }

  pause() {
    this.isPlaying = false;
    this.classList.remove('is-playing');

    if (this.video) {
      try {
        this.video.pause();
      } catch (err) {}
    } else if (this.iframe && this.iframe.contentWindow) {
      try {
        this.iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
        this.iframe.contentWindow.postMessage(
          JSON.stringify({ method: 'pause' }),
          '*'
        );
      } catch (err) {}
    }
  }
}

if (!customElements.get('video-moments-card')) {
  customElements.define('video-moments-card', VideoMomentsCard);
}

class VideoMomentsSlider extends HTMLElement {
  connectedCallback() {
    this.gridWrap = this.querySelector('.video-moments__grid-wrap');
    this.pagination = this.querySelector('.video-moments__pagination');
    this.cards = Array.from(this.querySelectorAll('.video-moments__card'));

    if (!this.gridWrap || !this.pagination || this.cards.length === 0) return;

    this.setupPagination();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.setupPagination(), 120);
    });

    this.gridWrap.addEventListener('scroll', () => this.handleScroll(), { passive: true });
  }

  setupPagination() {
    this.pagination.innerHTML = '';
    const totalCards = this.cards.length;
    if (totalCards <= 1) {
      this.pagination.style.display = 'none';
      return;
    }

    const wrapWidth = this.gridWrap.clientWidth;
    const cardWidth = this.cards[0].offsetWidth || 300;
    const visibleCards = Math.max(1, Math.round(wrapWidth / cardWidth));

    const maxScroll = this.gridWrap.scrollWidth - this.gridWrap.clientWidth;
    if (maxScroll <= 5) {
      this.pagination.style.display = 'none';
      return;
    }
    
    const pageCount = Math.ceil(totalCards / visibleCards);
    if (pageCount <= 1) {
      this.pagination.style.display = 'none';
      return;
    }

    this.pagination.style.display = 'flex';
    this.pageCount = pageCount;
    this.visibleCards = visibleCards;

    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `video-moments__dot${i === 0 ? ' video-moments__dot--active' : ''}`;
      dot.setAttribute('data-page', i);
      dot.setAttribute('aria-label', `Page ${i + 1}`);

      dot.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPage(i);
      });

      this.pagination.appendChild(dot);
    }
  }

  goToPage(pageIndex) {
    const cardIndex = Math.min(pageIndex * this.visibleCards, this.cards.length - 1);
    const targetCard = this.cards[cardIndex];
    if (targetCard) {
      const wrapLeft = this.gridWrap.getBoundingClientRect().left;
      const cardLeft = targetCard.getBoundingClientRect().left;
      const offset = cardLeft - wrapLeft;
      this.gridWrap.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  handleScroll() {
    const dots = this.pagination.querySelectorAll('.video-moments__dot');
    if (!dots.length) return;

    const scrollLeft = this.gridWrap.scrollLeft;
    const maxScroll = this.gridWrap.scrollWidth - this.gridWrap.clientWidth;

    let activePage = 0;
    if (maxScroll > 0) {
      const progress = scrollLeft / maxScroll;
      activePage = Math.min(dots.length - 1, Math.round(progress * (dots.length - 1)));
    }

    dots.forEach((dot, index) => {
      if (index === activePage) {
        dot.classList.add('video-moments__dot--active');
      } else {
        dot.classList.remove('video-moments__dot--active');
      }
    });
  }
}

if (!customElements.get('video-moments-slider')) {
  customElements.define('video-moments-slider', VideoMomentsSlider);
}
