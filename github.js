// ==UserScript==
// @name         Github
// @namespace    https://a.mcdrmtt.co/
// @version      2025-12-05
// @description  Github Improvements
// @author       Andreas McDermott
// @match        https://github.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const debounce = (fn, ms) => {
    let timeoutId = 0;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), ms);
    }
  };

  const wait = (ms) => new Promise(resolve => { setTimeout(resolve, ms); });

  const action = async (el, fn, successString) => {
    const original = el.textContent;

    try {
      el.textContent = "...";
      await fn();
      el.textContent = successString;
    } catch {
      el.textContent = 'Failed!'
    }
    finally {
      await wait(1000);
      el.textContent = original;
    }
  }

  const addBranch = (row) => {
    const link = row.querySelector('.js-navigation-open');
    const url = link.getAttribute('href');
    const placement = link.nextSibling.nextSibling;

    const button = document.createElement('button');
    button.classList.add('amcd-copy-branch');
    button.textContent = 'Copy Branch';
    button.style = "border:none;font-size:10px;border-radius:4px;";

    button.addEventListener('click', (e) => {
      action(button, async () => {
        const res = await fetch(url);
        if (res.ok) {
          const html = await res.text();
          const [,branch] = /<clipboard-copy aria-label="Copy" data-copy-feedback="Copied!" value="([^"]+)" data-view-component="true" class=".*js-copy-branch.*">/i.exec(html) || [];
          if (branch) await navigator.clipboard.writeText(branch)
        }
      }, 'Copied!');
    });
    placement.after(button);
  };

  const updateListUI = debounce(() => {
    const rows = [...document.querySelectorAll('.js-issue-row')];

    for (const row of rows) {
      if (row.querySelector('.amcd-copy-branch')) continue;
      addBranch(row);
    }
  }, 250);

  const updatePageUI = debounce(() => {
    const tabList = document.querySelector('[aria-label="Pull request navigation tabs"]');
    const [,prId] = /\/pull\/(\d+)/.exec(location.href) || []

    if (prId && tabList) {
        const [urlPrefix] = location.href.split(prId);

        fetch(`${urlPrefix}${prId}`)
            .then((res) => res.text())
            .then((content) => {
                const [,previewUrl] = /href="(https:\/\/.+\.app\.(shortcut|korey)-staging\.(com|ai)\/?)"/.exec(content) || [];

                if (previewUrl) {
                    const hasPreview = document.querySelector('.amcd-preview-link');
                    if (!hasPreview) {
                        const link = document.createElement('a');
                        link.classList.add('amcd-preview-link');
                        link.setAttribute('href', previewUrl);
                        link.setAttribute('target', '_blank');
                        link.style = "float:right;"
                        link.textContent = 'Preview';
                        tabList.appendChild(link);
                    }
                }
            });
    }
  }, 250);

  const updateUI = () => {
      if (/\/pulls($|\/|\?)/.test(location.href)) updateListUI();
      else if (/pull\/\d+/.test(location.href)) updatePageUI();
  };

  const observer = new MutationObserver(updateUI);
  const node = document.getElementById('repo-content-turbo-frame');
  if (!node) return
  observer.observe(node, {subtree: true, childList: true});
})();
