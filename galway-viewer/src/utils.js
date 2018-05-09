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
