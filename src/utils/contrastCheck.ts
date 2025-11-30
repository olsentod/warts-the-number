import { getContrastRatio } from './colorContrast';

// Current Palette
const palette = {
  darkGreen: '#2c3e2c',
  mediumGreen: '#527141',
  green: '#77a361',
  lightGreen: '#a4c195',
  extraLightGreen: '#d0dfc8',
  white: '#ffffff',
};

// Proposed Dark Theme (Card Bg = Dark Green)
const darkTheme = {
  bgCard: palette.darkGreen,
  textPrimary: palette.extraLightGreen,
  textSecondary: palette.lightGreen,

  btnPrimaryBg: palette.lightGreen,
  btnPrimaryText: palette.darkGreen,

  btnSecondaryBg: palette.green,
  btnSecondaryText: palette.darkGreen,

  cellBg: palette.darkGreen,
  cellText: palette.extraLightGreen, // User entered numbers

  cellBgInitial: 'rgba(0, 0, 0, 0.2)', // Approximate blend on dark green
  cellTextInitial: palette.extraLightGreen, // Assuming same text color for now

  cellBgSelected: palette.green,
  cellBgSameNumber: palette.lightGreen,
  cellTextSameNumber: palette.darkGreen,
};

console.log('--- Dark Theme Contrast Report ---');

function check(label: string, fg: string, bg: string) {
  const ratio = getContrastRatio(fg, bg);
  const passAA = ratio >= 4.5;
  const passAALarge = ratio >= 3.0;
  console.log(`${label}: ${ratio.toFixed(2)} ${passAA ? '✅ AA' : (passAALarge ? '⚠️ AA Large' : '❌ Fail')}`);
}

check('Primary Text on Card Bg', darkTheme.textPrimary, darkTheme.bgCard);
check('Secondary Text on Card Bg', darkTheme.textSecondary, darkTheme.bgCard);
check('Primary Button Text on Bg', darkTheme.btnPrimaryText, darkTheme.btnPrimaryBg);
check('Secondary Button Text on Bg', darkTheme.btnSecondaryText, darkTheme.btnSecondaryBg);

console.log('\n--- Cell States ---');
check('User Text on Empty Cell', darkTheme.cellText, darkTheme.cellBg);
// Note: Initial cell bg is transparent black on dark green, effectively darker green
// #2c3e2c mixed with 0.2 black -> approx #233123
check('Initial Text on Initial Cell', darkTheme.cellTextInitial, '#233123');
check('Same Number Text on Same Number Bg', darkTheme.cellTextSameNumber, darkTheme.cellBgSameNumber);

console.log('\n--- Selected Cell Fix Options ---');
// Current failure
check('Current: Extra Light Green on Green', palette.extraLightGreen, palette.green);
// Option 1: Dark Green
check('Option 1: Dark Green on Green', palette.darkGreen, palette.green);
// Option 2: White
check('Option 2: White on Green', palette.white, palette.green);
