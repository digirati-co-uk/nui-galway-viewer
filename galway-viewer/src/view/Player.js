import Controls from "./Controls";

export default class Player {

  constructor($el) {
    this.$el = $el;
    this.controls = new Controls($el.querySelector('.galway-player__controls'));
  }

}
