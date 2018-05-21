import React from 'react';

export function renderTemporal({ temporal }) {
  if (!temporal) {
    return '';
  }
  if (temporal.length <= 2) {
    return <span>{temporal.join(' - ')}</span>;
  }
  return <span>{Math.min(temporal) + ' - ' + Math.max(temporal)}</span>;
}

export function hasManifestData(annotation) {
  if (!annotation) {
    return false;
  }
  const jsonLd = annotation.__jsonld;

  return (
    jsonLd &&
    (jsonLd.resource['@type'] || '').toLowerCase() === 'sc:canvas' &&
    (jsonLd.resource.within['@type'] || '').toLowerCase() === 'sc:manifest'
  );
}

export function getManifestData(annotation) {
  if (!annotation) {
    return null;
  }
  const jsonLd = annotation.__jsonld;
  if (hasManifestData(annotation)) {
    return {
      label: jsonLd.resource.within.label,
      manifest: jsonLd.resource.within['@id'],
      description: jsonLd.resource.within.description,
      canvasId: jsonLd.resource['@id'],
    };
  }
}
