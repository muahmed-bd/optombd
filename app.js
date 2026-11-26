/**
 * OptomBD Main Controller
 * File: app.js
 */

(function () {
  'use strict';

  const Optotypes = window.OptomBDOptotypes;
  const AnatomyPage = window.OptomBDAnatomy;
  const CommonDiseasesPage = window.OptomBDCommonDiseases;
  const OurAppsPage = window.OptomBDOurApps;
  const DeveloperPage = window.OptomBDDeveloper;

  const DISTANCES = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0];
  const STORAGE_KEY = 'optombd_config_v3';

  // Replace YOUR_GITHUB_USER and YOUR_REPO with your actual repository details
  const CURRENT_APP_VERSION = '2.4.0';
  const REMOTE_VERSION_URL = 'https://raw.githubusercontent.com/muahmed-bd/optombd/main/version.json';

  const MENU_CARDS_12 = [
    { action: 'selectChart', value: 'englishLetters', icon: 'ABC', title: 'English Letters',  sub: 'Acuity Chart' },
    { action: 'selectChart', value: 'numbers',        icon: '123', title: 'English Numbers',  sub: 'Acuity Chart' },
    { action: 'selectChart', value: 'banglaLetters',  icon: 'কখগ', title: 'Bangla Letters',   sub: 'Acuity Chart' },
    { action: 'selectChart', value: 'banglaNumbers',  icon: '১২৩', title: 'Bangla Numbers',   sub: 'Acuity Chart' },
    { action: 'selectChart', value: 'tumblingE',      icon: 'E',   title: 'Tumbling E',       sub: 'Acuity Chart' },
    { action: 'selectChart', value: 'landoltC',       icon: 'C',   title: 'Landolt C',        sub: 'Acuity Chart' },
    { action: 'infoNotice',  value: 'ishihara',       icon: '🔴🟢', title: 'Ishihara',         sub: 'Color Test' },
    { action: 'openAnatomy', value: '',               icon: '👁️',  title: 'Anatomy',          sub: 'Ocular Slides' },
    { action: 'openDiseases',value: '',               icon: '🩺',  title: 'Common Diseases',  sub: 'Clinical Notes' },
    { action: 'openSettings',value: '',               icon: '⚙️',  title: 'Settings',         sub: 'Calibration & Mirror' },
    { action: 'openDeveloper',value:'',               icon: '👨‍⚕️', title: 'About',            sub: 'Developer Info' },
    { action: 'openOurApps', value: '',               icon: '📱',  title: 'Our Apps',         sub: 'More Apps' }
  ];

  const state = {
    chartType: 'tumblingE',
    displayMode: 'full',
    duochrome: false,
    mirror: false,
    distanceMeters: 3.0,
    calBarPx: 378,
    acuityIndex: 0,
    singleIndex: 0,
    activeView: 'chart',
    menuFocusIndex: 0,
    currentSymbols: [],
    updateStatus: 'Idle',
    updateMessage: 'Tap "Check for Updates" when connected to the internet.',
    remoteVersion: null,
    updateAvailable: false,
    isCheckingUpdate: false
  };

  // Native AndroidUpdater (MainActivity.java) থেকে আসা আপডেট স্ট্যাটাস হ্যান্ডলার
  window.onNativeUpdateStatus = function (statusObj) {
    if (!statusObj) return;

    if (statusObj.state === 'checking') {
      state.isCheckingUpdate = true;
      state.updateStatus = 'Checking...';
      state.updateMessage = statusObj.message || 'Checking Git repository for new version...';
    } else if (statusObj.state === 'downloading') {
      state.isCheckingUpdate = true;
      state.updateStatus = 'Downloading (' + (statusObj.progress || 0) + '%)';
      state.updateMessage = statusObj.message || 'Downloading updated files...';
    } else if (statusObj.state === 'up_to_date') {
      state.isCheckingUpdate = false;
      state.updateAvailable = false;
      state.updateStatus = 'Up to Date';
      state.updateMessage = statusObj.message || 'You are on the latest version (v' + CURRENT_APP_VERSION + ').';
    } else if (statusObj.state === 'completed') {
      state.isCheckingUpdate = false;
      state.updateAvailable = false;
      state.updateStatus = 'Updated';
      state.updateMessage = statusObj.message || 'Update completed. Reloading...';
    } else if (statusObj.state === 'error') {
      state.isCheckingUpdate = false;
      state.updateAvailable = false;
      state.updateStatus = 'Update Failed';
      state.updateMessage = statusObj.message || 'No internet connection or Git update server unreachable.';
    }

    if (typeof renderAll === 'function' && state.activeView === 'settings') {
      renderAll();
    }
  };

  function compareVersions(remoteVer, localVer) {
    const rParts = String(remoteVer || '0.0.0').trim().split('.').map(function (n) { return parseInt(n, 10) || 0; });
    const lParts = String(localVer || '0.0.0').trim().split('.').map(function (n) { return parseInt(n, 10) || 0; });
    const len = Math.max(rParts.length, lParts.length);

    for (let i = 0; i < len; i++) {
      const rv = rParts[i] || 0;
      const lv = lParts[i] || 0;
      if (rv > lv) return 1;
      if (rv < lv) return -1;
    }
    return 0;
  }

  function checkForGitUpdates() {
    if (state.isCheckingUpdate) return;

    // Android WebView-এর ভেতরে থাকলে নেটিভ AndroidUpdater দিয়ে ফাইল ডাউনলোড ও ক্যাশ আপডেট করবে
    if (window.AndroidUpdater && typeof window.AndroidUpdater.checkForUpdates === 'function') {
      state.isCheckingUpdate = true;
      state.updateStatus = 'Checking...';
      state.updateMessage = 'Connecting to native updater...';
      if (state.activeView === 'settings') renderAll();
      window.AndroidUpdater.checkForUpdates();
      return;
    }

    if (!navigator.onLine) {
      state.updateStatus = 'Offline';
      state.updateAvailable = false;
      state.updateMessage = 'No internet connection. Running offline local build.';
      if (state.activeView === 'settings') renderAll();
      return;
    }

    state.isCheckingUpdate = true;
    state.updateStatus = 'Checking...';
    state.updateMessage = 'Checking Git repository for new version...';
    if (state.activeView === 'settings') renderAll();

    const cacheBustUrl = REMOTE_VERSION_URL + (REMOTE_VERSION_URL.includes('?') ? '&' : '?') + 't=' + Date.now();

    fetch(cacheBustUrl, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        const latestVer = data && data.version ? String(data.version).trim() : null;
        state.remoteVersion = latestVer;

        if (!latestVer) {
          state.updateStatus = 'Invalid Info';
          state.updateAvailable = false;
          state.updateMessage = 'Could not read remote version info.';
          return;
        }

        if (compareVersions(latestVer, CURRENT_APP_VERSION) > 0) {
          state.updateAvailable = true;
          state.updateStatus = 'Update Available';
          state.updateMessage = 'New updates are available (v' + latestVer + ').' + (data.notes ? ' — ' + data.notes : '');
        } else {
          state.updateAvailable = false;
          state.updateStatus = 'Up to Date';
          state.updateMessage = 'You are on the latest version (v' + CURRENT_APP_VERSION + ').';
        }
      })
      .catch(function () {
        state.updateAvailable = false;
        state.updateStatus = 'Offline / Unreachable';
        state.updateMessage = 'No internet connection or Git update server unreachable.';
      })
      .finally(function () {
        state.isCheckingUpdate = false;
        if (state.activeView === 'settings') renderAll();
      });
  }

  function loadSavedConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return;
      if (Optotypes.CHART_LABELS[saved.chartType]) state.chartType = saved.chartType;
      if (saved.displayMode === 'full' || saved.displayMode === 'single') state.displayMode = saved.displayMode;
      if (typeof saved.duochrome === 'boolean') state.duochrome = saved.duochrome;
      if (typeof saved.mirror === 'boolean') state.mirror = saved.mirror;
      if (DISTANCES.includes(saved.distanceMeters)) state.distanceMeters = saved.distanceMeters;
      if (typeof saved.calBarPx === 'number' && saved.calBarPx >= 150 && saved.calBarPx <= 1200) {
        state.calBarPx = saved.calBarPx;
      }
    } catch (e) {}
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        chartType: state.chartType,
        displayMode: state.displayMode,
        duochrome: state.duochrome,
        mirror: state.mirror,
        distanceMeters: state.distanceMeters,
        calBarPx: state.calBarPx
      }));
    } catch (e) {}
  }

  function regenerateLine() {
    const level = Optotypes.ACUITY_LEVELS[state.acuityIndex];
    state.currentSymbols = Optotypes.generateSymbolsForLine(state.chartType, level.count);
    state.singleIndex = 0;
  }

  function renderChartHUD() {
    const level = Optotypes.ACUITY_LEVELS[state.acuityIndex];
    const sizePx = Optotypes.calculateOptotypePx(level.denom, state.distanceMeters, state.calBarPx);

    const hudChart = document.getElementById('hud-chart-type');
    const hudMirrorBadge = document.getElementById('hud-mirror-badge');
    const hudMetric = document.getElementById('hud-metric');
    const hudImperial = document.getElementById('hud-imperial');
    const hudLogmar = document.getElementById('hud-logmar');
    const hudDist = document.getElementById('hud-distance');
    const hudMode = document.getElementById('hud-display-mode');
    const hudMirrorText = document.getElementById('hud-mirror-text');
    const row = document.getElementById('optotype-row');

    if (hudChart) hudChart.textContent = Optotypes.CHART_LABELS[state.chartType].toUpperCase();
    if (hudMirrorBadge) hudMirrorBadge.classList.toggle('hidden', !state.mirror);
    if (hudMetric) hudMetric.textContent = level.metric;
    if (hudImperial) hudImperial.textContent = level.imperial;
    if (hudLogmar) hudLogmar.textContent = level.logmar;
    if (hudDist) hudDist.textContent = state.distanceMeters.toFixed(1) + ' m';
    if (hudMode) {
      hudMode.textContent = state.displayMode === 'full'
        ? 'Full Line (' + level.count + ')'
        : 'Single (' + (state.singleIndex + 1) + '/' + level.count + ')';
    }
    if (hudMirrorText) hudMirrorText.textContent = state.mirror ? 'ON' : 'Off';

    document.body.classList.toggle('duochrome-active', state.duochrome);
    document.body.classList.toggle('mirror-active', state.mirror);

    if (row) {
      row.innerHTML = '';
      row.style.gap = sizePx.toFixed(2) + 'px';
      const items = state.displayMode === 'single'
        ? [state.currentSymbols[state.singleIndex]]
        : state.currentSymbols;

      items.forEach(function (sym) {
        row.appendChild(Optotypes.createOptotypeElement(state.chartType, sym, sizePx));
      });
    }
  }

  function renderCardMenu(container) {
    const cardsHTML = MENU_CARDS_12.map(function (card) {
      const isActiveChart = card.action === 'selectChart' && state.chartType === card.value;
      const cls = 'menu-card nav-card' + (isActiveChart ? ' is-active-chart' : '');
      return (
        '<button type="button" class="' + cls + '" data-action="' + card.action + '" data-value="' + card.value + '">' +
          '<span class="card-icon">' + card.icon + '</span>' +
          '<span class="card-title-bn">' + card.title + '</span>' +
          '<span class="card-sub-en">' + card.sub + '</span>' +
        '</button>'
      );
    }).join('');

    container.innerHTML =
      '<div class="menu-top-bar">' +
        '<div>' +
          '<h2>OptomBD Menu</h2>' +
          '<p>Select an option using remote or pointer</p>' +
        '</div>' +
        '<button type="button" id="btn-back-to-chart" class="nav-pill-btn primary">Chart ✕</button>' +
      '</div>' +
      '<div class="cards-grid-12">' + cardsHTML + '</div>';

    const closeBtn = document.getElementById('btn-back-to-chart');
    if (closeBtn) closeBtn.onclick = function () { setView('chart'); };

    const cards = Array.from(container.querySelectorAll('.nav-card'));
    if (state.menuFocusIndex >= cards.length) state.menuFocusIndex = 0;
    cards.forEach(function (card, idx) {
      card.classList.toggle('focused', idx === state.menuFocusIndex);
      card.onclick = function () {
        state.menuFocusIndex = idx;
        executeCardAction(card);
      };
    });
  }

  function renderSettingsPage(container) {
    const pxPerMm = (state.calBarPx / 100).toFixed(2);
    const alertClass = state.updateAvailable
      ? 'update-banner has-update'
      : (navigator.onLine ? 'update-banner' : 'update-banner is-offline');

    container.innerHTML =
      '<div class="subpage-card">' +
        '<div class="subpage-header">' +
          '<div>' +
            '<h2>Settings</h2>' +
            '<p>Mirror, Duochrome, Distance, 100mm Calibration & System Updates</p>' +
          '</div>' +
          '<button type="button" id="btn-set-back" class="nav-pill-btn primary">◄ Back to Menu</button>' +
        '</div>' +

        '<div class="settings-grid">' +
          '<div class="setting-box">' +
            '<div><h3>Mirror Mode</h3><p>Horizontal flip for mirror setup</p></div>' +
            '<button type="button" id="set-mirror" class="nav-pill-btn">' + (state.mirror ? 'ON' : 'OFF') + '</button>' +
          '</div>' +

          '<div class="setting-box">' +
            '<div><h3>Duochrome (Red / Green)</h3><p>Red-green background on all charts</p></div>' +
            '<button type="button" id="set-duo" class="nav-pill-btn">' + (state.duochrome ? 'ON' : 'OFF') + '</button>' +
          '</div>' +

          '<div class="setting-box">' +
            '<div><h3>Viewing Distance</h3><p>Patient test distance</p></div>' +
            '<button type="button" id="set-dist" class="nav-pill-btn">' + state.distanceMeters.toFixed(1) + ' m</button>' +
          '</div>' +

          '<div class="setting-box">' +
            '<div><h3>Presentation Mode</h3><p>Full line or single optotype</p></div>' +
            '<button type="button" id="set-mode" class="nav-pill-btn">' + (state.displayMode === 'full' ? 'Full Line' : 'Single') + '</button>' +
          '</div>' +
        '</div>' +

        '<div class="update-card ' + alertClass + '">' +
          '<div class="update-info">' +
            '<div class="update-version-row">' +
              '<span class="version-badge">Current Version: v' + CURRENT_APP_VERSION + '</span>' +
              '<span class="status-chip">' + state.updateStatus + '</span>' +
            '</div>' +
            '<p class="update-msg">' + state.updateMessage + '</p>' +
          '</div>' +
          '<button type="button" id="btn-check-update" class="nav-pill-btn primary" ' + (state.isCheckingUpdate ? 'disabled' : '') + '>' +
            (state.isCheckingUpdate ? 'Checking...' : 'Check for Updates') +
          '</button>' +
        '</div>' +

        '<div class="cal-page-body">' +
          '<div class="cal-controls-row">' +
            '<button type="button" id="btn-cal-minus" class="cal-step-btn">◄ -2 px</button>' +
            '<div class="cal-readout-pill">100mm Bar: ' + state.calBarPx + ' px (' + pxPerMm + ' px/mm)</div>' +
            '<button type="button" id="btn-cal-plus" class="cal-step-btn">+2 px ►</button>' +
          '</div>' +
          '<div class="cal-track">' +
            '<div id="calibration-bar" style="width: ' + state.calBarPx + 'px;">' +
              '<span>0 mm</span><span>100 mm</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-set-back').onclick = function () { setView('menu'); };
    document.getElementById('btn-check-update').onclick = checkForGitUpdates;

    document.getElementById('set-mirror').onclick = function () {
      state.mirror = !state.mirror;
      saveConfig();
      renderAll();
    };
    document.getElementById('set-duo').onclick = function () {
      state.duochrome = !state.duochrome;
      saveConfig();
      renderAll();
    };
    document.getElementById('set-dist').onclick = function () {
      const idx = DISTANCES.indexOf(state.distanceMeters);
      state.distanceMeters = DISTANCES[(idx + 1) % DISTANCES.length];
      saveConfig();
      renderAll();
    };
    document.getElementById('set-mode').onclick = function () {
      state.displayMode = state.displayMode === 'full' ? 'single' : 'full';
      state.singleIndex = 0;
      saveConfig();
      renderAll();
    };
    document.getElementById('btn-cal-minus').onclick = function () {
      state.calBarPx = Math.max(150, state.calBarPx - 2);
      saveConfig();
      renderAll();
    };
    document.getElementById('btn-cal-plus').onclick = function () {
      state.calBarPx = Math.min(1200, state.calBarPx + 2);
      saveConfig();
      renderAll();
    };
  }

  function renderExitConfirmPage(container) {
    container.innerHTML =
      '<div class="exit-modal-card">' +
        '<h3>Exit OptomBD Chart?</h3>' +
        '<p>Return to Menu or stay on the current chart?</p>' +
        '<div class="exit-actions">' +
          '<button type="button" id="btn-stay-chart" class="exit-stay-btn">Stay in Chart</button>' +
          '<button type="button" id="btn-confirm-exit" class="exit-confirm-btn">Go to Menu</button>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-stay-chart').onclick = function () { setView('chart'); };
    document.getElementById('btn-confirm-exit').onclick = function () { setView('menu'); };
  }

  function executeCardAction(card) {
    const action = card.getAttribute('data-action');
    const val = card.getAttribute('data-value');

    if (action === 'selectChart') {
      state.chartType = val;
      regenerateLine();
      saveConfig();
      setView('chart');
    } else if (action === 'openAnatomy') {
      setView('anatomy');
    } else if (action === 'openDiseases') {
      setView('diseases');
    } else if (action === 'openSettings') {
      setView('settings');
    } else if (action === 'openDeveloper') {
      setView('developer');
    } else if (action === 'openOurApps') {
      setView('ourApps');
    } else if (action === 'infoNotice') {
      alert('Ishihara color test plates will be added in a future update.');
    }
  }

  function setView(viewName) {
    state.activeView = viewName;
    renderAll();
  }

  function handleStepBack(e) {
    const subPages = ['settings', 'anatomy', 'diseases', 'developer', 'ourApps'];
    if (subPages.includes(state.activeView)) {
      if (e) e.preventDefault();
      setView('menu');
      return true;
    }
    if (state.activeView === 'menu') {
      if (e) e.preventDefault();
      setView('chart');
      return true;
    }
    if (state.activeView === 'chart') {
      if (e) e.preventDefault();
      setView('exitConfirm');
      return true;
    }
    if (state.activeView === 'exitConfirm') {
      if (e) e.preventDefault();
      setView('chart');
      return true;
    }
    return false;
  }

  function renderAll() {
    renderChartHUD();

    const overlay = document.getElementById('tv-menu-overlay');
    const container = document.getElementById('overlay-container');
    if (!overlay || !container) return;

    overlay.classList.toggle('anatomy-mode', state.activeView === 'anatomy');

    if (state.activeView === 'chart') {
      overlay.classList.add('hidden');
      return;
    }

    overlay.classList.remove('hidden');

    if (state.activeView === 'menu') {
      renderCardMenu(container);
    } else if (state.activeView === 'settings') {
      renderSettingsPage(container);
    } else if (state.activeView === 'anatomy') {
      AnatomyPage.render(container, function () { setView('menu'); });
    } else if (state.activeView === 'diseases') {
      CommonDiseasesPage.render(container, function () { setView('menu'); });
    } else if (state.activeView === 'developer') {
      DeveloperPage.render(container, function () { setView('menu'); });
    } else if (state.activeView === 'ourApps') {
      OurAppsPage.render(container, function () { setView('menu'); });
    } else if (state.activeView === 'exitConfirm') {
      renderExitConfirmPage(container);
    }
  }

  function goBigger() {
    if (state.acuityIndex > 0) {
      state.acuityIndex--;
      regenerateLine();
      renderAll();
    }
  }

  function goSmaller() {
    if (state.acuityIndex < Optotypes.ACUITY_LEVELS.length - 1) {
      state.acuityIndex++;
      regenerateLine();
      renderAll();
    }
  }

  function goNextRandom() {
    const level = Optotypes.ACUITY_LEVELS[state.acuityIndex];
    if (state.displayMode === 'single' && state.singleIndex < level.count - 1) {
      state.singleIndex++;
    } else {
      regenerateLine();
    }
    renderAll();
  }

  function goPrevRandom() {
    if (state.displayMode === 'single' && state.singleIndex > 0) {
      state.singleIndex--;
    } else {
      regenerateLine();
    }
    renderAll();
  }

  function bindEvents() {
    document.getElementById('btn-up').onclick = goBigger;
    document.getElementById('btn-down').onclick = goSmaller;
    document.getElementById('btn-left').onclick = goPrevRandom;
    document.getElementById('btn-right').onclick = goNextRandom;
    document.getElementById('btn-menu').onclick = function () { setView('menu'); };

    try {
      window.history.pushState({ optombd: true }, '');
      window.addEventListener('popstate', function () {
        window.history.pushState({ optombd: true }, '');
        handleStepBack(null);
      });
    } catch (e) {}

    document.addEventListener('keydown', function (e) {
      const key = e.key;
      const code = e.keyCode || e.which;

      const isUp = key === 'ArrowUp' || key === 'Up' || code === 19 || code === 38;
      const isDown = key === 'ArrowDown' || key === 'Down' || code === 20 || code === 40;
      const isLeft = key === 'ArrowLeft' || key === 'Left' || code === 21 || code === 37;
      const isRight = key === 'ArrowRight' || key === 'Right' || code === 22 || code === 39;
      const isEnter = key === 'Enter' || code === 23 || code === 66 || code === 13;
      const isBack = key === 'Escape' || key === 'Backspace' || code === 4;

      if (isBack) {
        handleStepBack(e);
        return;
      }

      if (isUp || isDown || isLeft || isRight || isEnter) {
        e.preventDefault();
      }

      if (state.activeView === 'exitConfirm') {
        if (isEnter) setView('chart');
        return;
      }

      if (state.activeView === 'chart') {
        if (isDown) goSmaller();
        else if (isUp) goBigger();
        else if (isRight) goNextRandom();
        else if (isLeft) goPrevRandom();
        else if (isEnter) setView('menu');
        return;
      }

      if (state.activeView === 'menu') {
        const cards = Array.from(document.querySelectorAll('#overlay-container .nav-card'));
        if (!cards.length) return;

        if (isRight || isDown) {
          state.menuFocusIndex = (state.menuFocusIndex + 1) % cards.length;
          renderAll();
        } else if (isLeft || isUp) {
          state.menuFocusIndex = (state.menuFocusIndex - 1 + cards.length) % cards.length;
          renderAll();
        } else if (isEnter) {
          executeCardAction(cards[state.menuFocusIndex]);
        }
        return;
      }

      if (state.activeView === 'anatomy') {
        const container = document.getElementById('overlay-container');
        if (isDown || isRight) {
          AnatomyPage.stepPart(1, container, function () { setView('menu'); });
        } else if (isUp || isLeft) {
          AnatomyPage.stepPart(-1, container, function () { setView('menu'); });
        } else if (isEnter) {
          setView('menu');
        }
      }
    });
  }

  loadSavedConfig();
  regenerateLine();
  bindEvents();
  renderAll();
})();