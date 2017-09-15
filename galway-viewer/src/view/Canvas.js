import Supplemental from './Supplemental';
import Link from './Link';
import $ from 'jquery';

export default class Canvas {

  constructor($el) {
    this.$el = $el;
    this.$supplimental = new Supplemental(document.getElementById('supplemental'));
    this.$link = new Link(document.getElementById('linkDump'));
  }

  handleClick = canvasId => (href, e) => {
    e.preventDefault();
    e.stopPropagation();
    $.ajax({
      dataType: 'json',
      url: href,
      cache: true,
      success: (manifest) => {
        this.$supplimental.render({manifest, canvasId});
      },
    });
  };

  static dropCaseComparison(a, b) {
    return (a ? a : '').toLowerCase() === (b ? b : '').toLowerCase();
  }

  render({canvas}) {
    // here you need to add sensible logic for your images. I know that Galway's are level 2 (Loris),
    // and I know that the annotated resource image is full size, and too big. So I'm going to ask for a smaller one.
    const imageUrl = canvas.images[0].resource.service.id + '/full/!1600,1600/0/default.jpg';
    this.$el.style.backgroundImage = `url(${imageUrl})`;
    this.$link.renderEmpty();
    this.$supplimental.renderEmpty();

    if (canvas.otherContent) {
      for (let ai = 0; ai < canvas.otherContent.length; ai++) {
        $.ajax({
          dataType: 'json',
          url: canvas.otherContent[ai]['@id'],
          cache: true,
          success: (annoList) => {
            if (annoList.resources) {
              for (let ri = 0; ri < annoList.resources.length; ri++) {
                // we're only interested in links to canvases in other manifests here.
                const anno = annoList.resources[ri];
                if (Canvas.dropCaseComparison(anno.motivation, 'oa:linking')) {
                  const parts = anno.on.split('#');
                  const cvid = parts[0];
                  const xywh = parts.length > 1 ? parts[1] : null;
                  // will populate this object:
                  const linkToManifest = {
                    xywh: xywh,
                    url: null,
                    canvasId: null,
                    label: null,
                    description: null,
                  };
                  if (anno.resource['@type'] === 'sc:Manifest') {
                    linkToManifest.url = anno.resource['@id'];
                    linkToManifest.label = anno.resource.label;
                    linkToManifest.description = anno.resource.description;
                  } else if (Canvas.dropCaseComparison(anno.resource['@type'], 'sc:Canvas')) {
                    // we MUST be given a within otherwise we're stuffed
                    if (anno.resource.within && Canvas.dropCaseComparison(anno.resource.within['@type'], 'sc:Manifest')) {
                      linkToManifest.url = anno.resource.within['@id'];
                      linkToManifest.label = anno.resource.within.label;
                      linkToManifest.description = anno.resource.within.description;
                      linkToManifest.canvasId = anno.resource['@id'];
                    }
                  }
                  if (linkToManifest.url) {
                    this.$link.render({linkToManifest, handleClick: this.handleClick });
                  }
                }
              }
            }
          },
        });
      }
    }
  }

}
