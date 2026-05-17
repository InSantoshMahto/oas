// Simple plugin metadata registry for prototypes

const _pluginMetadata: any[] = [];

export function loadPluginMetadata(fn: Function) {
  if (typeof fn !== 'function') return;
  try {
    const meta = fn();
    _pluginMetadata.push(meta);
    return meta;
  } catch (err) {
    // swallow for now in prototype
    return undefined;
  }
}

export function getLoadedPluginMetadata() {
  return [..._pluginMetadata];
}
