/**
 * OptomBD Module 3: Developer Profile & Clinical Credit Page
 * File: js/developer.js
 */

(function (window) {
  'use strict';

  const PHOTO_PATH = 'assets/others/mohiuahmed.png';

  const DEVELOPER_INFO = {
    appName: 'OptomBD — Clinical Visual Acuity System',
    version: 'v2.4',
    developerName: 'Mohiuddin Ahmed',
    primaryRole: 'Optometrist & Director, Smart Optics & Eye Care',
    location: 'Damudya Bazar, Shariatpur, Bangladesh',
    qualifications: [
      'Diploma in Optometry & Low Vision',
      'Diploma in Electronics Engineering',
      'Diploma in Homoeopathic Medicine & Surgery (3rd Year)'
    ],
    appDescription:
      'OptomBD is a clinical visual acuity and ocular presentation system designed for eye clinics and vision centers, featuring multi-chart testing, Mirror mode, Duochrome, 100mm screen calibration, and anatomy slides.',
    disclaimer:
      'Verify viewing distance and 100mm screen calibration before clinical assessment.'
  };

  function renderDeveloperPage(container, onBackToMenu) {
    const qualListHTML = DEVELOPER_INFO.qualifications
      .map(function (q) {
        return '<li>' + q + '</li>';
      })
      .join('');

    container.innerHTML =
      '<div class="subpage-card dev-large-stage">' +
        '<div class="subpage-header dev-large-header">' +
          '<div>' +
            '<h2>About Developer</h2>' +
            '<p>' + DEVELOPER_INFO.appName + ' • ' + DEVELOPER_INFO.version + '</p>' +
          '</div>' +
          '<button type="button" id="btn-dev-back" class="nav-pill-btn primary dev-back-large">◄ Back to Menu</button>' +
        '</div>' +

        '<div class="dev-profile-grid dev-large-grid">' +
          '<div class="dev-card primary-card dev-large-card">' +
            '<div class="dev-photo-frame">' +
              '<img id="dev-profile-photo" src="' + PHOTO_PATH + '" alt="Mohiuddin Ahmed" class="dev-photo-img" />' +
              '<div id="dev-photo-fallback" class="dev-photo-fallback hidden">M. U. Ahmed</div>' +
            '</div>' +
            '<h3 class="dev-name-lg">' + DEVELOPER_INFO.developerName + '</h3>' +
            '<p class="dev-role dev-role-lg">' + DEVELOPER_INFO.primaryRole + '</p>' +
            '<p class="dev-meta dev-meta-lg">📍 ' + DEVELOPER_INFO.location + '</p>' +

            '<div class="dev-qual-box">' +
              '<div class="dev-qual-title dev-qual-title-lg">Qualifications</div>' +
              '<ul class="dev-qual-list dev-qual-list-lg">' + qualListHTML + '</ul>' +
            '</div>' +
          '</div>' +

          '<div class="dev-card dev-large-card dev-about-col">' +
            '<span class="dev-tag">ABOUT APP</span>' +
            '<h3 class="dev-about-heading">About OptomBD</h3>' +
            '<p class="dev-text dev-text-lg">' + DEVELOPER_INFO.appDescription + '</p>' +
            '<div class="dev-disclaimer dev-disclaimer-lg">' + DEVELOPER_INFO.disclaimer + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    const imgEl = document.getElementById('dev-profile-photo');
    const fallbackEl = document.getElementById('dev-photo-fallback');
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

    const backBtn = document.getElementById('btn-dev-back');
    if (backBtn) backBtn.onclick = onBackToMenu;
  }

  window.OptomBDDeveloper = {
    render: renderDeveloperPage
  };
})(window);