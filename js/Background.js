/**
 * Copyright Liang Zhou
 * All rights reserved.
 */
var global = "undefined" != typeof chrome ? chrome : "undefined" != typeof browser ? browser : void 0, NP = {
    init: function() {
        global.browserAction.onClicked.addListener(this.inject), global.runtime.onMessage.addListener(function(e, t, n) {
            if ("take_screen_shot" === e.method) NP.screenShot(n); else if ("get_pixel_color" === e.method) {
                var a = e.point;
                NP.getPixelColor(a, n);
            } else "save_data" === e.method ? NP.saveData(e.config) : "get_data" === e.method ? NP.getData(n) : "open_options" === e.method && chrome.runtime.openOptionsPage();
            return !0;
        });
    },
    getPixelColor: function(r, c) {
        global.tabs.captureVisibleTab(null, null, function(e) {
            var o = document.createElement("canvas"), i = o.getContext("2d"), l = new Image();
            document.documentElement.appendChild(o), l.src = e, l.onload = function() {
                o.width = l.naturalWidth, o.height = l.naturalHeight, i.drawImage(l, 0, 0);
                var e = i.getImageData(0, 0, o.width, o.height), t = 4 * (r.y * e.width + r.x), n = e.data;
                if ("function" == typeof c) {
                    var a = {
                        r: n[t],
                        g: n[t + 1],
                        b: n[t + 2],
                        a: n[t + 3]
                    };
                    document.documentElement.removeChild(o), c(a);
                }
            };
        });
    },
    saveData: function(e) {
        try {
            localStorage.setItem("config", JSON.stringify(e));
        } catch (e) {}
    },
    getData: function(e) {
        var t = localStorage.getItem("config"), n = null;
        try {
            n = JSON.parse(t);
        } catch (e) {}
        e(n);
    },
    inject: function() {
        global.tabs.insertCSS(null, {
            file: "/css/main.min.css"
        }, function() {
            if (global.extension.lastError) {
                global.extension.lastError.message;
                try {
                    alert("We are sorry, but the page you are viewing is not supported. Please try another page.");
                } catch (e) {}
            }
            global.tabs.executeScript(null, {
                file: "/js/inject.js"
            });
        });
    },
    screenShot: function(i) {
        global.tabs.captureVisibleTab(function(a) {
            var o = global.extension.getURL("screen.html");
            global.tabs.query({}, function(e) {
                var t;
                if (e && e.length) for (var n = e.length - 1; 0 <= n; n--) if (e[n].url === o) {
                    t = e[n];
                    break;
                }
                t ? global.tabs.update(t.id, {
                    active: !0
                }, Function.prototype.bind.call(NP.updateScreenshot, NP, a, i, 0)) : global.tabs.create({
                    url: o
                }, Function.prototype.bind.call(NP.updateScreenshot, NP, a, i, 0));
            });
        });
    },
    updateScreenshot: function(t, n) {
        var a = arguments[2];
        null == a && (a = 0), 10 < a || global.runtime.sendMessage({
            method: "update_url",
            url: t
        }, function(e) {
            e && e.success || window.setTimeout(Function.prototype.bind.call(NP.updateScreenshot, NP, t, n, ++a), 300);
        });
    }
};

NP.init();