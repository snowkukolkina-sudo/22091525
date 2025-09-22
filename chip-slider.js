(function(){
  // Utility: ensure underline structure exists on a category bar
  function ensureUnderline(bar) {
    let underline = bar.querySelector('.chip-underline');
    if (!underline) {
      underline = document.createElement('div');
      underline.className = 'chip-underline';
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      underline.appendChild(thumb);
      bar.appendChild(underline);
    }
    let thumb = underline.querySelector('.thumb');
    if (!thumb) {
      thumb = document.createElement('div');
      thumb.className = 'thumb';
      underline.appendChild(thumb);
    }
    return { underline, thumb };
  }
  // Update the slider thumb dimensions/position based on scroll state
  function updateThumb(scroll, underline) {
    const rect = underline.getBoundingClientRect();
    const trackWidth = rect.width;
    const totalScrollWidth = scroll.scrollWidth;
    const visibleWidth = scroll.clientWidth;
    const maxScroll = Math.max(1, totalScrollWidth - visibleWidth);
    // width of thumb represents visible portion of scroll area (min 40px)
    const thumbWidth = Math.max(40, (visibleWidth / totalScrollWidth) * trackWidth);
    // x position based on scrollLeft
    const x = (scroll.scrollLeft / maxScroll) * Math.max(0, trackWidth - thumbWidth);
    underline.style.setProperty('--w', thumbWidth + 'px');
    underline.style.setProperty('--x', x + 'px');
  }
  // Set scroll left of container by ratio (used by drag)
  function setScrollByRatio(scroll, ratio) {
    const maxScroll = Math.max(1, scroll.scrollWidth - scroll.clientWidth);
    scroll.scrollLeft = Math.min(maxScroll, Math.max(0, ratio * maxScroll));
  }
  // Bind drag behavior to thumb
  function bindDrag(bar, scroll, underline, thumb) {
    let dragging = false;
    let startX = 0;
    let startRatio = 0;
    // Compute usable width for thumb sliding
    const usable = () => {
      const rect = underline.getBoundingClientRect();
      const trackW = rect.width;
      const thumbW = parseFloat(getComputedStyle(underline).getPropertyValue('--w')) || 40;
      return Math.max(1, trackW - thumbW);
    };
    const currentX = () => {
      return parseFloat(getComputedStyle(underline).getPropertyValue('--x')) || 0;
    };
    const onDown = e => {
      dragging = true;
      bar.classList.add('dragging');
      startX = e.clientX;
      startRatio = currentX() / usable();
      e.preventDefault();
    };
    const onMove = e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const ratio = Math.min(1, Math.max(0, startRatio + dx / usable()));
      setScrollByRatio(scroll, ratio);
      updateThumb(scroll, underline);
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      bar.classList.remove('dragging');
    };
    thumb.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    // Clicking the track jumps to position
    underline.addEventListener('pointerdown', e => {
      if (e.target === thumb) return;
      const rect = underline.getBoundingClientRect();
      const trackW = rect.width;
      const thumbW = parseFloat(getComputedStyle(underline).getPropertyValue('--w')) || 40;
      const usableWidth = Math.max(1, trackW - thumbW);
      const rel = Math.min(usableWidth, Math.max(0, e.clientX - rect.left - thumbW / 2));
      const ratio = rel / usableWidth;
      setScrollByRatio(scroll, ratio);
      updateThumb(scroll, underline);
      // start dragging immediately
      startX = e.clientX;
      dragging = true;
      bar.classList.add('dragging');
      startRatio = rel / usableWidth;
    });
  }
  // Allow horizontal scroll via arrow keys and vertical scroll wheel
  function addKeyboardWheel(scroll, underline) {
    scroll.tabIndex = 0;
    const step = 120;
    scroll.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') {
        scroll.scrollBy({ left: step, behavior: 'smooth' });
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') {
        scroll.scrollBy({ left: -step, behavior: 'smooth' });
        e.preventDefault();
      }
      if (e.key === 'Home') {
        scroll.scrollTo({ left: 0, behavior: 'smooth' });
        e.preventDefault();
      }
      if (e.key === 'End') {
        scroll.scrollTo({ left: scroll.scrollWidth, behavior: 'smooth' });
        e.preventDefault();
      }
    });
    scroll.addEventListener(
      'wheel',
      e => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          scroll.scrollLeft += e.deltaY;
          updateThumb(scroll, underline);
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }
  // Initialize slider on every category bar
  function init() {
    document.querySelectorAll('.category-bar').forEach(bar => {
      const scroll = bar.querySelector('.category-scroll');
      if (!scroll) return;
      /* Normalize chip contents: remove span wrappers and fire class for consistent styling */
      scroll.querySelectorAll('.chip').forEach(chip => {
        // Replace the HTML with plain text to remove any <span class="letter"> wrappers
        const text = chip.textContent.trim();
        chip.textContent = text;
        // Remove fire class if present
        chip.classList.remove('fire');
      });
      const { underline, thumb } = ensureUnderline(bar);
      const update = () => updateThumb(scroll, underline);
      update();
      scroll.addEventListener('scroll', update, { passive: true });
      new ResizeObserver(update).observe(scroll);
      bindDrag(bar, scroll, underline, thumb);
      addKeyboardWheel(scroll, underline);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();