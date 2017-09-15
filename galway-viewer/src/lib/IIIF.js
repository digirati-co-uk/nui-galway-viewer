const IIIF = function () {

  function jsonLdTidy(obj, propNames) {
    propNames.forEach(function (pn) {
      Object.defineProperty(obj, pn, {
        get: function () {
          return this['@' + pn];
        },
        set: function (value) {
          this['@' + pn] = value;
        },
      });
    });
  }

  function getScale(box, width, height) {
    var scaleW = box / width;
    var scaleH = box / height;
    return Math.min(scaleW, scaleH);
  }

  function fits(size, min, max) {
    if (size.width && size.height) {
      return (size.width >= min || size.height >= min) && (size.width <= max && size.height <= max);
    }
    return null;
  }

  function getDistance(size, preferred) {
    var box = Math.max(size.width, size.height);
    return Math.abs(preferred - box);
  }

  function getCanonicalUri(imageService, width, height) {
    // TODO - this is not correct, it's a placeholder... it's more complicated than this...
    //return imageService.id + "/full/" + width + "," + height + "/0/default.jpg";
    return imageService.id + '/full/' + width + ',/0/default.jpg';
  }

  function getThumbnailFromServiceSizes(service, preferred, min, max) {
    // this will return a thumbnail between min and max
    var sizes = service.sizes;
    sizes.sort(function (a, b) {
      return a.width - b.width;
    });
    var best = null;
    var distance = Number.MAX_SAFE_INTEGER;
    for (var i = sizes.length - 1; i >= 0; i--) {
      // start with the biggest; see if each one matches criteria.
      var size = sizes[i];
      if (fits(size, min, max)) {
        var sizeDist = getDistance(size, preferred);
        if (sizeDist < distance) {
          best = size;
        }
        distance = sizeDist;
      } else {
        if (best) break;
      }
    }
    if (best) {
      var url = getCanonicalUri(service, best.width, best.height);
      return makeThumb(preferred, best, url);
    }
    return null;
  }

  function makeThumb(preferred, size, url) {
    var scale = getScale(preferred, size.width, size.height);
    return {
      url: url,
      width: Math.round(scale * size.width),
      height: Math.round(scale * size.height),
      actualWidth: size.width,
      actualHeight: size.height,
    };
  }

  function hasSizes(service) {
    return service && isImageService(service) && service.sizes && service.sizes.length;
  }

  function getThumbnailFromImageResource(image, preferred, min, max) {
    var thumbnail = null;
    if (typeof image === 'string') {
      // A thumbnail has been supplied but we have no idea how big it is
      if (preferred <= 0) {
        thumbnail = {url: image}; // caller didn't care
      }
    } else if (image.service) {
      var imgService = image.service.first(hasSizes);
      if (imgService) {
        thumbnail = getThumbnailFromServiceSizes(imgService, preferred, min, max);
      } else {
        imgService = image.service.first(isImageService);
        if (imgService) {
          if (imgService.profile.asArray()[0].indexOf('level0.json') !== -1) {
            thumbnail = getThumbnailFromTileOnlyLevel0ImageService(imgService, preferred, min, max);
          } else {
            // attempt to determine the aspect ratio
            var size = {
              width: imgService.width || image.width || canvas.width,
              height: imgService.height || image.height || canvas.height,
            };
            if (preferred <= 0) {
              // we can't supply 0!
              preferred = 200;
            }
            var thumbnail = makeThumb(preferred, size);
            thumbnail.url = getCanonicalUri(imgService, thumbnail.width, thumbnail.height);
            thumbnail.actualWidth = thumbnail.width;
            thumbnail.actualHeight = thumbnail.height;
          }
        }
      }
    } else {
      var imageResourceSize = {
        width: image.width,
        height: image.height,
      };
      if (preferred <= 0 || fits(imageResourceSize, min, max)) {
        thumbnail = makeThumb(preferred, imageResourceSize, image.id);
      }
    }
    return thumbnail;
  }

  function getThumbnailFromTileOnlyLevel0ImageService(imgService, preferred, min, max, follow) {
    // check for level 0 with tiles only - ask for a small tile
    // unless there's enough info inline, will need to dereference info.json to determine tile sizes
    // we have already checked for sizes

    // TODO - this is not a complete implementation yet, assumes we have the width and height (we would if derefed),
    // TODO - assumes only one set of tiles
    if (imgService.tiles) {
      var size = Math.max(imgService.width, imgService.height);
      // now we need to find a tile that the whole image fits on
      var tileWidth = imgService.tiles[0].width; // assume square for now
      imgService.tiles[0].scaleFactors.sort(function (a, b) {
        return a - b;
      });
      for (var i = 0; i < imgService.tiles[0].scaleFactors.length; i++) {
        var scaleFactor = imgService.tiles[0].scaleFactors[i];
        var s = size / scaleFactor;
        if (s <= tileWidth) {
          // this is not right...
          var url = imgService.id + '/full/' + Math.round(imgService.width / scaleFactor) + ',/0/default.jpg';
          var thumbSize = {
            width: Math.round(imgService.width / scaleFactor),
            height: Math.round(imgService.height / scaleFactor),
          };
          return makeThumb(preferred, thumbSize, url);
        }
      }
    }

    // TODO: follow is not implemented - but if it was, the full info.json would be dereferenced here.
    // if the dereferenced info.json has 'sizes' use those, otherwise use tiles as above

    return null;
  }

  function getThumbnail(preferred, min, max, follow) {
    if (!max) max = 3 * (min || 100);
    var thumbnail;
    if (this.hasOwnProperty('thumbnail')) {
      thumbnail = getThumbnailFromImageResource(this.thumbnail, preferred, min, max);
      if (thumbnail) return thumbnail;
    }
    // no explicit thumbnail. Now we need to take a look at what this actually is
    if (this.type === 'dctypes:Image') {
      thumbnail = getThumbnailFromImageResource(this, preferred, min, max);
      if (thumbnail) return thumbnail;
    }
    if (this.type === 'sc:Canvas' && this.images && this.images.length && this.images[0].resource) {
      thumbnail = getThumbnailFromImageResource(this.images[0].resource, preferred, min, max);
      if (thumbnail) return thumbnail;
    }
    return null;
  }

  function isImageService(service) {
    if (typeof service === 'object' && service && service.profile) {
      //var profileList = (service.profile.constructor === Array) ? service.profile : [service.profile];
      if (service.profile.asArray()[0].indexOf('http://iiif.io/api/image') !== -1) {
        return true;
      }
    }
    return false;
  }

  // TODO - better handling of multiple images per canvas
  function getDefaultImageService() {
    // on sc:Canvas
    var imgService = null;
    if (this.images) {
      this.images.forEach(function (img) {
        if (img.resource && img.resource.service) {
          imgService = img.resource.service.first(isImageService);
          if (imgService) return imgService;
        }
      });
    }
    return imgService;
  }

  function getAuthServices(info) {
    var svcInfo = {};
    var services;
    console.log('Looking for auth services');
    if (info.hasOwnProperty('service')) {
      if (info.service.hasOwnProperty('@context')) {
        services = [info.service];
      } else {
        // array of service
        services = info.service;
      }
      var prefix = 'http://iiif.io/api/auth/0/';
      var clickThrough = 'http://iiif.io/api/auth/0/login/clickthrough';
      for (var service, i = 0; (service = services[i]); i++) {
        var serviceName = null;

        if (service['profile'] === clickThrough) {
          serviceName = 'clickthrough';
          console.log('Found click through service');
          svcInfo[serviceName] = {
            id: service['@id'],
            label: service.label,
            description: service.description,
            confirmLabel: 'Accept terms and Open' // fake this for now
          };
        }
        else if (service['profile'].indexOf(prefix) === 0) {
          serviceName = service['profile'].slice(prefix.length);
          console.log('Found ' + serviceName + ' auth service');
          svcInfo[serviceName] = {id: service['@id'], label: service.label};

        }
        if (service.service && serviceName) {
          for (var service2, j = 0; (service2 = service.service[j]); j++) {
            var nestedServiceName = service2['profile'].slice(prefix.length);
            console.log('Found nested ' + nestedServiceName + ' auth service');
            svcInfo[serviceName][nestedServiceName] = {id: service2['@id'], label: service2.label};
          }
        }
      }
    }
    return svcInfo;
  }

  function findIndexById(id) {
    for (var idx = 0; idx < this.length; idx++) {
      if (id === this[idx]['@id']) {
        return idx;
      }
    }
    return -1;
  }


  function wrap(rawObj, key) {
    if (!!rawObj) {
      if (typeof (rawObj) === 'object') {
        if (rawObj.constructor !== Array) {
          jsonLdTidy(rawObj, ['id', 'type', 'context']);
          if (rawObj.hasOwnProperty('@type') && rawObj['@type'].indexOf('sc:') === 0) {
            rawObj.getThumbnail = getThumbnail; // for all IIIF types
            if (rawObj['@type'] === 'sc:Canvas') {
              rawObj.getDefaultImageService = getDefaultImageService; // only for Canvas
            }
          }
        }
        if (key === 'canvases') {
          // We could do this for more than just canvases. But for now..
          rawObj.findIndexById = findIndexById;
        }
        for (var obj in rawObj) {
          if (rawObj.hasOwnProperty(obj)) {
            wrap(rawObj[obj], obj);
          }
        }
      }
      // add helpers for non-@container JSON-LD keys
      rawObj.asArray = function () {
        return (this.constructor === Array) ? this : [this];
      };
      rawObj.where = function (predicate) {
        return this.asArray().filter(predicate);
      };
      rawObj.first = function (predicate) {
        var taa = this.asArray();
        if (predicate) {
          taa = taa.filter(predicate);
        }
        return taa.length ? taa[0] : null;
      };
      rawObj.any = function (predicate) {
        return this.first(predicate);
      };
      if (typeof (rawObj) === 'object') {
        // prevent our helpers appearing as enumerable props
        Object.defineProperty(rawObj, 'asArray', {enumerable: false});
        Object.defineProperty(rawObj, 'where', {enumerable: false});
        Object.defineProperty(rawObj, 'first', {enumerable: false});
        Object.defineProperty(rawObj, 'any', {enumerable: false});
      }
    }
  }

  return {
    wrap: function (obj) {
      wrap(obj);
    },
    getAuthServices: getAuthServices,
  };
}();

String.prototype.asArray = function () {
  return [this];
};

export default IIIF;
