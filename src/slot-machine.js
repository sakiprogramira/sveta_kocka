/**
 *  Slot Machine Generator
 *  Create an extremely biased, web-based slot machine game.
 *
 *  Copyright 2020, Marc S. Brooks (https://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */

function SlotMachine(container, options) {
  const self = this;

  const STRIP_TOTAL = 24;

  const defaults = {
    reelHeight: 1320,
    reelWidth:  200,
    reels: [],
    rngFunc: function() {
      return Math.random();
    },
  };

  (function() {
    self.options = Object.assign(defaults, options);

    if (self.options.reels) {
      initReels();
    } else {
      throw new Error('Failed to initialize (missing reels)');
    }
  })();

  /**
   * Initialize slot reels.
   */
  function initReels() {
    const div = document.createElement('div');
    div.classList.add('reels');

    self.options.reels.forEach(reel => {
      const elm = createReelElm(reel, reel.items[0].position);

      div.appendChild(elm);

      reel['element'] = elm;
    });

    container.appendChild(div);
  }

  /**
   * Create reel elements (faux-panoramic animation).
   *
   * @param {Object} config
   *   Config options.
   *
   * @param {Number} startPos
   *   Start position.
   *
   * @return {Element}
   */
  function createReelElm(config, startPos = 0) {
    const stripHeight = getStripHeight();
    const stripWidth  = getStripWidth();

    const reelDiam = Math.trunc(
      Math.tan(90 / Math.PI - 15) * (stripHeight * 0.5) * 4
    );

    const marginTop = (reelDiam / 2) + (stripHeight / 2) * 4;

    const ul = document.createElement('ul');
    ul.style.height    = stripHeight + 'px';
    ul.style.marginTop = marginTop   + 'px';
    ul.style.width     = stripWidth  + 'px';
    ul.classList.add('reel');

    for (let i = 0; i < STRIP_TOTAL; i++) {
      const li = document.createElement('li');

      const imgPosY = -Math.abs((stripHeight * i) + startPos);
      const rotateX = (STRIP_TOTAL * 15) - (i * 15);

      // Position image per the strip angle/container radius.
      li.style.background = `url(${config.imageUrl}) 0px ${imgPosY}px`;
      li.style.height     = stripHeight + 'px';
      li.style.width      = stripWidth  + 'px';
      li.style.transform  = `rotateX(${rotateX}deg) translateZ(${reelDiam}px)`;

      ul.appendChild(li);
    }

    return ul;
  }

  /**
   * Select a random item by weight.
   *
   * @param {Array<Object>} items
   *   List of items.
   *
   * @return {Object}
   */
  function selectRandItem(items) {
    let totalWeight = 0;

    const itemTotal = items.length;

    for (let i = 0; i < itemTotal; i++) {
      const item   = items[i];
      const weight = item.weight;

      totalWeight += weight;
    }

    let randNum = getRandom() * totalWeight;

    for (let j = 0; j < itemTotal; j++) {
      const item   = items[j];
      const weight = item.weight;

      if (randNum < weight) {
        return item;
      }

     randNum -= weight;
    }
  }

  /**
   * Spin the reels and try your luck.
   */
  function play() {
    const stripHeight = getStripHeight();

    self.options.reels.forEach(reel => {
      const selected = selectRandItem(reel.items);

      // Start the rotation animation.
      const elm = reel.element;
      elm.classList.remove('stop');
      elm.classList.toggle('spin');

      // Shift images to select position.
      elm.childNodes.forEach((li, index) => {
        const imgPosY = -Math.abs((stripHeight * index) + selected.position);

        li.style.backgroundPositionY = imgPosY + 'px';
      });

      // Randomly stop rotation animation.
      const timer = window.setTimeout(() => {
        elm.classList.replace('spin', 'stop');

        self.isAnimating = false;

        window.clearTimeout(timer);
      }, 1000 * getRandomInt(1, 4));
    });
  }

  /**
   * Get random number between 0 (inclusive) and 1 (exclusive).
   *
   * @return {number}
   */
  function getRandom() {
    return self.options.rngFunc();
  }

  /**
   * Get random integer between two values.
   *
   * @param {Number} min
   *   Minimum value (default: 0).
   *
   * @param {Number} max
   *   Maximum value (default: 10).
   *
   * @return {Number}
   */
  function getRandomInt(min = 1, max = 10) {
    const minNum = Math.ceil(min);
    const maxNum = Math.floor(max);

    return Math.floor(getRandom() * (Math.floor(maxNum) - minNum)) + minNum;
  }

  /**
   * Calculate the strip height.
   *
   * @return {Number}
   */
  function getStripHeight() {
    return self.options.reelHeight / STRIP_TOTAL;
  }

  /**
   * Calculate the strip width.
   *
   * @return {Number}
   */
  function getStripWidth() {
    return self.options.reelWidth;
  }

  /**
   * Dispatch game actions.
   *
   * @param {Function} func
   *   Function to execute.
   */
  function dispatch(func) {
    if (!self.isAnimating) {
      self.isAnimating = true;

      func.call(self);
    }
  }

  /**
   * Protected members.
   */
  this.play = function() {
    dispatch(play);
  };
}

/**
 * Set global/exportable instance, where supported.
 */
window.slotMachine = function(container, options) {
  return new SlotMachine(container, options);
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SlotMachine;
}
