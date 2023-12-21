import { DOMParser, XMLSerializer } from "xmldom";

const parser = new DOMParser();
export function extractDecisionById(
  xmlString: string,
  decisionId: string,
): string | null {
  const doc = parser.parseFromString(xmlString, "text/xml");
  const decisions = doc.getElementsByTagName("decision");
  const definitions = doc.getElementsByTagName("definitions")[0];

  // Trouver la balise <decision> avec l'ID spécifié
  let targetDecision: Element | null = null;
  for (let i = 0; i < decisions.length; i++) {
    if (decisions[i].getAttribute("id") === decisionId) {
      targetDecision = decisions[i];
      break;
    }
  }

  if (targetDecision && definitions) {
    // Supprimer toutes les balises enfants de <definitions> sauf la <decision> ciblée
    Array.from(definitions.childNodes).forEach((child) => {
      if (child !== targetDecision) {
        definitions.removeChild(child);
      }
    });

    // Serialiser le document modifié en chaîne XML
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }

  return null; // Retourner null si l'ID de décision n'est pas trouvé
}

// functio nthat define if the file is a single table or a multiple table thanks to <dmndi:DMNDI>
export function isSingleTable(xmlString: string): boolean {
  const doc = parser.parseFromString(xmlString, "text/xml");
  const dmndi = doc.getElementsByTagName("dmndi");

  if (dmndi.length > 0) {
    return false;
  }
  return true;
}
