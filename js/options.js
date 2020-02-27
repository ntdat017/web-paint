/**
 * Copyright Liang Zhou
 * All rights reserved.
 */
!function() {
    var e = localStorage.getItem("config"), i = document.getElementsByTagName("input"), o = document.getElementById("save"), c = null;
    try {
        c = JSON.parse(e);
    } catch (e) {}
    function t(e) {
        for (var t, a, s = this.value.toUpperCase().replace(/([^0-9A-Z])/g, ""), l = 0; l < i.length; l++) {
            var n = i[l];
            n !== this && n.value === s && (s = "");
        }
        this.value = s, c.hotkeys && c.hotkeys[this.id] === this.value || (a = "hide", (t = o).className = t.className.replace(new RegExp("\\b" + a + "\\b", "g"), ""));
    }
    c = c || {};
    for (var a = 0; a < i.length; a++) {
        var s = i[a];
        s.addEventListener("keyup", t), s.addEventListener("focus", function() {
            this.select();
        }), c.hotkeys && c.hotkeys[s.id] && (s.value = c.hotkeys[s.id]);
    }
    o.addEventListener("click", function() {
        c.hotkeys = c.hotkeys || {};
        for (var e = 0; e < i.length; e++) {
            var t = i[e];
            t.value ? c.hotkeys[t.id] = t.value : delete c.hotkeys[t.id];
        }
        try {
            localStorage.setItem("config", JSON.stringify(c));
        } catch (e) {}
        var a, s;
        s = "hide", 0 <= (a = o).className.indexOf(s) || (a.className = a.className + " " + s);
    });
}();