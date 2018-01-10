import cookie from 'cookies-js';

export default class StartScreen {

  static DISMISS = 'galway-start-screen__dismiss';
  static HIDE_START_SCREEN = 'galway-start-screen--hidden';
  static COOKIE_NAME = 'galway-viewer-intro';

  constructor($el) {
    this.$el = $el;
    this.cookie = cookie;
    this.hasCookieBoolean = this.cookie.get(StartScreen.COOKIE_NAME) === 'true';

    const dismiss = this.$el.querySelectorAll(`.${StartScreen.DISMISS}`);
    if (!dismiss) {
      console.warn('Popup has been disabled as there is no way to dismiss.');
      return;
    }

    dismiss.forEach(e => e.addEventListener('click', () => {
      this.$el.classList.add(StartScreen.HIDE_START_SCREEN);
      this.setCookie();
    }));
    if (!this.hasCookie()) {
      this.$el.classList.remove(StartScreen.HIDE_START_SCREEN);
    }

    Array.from(this.$el.querySelectorAll('.galway-start-screen__dismiss')).map(target => target.addEventListener('click', () => {
      this.closeStartScreen();
    }));

  }

  toggleStartScreen() {
    this.$el.classList[this.$el.classList.contains('galway-start-screen--hidden') ? 'remove' : 'add']('galway-start-screen--hidden');
  }

  openStartScreen() {
    this.$el.classList.remove('galway-start-screen--hidden');
  }

  closeStartScreen() {
    this.$el.classList.add('galway-start-screen--hidden');

    if (this.hasCookie() === false) {
      this.setCookie();
    }
  }

  setCookie() {
    this.cookie.set(StartScreen.COOKIE_NAME, 'true', { expires: Infinity });
  }

  hasCookie() {
    return this.hasCookieBoolean;
  }
}
