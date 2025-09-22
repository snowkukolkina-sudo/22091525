/*
 * Interaction logic for the condensed & small navigation bar.  
 * Applies the correct slider width according to the horizontal scale factor
 * specified in CSS and keeps the active tab in view.
 */

document.addEventListener('DOMContentLoaded', () => {
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const slider = document.querySelector('.slider');
  const wrap = document.querySelector('.tabs-wrap');

  function activateTab(tab) {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const rect = tab.getBoundingClientRect();
    const offset = tab.offsetLeft;
    const scaleX = parseFloat(getComputedStyle(tab).getPropertyValue('--scale-x')) || 1;
    slider.style.width = `${rect.width * scaleX}px`;
    slider.style.transform = `translateX(${offset}px)`;
  }

  function scrollIntoViewIfNeeded(tab) {
    const wrapRect = wrap.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    if (tabRect.left < wrapRect.left) {
      wrap.scrollBy({ left: tabRect.left - wrapRect.left - 20, behavior: 'smooth' });
    } else if (tabRect.right > wrapRect.right) {
      wrap.scrollBy({ left: tabRect.right - wrapRect.right + 20, behavior: 'smooth' });
    }
  }

  if (tabs.length) activateTab(tabs[0]);
  tabs.forEach(tab => {
    tab.addEventListener('click', evt => {
      evt.preventDefault();
      activateTab(tab);
      scrollIntoViewIfNeeded(tab);
    });
  });
});