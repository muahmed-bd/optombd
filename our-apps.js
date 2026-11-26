/**
 * OptomBD Module: Our Apps Showcase
 * File: js/our-apps.js
 */

(function (window) {
  'use strict';

  const OUR_APPS = [
    {
      name: 'OptomBD Clinical Chart',
      status: 'Active',
      desc: 'Clinical visual acuity chart system with Mirror mode, Duochrome, 100mm calibration, and full-screen anatomy slides.',
      link: '—'
    },
    {
      name: 'Upcoming Clinical & Educational Apps',
      status: 'Coming Soon',
      desc: 'Additional apps, descriptions, and links will be updated here in future releases.',
      link: '—'
    }
  ];

  function renderOurAppsPage(container, onBackToMenu) {
    const cardsHTML = OUR_APPS.map(function (app) {
      return (
        '<div class="dev-card">' +
          '<span class="dev-tag">' + app.status + '</span>' +
          '<h3>' + app.name + '</h3>' +
          '<p class="dev-text">' + app.desc + '</p>' +
          '<p class="dev-meta">Link / Info: ' + app.link + '</p>' +
        '</div>'
      );
    }).join('');

    container.innerHTML =
      '<div class="subpage-card">' +
        '<div class="subpage-header">' +
          '<div>' +
            '<h2>Our Apps</h2>' +
            '<p>Additional apps and links will be updated here</p>' +
          '</div>' +
          '<button type="button" id="btn-ourapps-back" class="nav-pill-btn primary">◄ Back to Menu</button>' +
        '</div>' +

        '<div class="dev-profile-grid">' + cardsHTML + '</div>' +
      '</div>';

    const backBtn = document.getElementById('btn-ourapps-back');
    if (backBtn) backBtn.onclick = onBackToMenu;
  }

  window.OptomBDOurApps = {
    render: renderOurAppsPage
  };
})(window);