// ==UserScript==
// @name            Themescript UserScript
// @description     Loads themescript and desired plugin
// @include         https://plug.dj/*
// @exclude         https://plug.dj/dashboard
// @exclude         https://plug.dj/privacy
// @exclude         https://plug.dj/terms
// @exclude         https://plug.dj/_/*
// @exclude         https://plug.dj/@/*
// @exclude         https://plug.dj/ba
// @exclude         https://plug.dj/plot
// @exclude         https://plug.dj/about
// @exclude         https://plug.dj/team
// @exclude         https://plug.dj/jobs
// @exclude         https://plug.dj/partners
// @exclude         https://plug.dj/press
// ==/UserScript==

(function(){
    var a = function(){
        if (!document.getElementsByClassName('loading-box').length) setTimeout(a,200);
        else b();
    },
    b = function(){
        if (document.getElementsByClassName('loading-box').length) setTimeout(b,200);
        else {
            var c = document.createElement('script');
            c.src = "https://wizzikz.github.io/themescript_tp.js";
            document.head.appendChild(c);
        }
    };
    a();
})();