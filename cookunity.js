// ==UserScript==
// @name         Cook Unity Ingredients
// @namespace    https://a.mcdrmtt.co
// @version      2026-02-02
// @description  Show a better ingredient list
// @author       Andreas McDermott
// @match        https://subscription.cookunity.com/products/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cookunity.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const debounce = (fn, ms) => {
        let timeoutId;

        return () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(fn, ms || 200);
        }
    };


    const runLogic = debounce(() => {
        const el = document.querySelector('.cui-meal-ingredients__text:not([data-amcd="true"])');
        if (el) {
            el.setAttribute('data-amcd', 'true');
const text = el.textContent;
            const blocks = text.split(/\|?\s?Contains \d+% or less of the following:/);
            let html = '';

            for (let block of blocks) {
              const list = block.split('|')
                                .map(t => t.trim()
                                           .replaceAll('(', '<span style="color:#aaa">(')
                                           .replaceAll(')',')</span>')
                                           .replaceAll(/(milk|cream|yoghurt|butter)/ig, '<strong>$1</strong>')
                                    )
                                .join('</li><li>');

                if (html.length) {
                  html += text.match(/Contains \d+% or less of the following:/)
                }

              html += `<ul><li>${list}</li></ul>`;
            }

            el.innerHTML = html;

        }
    });

    const observer = new MutationObserver(() => {
        runLogic();
    });

    observer.observe(document.getElementById('root'), {childList: true, subtree: true });
})();
