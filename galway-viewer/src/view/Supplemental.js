import {div, img, link, paragraph} from '../utils';

export default class Supplemental {

  constructor($el) {
    this.$supplemental = $el;

    this.$title = $el.querySelector('.galway-supplemental__title');
    this.$desc = $el.querySelector('.galway-supplemental__description');
    this.$images = $el.querySelector('.galway-supplemental__images');
    this.$inner = $el.querySelector('.galway-supplemental__inner');

    // bug fixes.
    this.$supplemental.style.removeProperty('display');
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        this.$supplemental.classList.remove('supplemental--active');
      }
    });

    const close = this.$supplemental.querySelector('.galway-supplemental__close');
    if (close) {
      close.addEventListener('click', () => {
        console.log('close => ', close);
        this.$supplemental.classList.remove('galway-supplemental--active');
      });
    }
    const lightbox = this.$supplemental.querySelector('.galway-supplemental__lightbox');
    if (lightbox) {
      lightbox.addEventListener('click', () => {
        this.$supplemental.classList.remove('galway-supplemental--active');
      });
    }
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

  getRepositoryLink(manifest) {
    if (manifest.related) {
      const repo = manifest['related'].asArray()[0]; // todo - prefer HTML format
      if (repo['@id']) {
        const url = link(repo['@id'], `${repo['label'] || 'More info'} <i class="material-icons">launch</i>`);
        url.setAttribute('target', '_blank');
        url.classList.add('galway-supplemental__link');
        return url;
      }
    }
  }

  render({manifest, canvasId}) {
    IIIF.wrap(manifest);

    const canvasIndex = Supplemental.getCanvasIndex(manifest, canvasId);
    const images = manifest.sequences[0].canvases.map((canvas, index) => {
      const imageUrl = canvas.images[0].resource.service.id + '/full/!1000,1000/0/default.jpg';
      const onLoad = index === canvasIndex ? (img) => this.scrollTo(img) : null;
      return img(
        imageUrl, {
          className: 'galway-supplemental__image',
          id: `supplementation-content-${index}`,
          onLoad
        });
    });
    const repo = this.getRepositoryLink(manifest);

    this.$supplemental.classList.add('galway-supplemental--active');
    this.$inner.innerHTML = '';
    this.$inner.appendChild(
      div({className: 'galway-supplemental__aside'}, [
        div({className: 'galway-supplemental__title'}, [
          manifest.label,
        ]),
        div({className: 'galway-supplemental__description'}, [
          manifest.description || '(no description)',
        ]),
        repo
      ])
    );

    this.$inner.appendChild(
      div({className: 'galway-supplemental__images'}, images)
    );

    return;

    // this.renderEmpty(false);

    // this.$title.innerText = manifest.label;
    // const descriptions = [];
    //
    // if (manifest.related) {
    //   const repo = manifest['related'].asArray()[0]; // todo - prefer HTML format
    //   if (repo['@id']) {
    //     const url = link(repo['@id'], repo['label'] || 'View in repository');
    //     url.setAttribute('target', '_blank');
    //     descriptions.push(
    //       div({},
    //         paragraph([url])
    //       )
    //     );
    //   }
    // }
    //
    // descriptions.push(div({}, manifest.description || '(no description)'));
    //
    // const canvasIndex = Supplemental.getCanvasIndex(manifest, canvasId);
    // const images = manifest.sequences[0].canvases.map((canvas, index) => {
    //   const imageUrl = canvas.images[0].resource.service.id + '/full/!1000,1000/0/default.jpg';
    //   const onLoad = index === canvasIndex ? (img) => this.scrollTo(img) : null;
    //   return img(imageUrl, {id: `suppcv_${index}`, onLoad});
    // });
    //
    // descriptions.map(description => this.$desc.appendChild(description));
    // images.map(image => this.$images.appendChild(image));
  }
}
