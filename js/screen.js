/**
 * Copyright Liang Zhou
 * All rights reserved.
 */
!function() {
    var e = "undefined" != typeof chrome ? chrome : "undefined" != typeof browser ? browser : void 0, i = new Image(), o = new Image(), d = document.getElementById("target"), t = document.createElement("canvas"), n = document.getElementById("download"), c = document.getElementById("print"), a = document.getElementById("crop"), r = document.getElementById("controls"), l = document.getElementById("cropControls"), h = document.getElementById("confirmControls"), u = document.getElementById("crop-back"), s = document.getElementById("crop-forward"), m = document.getElementById("crop-stop"), g = document.getElementById("confirm-crop"), v = document.getElementById("cancel-crop"), f = document.getElementById("instruction"), E = document.getElementById("boxclose"), w = document.getElementById("copyToClipboard"), p = d.getContext("2d"), y = [], I = 0, L = null, x = null, b = !1;
    function B(e, t) {
        0 <= e.className.indexOf(t) || (e.className = e.className + " " + t);
    }
    function k(e, t) {
        e.className = e.className.replace(new RegExp("\\b" + t + "\\b", "g"), "");
    }
    function M() {
        I = 0, x = L = null, b = !(y = []), o = new Image(), k(d, "crop"), B(l, "hide"), 
        B(h, "hide"), k(r, "hide"), d.removeEventListener("mousedown", D), d.removeEventListener("touchstart", D), 
        d.removeEventListener("mousemove", H), d.removeEventListener("touchmove", H), d.removeEventListener("mouseup", T), 
        d.removeEventListener("touchend", T);
        var e = i.naturalWidth, t = i.naturalHeight;
        d.width = e, d.height = t, p.drawImage(i, 0, 0);
    }
    function R() {
        p.clearRect(0, 0, d.width, d.height), p.drawImage(t, 0, 0);
    }
    function X() {
        t.width = d.width, t.height = d.height, t.getContext("2d").drawImage(d, 0, 0);
    }
    function Y(e, t) {
        var n = d.getBoundingClientRect();
        return {
            x: Math.round(e) - n.left * (d.width / n.width),
            y: Math.round(t) - n.top * (d.height / n.height)
        };
    }
    function C() {
        B(d, "crop"), k(l, "hide"), B(r, "hide"), I = 0, (y = []).push(d.toDataURL()), o.src = i.src, 
        X(), N(), d.addEventListener("mousedown", D), d.addEventListener("touchstart", D), 
        d.addEventListener("mousemove", H), d.addEventListener("touchmove", H), d.addEventListener("mouseup", T), 
        d.addEventListener("touchend", T), j();
    }
    function D(e) {
        e.preventDefault(), B(h, "hide"), R(), L = Y(void 0 === e.clientX ? e.touches[0].clientX : e.clientX, void 0 === e.clientY ? e.touches[0].clientY : e.clientY), 
        b = !0, N();
    }
    function N() {
        p.save(), p.globalAlpha = .5, p.fillStyle = "black", p.fillRect(0, 0, d.width, d.height), 
        p.restore();
    }
    function H(e) {
        e.preventDefault();
        var t = Y(void 0 === e.clientX ? e.touches[0].clientX : e.clientX, void 0 === e.clientY ? e.touches[0].clientY : e.clientY);
        if (b) {
            var n = Math.min(L.x, t.x), i = Math.max(L.x, t.x), c = Math.min(L.y, t.y), d = Math.max(L.y, t.y);
            R(), N(), p.save(), p.beginPath(), p.rect(n, c, i - n, d - c), p.clip(), p.drawImage(o, 0, 0), 
            p.restore();
        }
    }
    function T(e) {
        e.preventDefault();
        var t = void 0 === e.clientX ? e.changedTouches[0].clientX : e.clientX, n = void 0 === e.clientY ? e.changedTouches[0].clientY : e.clientY;
        x = Y(t, n), b = !1, h.style.top = n + "px", h.style.left = t + "px", k(h, "hide");
    }
    function U() {
        var e = Math.min(L.x, x.x), t = Math.max(L.x, x.x), n = Math.min(L.y, x.y), i = Math.max(L.y, x.y);
        B(h, "hide");
        var c = new Image();
        c.src = d.toDataURL(), c.onload = function() {
            p.clearRect(0, 0, d.width, d.height), d.width = t - e, d.height = i - n, p.drawImage(c, e, n, t - e, i - n, 0, 0, t - e, i - n), 
            X(), y.push(d.toDataURL()), I = y.length - 1, o.src = y[I], j();
        };
    }
    function W() {
        B(h, "hide"), R();
    }
    function j() {
        y.length && 0 !== I ? k(u, "disabled") : B(u, "disabled"), y.length && I !== y.length - 1 ? k(s, "disabled") : B(s, "disabled");
    }
    function A() {
        if (y.length && 0 !== I) {
            var e = y[--I], t = new Image();
            t.src = e, o.src = e, t.onload = function() {
                p.clearRect(0, 0, d.width, d.height), d.width = t.naturalWidth, d.height = t.naturalHeight, 
                p.drawImage(t, 0, 0), X();
            }, j();
        }
    }
    function O() {
        if (y.length && I !== y.length - 1) {
            var e = y[++I], t = new Image();
            t.src = e, o.src = e, t.onload = function() {
                p.clearRect(0, 0, d.width, d.height), d.width = t.naturalWidth, d.height = t.naturalHeight, 
                p.drawImage(t, 0, 0), X();
            }, j();
        }
    }
    function P() {
        i.src === y[I] ? M() : i.src = y[I];
    }
    i.addEventListener("load", M, !1), e.runtime.onMessage.addListener(function(e, t, n) {
        "update_url" === e.method && (i.src = e.url, n({
            success: !0
        }));
    }), n.addEventListener("click", function() {
        var e = document.createElement("a");
        e.download = "screenshot.jpg", e.href = i.src, document.body.appendChild(e), e.click(), 
        document.body.removeChild(e);
    }), c.addEventListener("click", function() {
        window.print();
    }), w.addEventListener("click", function() {
        B(f, "visible");
    }), E.addEventListener("click", function() {
        k(f, "visible");
    }), a.addEventListener("click", C), g.addEventListener("click", U), v.addEventListener("click", W), 
    u.addEventListener("click", A), s.addEventListener("click", O), m.addEventListener("click", P);
}();