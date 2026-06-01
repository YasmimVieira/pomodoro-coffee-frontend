const { Resvg } = require('@resvg/resvg-js');
const fs   = require('fs');
const path = require('path');

const assets = path.join(__dirname, '..', 'assets');

function convert(svgFile, pngFile, size = 1024) {
  const svgPath = path.join(assets, svgFile);
  const pngPath = path.join(assets, pngFile);
  const svg = fs.readFileSync(svgPath);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const rendered = resvg.render();
  fs.writeFileSync(pngPath, rendered.asPng());
  console.log(`✓  ${pngFile}  (${size}×${size}px)`);
}

console.log('\nGerando ícones...\n');
convert('icon.svg',      'icon.png',                    1024);
convert('icon-fg.svg',   'android-icon-foreground.png', 1024);
convert('icon-bg.svg',   'android-icon-background.png', 1024);
convert('icon-mono.svg', 'android-icon-monochrome.png', 1024);
convert('icon.svg',      'splash-icon.png',              512);
console.log('\n✅  Todos os ícones gerados em assets/\n');
