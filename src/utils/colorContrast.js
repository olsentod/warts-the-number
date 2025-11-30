"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContrastRatio = void 0;
var getLuminance = function (hexColor) {
    var rgb = parseInt(hexColor.slice(1), 16);
    var r = (rgb >> 16) & 0xff;
    var g = (rgb >> 8) & 0xff;
    var b = (rgb >> 0) & 0xff;
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};
var getContrastRatio = function (color1, color2) {
    var lum1 = getLuminance(color1);
    var lum2 = getLuminance(color2);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
};
exports.getContrastRatio = getContrastRatio;
