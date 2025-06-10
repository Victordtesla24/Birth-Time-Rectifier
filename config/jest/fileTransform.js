const path = require('path');

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));

    if (filename.match(/\.svg$/)) {
      return {
        code: `module.exports = {
          __esModule: true,
          default: ${assetFilename},
          ReactComponent: (props) => ({
            $$typeof: Symbol.for('react.element'),
            type: 'svg',
            ref: null,
            key: null,
            props: Object.assign({}, props, {
              children: ${assetFilename}
            })
          }),
        };`,
      };
    }

    return {
      code: `module.exports = ${assetFilename};`,
    };
  },
}; 