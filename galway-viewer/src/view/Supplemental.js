export default class Supplemental {

  constructor($el) {
    this.$supplemental = $el;
    this.$title = $el.querySelector('.supplemental__title');
    this.$desc = $el.querySelector('.supplemental__description');
    this.$images = $el.querySelector('.supplemental__images');

    // bug fixes.
    this.$supplemental.style.removeProperty('display');
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        this.$supplemental.classList.remove('supplemental--active');
      }
    });

    const close = this.$supplemental.querySelector('.supplemental__close');
    if (close) {
      close.addEventListener('click', () => {
        this.$supplemental.classList.remove('supplemental--active');
      });
    }
    const lightbox = this.$supplemental.querySelector('.supplemental__lightbox');
    if (lightbox) {
      lightbox.addEventListener('click', () => {
        this.$supplemental.classList.remove('supplemental--active');
      });
    }
  }

  static div(text) {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div;
  }

  image(src, id, onLoad = null) {
    const img = document.createElement('img');
    img.src = src;
    img.id = id;
    if (onLoad) {
      img.addEventListener('load', (e) => onLoad(img));
    }
    return img;
  }

  static getCanvasIndex(manifest, canvasId) {
    let canvasIndex = manifest.sequences[0].canvases.findIndexById(canvasId);
    return canvasIndex < 0 ? 0 : canvasIndex;
  }

  scrollTo($image) {
    this.$supplemental.scrollTop = $image.offsetTop;
  }

  renderEmpty(height = true) {
    this.$title.innerText = '';
    // Empty
    while (this.$desc.firstChild) {
      this.$desc.removeChild(this.$desc.firstChild);
    }
    // Empty
    while (this.$images.firstChild) {
      this.$images.removeChild(this.$images.firstChild);
    }
    if (height) {
      this.$supplemental.scrollTop = 0;
      // this.$supplemental.style.width = 0;
    }
  }

  render({manifest, canvasId}) {
    IIIF.wrap(manifest);
    this.renderEmpty(false);


    this.$supplemental.classList.add('supplemental--active');
    this.$title.innerText = manifest.label;
    const descriptions = [];

    if (manifest.related) {
      const repo = manifest['related'].asArray()[0]; // todo - prefer HTML format
      if (repo['@id']) {
        descriptions.push(
          Supplemental.div(`<p><a target="_blank" href='${repo['@id']}'>${repo['label'] || 'View in repository'}</a></p>`),
        );
      }
    }

    descriptions.push(Supplemental.div(manifest.description || '(no description)'));

    const canvasIndex = Supplemental.getCanvasIndex(manifest, canvasId);
    const images = manifest.sequences[0].canvases.map((canvas, index) => {
      const imageUrl = canvas.images[0].resource.service.id + '/full/!1000,1000/0/default.jpg';
      const onLoad = index === canvasIndex ? (img) => this.scrollTo(img) : null;
      return this.image(imageUrl, `suppcv_${index}`, onLoad);
    });

    descriptions.map(description => this.$desc.appendChild(description));
    images.map(image => this.$images.appendChild(image));
  }
}
