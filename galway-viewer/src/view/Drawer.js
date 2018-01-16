import {div, DOM, EventBus, renderTemporal} from '../utils';

export default class Drawer {

  static INACTIVE_CLASS = 'galway-drawer--inactive';

  constructor($el, structure) {
    this.$el = $el;
    this.$lightbox = $el.querySelector('.galway-drawer__background');
    this.$menu = $el.querySelector('.galway-drawer__menu');
    this.structure = structure;
    this.bus = new EventBus('Drawer');
    this.$elements = {};

    this.onItemClick((item, top) => (top === false ? this.closeMenu() : null));

    this.$lightbox.addEventListener('click', () => this.closeMenu());

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
      DOM('ul', {className: 'galway-drawer__list'},
        item.children.map(item => this.itemToListItem(item))
      )
    );
  }

  onItemClick(func) {
    this.bus.subscribe('item:click', func);
  }

  createElement(item, children) {
    this.$elements[item.id] = DOM('li', {
      className: 'galway-drawer__list-item',
    }, [
      DOM('a', {
        className: 'galway-drawer__list-link',
        onClick: () => this.bus.dispatch('item:click', item, !!children)
      }, [
        item.label,
        div({ className: 'galway-drawer__temporal' }, [renderTemporal(item)])
      ]),
      children
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

  render(canvasId, model) {
    const $currentActive = this.$el.querySelector('.galway-drawer__list-item--active');
    if ($currentActive && model.depth === 0) {
      $currentActive.classList.remove('galway-drawer__list-item--active');
    }

    Object.keys(this.$elements).forEach((id) => {
      if (model.top && id === model.top.id) {
        const $el = this.$elements[id];
        // Add active class when current item is top level.
        if ($currentActive && $currentActive !== $el) {
          $currentActive.classList.remove('galway-drawer__list-item--active');
        }
        $el.classList.add('galway-drawer__list-item--active');
      }
    })
  }

}
