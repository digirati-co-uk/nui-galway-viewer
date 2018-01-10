export default class Drawer {

  static INACTIVE_CLASS = 'galway-drawer--inactive';

  constructor($el, tree = []) {
    this.$el = $el;
    this.$lightbox = $el.querySelector('.galway-drawer__background');
    this.tree = tree;

    this.$lightbox.addEventListener('click', () => {
      this.closeMenu();
    });
  }

  openMenu() {
    this.$el.classList.remove(Drawer.INACTIVE_CLASS);
  }

  closeMenu() {
    this.$el.classList.add(Drawer.INACTIVE_CLASS);
  }

  toggleMenu() {
    this.$el.classList[
      this.$el.classList.contains(Drawer.INACTIVE_CLASS) ? 'remove' : 'add'
      ](Drawer.INACTIVE_CLASS);
  }

  render(canvasId, depth = 0) {
    // Nothing yet!
  }

}
