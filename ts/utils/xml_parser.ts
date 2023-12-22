/**
 * @module utils/xml_parser
 * @description This module contains functions for parsing XML.
 */
import { DOMParser, XMLSerializer } from "xmldom";

const parser = new DOMParser();
/**
 * Extracts a specific decision element from a DMN XML string by its ID.
 *
 * @param {string} xmlString - The DMN XML as a string.
 * @param {string} decisionId - The ID of the decision element to extract.
 * @returns {string | null} - The XML string containing only the specified decision element,
 *                            or null if the decision ID is not found.
 */
export function extractDecisionById(
  xmlString: string,
  decisionId: string,
): string | null {
  const doc = parser.parseFromString(xmlString, "text/xml");
  const decisions = doc.getElementsByTagName("decision");
  const definitions = doc.getElementsByTagName("definitions")[0];

  // Find the <decision> tag with the specified ID
  let targetDecision: Element | null = null;
  for (let i = 0; i < decisions.length; i++) {
    if (decisions[i].getAttribute("id") === decisionId) {
      targetDecision = decisions[i];
      break;
    }
  }

  if (targetDecision && definitions) {
    // Remove all child tags of <definitions> except the targeted <decision>
    Array.from(definitions.childNodes).forEach((child) => {
      if (child !== targetDecision) {
        definitions.removeChild(child);
      }
    });

    // Serialize the modified document to an XML string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }

  return null; // Return null if the decision ID is not found
}
