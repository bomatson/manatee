exports.project = function(pm) {
  var f = pm.filters(require('pm-spritesheet'));

  return {
    spritesheet: {
      files: 'public/images/*.png',
      dev: [
        f.spritesheet({filename: 'spritesheet.png', root: 'public/images/', jsonStyle:'texturePacker'})
      ]
    }
  };
};
