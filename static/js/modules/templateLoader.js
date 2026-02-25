// ================================
//       TEMPLATE LOADER
// ================================

const cache = {};

export async function loadTemplate(path) {
    if (cache[path]) return cache[path];
    const res = await fetch(`/static/templates/${path}`);
    if (!res.ok) throw new Error(`Template not found: ${path}`);
    cache[path] = await res.text();
    return cache[path];
}
