/**
 * Copyright Liang Zhou
 * All rights reserved.
 */
window.TextCursor || (window.TextCursor = function(t, e) {
    this.fillStyle = t || "rgba(0, 0, 0, 0.7)", this.width = e || 2, this.left = 0, 
    this.top = 0;
}, window.TextCursor.prototype = {
    getHeight: function(t) {
        var e = t.measureText("W").width;
        return e + e / 6;
    },
    createPath: function(t) {
        t.beginPath(), t.rect(this.left, this.top, this.width, this.getHeight(t));
    },
    draw: function(t, e, i) {
        t.save(), this.left = e, this.top = i - this.getHeight(t), this.createPath(t), t.lineWidth = 1, 
        t.fillStyle = this.fillStyle, t.fill(), t.restore();
    },
    erase: function(t) {
        window.NOTEPAD.restoreCanvas([ this.left - 1, this.top, this.width + 2, this.getHeight(t) ]);
    }
}), window.TextLine || (window.TextLine = function(t, e) {
    this.text = "", this.left = t, this.bottom = e, this.caret = 0;
}, window.TextLine.prototype = {
    insert: function(t) {
        var e = this.text.slice(0, this.caret), i = this.text.slice(this.caret);
        e += t, this.text = e, this.text += i, this.caret += t.length;
    },
    getCaretX: function(t) {
        var e = this.text.substring(0, this.caret), i = t.measureText(e).width;
        return this.left + i;
    },
    removeCharacterBeforeCaret: function() {
        0 !== this.caret && (this.text = this.text.substring(0, this.caret - 1) + this.text.substring(this.caret), 
        this.caret--);
    },
    removeLastCharacter: function() {
        this.text = this.text.slice(0, -1);
    },
    getWidth: function(t) {
        return t.measureText(this.text).width;
    },
    getHeight: function(t) {
        var e = t.measureText("W").width;
        return e + e / 6;
    },
    draw: function(t) {
        t.save(), t.textAlign = "start", t.textBaseline = "bottom", t.lineWidth = 1, t.strokeText(this.text, this.left, this.bottom), 
        t.fillText(this.text, this.left, this.bottom), t.restore();
    },
    erase: function(t) {
        window.NOTEPAD.restoreCanvas();
    }
}), window.Paragraph || (window.Paragraph = function(t, e, i, n, s) {
    this.context = t, this.drawingSurface = n, this.left = e, this.top = i, this.lines = [], 
    this.activeLine = void 0, this.cursor = s, this.blinkingInterval = void 0;
}, window.Paragraph.prototype = {
    clearIntervals: function(t) {
        this.blinkingInterval = window.clearInterval(this.blinkingInterval), this.blinkingTimeout = window.clearTimeout(this.blinkingTimeout), 
        this.cursor.erase(this.context, this.drawingSurface), "function" != typeof t || this.blinkingInterval ? this.blinkingInterval && this.clearIntervals(t) : t();
    },
    isPointInside: function(t) {
        var e = this.context;
        return e.beginPath(), e.rect(this.left, this.top, this.getWidth(), this.getHeight()), 
        e.isPointInPath(t.x, t.y);
    },
    getHeight: function() {
        var e = 0;
        return this.lines.forEach(Function.prototype.bind.call(function(t) {
            e += t.getHeight(this.context);
        }, this)), e;
    },
    getWidth: function() {
        var e = 0, i = 0;
        return this.lines.forEach(Function.prototype.bind.call(function(t) {
            e = t.getWidth(this.context), i < e && (i = e);
        }, this)), i;
    },
    draw: function() {
        this.lines.forEach(Function.prototype.bind.call(function(t) {
            t.draw(this.context);
        }, this));
    },
    erase: function(t) {
        window.NOTEPAD.restoreCanvas();
    },
    addLine: function(t) {
        this.lines.push(t), this.activeLine = t, this.moveCursor(t.left, t.bottom);
    },
    insert: function(t) {
        this.erase(this.context, this.drawingSurface), this.activeLine.insert(t);
        var e = this.activeLine.text.substring(0, this.activeLine.caret), i = this.context.measureText(e).width;
        this.moveCursor(this.activeLine.left + i, this.activeLine.bottom), this.draw(this.context);
    },
    blinkCursor: function(t, e) {
        var i = this;
        this.blinkingInterval && (this.blinkingInterval = window.clearInterval(this.blinkingInterval)), 
        this.blinkingInterval = setInterval(function(t) {
            var e = window.NOTEPAD.drawOptions[window.NOTEPAD.selectedDrawOption];
            e && "text" === e.type ? (i.cursor.erase(i.context, i.drawingSurface), i.blinkingTimeout && (i.blinkingTimeout = window.clearTimeout(i.blinkingTimeout)), 
            i.blinkingTimeout = setTimeout(function(t) {
                i.cursor.draw(i.context, i.cursor.left, i.cursor.top + i.cursor.getHeight(i.context));
            }, 200)) : i.blinkingInterval = window.clearInterval(i.blinkingInterval);
        }, 900);
    },
    moveCursorCloseTo: function(t, e) {
        var i = this.getLine(e);
        i && (i.caret = this.getColumn(i, t), this.activeLine = i, this.moveCursor(i.getCaretX(this.context), i.bottom));
    },
    moveCursor: function(t, e) {
        this.cursor.erase(this.context, this.drawingSurface), this.cursor.draw(this.context, t, e), 
        this.blinkingInterval || this.blinkCursor(t, e);
    },
    moveLinesDown: function(t) {
        for (var e = t; e < this.lines.length; ++e) {
            var i = this.lines[e];
            i.bottom += i.getHeight(this.context);
        }
    },
    newline: function() {
        var t, e, i = this.activeLine.text.substring(0, this.activeLine.caret), n = this.activeLine.text.substring(this.activeLine.caret), s = this.context.measureText("W").width + this.context.measureText("W").width / 6, o = this.activeLine.bottom + s;
        this.erase(this.context, this.drawingSurface), this.activeLine.text = i, (e = new TextLine(this.activeLine.left, o)).insert(n), 
        t = this.lines.indexOf(this.activeLine), this.lines.splice(t + 1, 0, e), this.activeLine = e, 
        this.activeLine.caret = 0;
        for (var a = (t = this.lines.indexOf(this.activeLine)) + 1; a < this.lines.length; ++a) (e = this.lines[a]).bottom += s;
        this.draw(), this.cursor.draw(this.context, this.activeLine.left, this.activeLine.bottom);
    },
    getLine: function(t) {
        for (var e, i = 0; i < this.lines.length; ++i) if (t > (e = this.lines[i]).bottom - e.getHeight(this.context) && t < e.bottom) return e;
    },
    getColumn: function(t, e) {
        var i, n, s, o, a = !1;
        for ((s = new TextLine(t.left, t.bottom)).insert(t.text); !a && 0 < s.text.length; ) i = s.left + s.getWidth(this.context), 
        s.removeLastCharacter(), (n = s.left + s.getWidth(this.context)) < e && (o = (e - n < i - e ? n : i) === i ? s.text.length + 1 : s.text.length, 
        a = !0);
        return o;
    },
    activeLineIsOutOfText: function() {
        return 0 === this.activeLine.text.length;
    },
    activeLineIsTopLine: function() {
        return this.lines[0] === this.activeLine;
    },
    moveUpOneLine: function() {
        var t, e;
        t = "" + this.activeLine.text;
        var i = this.lines.indexOf(this.activeLine);
        this.activeLine = this.lines[i - 1], this.activeLine.caret = this.activeLine.text.length, 
        this.lines.splice(i, 1), this.moveCursor(this.activeLine.left + this.activeLine.getWidth(this.context), this.activeLine.bottom), 
        this.activeLine.text += t;
        for (var n = i; n < this.lines.length; ++n) (e = this.lines[n]).bottom -= e.getHeight(this.context);
    },
    backspace: function() {
        var t, e;
        this.context.save(), 0 === this.activeLine.caret ? this.activeLineIsTopLine() || (this.erase(this.context, this.drawingSurface), 
        this.moveUpOneLine(), this.draw()) : (this.erase(this.context, this.drawingSurface), 
        this.activeLine.removeCharacterBeforeCaret(), t = this.activeLine.text.slice(0, this.activeLine.caret), 
        e = this.context.measureText(t).width, this.moveCursor(this.activeLine.left + e, this.activeLine.bottom), 
        this.draw(this.context), this.context.restore());
    }
}), Function.prototype.bind || (Function.prototype.bind = function(t) {
    if ("function" != typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    var e = Array.prototype.slice.call(arguments, 1), i = this, n = function() {}, s = function() {
        return i.apply(this instanceof n && t ? this : t, e.concat(Array.prototype.slice.call(arguments)));
    };
    return n.prototype = this.prototype, s.prototype = new n(), s;
});

var getCSSAnimationManager = function() {
    for (var t, e, i, n = !1, s = [ "webkit", "Moz", "O", "" ], o = s.length, a = document.documentElement.style; o--; ) if (s[o]) {
        if (void 0 !== a[s[o] + "AnimationName"]) {
            switch (t = s[o], o) {
              case 0:
                e = t.toLowerCase() + "AnimationStart", i = t.toLowerCase() + "AnimationEnd", n = !0;
                break;

              case 1:
                e = "animationstart", i = "animationend", n = !0;
                break;

              case 2:
                e = t.toLowerCase() + "animationstart", i = t.toLowerCase() + "animationend", n = !0;
            }
            break;
        }
    } else if (void 0 !== a.animationName) {
        t = s[o], e = "animationstart", i = "animationend", n = !0;
        break;
    }
    return {
        supported: n,
        prefix: t,
        start: e,
        end: i
    };
};

!function(t, e) {
    "undefined" != typeof unsafeWindow && null !== unsafeWindow ? unsafeWindow.CTRL_HIDDEN ? t.NOTEPAD.showControlPanel() : unsafeWindow.NOTEPAD_INIT || (t.NOTEPAD = e(t), 
    t.NOTEPAD.init()) : (void 0 !== t.NOTEPAD && null !== t.NOTEPAD || (t.NOTEPAD = e(t)), 
    t.NOTEPAD.controlPanelHidden ? t.NOTEPAD.showControlPanel() : t.NOTEPAD.initialized || t.NOTEPAD.init());
}("undefined" != typeof window ? window : this, function(v) {
    var t = function() {
        this.MAX_ITEMS = 50, this.currentIndex = 0, this.array = [];
    };
    t.prototype.add = function(t) {
        if (this.currentIndex < this.array.length - 1 ? (this.array[++this.currentIndex] = t, 
        this.array = this.array.slice(0, this.currentIndex + 1)) : (this.array.push(t), 
        this.currentIndex = this.array.length - 1), this.array.length > this.MAX_ITEMS) {
            var e = this.array.length - this.MAX_ITEMS;
            this.array = this.array.splice(-this.MAX_ITEMS), this.currentIndex = this.currentIndex - e;
        }
    }, t.prototype.previous = function() {
        return 0 === this.currentIndex ? null : this.array[--this.currentIndex];
    }, t.prototype.next = function() {
        return this.currentIndex === this.array.length - 1 ? null : this.array[++this.currentIndex];
    }, t.prototype.hasPrevious = function() {
        return 0 < this.currentIndex;
    }, t.prototype.hasNext = function() {
        return this.currentIndex < this.array.length - 1;
    };
    var g = "undefined" != typeof chrome ? chrome : "undefined" != typeof browser ? browser : void 0, e = {
        canvas: null,
        context: null,
        buffer: null,
        initialized: !1,
        controlPanelHidden: !1,
        persistTimer: null,
        history: null,
        config: {},
        drawOptions: [ {
            type: "pen",
            title: "Pencil - draw a custom line"
        }, {
            type: "eyedropper",
            title: "Color picker - pick a color from the web page or your drawings and use it for drawing"
        }, {
            type: "text",
            font: "Arial",
            minSize: 15,
            maxSize: 50,
            title: "Text - insert text"
        }, {
            type: "line",
            title: "Line - draw a straight line"
        }, {
            type: "quadratic_curve",
            title: "Quadratic curve - draw a quadratic curve",
            iteration: 0,
            initLoc: null,
            lastLoc: null
        }, {
            type: "bezier_curve",
            title: "Bezier curve - draw a bezier curve",
            iteration: 0,
            initLoc: null,
            firstPoint: null,
            lastPoint: null
        }, {
            type: "polygon",
            title: "Polygon - draw a polygon",
            initLoc: null,
            lastLoc: null
        }, {
            type: "circle",
            title: "Ellipse - draw an ellipse or a circle"
        }, {
            type: "rectangle",
            title: "Rectangle - draw a rectangle or a square"
        }, {
            type: "cursor",
            title: "Cursor - interact with the web page"
        }, {
            type: "eraser",
            title: "Eraser - erase part of your drawings",
            width: 30,
            height: 30
        }, {
            type: "fill",
            title: "Paint Bucket - fill an area"
        } ],
        selectedDrawOption: null,
        selectedColorOption: null,
        selectedAlphaOption: null,
        mousedown: !1,
        lastMouseDownLoc: null,
        drawingSurfaceImageData: null,
        resizeTimeoutID: null,
        cursor: new TextCursor(),
        paragraph: null,
        panel: null,
        browser: {
            isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
        },
        createCanvas: function() {
            this.canvas = v.document.createElement("canvas"), this.context = this.canvas.getContext("2d"), 
            this.canvas.setAttribute("id", "NOTEPAD"), this.browser.isChrome || (this.buffer = document.createElement("canvas")), 
            v.document.body.appendChild(this.canvas), v.addEventListener("resize", this.resizeBinded), 
            v.addEventListener("scroll", this.resizeBinded);
            var t = localStorage.getItem("WP_CRX_STORAGE_SNAPSHOT_" + v.location.pathname);
            if (t) {
                var e = new Image();
                e.onload = Function.prototype.bind.call(this.initCanvas, this, e), e.src = t;
            } else this.initCanvas();
        },
        initCanvas: function(t) {
            t ? (this.handleResize(!0), this.context.drawImage(t, 0, 0), this.storeCanvas(!0)) : this.handleResize(), 
            this.storeHistory();
        },
        checkHistoryButtonStatus: function() {
            this.nextBtn && this.backBtn && (this.history.hasNext() ? this.removeClass(this.nextBtn, "disabled") : this.addClass(this.nextBtn, "disabled"), 
            this.history.hasPrevious() ? this.removeClass(this.backBtn, "disabled") : this.addClass(this.backBtn, "disabled"));
        },
        storeHistory: function() {
            this.history.add(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)), 
            this.checkHistoryButtonStatus();
        },
        handleBackButtonClick: function() {
            this.history.hasPrevious() && (this.finishLastDrawing(), this.context.putImageData(this.history.previous(), 0, 0), 
            this.storeCanvas(), this.checkHistoryButtonStatus());
        },
        handleForwardButtonClick: function() {
            this.history.hasNext() && (this.finishLastDrawing(), this.context.putImageData(this.history.next(), 0, 0), 
            this.storeCanvas(), this.checkHistoryButtonStatus());
        },
        persistLocalStorage: function() {
            var e = this.canvas.toDataURL();
            try {
                v.localStorage.setItem("WP_CRX_STORAGE_SNAPSHOT_" + v.location.pathname, e);
            } catch (t) {
                try {
                    v.localStorage.clear(), v.localStorage.setItem("WP_CRX_STORAGE_SNAPSHOT_" + v.location.pathname, e);
                } catch (t) {}
            }
        },
        storeCanvas: function(t) {
            this.browser.isChrome ? this.buffer = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height) : (this.buffer.width = this.canvas.width, 
            this.buffer.height = this.canvas.height, this.buffer.getContext("2d").drawImage(this.canvas, 0, 0)), 
            t || (this.persistTimer && (this.persistTimer = v.clearInterval(this.persistTimer)), 
            this.persistTimer = v.setTimeout(this.persistLocalStorageBinded, 500));
        },
        restoreCanvas: function(t) {
            t ? (this.context.clearRect.apply(this.context, t), this.browser.isChrome ? (t.unshift(this.buffer, 0, 0), 
            this.context.putImageData.apply(this.context, t)) : (t.unshift(this.buffer), this.context.drawImage.apply(this.context, t))) : (this.context.clearRect(0, 0, this.canvas.width, this.canvas.height), 
            this.browser.isChrome ? this.context.putImageData(this.buffer, 0, 0) : this.context.drawImage(this.buffer, 0, 0));
        },
        handlePanelAppearing: function(t) {
            t.target.style.opacity = 1;
        },
        handleResize: function(t) {
            var e = !1, i = v.pageYOffset || document.documentElement.scrollTop, n = (v.innerHeight || document.documentElement.clientHeight, 
            this.context.lineWidth), s = Math.max(document.documentElement.clientWidth, document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth), o = Math.max(document.documentElement.clientHeight, document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight), a = Math.min(o - this.canvas.offsetTop, 5e3);
            5e3 < i - this.canvas.offsetTop ? (a = Math.min(o - i, 5e3), this.canvas.style.top = i + "px", 
            e = !0) : i < this.canvas.offsetTop && (a = 5e3, this.canvas.style.top = Math.max(0, 5e3 * Math.floor(i / 5e3)) + "px", 
            e = !0), e ? (this.context.clearRect(0, 0, this.canvas.width, this.canvas.height), 
            this.paragraph && (this.paragraph.clearIntervals(), this.paragraph = null), this.storeCanvas(!0)) : this.storeCanvas(t), 
            this.canvas.width = s, this.canvas.height = a, e || this.restoreCanvas(), this.updatePaintStyle(), 
            this.context.lineWidth = n;
        },
        createControlPanel: function() {
            this.panel = v.document.createElement("div"), this.backBtn = v.document.createElement("div"), 
            this.nextBtn = v.document.createElement("div");
            var t = v.document.createElement("div"), e = v.document.createElement("div"), i = v.document.createElement("div"), n = v.document.createElement("div"), s = v.document.createElement("div");
            this.panel.setAttribute("id", "NOTEPAD_controls"), t.setAttribute("class", "NOTEPAD_controls_draw"), 
            e.setAttribute("class", "NOTEPAD_controls_color"), i.setAttribute("class", "NOTEPAD_controls_control"), 
            n.setAttribute("class", "NOTEPAD_controls_range alpha_control"), s.setAttribute("class", "NOTEPAD_controls_range size_control"), 
            v.document.body.appendChild(this.panel), this.panel.appendChild(t), this.panel.appendChild(e), 
            this.panel.appendChild(n), this.panel.appendChild(s), this.panel.appendChild(i);
            for (var o = 0; o < this.drawOptions.length; o++) {
                var a = this.drawOptions[o], r = v.document.createElement("div");
                r.setAttribute("class", "NOTEPAD_controls_draw_option"), r.setAttribute("title", a.title), 
                this.addClass(r, a.type), r.addEventListener("click", Function.prototype.bind.call(this.onControlPanelClick, this, o)), 
                t.appendChild(r), (null !== this.config.tool && void 0 !== this.config.tool || 0 !== o) && o !== this.config.tool || this.triggerClick(r);
            }
            this.colorPicker = v.document.createElement("input"), this.colorPicker.setAttribute("type", "color"), 
            this.colorPicker.value = this.config.color || "#000000", this.colorPicker.setAttribute("title", "Select a color"), 
            this.colorPicker.addEventListener("change", Function.prototype.bind.call(this.onColorPanelClick, this), !1), 
            e.appendChild(this.colorPicker), this.alphaPicker = v.document.createElement("input"), 
            this.alphaPicker.setAttribute("type", "range"), this.alphaPicker.setAttribute("min", "0"), 
            this.alphaPicker.setAttribute("max", "1"), this.alphaPicker.setAttribute("step", "0.01"), 
            this.alphaPicker.value = null !== this.config.alpha && void 0 !== this.config.alpha ? this.config.alpha : 1, 
            this.alphaPicker.setAttribute("title", "Select transparency"), this.alphaPicker.addEventListener("change", Function.prototype.bind.call(this.onAlphaChange, this), !1), 
            this.alphaPicker.addEventListener("input", Function.prototype.bind.call(this.onAlphaUpdate, this), !1), 
            this.alphaPickerPreview = v.document.createElement("p"), n.appendChild(this.alphaPicker), 
            n.appendChild(this.alphaPickerPreview);
            var h = v.document.createElement("input");
            h.setAttribute("type", "range"), h.setAttribute("min", "1"), h.setAttribute("max", "20"), 
            h.setAttribute("step", "1"), h.value = this.config.thickness || 1, h.setAttribute("title", "Select line width"), 
            h.addEventListener("change", Function.prototype.bind.call(this.onLineChange, this), !1), 
            h.addEventListener("input", Function.prototype.bind.call(this.onLineUpdate, this), !1), 
            this.linePickerPreview = v.document.createElement("p"), s.appendChild(h), s.appendChild(this.linePickerPreview), 
            this.selectedColorOption = this.hexToRgb(this.colorPicker.value), this.selectedAlphaOption = this.alphaPicker.value, 
            this.context.lineWidth = h.value, this.alphaPickerPreview.innerHTML = Math.round(100 * this.selectedAlphaOption) + "%", 
            this.linePickerPreview.innerHTML = Math.round(this.context.lineWidth / 20 * 100) + "%", 
            this.updatePaintStyle();
            var c = v.document.createElement("div"), l = v.document.createElement("div"), d = v.document.createElement("div"), u = v.document.createElement("div"), p = v.document.createElement("div");
            c.setAttribute("class", "NOTEPAD_controls_control_option prtBtn"), c.setAttribute("title", "Take a screenshot of the current web page with your drawings"), 
            l.setAttribute("class", "NOTEPAD_controls_control_option exitBtn"), l.setAttribute("title", "Quit"), 
            this.backBtn.setAttribute("class", "NOTEPAD_controls_control_option backBtn"), this.backBtn.setAttribute("title", "Step backward"), 
            this.nextBtn.setAttribute("class", "NOTEPAD_controls_control_option nextBtn"), this.nextBtn.setAttribute("title", "Step forward"), 
            d.setAttribute("class", "NOTEPAD_controls_control_option eraseAllBtn"), d.setAttribute("title", "Erase all"), 
            u.setAttribute("class", "NOTEPAD_controls_control_option hideCtrlBtn"), u.setAttribute("title", "Close control panel (Click the extension icon to re-open)"), 
            p.setAttribute("class", "settingsBtn"), p.setAttribute("title", "Settings"), c.addEventListener("click", Function.prototype.bind.call(this.onPrintButtonClick, this)), 
            l.addEventListener("click", Function.prototype.bind.call(this.exit, this)), this.backBtn.addEventListener("click", Function.prototype.bind.call(this.handleBackButtonClick, this)), 
            this.nextBtn.addEventListener("click", Function.prototype.bind.call(this.handleForwardButtonClick, this)), 
            d.addEventListener("click", Function.prototype.bind.call(this.eraseAll, this)), 
            u.addEventListener("click", Function.prototype.bind.call(this.hideControlPanel, this)), 
            p.addEventListener("click", function() {
                g.runtime.sendMessage({
                    method: "open_options"
                });
            }), i.appendChild(this.backBtn), i.appendChild(this.nextBtn), i.appendChild(d), 
            i.appendChild(c), i.appendChild(u), i.appendChild(l), i.appendChild(p), this.checkHistoryButtonStatus(), 
            this.CSSAnimationManager.supported ? this.panel.addEventListener(this.CSSAnimationManager.end, Function.prototype.bind.call(this.handlePanelAppearing, this), !1) : this.panel.style.opacity = 1;
        },
        finishLastDrawing: function() {
            var t = this.drawOptions[this.selectedDrawOption];
            t && "polygon" === t.type && t.lastLoc && t.initLoc ? (this.context.beginPath(), 
            this.context.moveTo(t.lastLoc.x, t.lastLoc.y), this.context.lineTo(t.initLoc.x, t.initLoc.y), 
            this.context.stroke(), this.context.closePath(), this.mousedown = !1, t.initLoc = null, 
            t.lastLoc = null, this.storeCanvas(), this.storeHistory()) : t && "quadratic_curve" === t.type && 0 !== t.iteration ? (this.context.closePath(), 
            this.storeCanvas(), this.storeHistory(), this.mousedown = !1, t.iteration = 0, t.initLoc = null, 
            t.lastLoc = null) : t && "bezier_curve" === t.type && 0 !== t.iteration ? (this.context.closePath(), 
            this.storeCanvas(), this.storeHistory(), this.mousedown = !1, t.iteration = 0, t.initLoc = null, 
            t.firstPoint = null, t.lastPoint = null) : "eyedropper" !== t && !0 === this.mousedown && (this.mousedown = !1, 
            this.storeCanvas(), this.storeHistory()), this.paragraph && this.paragraph.clearIntervals(Function.prototype.bind.call(function() {
                this.paragraph = null, this.storeCanvas(), this.storeHistory();
            }, this));
        },
        setColor: function(t) {
            t && (this.colorPicker.value = this.rgbToHex(t.r, t.g, t.b), this.selectedColorOption = {
                r: t.r,
                g: t.g,
                b: t.b
            }, this.alphaPicker.value = t.a / 255, this.selectedAlphaOption = this.alphaPicker.value, 
            this.alphaPickerPreview && (this.alphaPickerPreview.innerHTML = Math.round(100 * this.selectedAlphaOption) + "%"), 
            this.updatePaintStyle(), this.config.color === this.colorPicker.value && this.config.alpha === this.selectedAlphaOption || (this.config.color = this.colorPicker.value, 
            this.config.alpha = this.selectedAlphaOption, this.saveData()));
        },
        getColorOfCurrentPixel: function(t) {
            g.runtime.sendMessage({
                method: "get_pixel_color",
                point: t
            }, this.setColorBinded);
        },
        onPrintButtonClick: function() {
            this.addClass(this.panel, "hide"), v.setTimeout(function() {
                g.runtime.sendMessage({
                    method: "take_screen_shot"
                });
            }, 100), v.setTimeout(Function.prototype.bind.call(function() {
                this.removeClass(this.panel, "hide");
            }, this), 500);
        },
        onControlPanelClick: function(t, e) {
            if (this.selectedDrawOption !== t) {
                var i = v.document.querySelectorAll("#NOTEPAD_controls .NOTEPAD_controls_draw_option");
                this.finishLastDrawing();
                for (var n = 0; n < i.length; n++) this.removeClass(i[n], "selected");
                this.addClass(i[t], "selected"), this.removeClass(this.canvas, "pen"), this.removeClass(this.canvas, "cross"), 
                this.removeClass(this.canvas, "eraser"), this.removeClass(this.canvas, "text"), 
                this.removeClass(this.canvas, "cursor"), this.removeClass(this.canvas, "eyedropper"), 
                this.removeClass(this.canvas, "fill"), this.selectedDrawOption = t;
                var s = this.drawOptions[this.selectedDrawOption];
                "pen" === s.type ? this.addClass(this.canvas, "pen") : "eraser" === s.type ? this.addClass(this.canvas, "eraser") : "text" === s.type ? this.addClass(this.canvas, "text") : "cursor" === s.type ? this.addClass(this.canvas, "cursor") : "eyedropper" === s.type ? this.addClass(this.canvas, "eyedropper") : "fill" === s.type ? this.addClass(this.canvas, "fill") : this.addClass(this.canvas, "cross"), 
                this.config.tool !== this.selectedDrawOption && (this.config.tool = this.selectedDrawOption, 
                this.saveData());
            }
        },
        hexToRgb: function(t) {
            var e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);
            return e ? {
                r: parseInt(e[1], 16),
                g: parseInt(e[2], 16),
                b: parseInt(e[3], 16)
            } : null;
        },
        rgbToHex: function(t, e, i) {
            return "#" + ((1 << 24) + (t << 16) + (e << 8) + i).toString(16).slice(1);
        },
        onColorPanelClick: function(t) {
            this.selectedColorOption = this.hexToRgb(t.currentTarget.value), this.updatePaintStyle(), 
            this.config.color !== t.currentTarget.value && (this.config.color = t.currentTarget.value, 
            this.saveData());
        },
        onAlphaChange: function(t) {
            this.selectedAlphaOption = t.currentTarget.value, this.alphaPickerPreview && (this.alphaPickerPreview.innerHTML = Math.round(100 * this.selectedAlphaOption) + "%"), 
            this.updatePaintStyle(), this.config.alpha !== this.selectedAlphaOption && (this.config.alpha = this.selectedAlphaOption, 
            this.saveData());
        },
        onAlphaUpdate: function(t) {
            this.alphaPickerPreview && (this.alphaPickerPreview.innerHTML = Math.round(100 * t.currentTarget.value) + "%");
        },
        onLineChange: function(t) {
            this.context.lineWidth = t.currentTarget.value, this.linePickerPreview && (this.linePickerPreview.innerHTML = Math.round(this.context.lineWidth / 20 * 100) + "%"), 
            this.config.thickness !== this.context.lineWidth && (this.config.thickness = this.context.lineWidth, 
            this.saveData());
        },
        onLineUpdate: function(t) {
            this.linePickerPreview && (this.linePickerPreview.innerHTML = Math.round(t.currentTarget.value / 20 * 100) + "%");
        },
        updatePaintStyle: function() {
            null !== this.selectedColorOption && null !== this.selectedAlphaOption && (this.cursor.fillStyle = "rgba(" + this.selectedColorOption.r + "," + this.selectedColorOption.g + "," + this.selectedColorOption.b + "," + this.selectedAlphaOption + ")", 
            this.context.strokeStyle = "rgba(" + this.selectedColorOption.r + "," + this.selectedColorOption.g + "," + this.selectedColorOption.b + "," + this.selectedAlphaOption + ")", 
            this.context.fillStyle = "rgba(" + this.selectedColorOption.r + "," + this.selectedColorOption.g + "," + this.selectedColorOption.b + "," + this.selectedAlphaOption + ")");
        },
        addMouseEventListener: function() {
            var t = Function.prototype.bind.call(this.handleMouseDown, this), e = Function.prototype.bind.call(this.handleMouseMove, this), i = Function.prototype.bind.call(this.handleMouseUp, this), n = Function.prototype.bind.call(this.handleMouseLeave, this);
            this.canvas.addEventListener("mousedown", t), this.canvas.addEventListener("touchstart", t), 
            this.canvas.addEventListener("mousemove", e), this.canvas.addEventListener("touchmove", e), 
            this.canvas.addEventListener("mouseup", i), this.canvas.addEventListener("touchend", i), 
            this.canvas.addEventListener("mouseleave", n), v.document.addEventListener("keydown", this.keydownBinded), 
            v.document.addEventListener("keypress", this.keypressBinded);
        },
        addKeyEventListeners: function() {
            this.config.hotkeys && v.document.addEventListener("keydown", this.handleHotKeysDownBinded);
        },
        handleHotKeysDown: function(t) {
            var e = v.event ? event : t;
            if (e.ctrlKey && e.shiftKey) for (var i in this.config.hotkeys) if (this.config.hotkeys.hasOwnProperty(i) && this.config.hotkeys[i].charCodeAt(0) === e.keyCode) {
                for (var n = 0; n < this.drawOptions.length; n++) if (this.drawOptions[n].type === i) {
                    this.onControlPanelClick(n);
                    break;
                }
                break;
            }
        },
        matchOutlineColor: function(t, e, i, n) {
            return 255 !== t && 255 !== e && 255 !== i && 0 !== n;
        },
        handleFill: function(t) {
            var e = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height), i = 4 * (t.y * this.canvas.width + t.x), n = e.data[i], s = e.data[i + 1], o = e.data[i + 2], a = e.data[i + 3], r = this.selectedColorOption.r, h = this.selectedColorOption.g, c = this.selectedColorOption.b, l = Math.round(255 * this.selectedAlphaOption);
            n === r && s === h && o === c && a === l || this.matchOutlineColor(n, s, o, a) || (this.floodFill(t.x, t.y, [ this.selectedColorOption.r, this.selectedColorOption.g, this.selectedColorOption.b, Math.round(255 * this.selectedAlphaOption) ], !1, e, 0, !0), 
            this.context.putImageData(e, 0, 0), this.storeCanvas(), this.storeHistory());
        },
        floodFill: function(t, e, o, i, n, a, s) {
            var r, h, c, l = n.data, d = [], u = !!0, p = !1, v = n.width, g = n.height, f = new Uint8ClampedArray(v * g), x = 4 * v, y = t, m = e, w = m * x + 4 * y, C = l[w], b = l[w + 1], L = l[w + 2], P = l[w + 3], T = !1, D = function(t, e) {
                if (t < 0 || e < 0 || g <= e || v <= t) return !1;
                var i = e * x + 4 * t, n = Math.max(Math.abs(C - l[i]), Math.abs(b - l[i + 1]), Math.abs(L - l[i + 2]), Math.abs(P - l[i + 3]));
                n < a && (n = 0);
                var s = Math.abs(0 - f[e * v + t]);
                return T || 0 !== n && 255 !== s && (l[i] = o[0], l[i + 1] = o[1], l[i + 2] = o[2], 
                l[i + 3] = (o[3] + l[i + 3]) / 2, f[e * v + t] = 255), n + s === 0;
            };
            for (d.push([ y, m ]); d.length; ) {
                var k = d.pop();
                for (y = k[0], m = k[1], T = !0; D(y, m - 1); ) m -= 1;
                for (T = !1, i && (!D(y - 1, m) && D(y - 1, m - 1) && d.push([ y - 1, m - 1 ]), 
                !D(y + 1, m) && D(y + 1, m - 1) && d.push([ y + 1, m - 1 ])), p = u = !1; D(y, m); ) void 0, 
                l[c = (h = m) * x + 4 * (r = y)] = o[0], l[c + 1] = o[1], l[c + 2] = o[2], l[c + 3] = o[3], 
                f[h * v + r] = 255, D(y - 1, m) ? u || (d.push([ y - 1, m ]), u = !0) : u && (u = !1), 
                D(y + 1, m) ? p || (d.push([ y + 1, m ]), p = !0) : p && (p = !1), m += 1;
                i && (D(y - 1, m) && !u && d.push([ y - 1, m ]), D(y + 1, m) && !p && d.push([ y + 1, m ]));
            }
        },
        handleKeyDown: function(t) {
            this.paragraph && (8 !== t.keyCode && 13 !== t.keyCode || t.preventDefault(), 8 === t.keyCode ? this.paragraph.backspace() : 13 === t.keyCode && this.paragraph.newline());
        },
        handleKeyPress: function(t) {
            if (this.paragraph) {
                var e = String.fromCharCode(t.which);
                if (8 !== t.keyCode && !t.ctrlKey && !t.metaKey) {
                    t.preventDefault();
                    var i = this.drawOptions[this.selectedDrawOption];
                    this.context.font = i.minSize + (i.maxSize - i.minSize) * this.context.lineWidth / 20 + "px " + i.font, 
                    this.paragraph.insert(e);
                }
            }
        },
        handleMouseDown: function(t) {
            t.preventDefault(), this.mousedown = !0;
            var e = this.drawOptions[this.selectedDrawOption];
            if (this.lastMouseDownLoc = this.windowToCanvas(void 0 === t.clientX ? t.touches[0].clientX : t.clientX, void 0 === t.clientY ? t.touches[0].clientY : t.clientY), 
            "pen" === e.type) this.context.beginPath(), this.context.moveTo(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y + 16); else if ("eyedropper" === e.type) this.getColorOfCurrentPixel({
                x: Math.round(v.devicePixelRatio * (void 0 === t.clientX ? t.touches[0].clientX : t.clientX - 2)),
                y: Math.round(v.devicePixelRatio * (void 0 === t.clientY ? t.touches[0].clientY : t.clientY + 22))
            }); else if ("line" === e.type) this.storeCanvas(); else if ("quadratic_curve" === e.type) {
                if (0 === e.iteration) this.storeCanvas(), e.initLoc = {
                    x: this.lastMouseDownLoc.x,
                    y: this.lastMouseDownLoc.y
                }; else if (1 !== e.iteration) throw new Error("invalid iteration");
            } else if ("bezier_curve" === e.type) {
                if (0 === e.iteration) this.storeCanvas(), e.initLoc = {
                    x: this.lastMouseDownLoc.x,
                    y: this.lastMouseDownLoc.y
                }; else if (1 === e.iteration) ; else if (2 !== e.iteration) throw new Error("invalid iteration");
            } else if ("polygon" === e.type) this.storeCanvas(), e.lastLoc ? (this.context.beginPath(), 
            this.context.moveTo(e.lastLoc.x, e.lastLoc.y), this.context.lineTo(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y), 
            this.context.stroke()) : (e.lastLoc = {
                x: this.lastMouseDownLoc.x,
                y: this.lastMouseDownLoc.y
            }, e.initLoc = {
                x: this.lastMouseDownLoc.x,
                y: this.lastMouseDownLoc.y
            }); else if ("circle" === e.type) this.storeCanvas(); else if ("rectangle" === e.type) this.storeCanvas(); else if ("eraser" === e.type) this.restoreCanvas(), 
            this.context.save(), this.context.translate(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y), 
            this.context.clearRect(0, 0, e.width, e.height), this.context.restore(); else if ("fill" === e.type) this.handleFill(this.lastMouseDownLoc); else if ("text" === e.type) if (this.cursor.erase(this.context, this.drawingSurfaceImageData), 
            this.storeCanvas(), this.paragraph && this.paragraph.isPointInside(this.lastMouseDownLoc)) this.paragraph.moveCursorCloseTo(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y); else {
                this.paragraph && (this.paragraph.clearIntervals(), this.paragraph = null);
                var i = this.context.measureText("W").width;
                i += i / 6, this.paragraph = new Paragraph(this.context, this.lastMouseDownLoc.x, this.lastMouseDownLoc.y - i, this.drawingSurfaceImageData, this.cursor), 
                this.paragraph.addLine(new TextLine(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y));
            }
        },
        handleMouseMove: function(t) {
            t.preventDefault();
            var e = this.drawOptions[this.selectedDrawOption], i = this.windowToCanvas(void 0 === t.clientX ? t.touches[0].clientX : t.clientX, void 0 === t.clientY ? t.touches[0].clientY : t.clientY);
            this.setLineProperty(), this.mousedown || "eraser" !== e.type || (this.restoreCanvas(), 
            this.context.save(), this.context.translate(i.x, i.y), this.context.clearRect(0, 0, e.width, e.height), 
            this.context.restore()), "quadratic_curve" === e.type ? 1 === e.iteration && e.lastLoc && (this.restoreCanvas(), 
            this.context.beginPath(), this.context.moveTo(e.initLoc.x, e.initLoc.y), this.context.quadraticCurveTo(i.x, i.y, e.lastLoc.x, e.lastLoc.y), 
            this.context.stroke()) : "bezier_curve" === e.type && (1 === e.iteration && e.firstPoint ? (this.restoreCanvas(), 
            this.context.beginPath(), this.context.moveTo(e.initLoc.x, e.initLoc.y), this.context.quadraticCurveTo(i.x, i.y, e.firstPoint.x, e.firstPoint.y), 
            this.context.stroke()) : 2 === e.iteration && e.firstPoint && e.lastPoint && (this.restoreCanvas(), 
            this.context.beginPath(), this.context.moveTo(e.initLoc.x, e.initLoc.y), this.context.bezierCurveTo(e.lastPoint.x, e.lastPoint.y, i.x, i.y, e.firstPoint.x, e.firstPoint.y), 
            this.context.stroke())), this.mousedown && ("pen" === e.type ? (this.restoreCanvas(), 
            this.context.lineTo(i.x, i.y + 16), this.context.stroke()) : "line" === e.type ? (this.restoreCanvas(), 
            this.context.beginPath(), this.context.moveTo(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y), 
            this.context.lineTo(i.x, i.y), this.context.stroke()) : "quadratic_curve" === e.type && 0 === e.iteration ? (this.restoreCanvas(), 
            this.context.beginPath(), this.context.moveTo(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y), 
            this.context.lineTo(i.x, i.y), this.context.stroke()) : "bezier_curve" === e.type && 0 === e.iteration ? (this.restoreCanvas(), 
            this.context.beginPath(), this.context.moveTo(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y), 
            this.context.lineTo(i.x, i.y), this.context.stroke()) : "polygon" === e.type ? (this.restoreCanvas(), 
            this.context.beginPath(), this.context.moveTo(e.lastLoc.x, e.lastLoc.y), this.context.lineTo(i.x, i.y), 
            this.context.stroke()) : "circle" === e.type ? (this.restoreCanvas(), this.drawEllipse(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y, i.x - this.lastMouseDownLoc.x, i.y - this.lastMouseDownLoc.y)) : "rectangle" === e.type ? (this.restoreCanvas(), 
            this.context.beginPath(), this.context.moveTo(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y), 
            this.context.lineTo(this.lastMouseDownLoc.x, i.y), this.context.lineTo(i.x, i.y), 
            this.context.lineTo(i.x, this.lastMouseDownLoc.y), this.context.lineTo(this.lastMouseDownLoc.x, this.lastMouseDownLoc.y), 
            this.context.stroke()) : "eraser" === e.type && (this.context.save(), this.context.translate(i.x, i.y), 
            this.context.clearRect(0, 0, e.width, e.height), this.context.restore()));
        },
        handleMouseUp: function(t) {
            t.preventDefault(), this.mousedown = !1;
            var e = this.drawOptions[this.selectedDrawOption], i = this.windowToCanvas(void 0 === t.clientX ? t.changedTouches[0].clientX : t.clientX, void 0 === t.clientY ? t.changedTouches[0].clientY : t.clientY);
            "pen" === e.type ? (this.context.closePath(), this.storeCanvas(), this.storeHistory()) : "line" === e.type ? (this.context.closePath(), 
            this.storeCanvas(), this.storeHistory()) : "quadratic_curve" === e.type ? 0 === e.iteration ? (e.lastLoc = {
                x: i.x,
                y: i.y
            }, e.iteration++) : 1 === e.iteration && (this.context.closePath(), this.storeCanvas(), 
            this.storeHistory(), e.iteration = 0, e.initLoc = null, e.lastLoc = null) : "bezier_curve" === e.type ? 0 === e.iteration ? (e.firstPoint = {
                x: i.x,
                y: i.y
            }, e.iteration++) : 1 === e.iteration ? (e.lastPoint = {
                x: i.x,
                y: i.y
            }, e.iteration++) : 2 === e.iteration && (this.context.closePath(), this.storeCanvas(), 
            this.storeHistory(), e.iteration = 0, e.initLoc = null, e.firstPoint = null, e.lastPoint = null) : "polygon" === e.type ? (this.storeCanvas(), 
            this.storeHistory(), e.lastLoc = {
                x: i.x,
                y: i.y
            }) : "circle" === e.type ? (this.storeCanvas(), this.storeHistory()) : "rectangle" === e.type ? (this.context.closePath(), 
            this.storeCanvas(), this.storeHistory()) : "eraser" === e.type && (this.storeCanvas(), 
            this.storeHistory());
        },
        handleMouseLeave: function() {
            "eraser" === this.drawOptions[this.selectedDrawOption].type && this.restoreCanvas();
        },
        setLineProperty: function() {
            this.context.lineJoin = "round", this.context.lineCap = "round";
        },
        drawEllipse: function(t, e, i, n) {
            var s = i / 2 * .5522848, o = n / 2 * .5522848, a = t + i, r = e + n, h = t + i / 2, c = e + n / 2;
            this.context.beginPath(), this.context.moveTo(t, c), this.context.bezierCurveTo(t, c - o, h - s, e, h, e), 
            this.context.bezierCurveTo(h + s, e, a, c - o, a, c), this.context.bezierCurveTo(a, c + o, h + s, r, h, r), 
            this.context.bezierCurveTo(h - s, r, t, c + o, t, c), this.context.stroke();
        },
        addClass: function(t, e) {
            0 <= t.className.indexOf(e) || (t.className = t.className + " " + e);
        },
        removeClass: function(t, e) {
            t.className = t.className.replace(new RegExp("\\b" + e + "\\b", "g"), "");
        },
        triggerClick: function(t) {
            this.triggerEvent(t, "click");
        },
        triggerEvent: function(t, e) {
            var i;
            document.createEvent ? (i = document.createEvent("HTMLEvents")).initEvent(e, !0, !0) : document.createEventObject && ((i = document.createEventObject()).eventType = e), 
            i.eventName = e, t.dispatchEvent ? t.dispatchEvent(i) : t.fireEvent && htmlEvents["on" + e] ? t.fireEvent("on" + i.eventType, i) : t[e] ? t[e]() : t["on" + e] && t["on" + e]();
        },
        initDragging: function() {
            this.panel.addEventListener("mousedown", this.handleDraggingStart), this.panel.addEventListener("touchstart", this.handleDraggingStart), 
            v.document.addEventListener("mouseup", this.handleDragDone), v.document.addEventListener("touchend", this.handleDragDone);
        },
        handleDraggingStart: function(t) {
            e.pos_x = this.getBoundingClientRect().left - (void 0 === t.clientX ? t.touches[0].clientX : t.clientX), 
            e.pos_y = this.getBoundingClientRect().top - (void 0 === t.clientY ? t.touches[0].clientY : t.clientY), 
            this.addEventListener("mousemove", e.handleDragging), this.addEventListener("touchmove", e.handleDragging);
        },
        handleDragging: function(t) {
            "INPUT" !== t.target.nodeName.toUpperCase() && (t.preventDefault(), this.style.top = (void 0 === t.clientY ? t.touches[0].clientY : t.clientY) + e.pos_y + "px", 
            this.style.left = (void 0 === t.clientX ? t.touches[0].clientX : t.clientX) + e.pos_x + "px");
        },
        handleDragDone: function(t) {
            e.panel.removeEventListener("mousemove", e.handleDragging), e.panel.removeEventListener("touchmove", e.handleDragging);
        },
        windowToCanvas: function(t, e) {
            var i = this.canvas.getBoundingClientRect();
            return {
                x: Math.round(t) - i.left * (this.canvas.width / i.width),
                y: Math.round(e) - i.top * (this.canvas.height / i.height)
            };
        },
        handlePostMessageResponse: function(t) {
            if (t.origin === v.location.origin) {
                var e = t.data;
                "get_pixel_color_response" === e.method ? this.setColor(e.response) : "get_data_response" === e.method && this.render(e.response);
            }
        },
        exit: function() {
            this.canvas.parentNode.removeChild(this.canvas), this.panel.parentNode.removeChild(this.panel), 
            v.document.removeEventListener("keydown", this.keydownBinded), v.document.removeEventListener("keypress", this.keypressBinded), 
            v.document.removeEventListener("keydown", this.handleHotKeysDownBinded), v.document.removeEventListener("mouseup", this.handleDragDone), 
            v.removeEventListener("resize", this.resizeBinded), v.removeEventListener("scroll", this.resizeBinded), 
            this.canvas = null, this.context = null, this.selectedDrawOption = null, this.selectedColorOption = null, 
            this.selectedAlphaOption = null, this.mousedown = !1, this.lastMouseDownLoc = null, 
            this.drawingSurfaceImageData = null, this.paragraph = null, this.panel = null, this.initialized = !1, 
            this.controlPanelHidden = !1, "undefined" != typeof unsafeWindow && null !== unsafeWindow && (unsafeWindow.NOTEPAD_INIT = !1, 
            unsafeWindow.CTRL_HIDDEN = !1);
        },
        eraseAll: function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height), this.paragraph && (this.paragraph.clearIntervals(), 
            this.paragraph = null), this.storeCanvas(!0), this.storeHistory(), v.localStorage.removeItem("WP_CRX_STORAGE_SNAPSHOT_" + v.location.pathname);
        },
        hideControlPanel: function() {
            this.addClass(this.panel, "hide"), this.controlPanelHidden = !0, "undefined" != typeof unsafeWindow && null !== unsafeWindow && (unsafeWindow.CTRL_HIDDEN = !0);
        },
        showControlPanel: function() {
            this.removeClass(this.panel, "hide"), this.controlPanelHidden = !1, "undefined" != typeof unsafeWindow && null !== unsafeWindow && (unsafeWindow.CTRL_HIDDEN = !1);
        },
        saveData: function() {
            g.runtime.sendMessage({
                method: "save_data",
                config: this.config
            });
        },
        render: function(t) {
            this.config = t || {}, this.createCanvas(), this.setLineProperty(), this.createControlPanel(), 
            this.initDragging(), this.addMouseEventListener(), this.addKeyEventListeners();
        },
        initConfig: function() {
            g.runtime.sendMessage({
                method: "get_data"
            }, this.renderBinded);
        },
        init: function() {
            this.history = new t(), this.CSSAnimationManager = getCSSAnimationManager(), this.setColorBinded = Function.prototype.bind.call(this.setColor, this), 
            this.renderBinded = Function.prototype.bind.call(this.render, this), this.handlePostMessageResponseBinded = Function.prototype.bind.call(this.handlePostMessageResponse, this), 
            this.keydownBinded = Function.prototype.bind.call(this.handleKeyDown, this), this.keypressBinded = Function.prototype.bind.call(this.handleKeyPress, this), 
            this.handleHotKeysDownBinded = Function.prototype.bind.call(this.handleHotKeysDown, this), 
            this.persistLocalStorageBinded = Function.prototype.bind.call(this.persistLocalStorage, this), 
            this.resizeBinded = Function.prototype.bind.call(function() {
                this.resizeTimeoutID && (this.resizeTimeoutID = v.clearTimeout(this.resizeTimeoutID)), 
                this.resizeTimeoutID = v.setTimeout(Function.prototype.bind.call(this.handleResize, this), 200);
            }, this), this.initConfig(), this.initialized = !0, "undefined" != typeof unsafeWindow && null !== unsafeWindow && (unsafeWindow.NOTEPAD_INIT = !0);
        }
    };
    return e;
});