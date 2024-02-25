import React from './React.js';

const ReactDom = {
  createRoot(container) {
    return {
      render(App) {
        return React.render(App, container);
      },
    };
  },
};

export default ReactDom;
