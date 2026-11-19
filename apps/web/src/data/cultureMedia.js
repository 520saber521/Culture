import assets from './cultureMediaAssets.json' with { type: 'json' }

export function cultureMediaKey(item, role = 'cover') {
  if (!item) return 'culture:hero'
  return `culture:${encodeURIComponent(item.city || '')}:${item.featureType}:${encodeURIComponent(item.id)}:${role}`
}

// Covers may use the existing API image. Details intentionally have their own
// slot and never silently reuse the cover. Explicit media configuration wins.
export function cultureMedia(item, role = 'cover') {
  const key = cultureMediaKey(item, role)
  const configured = assets[key]
  return {
    key, src: configured && Object.hasOwn(configured, 'src') ? configured.src : (item && role === 'cover' ? item.imageUrl : null),
    alt: configured?.alt || item?.name || '江苏城市风物主题影像',
    credit: configured?.credit || '',
  }
}
