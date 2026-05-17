import { DocumentOptions } from "./types";

export class DocumentBuilder {
  private options: DocumentOptions = {};

  setTitle(title: string) {
    this.options.title = title;
    return this;
  }

  setDescription(description: string) {
    this.options.description = description;
    return this;
  }

  setVersion(version: string) {
    this.options.version = version;
    return this;
  }

  setTermsOfService(tosUrl: string) {
    this.options.termsOfService = tosUrl;
    return this;
  }

  setContact(name: string, url?: string, email?: string) {
    this.options.contact = { name, url, email };
    return this;
  }

  setLicense(name: string, url?: string) {
    this.options.license = { name, url };
    return this;
  }

  addServer(url: string, description?: string) {
    if (!this.options.servers) this.options.servers = [];
    this.options.servers.push({ url, description });
    return this;
  }

  addTag(tag: any) {
    if (!this.options.tags) this.options.tags = [];
    this.options.tags.push(tag);
    return this;
  }

  build(): DocumentOptions {
    if (!this.options.title) this.options.title = "API";
    if (!this.options.version) this.options.version = "1.0.0";
    return { ...this.options };
  }
}
