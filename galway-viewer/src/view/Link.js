import {link, paragraph} from '../utils';

export default class Link {

  constructor($el) {
    this.$link = $el;
    // this.$link.style.opacity = 0;
  }

  renderEmpty() {
    // this.$link.style.opacity = 0;
    // this.$link.innerHTML = '';
  }

  render({linkToManifest, handleClick}) {
    const {url, canvasId, xywh, label, description} = linkToManifest;

    this.$link.appendChild(
      paragraph([
        'Draw link at',
        link(url, xywh, handleClick(canvasId)),
        'going to',
        label,
      ]),
    );
    this.$link.appendChild(
      paragraph([description], 'desc'),
    );

    this.$link.style.opacity = 1;
  }

}
