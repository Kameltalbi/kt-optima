// Script pour générer favicon.ico à partir du SVG
// Nécessite sharp: npm install sharp --save-dev

const fs = require('fs');
const path = require('path');

// Pour l'instant, on utilise le SVG directement
// Pour générer un vrai ICO, il faudrait installer sharp ou utiliser un service en ligne
console.log('Favicon SVG créé. Pour générer un ICO, utilisez un outil en ligne comme:');
console.log('https://realfavicongenerator.net/');
console.log('ou installez sharp: npm install sharp --save-dev');
