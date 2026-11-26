/**
 * OptomBD Module: Common Eye Diseases
 * File: js/common-diseases.js
 */

(function (window) {
  'use strict';

  const DISEASE_IMAGE_PATH = 'assets/diseases/';

  const COMMON_DISEASES = [
    {
      id: 'cataract',
      title: 'Cataract',
      summary: 'Clinical summary and related visual reference will be added here.',
      image: 'cataract.png'
    },
    {
      id: 'glaucoma',
      title: 'Glaucoma',
      summary: 'Clinical summary and related visual reference will be added here.',
      image: 'glaucoma.png'
    },
    {
      id: 'conjunctivitis',
      title: 'Conjunctivitis',
      summary: 'Clinical summary and related visual reference will be added here.',
      image: 'conjunctivitis.png'
    },
    {
      id: 'dryEye',
      title: 'Dry Eye Syndrome',
      summary: 'Clinical summary and related visual reference will be added here.',
      image: 'dry-eye.png'
    }
  ];

  let selectedIndex = 0;

  function renderCommonDiseasesPage(container, onBackToMenu) {
    const current = COMMON_DISEASES[selectedIndex];
    const imgSrc = DISEASE_IMAGE_PATH + current.image;

    container.innerHTML =
      '<div class="subpage-card">' +
        '<div class="subpage-header">' +
          '<div>' +
            '<h2>Common Diseases</h2>' +
            '<p>Clinical notes and images will be expanded step by step</p>' +
          '</div>' +
          '<button type="button" id="btn-disease-back" class="nav-pill-btn primary">◄ Back to Menu</button>' +
        '</div>' +

        '<div class="disease-layout">' +
          '<div class="disease-list">' +
            COMMON_DISEASES.map(function (item, idx) {
              const cls = idx === selectedIndex ? 'part-chip active' : 'part-chip';
              return '<button type="button" class="' + cls + '" data-d-idx="' + idx + '">' + item.title + '</button>';
            }).join('') +
          '</div>' +

          '<div class="disease-detail-card">' +
            '<div class="disease-img-box">' +
              '<img id="disease-img" src="' + imgSrc + '" alt="' + current.title + '" class="disease-img" />' +
              '<div id="disease-img-fallback" class="disease-fallback-box">Image Slot: assets/diseases/' + current.image + '</div>' +
            '</div>' +
            '<h3>' + current.title + '</h3>' +
            '<p>' + current.summary + '</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    const imgEl = document.getElementById('disease-img');
    const fbEl = document.getElementById('disease-img-fallback');
    if (imgEl && fbEl) {
      imgEl.onerror = function () {
        imgEl.classList.add('hidden');
        fbEl.classList.remove('hidden');
      };
      imgEl.onload = function () {
        imgEl.classList.remove('hidden');
        fbEl.classList.add('hidden');
      };
    }

    const backBtn = document.getElementById('btn-disease-back');
    if (backBtn) backBtn.onclick = onBackToMenu;

    Array.from(container.querySelectorAll('[data-d-idx]')).forEach(function (btn) {
      btn.onclick = function () {
        selectedIndex = parseInt(btn.getAttribute('data-d-idx'), 10) || 0;
        renderCommonDiseasesPage(container, onBackToMenu);
      };
    });
  }

  window.OptomBDCommonDiseases = {
    render: renderCommonDiseasesPage
  };
})(window);