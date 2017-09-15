export default class Supplemental {

  constructor($el) {
    this.$supplemental = $el;
    this.$title = $el.querySelector('#supplementalTitle');
    this.$desc = $el.querySelector('#supplementalTitle');
    this.$images = $el.querySelector('#supplementalImages');
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
      img.addEventListener('load', (e) => onLoad(img))
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
    while(this.$desc.firstChild){
      this.$desc.removeChild(this.$desc.firstChild);
    }
    // Empty
    while(this.$images.firstChild){
      this.$images.removeChild(this.$images.firstChild);
    }
    if (height) {
      this.$supplemental.scrollTop = 0;
      this.$supplemental.style.width = 0;
    }
  }

  render({ manifest, canvasId }) {
    IIIF.wrap(manifest);
    this.renderEmpty(false);

    this.$supplemental.style.width = '50%';
    this.$title.innerText = manifest.label;
    const descriptions = [];

    if (manifest.related) {
      const repo = manifest['related'].asArray()[0]; // todo - prefer HTML format
      descriptions.push(
        Supplemental.div(`<p><a href='${repo['@id']}'>${repo['label'] || 'View in repository'}</a></p>`)
      );
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
