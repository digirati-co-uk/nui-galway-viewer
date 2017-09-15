
import Timeline from '../components/Timeline';

export default class App {

  constructor($el) {
    this.$el = $el;
    this.state = {counter: 0};
    this.$timeline = new Timeline();
    setInterval(() => this.render(), 100)
  }

  load(manifest) {
    this.manifest = manifest;
  }

  update(state) {
    this.state = state;
    requestAnimationFrame(() => this.render(), 0);
  }

  render() {
    if (this.$el.children.length === 0) {
      this.$el.appendChild(this.$timeline.render());
    }
  }

}
