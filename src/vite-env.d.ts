/// <reference types="vite/client" />

// The blank ABF form is shipped as a fingerprinted asset and fetched at export
// time (design §08). Vite resolves `?url` to the built asset URL.
declare module "*.pdf?url" {
  const src: string;
  export default src;
}
