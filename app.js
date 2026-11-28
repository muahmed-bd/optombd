/**
 * OptomBD Main Controller
 * File: app.js
 * কাজ: ভিশন চার্ট, মেনু, ইশিহারা টেস্ট, সেটিংস, আপডেট চেক এবং রিমোট/কীবোর্ড নেভিগেশন নিয়ন্ত্রণ করে।
 */

(function () {
  'use strict';

  // অন্যান্য মডিউল ফাইল থেকে আসা অবজেক্ট রেফারেন্স
  const Optotypes = window.OptomBDOptotypes;
  const AnatomyPage = window.OptomBDAnatomy;
  const CommonDiseasesPage = window.OptomBDCommonDiseases;
  const OurAppsPage = window.OptomBDOurApps;
  const DeveloperPage = window.OptomBDDeveloper;

  // চার্ট দেখার সম্ভাব্য দূরত্ব (মিটারে) ও লোকাল স্টোরেজ কী
  const DISTANCES = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0];
  const STORAGE_KEY = 'optombd_config_v3';

  // অ্যাপের বর্তমান ভার্সন এবং GitHub-এর version.json URL
  const CURRENT_APP_VERSION = '2.0.0';
  const REMOTE_VERSION_URL = 'https://raw.githubusercontent.com/muahmed-bd/optombd/main/version.json';

  // মেইন মেনুর ১২টি কার্ডের তালিকা (action অনুযায়ী নির্দিষ্ট ভিউ বা চার্ট খোলে)
  const MENU_CARDS_12 = [
    { action: 'selectChart',  value: 'englishLetters', icon: 'ABC',  title: 'English Letters',  sub: 'Acuity Chart' },
    { action: 'selectChart',  value: 'numbers',        icon: '123',  title: 'English Numbers',  sub: 'Acuity Chart' },
    { action: 'selectChart',  value: 'banglaLetters',  icon: 'কখগ', title: 'Bangla Letters',   sub: 'Acuity Chart' },
    { action: 'selectChart',  value: 'banglaNumbers',  icon: '১২৩', title: 'Bangla Numbers',   sub: 'Acuity Chart' },
    { action: 'selectChart',  value: 'tumblingE',      icon: 'E',    title: 'Tumbling E',       sub: 'Acuity Chart' },
    { action: 'selectChart',  value: 'landoltC',       icon: 'C',    title: 'Landolt C',        sub: 'Acuity Chart' },
    { action: 'openIshihara', value: 'ishihara',       icon: '🔴🟢', title: 'Ishihara',         sub: 'Color Test' },
    { action: 'openAnatomy',  value: '',               icon: '👁️',   title: 'Anatomy',          sub: 'Ocular Slides' },
    { action: 'openDiseases', value: '',               icon: '🩺',   title: 'Common Diseases',  sub: 'Clinical Notes' },
    { action: 'openSettings', value: '',               icon: '⚙️',   title: 'Settings',         sub: 'Calibration & Mirror' },
    { action: 'openDeveloper',value: '',               icon: '👨‍⚕️', title: 'About',            sub: 'Developer Info' },
    { action: 'openOurApps',  value: '',               icon: '📱',   title: 'Our Apps',         sub: 'More Apps' }
  ];

  // অ্যাপের চলমান অবস্থা (চার্ট টাইপ, মিরর, ডুওক্রোম, দূরত্ব, ক্যালিব্রেশন, ভিউ ও আপডেট তথ্য)
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

  // =========================================================================
  // সেকশন: ISHIHARA COLOR VISION TEST (আন্তর্জাতিক সিরিয়াল + সহজ স্ক্রিনিং)
  // =========================================================================

  // আন্তর্জাতিক প্রথম ১২টি প্লেটের স্ট্যান্ডার্ড রেফারেন্স তালিকা
  // normal: স্বাভাবিক দৃষ্টিতে প্রত্যাশিত সংখ্যা
  // deficiency: রেড-গ্রিন ডেফিসিয়েন্সিতে সাধারণত যে ভিন্ন সংখ্যা বা অস্পষ্টতা দেখা যায়
  // screeningTip: পরীক্ষকের জন্য সংক্ষিপ্ত ক্লিনিক্যাল নোট
  const ISHIHARA_PLATES = [
    { plateNo: 1,  title: 'Plate 01 (Demo)', img: 'assets/ishihara/plate-01.jpg', normal: '12', deficiency: '12 (সবাই সাধারণত স্পষ্ট দেখে)', screeningTip: 'ডেমো প্লেট: স্বাভাবিক ও কালার ডেফিসিয়েন্সি—উভয় ক্ষেত্রেই ১২ দেখা যায়।' },
    { plateNo: 2,  title: 'Plate 02',        img: 'assets/ishihara/plate-02.jpg', normal: '8',  deficiency: '3', screeningTip: 'রেড-গ্রিন ডেফিসিয়েন্সিতে ৮-এর বদলে ৩ দেখা যেতে পারে।' },
    { plateNo: 3,  title: 'Plate 03',        img: 'assets/ishihara/plate-03.jpg', normal: '29', deficiency: '70', screeningTip: 'স্বাভাবিক দৃষ্টিতে ২৯ এবং ডেফিসিয়েন্সিতে অনেক সময় ৭০ দেখা যায়।' },
    { plateNo: 4,  title: 'Plate 04',        img: 'assets/ishihara/plate-04.jpg', normal: '5',  deficiency: '2', screeningTip: 'স্বাভাবিক দৃষ্টিতে ৫ এবং ডেফিসিয়েন্সিতে ২ দেখা যেতে পারে।' },
    { plateNo: 5,  title: 'Plate 05',        img: 'assets/ishihara/plate-05.jpg', normal: '3',  deficiency: '5', screeningTip: 'স্বাভাবিক দৃষ্টিতে ৩ এবং ডেফিসিয়েন্সিতে ৫ মনে হতে পারে।' },
    { plateNo: 6,  title: 'Plate 06',        img: 'assets/ishihara/plate-06.jpg', normal: '15', deficiency: '17', screeningTip: 'স্বাভাবিক দৃষ্টিতে ১৫ এবং ডেফিসিয়েন্সিতে ১৭ দেখা যেতে পারে।' },
    { plateNo: 7,  title: 'Plate 07',        img: 'assets/ishihara/plate-07.jpg', normal: '74', deficiency: '21', screeningTip: 'স্বাভাবিক দৃষ্টিতে ৭৪ এবং ডেফিসিয়েন্সিতে ২১ দেখা যেতে পারে।' },
    { plateNo: 8,  title: 'Plate 08',        img: 'assets/ishihara/plate-08.jpg', normal: '6',  deficiency: 'অস্পষ্ট / দেখা যায় না', screeningTip: 'স্বাভাবিক দৃষ্টিতে ৬ স্পষ্ট; ডেফিসিয়েন্সিতে পড়া কঠিন হয়।' },
    { plateNo: 9,  title: 'Plate 09',        img: 'assets/ishihara/plate-09.jpg', normal: '45', deficiency: 'অস্পষ্ট / দেখা যায় না', screeningTip: 'স্বাভাবিক দৃষ্টিতে ৪৫ দেখা যায়; ডেফিসিয়েন্সিতে অস্পষ্ট হতে পারে।' },
    { plateNo: 10, title: 'Plate 10',        img: 'assets/ishihara/plate-10.jpg', normal: '5',  deficiency: 'অস্পষ্ট / দেখা যায় না', screeningTip: 'স্বাভাবিক দৃষ্টিতে ৫ দেখা যায়; ডেফিসিয়েন্সিতে মিশে যেতে পারে।' },
    { plateNo: 11, title: 'Plate 11',        img: 'assets/ishihara/plate-11.jpg', normal: '7',  deficiency: 'অস্পষ্ট / দেখা যায় না', screeningTip: 'স্বাভাবিক দৃষ্টিতে ৭ দেখা যায়; ডেফিসিয়েন্সিতে অনুপস্থিত মনে হতে পারে।' },
    { plateNo: 12, title: 'Plate 12',        img: 'assets/ishihara/plate-12.jpg', normal: '16', deficiency: 'অস্পষ্ট / দেখা যায় না', screeningTip: 'স্বাভাবিক দৃষ্টিতে ১৬ দেখা যায়; ডেফিসিয়েন্সিতে চেনা কঠিন হয়।' }
  ];

  // বর্তমান প্লেটের ইনডেক্স, Key দেখানোর ফ্ল্যাগ এবং প্রতিটি প্লেটের স্ক্রিনিং মার্ক ('normal' | 'deficiency' | null)
  let ishiharaIndex = 0;
  let showIshiharaKey = false;
  let ishiharaMarks = new Array(ISHIHARA_PLATES.length).fill(null);

  // স্ক্রিনিং মার্কগুলোর ওপর ভিত্তি করে সহজ ও নিরাপদ একটি সারসংক্ষেপ তৈরি করে
  function getIshiharaScreeningSummary() {
    // Plate 01 ডেমো প্লেট; তাই Plate 02 থেকে Plate 12 পর্যন্ত মার্ক গণনা করা হয়
    const diagnosticMarks = ishiharaMarks.slice(1);
    const defCount = diagnosticMarks.filter(function (m) { return m === 'deficiency'; }).length;
    const normCount = diagnosticMarks.filter(function (m) { return m === 'normal'; }).length;

    if (defCount === 0 && normCount === 0) {
      return 'স্ক্রিনিং নোট: প্লেটগুলো দেখে Normal বা Deficiency মার্ক করলে এখানে সারসংক্ষেপ দেখাবে।';
    }
    if (defCount >= 3) {
      return 'স্ক্রিনিং ফলাফল (' + defCount + '/11 প্লেটে Deficiency মার্ক): Red-Green Color Vision Deficiency-এর সম্ভাবনা নির্দেশ করে (Protan/Deutan উপধরন যাচাইয়ের জন্য বিস্তারিত মূল্যায়ন প্রয়োজন)।';
    }
    if (defCount > 0) {
      return 'স্ক্রিনিং ফলাফল (' + defCount + '/11 প্লেটে Deficiency মার্ক): আংশিক বা সীমিত কালার ভিশন পার্থক্য পরিলক্ষিত হয়েছে; আলো ও দূরত্ব নিশ্চিত করে পুনরায় যাচাই করুন।';
    }
    return 'স্ক্রিনিং ফলাফল (' + normCount + '/11 প্লেটে Normal মার্ক): এখন পর্যন্ত স্বাভাবিক (Normal) কালার ভিশন রেসপন্স পাওয়া গেছে।';
  }

  // ইশিহারা পেজ রেন্ডার করে (২০ ফিট দূরত্বের বড় ছবি, Key রেফারেন্স ও সহজ স্ক্রিনিং মার্কসহ)
  function renderIshiharaPage(container) {
    const plate = ISHIHARA_PLATES[ishiharaIndex];
    const currentMark = ishiharaMarks[ishiharaIndex];
    const summaryText = getIshiharaScreeningSummary();

    container.innerHTML =
      '<div class="subpage-card" style="max-width:1280px; width:96%; margin:0 auto;">' +
        // হেডার: শিরোনাম, প্লেট নম্বর ও মেনুতে ফেরার বাটন
        '<div class="subpage-header">' +
          '<div>' +
            '<h2 style="font-size:1.8rem;">Ishihara Color Vision Test</h2>' +
            '<p style="font-size:1.15rem;">' + plate.title + ' — Plate ' + (ishiharaIndex + 1) + ' of ' + ISHIHARA_PLATES.length + '</p>' +
          '</div>' +
          '<button type="button" id="btn-ishihara-back" class="nav-pill-btn primary" style="font-size:1.1rem; padding:12px 20px;">◄ Back to Menu</button>' +
        '</div>' +

        // মূল অংশ: বড় ইশিহারা প্লেট ছবি, স্ক্রিনিং মার্ক বাটন ও Key প্যানেল
        '<div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding:10px 0;">' +
          '<div style="background:#fff; padding:18px; border-radius:16px; display:flex; justify-content:center; align-items:center; box-shadow:0 8px 24px rgba(0,0,0,0.25);">' +
            '<img id="ishihara-img" src="' + plate.img + '" alt="' + plate.title + '" style="height:68vh; max-height:700px; width:auto; max-width:92vw; object-fit:contain; border-radius:12px;" />' +
          '</div>' +

          // এই প্লেটের জন্য Normal বা Deficiency মার্ক করার সহজ বাটন
          '<div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; align-items:center;">' +
            '<button type="button" id="btn-mark-normal" class="nav-pill-btn" style="font-size:1.05rem; padding:10px 18px; ' + (currentMark === 'normal' ? 'outline:3px solid #22c55e;' : '') + '">Mark: Normal</button>' +
            '<button type="button" id="btn-mark-def" class="nav-pill-btn" style="font-size:1.05rem; padding:10px 18px; ' + (currentMark === 'deficiency' ? 'outline:3px solid #ef4444;' : '') + '">Mark: Deficiency</button>' +
            '<button type="button" id="btn-mark-reset" class="nav-pill-btn" style="font-size:1.05rem; padding:10px 18px;">Clear All</button>' +
          '</div>' +

          // Show Key চালু থাকলে স্বাভাবিক/ডেফিসিয়েন্সি রেফারেন্স ও সারসংক্ষেপ দেখাবে
          (showIshiharaKey
            ? '<div class="update-card" style="width:100%; max-width:900px; text-align:left; font-size:1.1rem; line-height:1.55;">' +
                '<div><strong>Normal Vision:</strong> ' + plate.normal + '</div>' +
                '<div><strong>Color Deficiency:</strong> ' + plate.deficiency + '</div>' +
                '<div style="margin-top:6px; opacity:0.92;">' + plate.screeningTip + '</div>' +
                '<div style="margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.18);"><strong>' + summaryText + '</strong></div>' +
              '</div>'
            : '<div class="update-card" style="width:100%; max-width:900px; text-align:left; font-size:1.05rem; line-height:1.45;">' +
                '<div>' + summaryText + '</div>' +
              '</div>') +

          // প্লেট বদলানো ও Key টগল করার বড় বাটনসমূহ
          '<div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">' +
            '<button type="button" id="btn-ishihara-prev" class="nav-pill-btn" style="font-size:1.25rem; padding:14px 26px;">◄ Previous</button>' +
            '<button type="button" id="btn-ishihara-key" class="nav-pill-btn" style="font-size:1.25rem; padding:14px 26px;">' + (showIshiharaKey ? 'Hide Key' : 'Show Key') + '</button>' +
            '<button type="button" id="btn-ishihara-next" class="nav-pill-btn primary" style="font-size:1.25rem; padding:14px 26px;">Next ►</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ছবি লোড হতে ব্যর্থ হলে ফলব্যাক বার্তা দেখায়
    const imgEl = document.getElementById('ishihara-img');
    if (imgEl) {
      imgEl.onerror = function () {
        this.alt = 'Image not found: ' + plate.img;
      };
    }

    // নেভিগেশন ও Key বাটনের ইভেন্ট
    document.getElementById('btn-ishihara-back').onclick = function () { setView('menu'); };
    document.getElementById('btn-ishihara-prev').onclick = function () {
      ishiharaIndex = (ishiharaIndex - 1 + ISHIHARA_PLATES.length) % ISHIHARA_PLATES.length;
      renderAll();
    };
    document.getElementById('btn-ishihara-next').onclick = function () {
      ishiharaIndex = (ishiharaIndex + 1) % ISHIHARA_PLATES.length;
      renderAll();
    };
    document.getElementById('btn-ishihara-key').onclick = function () {
      showIshiharaKey = !showIshiharaKey;
      renderAll();
    };

    // স্ক্রিনিং মার্ক বাটনগুলোর ইভেন্ট
    document.getElementById('btn-mark-normal').onclick = function () {
      ishiharaMarks[ishiharaIndex] = 'normal';
      renderAll();
    };
    document.getElementById('btn-mark-def').onclick = function () {
      ishiharaMarks[ishiharaIndex] = 'deficiency';
      renderAll();
    };
    document.getElementById('btn-mark-reset').onclick = function () {
      ishiharaMarks = new Array(ISHIHARA_PLATES.length).fill(null);
      renderAll();
    };
  }
  
  // =========================================================================
  // সেকশন: REMOTE UPDATE & VERSION MANAGEMENT (GitHub + AndroidUpdater)
  // =========================================================================

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

  // দুটি ভার্সন নম্বর (যেমন 2.0.0 ও 2.0.1) তুলনা করে
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

  // নেটিভ আপডেটার বা GitHub version.json থেকে নতুন আপডেট যাচাই করে
  function checkForGitUpdates() {
    if (state.isCheckingUpdate) return;

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

  // =========================================================================
  // সেকশন: CONFIG STORAGE & VISUAL ACUITY CHART RENDERING
  // =========================================================================

  // লোকাল স্টোরেজ থেকে সেভ করা সেটিংস লোড করে
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

  // বর্তমান সেটিংস লোকাল স্টোরেজে সংরক্ষণ করে
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

  // বর্তমান অ্যাকিউটি লেভেল অনুযায়ী নতুন সিম্বল লাইন তৈরি করে
  function regenerateLine() {
    const level = Optotypes.ACUITY_LEVELS[state.acuityIndex];
    state.currentSymbols = Optotypes.generateSymbolsForLine(state.chartType, level.count);
    state.singleIndex = 0;
  }

  // চার্টের HUD তথ্য ও অপটোটাইপ সিম্বলগুলো স্ক্রিনে আঁকে
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

  // =========================================================================
  // সেকশন: MENU, SETTINGS & EXIT CONFIRM RENDERERS
  // =========================================================================

  // ১২টি কার্ডের মেইন মেনু রেন্ডার করে
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

  // সেটিংস পেজ (Mirror, Duochrome, Distance, Mode, Update, 100mm Calibration) রেন্ডার করে
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

  // চার্ট থেকে বের হওয়ার কনফার্মেশন ভিউ রেন্ডার করে
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

  // =========================================================================
  // সেকশন: VIEW SWITCHING, STEP BACK & MASTER RENDER
  // =========================================================================

  // মেনু কার্ডে ক্লিক বা Enter চাপলে নির্দিষ্ট চার্ট বা পেজ খোলে
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
    } else if (action === 'openIshihara') {
      setView('ishihara');
    }
  }

  // সক্রিয় ভিউ পরিবর্তন করে পুরো স্ক্রিন আপডেট করে
  function setView(viewName) {
    state.activeView = viewName;
    renderAll();
  }

  // ব্যাক বাটন চাপলে ধাপে ধাপে আগের ভিউতে নিয়ে যায়
  function handleStepBack(e) {
    const subPages = ['settings', 'anatomy', 'diseases', 'ishihara', 'developer', 'ourApps'];
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

  // চার্ট HUD এবং বর্তমান ভিউ অনুযায়ী ওভারলে কন্টেইনার রেন্ডার করে
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
    } else if (state.activeView === 'ishihara') {
      renderIshiharaPage(container);
    }
  }

  // =========================================================================
  // সেকশন: CHART CONTROLS & KEYBOARD / TV REMOTE EVENT BINDING
  // =========================================================================

  // চার্টের অক্ষর/সিম্বল বড় করে (acuityIndex কমায়)
  function goBigger() {
    if (state.acuityIndex > 0) {
      state.acuityIndex--;
      regenerateLine();
      renderAll();
    }
  }

  // চার্টের অক্ষর/সিম্বল ছোট করে (acuityIndex বাড়ায়)
  function goSmaller() {
    if (state.acuityIndex < Optotypes.ACUITY_LEVELS.length - 1) {
      state.acuityIndex++;
      regenerateLine();
      renderAll();
    }
  }

  // পরবর্তী সিম্বল বা নতুন র‍্যান্ডম লাইন দেখায়
  function goNextRandom() {
    const level = Optotypes.ACUITY_LEVELS[state.acuityIndex];
    if (state.displayMode === 'single' && state.singleIndex < level.count - 1) {
      state.singleIndex++;
    } else {
      regenerateLine();
    }
    renderAll();
  }

  // আগের সিম্বল বা নতুন র‍্যান্ডম লাইন দেখায়
  function goPrevRandom() {
    if (state.displayMode === 'single' && state.singleIndex > 0) {
      state.singleIndex--;
    } else {
      regenerateLine();
    }
    renderAll();
  }

  // অন-স্ক্রিন বাটন, হিস্ট্রি ব্যাক এবং কীবোর্ড/টিভি রিমোট keydown ইভেন্ট যুক্ত করে
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

      // রিমোট বা কীবোর্ডের ডিরেকশন, ওকে/এন্টার এবং ব্যাক বাটন শনাক্তকরণ
      const isUp = key === 'ArrowUp' || key === 'Up' || code === 19 || code === 38;
      const isDown = key === 'ArrowDown' || key === 'Down' || code === 20 || code === 40;
      const isLeft = key === 'ArrowLeft' || key === 'Left' || code === 21 || code === 37;
      const isRight = key === 'ArrowRight' || key === 'Right' || code === 22 || code === 39;
      const isEnter = key === 'Enter' || code === 23 || code === 66 || code === 13;
      const isBack = key === 'Escape' || key === 'Backspace' || code === 4;

      // ব্যাক বাটন চাপলে আগের ধাপে বা কনফার্মেশনে যাবে
      if (isBack) {
        handleStepBack(e);
        return;
      }

      // এরো ও এন্টার চাপলে পেজ স্ক্রল হওয়া আটকাবে
      if (isUp || isDown || isLeft || isRight || isEnter) {
        e.preventDefault();
      }

      // ---------------------------------------------------------------------
      // ভিউ ১: EXIT CONFIRM — Enter চাপলে চার্টে ফিরবে
      // ---------------------------------------------------------------------
      if (state.activeView === 'exitConfirm') {
        if (isEnter) {
          setView('chart');
        }
        return;
      }

      // ---------------------------------------------------------------------
      // ভিউ ২: CHART — Up/Down সাইজ, Left/Right সিম্বল, Enter মেনু
      // ---------------------------------------------------------------------
      if (state.activeView === 'chart') {
        if (isDown) goSmaller();
        else if (isUp) goBigger();
        else if (isRight) goNextRandom();
        else if (isLeft) goPrevRandom();
        else if (isEnter) setView('menu');
        return;
      }

      // ---------------------------------------------------------------------
      // ভিউ ৩: MENU — Left/Right পাশাপাশি, Up/Down উপর-নিচের সারিতে, Enter খোলে
      // ---------------------------------------------------------------------
      if (state.activeView === 'menu') {
        const cards = Array.from(document.querySelectorAll('#overlay-container .nav-card'));
        if (!cards.length) return;

        // গ্রিডের প্রথম সারিতে কয়টি কার্ড আছে তা বের করা হচ্ছে
        const gridEl = document.querySelector('#overlay-container .cards-grid-12');
        let cols = 4;
        if (gridEl && cards.length > 1) {
          const firstTop = cards[0].getBoundingClientRect().top;
          let rowCount = 0;
          for (let i = 0; i < cards.length; i++) {
            if (Math.abs(cards[i].getBoundingClientRect().top - firstTop) < 5) {
              rowCount++;
            } else {
              break;
            }
          }
          if (rowCount > 0) cols = rowCount;
        }

        if (isRight) {
          state.menuFocusIndex = (state.menuFocusIndex + 1) % cards.length;
          renderAll();
        } else if (isLeft) {
          state.menuFocusIndex = (state.menuFocusIndex - 1 + cards.length) % cards.length;
          renderAll();
        } else if (isDown) {
          const nextIdx = state.menuFocusIndex + cols;
          state.menuFocusIndex = nextIdx < cards.length ? nextIdx : state.menuFocusIndex % cols;
          renderAll();
        } else if (isUp) {
          const prevIdx = state.menuFocusIndex - cols;
          if (prevIdx >= 0) {
            state.menuFocusIndex = prevIdx;
          } else {
            const colPos = state.menuFocusIndex % cols;
            const lastRowStart = Math.floor((cards.length - 1) / cols) * cols;
            state.menuFocusIndex = Math.min(lastRowStart + colPos, cards.length - 1);
          }
          renderAll();
        } else if (isEnter) {
          executeCardAction(cards[state.menuFocusIndex]);
        }
        return;
      }

      // ---------------------------------------------------------------------
      // ভিউ ৪: SETTINGS — এরো দিয়ে বাটনে ফোকাস ঘোরানো ও Enter দিয়ে ক্লিক
      // ---------------------------------------------------------------------
      if (state.activeView === 'settings') {
        const focusables = Array.from(
          document.querySelectorAll('#overlay-container button:not([disabled])')
        );
        if (!focusables.length) return;

        let currentIdx = focusables.indexOf(document.activeElement);
        if (currentIdx === -1) currentIdx = 0;

        if (isRight || isDown) {
          const nextIdx = (currentIdx + 1) % focusables.length;
          focusables[nextIdx].focus();
        } else if (isLeft || isUp) {
          const prevIdx = (currentIdx - 1 + focusables.length) % focusables.length;
          focusables[prevIdx].focus();
        } else if (isEnter) {
          focusables[currentIdx].click();
        }
        return;
      }

      // ---------------------------------------------------------------------
      // ভিউ ৫: ANATOMY — Up/Down ও Left/Right দিয়ে পার্ট বদল, Enter মেনুতে ফেরা
      // ---------------------------------------------------------------------
      if (state.activeView === 'anatomy') {
        const container = document.getElementById('overlay-container');
        if (isDown || isRight) {
          AnatomyPage.stepPart(1, container, function () { setView('menu'); });
        } else if (isUp || isLeft) {
          AnatomyPage.stepPart(-1, container, function () { setView('menu'); });
        } else if (isEnter) {
          setView('menu');
        }
        return;
      }

      // ---------------------------------------------------------------------
      // ভিউ ৬: ISHIHARA — Left/Right প্লেট বদল, Up/Down Key টগল, Enter মেনুতে ফেরা
      // ---------------------------------------------------------------------
      if (state.activeView === 'ishihara') {
        if (isRight) {
          ishiharaIndex = (ishiharaIndex + 1) % ISHIHARA_PLATES.length;
          renderAll();
        } else if (isLeft) {
          ishiharaIndex = (ishiharaIndex - 1 + ISHIHARA_PLATES.length) % ISHIHARA_PLATES.length;
          renderAll();
        } else if (isUp || isDown) {
          showIshiharaKey = !showIshiharaKey;
          renderAll();
        } else if (isEnter) {
          setView('menu');
        }
      }
    });
  }

  // অ্যাপ চালু হওয়ার প্রাথমিক ধাপসমূহ
  loadSavedConfig();
  regenerateLine();
  bindEvents();
  renderAll();
})();