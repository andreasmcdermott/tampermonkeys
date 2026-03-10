// ==UserScript==
// @name         Gmail Keyboard Shortcuts
// @namespace    https://a.mcdrmtt.co
// @version      2025-03-11
// @description  Add better keyboard shortcuts for gmail.
// @author       Andreas McDermott
// @match        https://mail.google.com/mail/u/1/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const clickVisible = (btns) => {
        for (const btn of btns) {
            if (btn.offsetParent) {
                btn.click();
                break;
            }
        }
    }


    document.body.addEventListener('keydown', e => {
        if (e.key === 'd') {
            const buttons = document.body.querySelectorAll('tr [role="toolbar"] [data-tooltip="Delete"]');
            clickVisible([...buttons]);
        } else if (e.key === 'h') {
            const buttons = document.body.querySelectorAll('tr [role="toolbar"] [data-tooltip="Archive"]');
            clickVisible([...buttons]);
        }
    });

})();
