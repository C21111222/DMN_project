declare module 'xmldom' {
    export class DOMParser {
      parseFromString(content: string, mimeType: string): Document;
    }
  
    export class XMLSerializer {
      serializeToString(document: Document): string;
    }
  }