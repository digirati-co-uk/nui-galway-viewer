export default class Link {

  constructor($el) {
    this.$link = $el;
    // this.$link.style.opacity = 0;
  }

  static a(href, text, onClick) {
    const link = document.createElement('a');
    link.href = href;
    link.innerText = text;
    link.addEventListener('click', (e) => {
      onClick(href, e);
    });
    return link;
  }

  static p(children, className) {
    const p = document.createElement('p');
    children.map($child =>
      p.appendChild(typeof $child === 'string' ? document.createTextNode($child) : $child)
    );
    if (className) {
      p.className = className;
    }
    return p;
  }

  renderEmpty() {
    // this.$link.style.opacity = 0;
    // this.$link.innerHTML = '';
  }

  render({linkToManifest, handleClick}) {
    const {url, canvasId, xywh, label, description} = linkToManifest;

    this.$link.appendChild(
      Link.p([
        'Draw link at',
        Link.a(url, xywh, handleClick(canvasId)),
        'going to',
        label
      ])
    );
    this.$link.appendChild(
      Link.p([ description ], 'desc')
    );

    this.$link.style.opacity = 1;
  }

}
