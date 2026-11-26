/**
 * OptomBD Module 1: Optotypes & Clinical Acuity Math
 * File: js/optotypes.js
 */

(function (window) {
  'use strict';

  const ACUITY_LEVELS = [
    { denom: 60, metric: '6/60', imperial: '20/200', logmar: '+1.00', count: 1 },
    { denom: 36, metric: '6/36', imperial: '20/120', logmar: '+0.78', count: 2 },
    { denom: 24, metric: '6/24', imperial: '20/80',  logmar: '+0.60', count: 3 },
    { denom: 18, metric: '6/18', imperial: '20/60',  logmar: '+0.48', count: 4 },
    { denom: 12, metric: '6/12', imperial: '20/40',  logmar: '+0.30', count: 5 },
    { denom: 9,  metric: '6/9',  imperial: '20/30',  logmar: '+0.18', count: 5 },
    { denom: 6,  metric: '6/6',  imperial: '20/20',  logmar: '0.00',  count: 5 },
    { denom: 5,  metric: '6/5',  imperial: '20/16',  logmar: '-0.08', count: 5 }
  ];

  const CHART_LABELS = {
    englishLetters: 'English Letters',
    numbers: 'English Numbers',
    banglaLetters: 'Bangla Letters',
    banglaNumbers: 'Bangla Numbers',
    tumblingE: 'Tumbling E',
    landoltC: 'Landolt C'
  };

  const ORIENTATIONS = [0, 90, 180, 270];
  const ENG_LETTERS = ['C', 'D', 'E', 'F', 'H', 'K', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Z'];
  const ENG_NUMBERS = ['2', '3', '4', '5', '6', '8', '9'];
  const BANGLA_LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'চ', 'জ', 'ট', 'ত', 'প', 'ম', 'ল', 'শ', 'হ'];
  const BANGLA_NUMBERS = ['১', '২', '৩', '৪', '৫', '৬', '৮', '৯'];

  const TAN_2_5_ARCMIN = Math.tan((2.5 / 60) * (Math.PI / 180));

  function calculateOptotypePx(denominator, distanceMeters, calBarPx) {
    const distanceMm = distanceMeters * 1000;
    const heightMm = 2 * distanceMm * TAN_2_5_ARCMIN * (denominator / 6);
    const pxPerMm = calBarPx / 100;
    return Math.max(4, heightMm * pxPerMm);
  }

  function createSVGElement(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
    return el;
  }

  function createOptotypeElement(chartType, symbolVal, sizePx) {
    if (chartType === 'tumblingE') {
      const svg = createSVGElement('svg', {
        viewBox: '0 0 5 5',
        width: sizePx.toFixed(2),
        height: sizePx.toFixed(2),
        class: 'optotype-svg'
      });
      svg.appendChild(createSVGElement('path', {
        d: 'M0,0 H5 V1 H1 V2 H5 V3 H1 V4 H5 V5 H0 Z',
        transform: 'rotate(' + symbolVal + ' 2.5 2.5)'
      }));
      return svg;
    }

    if (chartType === 'landoltC') {
      const svg = createSVGElement('svg', {
        viewBox: '0 0 5 5',
        width: sizePx.toFixed(2),
        height: sizePx.toFixed(2),
        class: 'optotype-svg'
      });
      const r = 2.0;
      const halfGap = Math.asin(0.5 / r);
      const x1 = (2.5 + r * Math.cos(halfGap)).toFixed(4);
      const y1 = (2.5 + r * Math.sin(halfGap)).toFixed(4);
      const x2 = (2.5 + r * Math.cos(-halfGap)).toFixed(4);
      const y2 = (2.5 + r * Math.sin(-halfGap)).toFixed(4);

      svg.appendChild(createSVGElement('path', {
        d: 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 1 1 ' + x2 + ' ' + y2,
        fill: 'none',
        stroke: '#0f172a',
        'stroke-width': '1',
        'stroke-linecap': 'butt',
        transform: 'rotate(' + symbolVal + ' 2.5 2.5)'
      }));
      return svg;
    }

    const span = document.createElement('span');
    span.className = 'optotype-text';
    span.textContent = symbolVal;
    span.style.fontSize = (sizePx * 1.12).toFixed(2) + 'px';
    span.style.lineHeight = '1';
    return span;
  }

  function getPool(chartType) {
    if (chartType === 'englishLetters') return ENG_LETTERS;
    if (chartType === 'numbers') return ENG_NUMBERS;
    if (chartType === 'banglaLetters') return BANGLA_LETTERS;
    if (chartType === 'banglaNumbers') return BANGLA_NUMBERS;
    return ORIENTATIONS;
  }

  function generateSymbolsForLine(chartType, count) {
    const pool = getPool(chartType);
    const list = [];
    let last = null;

    for (let i = 0; i < count; i++) {
      const choices = pool.filter(function (item) {
        return item !== last;
      });
      const pick = choices[Math.floor(Math.random() * choices.length)];
      list.push(pick);
      last = pick;
    }
    return list;
  }

  window.OptomBDOptotypes = {
    ACUITY_LEVELS: ACUITY_LEVELS,
    CHART_LABELS: CHART_LABELS,
    calculateOptotypePx: calculateOptotypePx,
    createOptotypeElement: createOptotypeElement,
    generateSymbolsForLine: generateSymbolsForLine
  };
})(window);