/**
 * OptomBD Module 2: Full-Screen Black Anatomy & Optics Slide Viewer
 * File: js/anatomy.js
 * কাজ: ১৬টি অ্যানাটমি ও রিফ্র্যাক্টিভ এরর স্লাইড কালো ব্যাকগ্রাউন্ডে দেখায় এবং
 *      ছবির ডানপাশে স্থিরভাবে সাদা হরফে (#ffffff) অংশটির নাম প্রদর্শন করে।
 */

(function (window) {
  'use strict';

  // অ্যানাটমি ও অপটিক্স ছবির ফোল্ডার পাথ
  const IMAGE_BASE_PATH = 'assets/anatomy/';

  // ১৬টি স্লাইডের তালিকা:
  // id    = অভ্যন্তরীণ আইডি
  // label = ডানপাশে সাদা হরফে যে নামটি দেখাবে (যেমন Cornea, Retina)
  // file  = assets/anatomy/ ফোল্ডারের ভেতরের ছবির ফাইল নেম
  const SLIDES = [
    { id: 'eyeball',       label: 'Eyeball',       file: 'eyeball.png' },
    { id: 'eyelids',       label: 'Eyelids',       file: 'eyelids.png' },
    { id: 'cornea',        label: 'Cornea',        file: 'cornea.png' },
    { id: 'lens',          label: 'Lens',          file: 'lens.png' },
    { id: 'ciliaryBody',   label: 'Ciliary Body',  file: 'ciliary-body.png' },
    { id: 'vitreous',      label: 'Vitreous',      file: 'vitreous.png' },
    { id: 'retina',        label: 'Retina',        file: 'retina.png' },
    { id: 'choroid',       label: 'Choroid',       file: 'choroid.png' },
    { id: 'opticNerve',    label: 'Optic Nerve',   file: 'optic-nerve.png' },
    { id: 'emmetropia',    label: 'Emmetropia',    file: 'emmetropia.png' },
    { id: 'myopia',        label: 'Myopia',        file: 'myopia.png' },
    { id: 'hypermetropia', label: 'Hypermetropia', file: 'hypermetropia.png' },
    { id: 'astigmatism',   label: 'Astigmatism',   file: 'astigmatism.png' },
    { id: 'cataract',      label: 'Cataract',      file: 'cataract.png' },
    { id: 'keratoconus',   label: 'Keratoconus',   file: 'keratoconus.png' },
    { id: 'glaucoma',      label: 'Glaucoma',      file: 'glaucoma.png' }
  ];

  // বর্তমান স্লাইডের ইনডেক্স (০ থেকে শুরু, অর্থাৎ প্রথম স্লাইড Eyeball)
  let currentIndex = 0;

  /**
   * নির্দিষ্ট স্লাইডটি রেন্ডার করে:
   * - বাম/মাঝখানে মূল ছবি দেখায় (ডানপাশের লেখার জন্য জায়গা রেখে)
   * - ডানপাশে স্থির অবস্থানে সাদা হরফে (#ffffff) অংশের নাম ও স্লাইড নম্বর দেখায়
   * - নিচে বামদিকে Previous/Next এরো এবং মেনুতে ফেরার বাটন যুক্ত করে
   */
  function renderAnatomyPage(container, onBackToMenu) {
    const slide = SLIDES[currentIndex];
    const imgSrc = IMAGE_BASE_PATH + slide.file;

    container.innerHTML =
      '<div class="anatomy-pure-stage" style="position:relative; width:100%; height:100%; background:#000000; display:flex; align-items:center; justify-content:flex-start; padding:24px 280px 24px 36px; box-sizing:border-box; overflow:hidden;">' +
        // মেনুতে ফেরার বাটন
        '<button type="button" id="btn-anatomy-back" class="anatomy-floating-close" style="z-index:25;">Menu ✕</button>' +

        // ছবি প্রদর্শনের ক্যানভাস (ডানপাশের লেবেল প্যানেলের সাথে যেন ওভারল্যাপ না করে)
        '<div class="anatomy-image-canvas" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; z-index:5;">' +
          '<img id="anatomy-main-img" src="' + imgSrc + '" alt="' + slide.label + '" class="anatomy-full-img" style="max-height:80vh; max-width:100%; object-fit:contain; transition:none;" />' +
          '<div id="anatomy-img-fallback" class="anatomy-fallback hidden" style="color:#ffffff;">' +
            '<p><code>assets/anatomy/' + slide.file + '</code></p>' +
          '</div>' +
        '</div>' +

        // ছবির ডানপাশে স্থিরভাবে সাদা হরফে অংশের নাম দেখানোর প্যানেল
        '<aside id="anatomy-side-info" aria-live="polite" style="position:fixed; right:36px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; justify-content:center; gap:8px; width:220px; padding:14px 20px; border-left:3px solid rgba(255,255,255,0.45); background:rgba(0,0,0,0.65); z-index:20; pointer-events:none;">' +
          '<span style="color:rgba(255,255,255,0.75); font-size:1rem; letter-spacing:0.06em; text-transform:uppercase;">' +
            'Slide ' + (currentIndex + 1) + ' / ' + SLIDES.length +
          '</span>' +
          '<h2 id="anatomy-part-label" style="color:#ffffff; font-size:clamp(1.8rem, 3vw, 2.8rem); font-weight:700; margin:0; line-height:1.15;">' +
            slide.label +
          '</h2>' +
        '</aside>' +

        // নিচের বামদিকে আগের ও পরের স্লাইডে যাওয়ার এরো বাটন
        '<div class="anatomy-bottom-left-arrows" style="z-index:25;">' +
          '<button type="button" id="btn-anat-prev" class="anat-arrow-btn" title="Previous">◄</button>' +
          '<button type="button" id="btn-anat-next" class="anat-arrow-btn" title="Next">►</button>' +
        '</div>' +
      '</div>';

    // ছবি লোড হওয়া বা এরর হ্যান্ডলিং
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

    // Back, Previous এবং Next বাটনের ইভেন্ট যুক্ত করা
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

  /**
   * পরের (+1) বা আগের (-1) স্লাইডে গিয়ে অ্যানাটমি পেজ পুনরায় রেন্ডার করে।
   */
  function stepPart(dir, container, onBackToMenu) {
    currentIndex = (currentIndex + dir + SLIDES.length) % SLIDES.length;
    renderAnatomyPage(container, onBackToMenu);
  }

  // app.js থেকে ব্যবহারের জন্য পাবলিক API এক্সপোর্ট করা
  window.OptomBDAnatomy = {
    render: renderAnatomyPage,
    stepPart: stepPart
  };
})(window);