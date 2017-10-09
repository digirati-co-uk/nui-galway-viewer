import cookie from 'cookies-js';

export default class StartScreen {

  constructor($el) {
    this.$el = $el;
    this.cookie = cookie;
    if (!this.$el || this.hasCookie()) {
      return;
    }
    const dismiss = this.$el.querySelectorAll('.start-screen__dismiss');
    if (!dismiss) {
      console.warn('Popup has been disabled as there is no way to dismiss.');
      return;
    }

    dismiss.forEach(e => e.addEventListener('click', () => {
      this.$el.classList.add('start-screen--hidden');
      this.setCookie();
    }));

    this.$el.classList.remove('start-screen--hidden');
  }

  setCookie() {
    this.cookie.set('galway-viewer-intro', 'true', { expires: Infinity });
  }

  hasCookie() {
    return (this.cookie.get('galway-viewer-intro') === 'true');
  }
}
