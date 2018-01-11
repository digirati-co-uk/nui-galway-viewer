import {div, DOM, EventBus} from '../utils';

export default class Drawer {

  static INACTIVE_CLASS = 'galway-drawer--inactive';

  constructor($el, structure) {
    this.$el = $el;
    this.$lightbox = $el.querySelector('.galway-drawer__background');
    this.$menu = $el.querySelector('.galway-drawer__menu');
    this.structure = structure;
    this.bus = new EventBus('Drawer');
    this.$elements = {};

    this.bus.subscribe('topRange:active', (item) => {
      if (this.$elements[item.id]) {
        this.$elements[item.id].classList.add('galway-drawer__list-item--active');
      }
    });
    this.bus.subscribe('topRange:inactive', (item) => {
      if (this.$elements[item.id]) {
        this.$elements[item.id].classList.remove('galway-drawer__list-item--active');
      }
    });

    this.bus.subscribe('item:click', (item, top) => {
      if (top === false) {
        this.closeMenu();
      }
    });

    this.$lightbox.addEventListener('click', () => {
      this.closeMenu();
    });

    this.$menu.appendChild(
      DOM(
        'ul',
        {className: 'galway-drawer__list'},
        this.structure.map(item => this.itemToListItem(item))
      )
    );
  }

  itemToListItem(item) {
    if (!item.children) {
      return this.createElement(item);
    }

    return this.createElement(item,
      DOM('ul', { className: 'galway-drawer__list' },
        item.children.map(item => this.itemToListItem(item))
      )
    );
  }

  createElement(item, children) {
    const label = DOM('a', {
        className: 'galway-drawer__list-link',
        onClick: () => this.bus.dispatch('item:click', item, !!children)
      }, item.label);

    this.$elements[item.id] = DOM('li', {
      className: 'galway-drawer__list-item',
    }, children ? [
      label,
      children
    ] : [
      label
    ]);

    return this.$elements[item.id]
  }

  setTopLevelRange(range) {
    this.topLevelRange = range;
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

    if (this.topLevelRange) {

    }
    console.log(canvasId)
    // Nothing yet!
  }

}
