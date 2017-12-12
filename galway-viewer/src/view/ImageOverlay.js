import Canvas from "./Canvas";
import {div} from '../utils';

export default class ImageOverlay {

  constructor(canvasId) {
    this.canvasId = canvasId;
    this.$annotationOverlay = div({ className: 'annotation-overlay' });
    this.annotations = [];
  }

  mountTo($target) {
    $target.appendChild(this.$annotationOverlay);
  }

  addAnnotation($annotation, position, canvasId) {
    if (this.canvasId === canvasId) {
      this.$annotationOverlay.appendChild($annotation);
      this.annotations.push({$el: $annotation, position});
    }
  }

  static createStaticAnnotation(label, description) {
    return div({className: 'galway-annotation'}, [
      div({className: 'galway-annotation__label'}, label),
      div({className: 'galway-annotation__description'}, description),
    ]);
  }

  render($image, canvasId) {
    if (this.canvasId !== canvasId) {
      return;
    }

    const {width, height} = $image.getBoundingClientRect();
    const px = n => `${n}px`;

    const fullWidth = parseInt($image.getAttribute('data-width'), 10);
    const fullHeight = parseInt($image.getAttribute('data-height'), 10);
    const ratio = height / fullHeight;

    this.$annotationOverlay.style.height = px(height);
    this.$annotationOverlay.style.width = px(width);
    this.$annotationOverlay.style.marginLeft = px(-(width / 2));

    this.annotations.forEach(({ $el: $annotation, position }) => {
      if (position) {
        $annotation.style.width = px(position.width * ratio);
        $annotation.style.height = px(position.height * ratio);
        $annotation.style.top = px(position.y * ratio);
        $annotation.style.left = px(position.x * ratio);
      }
    })

  }

}
