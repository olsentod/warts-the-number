"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var colorContrast_1 = require("./colorContrast");
var lightTheme = {
    '--background-color': '#d0dfc8',
    '--primary-color': '#2c3e2c',
    '--secondary-color': '#a4c195',
    '--button-text-color': '#d0dfc8',
    '--button-hover-color': '#77a361',
    '--selected-number-color': '#2c3e2c',
    '--highlighted-number-cell-color': '#a4c195',
    '--highlighted-number-text-color': '#2c3e2c',
};
var darkTheme = {
    '--background-color': '#2c3e2c',
    '--primary-color': '#d0dfc8',
    '--secondary-color': '#527141',
    '--button-text-color': '#2c3e2c',
    '--button-hover-color': '#a4c195',
    '--selected-number-color': '#d0dfc8',
    '--highlighted-number-cell-color': '#77a361',
    '--highlighted-number-text-color': '#d0dfc8',
};
console.log('Light Theme Contrast Ratios:');
console.log('Button text on secondary color:', (0, colorContrast_1.getContrastRatio)(lightTheme['--button-text-color'], lightTheme['--secondary-color']));
console.log('Highlighted number text on highlighted number cell:', (0, colorContrast_1.getContrastRatio)(lightTheme['--highlighted-number-text-color'], lightTheme['--highlighted-number-cell-color']));
console.log('\nDark Theme Contrast Ratios:');
console.log('Button text on secondary color:', (0, colorContrast_1.getContrastRatio)(darkTheme['--button-text-color'], darkTheme['--secondary-color']));
console.log('Highlighted number text on highlighted number cell:', (0, colorContrast_1.getContrastRatio)(darkTheme['--highlighted-number-text-color'], darkTheme['--highlighted-number-cell-color']));
