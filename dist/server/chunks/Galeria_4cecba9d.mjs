export { renderers } from '../renderers.mjs';
export { onRequest } from '../_empty-middleware.mjs';

const page = () => import('./prerender_a1ffcb9b.mjs').then(n => n.G);

export { page };