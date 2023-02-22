// Icons source: https://material.io/

import link from './link';
import unlink from './unlink';

const DEFAULT_ICON_HEIGHT = 20;
const DEFAULT_ICON_WIDTH = 20;
const DEFAULT_ICON_FILL = 'currentColor';

const icons: Record<string, any> = {
  link,
  unlink,
};

class Icon {
  static get(name: keyof typeof icons, fill = DEFAULT_ICON_FILL): string {
    const path = icons[name] || '<path></path>';
    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill=${fill}
        height=${DEFAULT_ICON_HEIGHT}
        width=${DEFAULT_ICON_WIDTH}
      >
        ${path}
      </svg>
    `;
  }
}

export default Icon;
