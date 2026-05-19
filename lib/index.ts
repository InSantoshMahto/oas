export * from "./types";
export * from "./helpers";
export * from "./plugin";

// Prefer upstream @nestjs/swagger for spec generation when available. The
// compat wrapper will fall back to local implementations if @nestjs/swagger
// is not installed.
export { DocumentBuilder } from "./compat-swagger";
export { createDocument } from "./compat-swagger";

// Also expose the local implementations explicitly for consumers who want
// to bypass the upstream package.
export { DocumentBuilder as LocalDocumentBuilder } from "./document-builder";
export { createDocument as localCreateDocument } from "./create-document";
