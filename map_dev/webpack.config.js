const webpack = require('webpack');

module.exports = {
  entry: {
    main: './js/main.js',
    localizacion: './js/localizacion.js',
    csv: './js/tablasTsv.js'
  },
  output: {
    path: __dirname,
    filename: '[name].js',
    libraryTarget: 'var',
    library: 'Lib[name]'
  },
};
