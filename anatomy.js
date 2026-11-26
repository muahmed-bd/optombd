/**
 * OptomBD Module 2: Full-Screen Black Anatomy & Optics Slide Viewer
 * File: js/anatomy.js
 * Pure image slides on black background with bottom-left arrows
 */

(function (window) {
  'use strict';

  const IMAGE_BASE_PATH = 'assets/anatomy/';

  const SLIDES = [
    { id: 'eyeball',       file: 'eyeball.png' },
    { id: 'eyelids',       file: 'eyelids.png' },
    { id: 'cornea',        file: 'cornea.png' },
    { id: 'lens',          file: 'lens.png' },
    { id: 'ciliaryBody',   file: 'ciliary-body.png' },
    { id: 'vitreous',      file: 'vitreous.png' },
    { id: 'retina',        file: 'retina.png' },
    { id: 'choroid',       file: 'choroid.png' },
    { id: 'opticNerve',    file: 'optic-nerve.png' },
    { id: 'emmetropia',    file: 'emmetropia.png' },
    { id: 'myopia',        file: 'myopia.png' },
    { id: 'hypermetropia', file: 'hypermetropia.png' },
    { id: 'astigmatism',   file: 'astigmatism.png' },
    { id: 'cataract',      file: 'cataract.png' },
    { id: 'keratoconus',   file: 'keratoconus.png' },
    { id: 'glaucoma',      file: 'glaucoma.png' }
  ];

  let currentIndex = 0;

  function renderAnatomyPage(container, onBackToMenu) {
    const slide = SLIDES[currentIndex];
    const imgSrc = IMAGE_BASE_PATH + slide.file;

    container.innerHTML =
      '<div class="anatomy-pure-stage">' +
        '<button type="button" id="btn-anatomy-back" class="anatomy-floating-close">Menu ✕</button>' +

        '<div class="anatomy-image-canvas">' +
          '<img id="anatomy-main-img" src="' + imgSrc + '" alt="' + slide.id + '" class="anatomy-full-img" />' +
          '<div id="anatomy-img-fallback" class="anatomy-fallback hidden">' +
            '<p><code>assets/anatomy/' + slide.file + '</code></p>' +
          '</div>' +
        '</div>' +

        '<div class="anatomy-bottom-left-arrows">' +
          '<button type="button" id="btn-anat-prev" class="anat-arrow-btn" title="Previous">◄</button>' +
          '<button type="button" id="btn-anat-next" class="anat-arrow-btn" title="Next">►</button>' +
        '</div>' +
      '</div>';

    const imgEl = document.getElementById('anatomy-main-img');
    const fallbackEl = document.getElementById('anatomy-img-fallback');

    if (imgEl && fallbackEl) {
      imgEl.onerror = function () {
        imgEl.classList.add('hidden');
        fallbackEl.classList.remove('hidden');
      };
      imgEl.onload = function () {
        imgEl.classList.remove('hidden');
        fallbackEl.classList.add('hidden');
      };
    }

    const backBtn = document.getElementById('btn-anatomy-back');
    const prevBtn = document.getElementById('btn-anat-prev');
    const nextBtn = document.getElementById('btn-anat-next');

    if (backBtn) backBtn.onclick = onBackToMenu;
    if (prevBtn) {
      prevBtn.onclick = function () {
        stepPart(-1, container, onBackToMenu);
      };
    }
    if (nextBtn) {
      nextBtn.onclick = function () {
        stepPart(1, container, onBackToMenu);
      };
    }
  }

  function stepPart(dir, container, onBackToMenu) {
    currentIndex = (currentIndex + dir + SLIDES.length) % SLIDES.length;
    renderAnatomyPage(container, onBackToMenu);
  }

  window.OptomBDAnatomy = {
    render: renderAnatomyPage,
    stepPart: stepPart
  };
})(window);