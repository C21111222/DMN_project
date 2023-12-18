/**
 * This file contains the migration logic for DMN diagrams base on https://github.com/bpmn-io/dmn-migrate
 * - migrateDiagram
 * - needsMigration
 */
import Ids from "ids";

import { isArray, isFunction, isString, some } from "min-dash";

import BiodiPackage from "./biodi.json";

declare const DmnModdle: any;
const ids = new Ids([32, 36, 1]);

const moddle = new DmnModdle({
  biodi: BiodiPackage,
});

const DMN11URI = '"http://www.omg.org/spec/DMN/20151101/dmn.xsd"';
const DMN12URI = '"http://www.omg.org/spec/DMN/20180521/MODEL/"';
const DMN13URI = '"https://www.omg.org/spec/DMN/20191111/MODEL/"';
/**
 * Check if XML needs migration.
 *
 * @param {string} xml
 *
 * @returns {boolean}
 * */
export function needsMigration(xml: any) {
  return hasNamespace(DMN11URI, xml) || hasNamespace(DMN12URI, xml);
}

/**
 * Migrate DMN 1.1 XML to 1.3.
 *
 * @param {string} xml
 *
 * @returns {Promise<string>}
 */
export async function migrateDiagram(xml: any) {
  if (!isString(xml)) {
    return xml; // retourne le XML sans migration
  }

  try {
    if (hasNamespace(DMN11URI, xml)) {
      console.log("Migration de DMN 1.1 à 1.3");
      return await migrateFrom11To13(xml); // Utilisez await directement
    } else if (hasNamespace(DMN12URI, xml)) {
      console.log("Migration de DMN 1.2 à 1.3");
      return migrateFrom12To13(xml); // Cette fonction n'est pas asynchrone, donc pas besoin de await
    } else if (hasNamespace(DMN13URI, xml)) {
      console.log("DMN 1.3 déjà présent");
      return xml;
    }
  } catch (err) {
    throw err; // Relancez l'erreur pour qu'elle soit attrapée par l'appelant
  }

  return xml; // retourne le XML sans migration
}

/**
 * Check if XML has namespace.
 *
 * @param {string} namespace
 * @param {string} xml
 *
 * @returns {boolean}
 */
function hasNamespace(namespace: any, xml: any) {
  return xml.includes(namespace);
}

/**
 * Migrate DMN 1.1 XML to 1.3.
 *
 * @param {string} xml
 *
 * @returns {string}
 */
function migrateFrom12To13(xml: any) {
  return new Promise((resolve) =>
    resolve(
      xml
        .replace(DMN12URI, DMN13URI)
        .replace(
          '"http://www.omg.org/spec/DMN/20180521/DMNDI/"',
          '"https://www.omg.org/spec/DMN/20191111/DMNDI/"',
        ),
    ),
  );
}

/**
 * Migrate DMN 1.1 XML to 1.3.
 *
 * @param {string} xml
 *
 * @returns {string}
 */
async function migrateFrom11To13(xml: any) {
  const namespaceReplacedXML = xml.replace(DMN11URI, DMN13URI);

  try {
    const { rootElement: definitions } = await moddle.fromXML(
      namespaceReplacedXML,
      "dmn:Definitions",
    );

    addIds(definitions);
    addNames(definitions);
    migrateDI(definitions, moddle);

    const { xml: migratedXML } = await moddle.toXML(definitions, {
      format: true,
    });
    return migratedXML;
  } catch (error) {
    throw error; // L'erreur sera propagée à l'appelant de la fonction
  }
}

export const TARGET_DMN_VERSION = "1.3";

/**
 * Add ID to element if required.
 *
 * @param {Object} element
 */
function addId(element: any) {
  if (element.id) {
    return;
  }

  if (
    isAny(element, [
      "dmn:DMNElement",
      "dmndi:DMNDiagram",
      "dmndi:DMNDiagramElement",
    ])
  ) {
    element.id = ids.nextPrefixed(element.$type.split(":")[1] + "_", element);
  }
}

interface TypeWithDollarType {
  $type?: string;
  [key: string]: any; // To allow indexing with string keys and accessing other properties
}

function isTypeWithDollarType(value: any): value is TypeWithDollarType {
  return value && typeof value.$type === "string";
}

// ... other existing functions

// Update the forEach loop in the addIds function
function addIds(element: any) {
  addId(element);

  Object.values(element).forEach((value) => {
    if (isTypeWithDollarType(value)) {
      addId(value);
      addIds(value);
    }

    if (isArray(value)) {
      value.forEach(addIds);
    }
  });
}

/**
 * Add name to element if required.
 *
 * @param {Object} element
 */
function addName(element: any) {
  if (is(element, "dmn:NamedElement") && !element.name) {
    element.name = element.id;
  }
}

/**
 * Add names to all elements that have to have names but don't.
 *
 * @param {Object} element
 */
function addNames(element: any) {
  addName(element);

  Object.values(element).forEach((value) => {
    if (isTypeWithDollarType(value)) {
      addName(value);
      addNames(value);
    }

    if (isArray(value)) {
      value.forEach(addNames);
    }
  });
}

/**
 * Create and return `dmndi:DMNDI`.
 *
 * @param {Object} moddle
 *
 * @returns {Object}
 */
function createDMNDI(moddle: any) {
  const dmnDiagram = moddle.create("dmndi:DMNDiagram", {
    diagramElements: [],
  });

  addId(dmnDiagram);

  const dmnDI = moddle.create("dmndi:DMNDI", {
    diagrams: [dmnDiagram],
  });

  dmnDiagram.$parent = dmnDI;

  return dmnDI;
}

/**
 * Check if element is type.
 *
 * @param {Object} element
 * @param {string} type
 *
 * @returns {boolean}
 */
function is(element: any, type: any) {
  return isFunction(element.$instanceOf) && element.$instanceOf(type);
}

/**
 * Check if element is any type.
 *
 * @param {Object} element
 * @param {Array<string>} types
 *
 * @returns {boolean}
 */
function isAny(element: any, types: string[]) {
  return some(types, (type: string) => is(element, type));
}

/**
 * Get referenced DMN element.
 *
 * @param {Object} drgElement
 * @param {string} source
 *
 * @returns {Object}
 */
interface DMNElementReference {
  href: string;
  [key: string]: any; // To allow indexing with string keys and accessing other properties
}

function isDMNElementReference(value: any): value is DMNElementReference {
  return value && typeof value.href === "string";
}

// ... (rest of your existing code)

function getDMNElementRef(drgElement: any, source: any) {
  if (is(drgElement, "dmn:Association")) {
    return drgElement;
  }

  return Object.values(drgElement).reduce((dmnElementRef, dmnElements) => {
    if (isArray(dmnElements)) {
      return (
        dmnElementRef ||
        dmnElements.find((dmnElement) => {
          if (is(dmnElement, "dmn:DMNElement")) {
            return Object.values(dmnElement).find((dmnElementReference) => {
              if (isDMNElementReference(dmnElementReference)) {
                const { href } = dmnElementReference;
                return href.replace("#", "").includes(source);
              }
            });
          }
        })
      );
    }

    return dmnElementRef;
  }, null);
}

/**
 * Migrate custom DI to DMN 1.3 DI.
 *
 * @param {Object} definitions
 * @param {Object} moddle
 *
 * @returns {Object}
 */
function migrateDI(definitions: any, moddle: any) {
  const diagramElements: any[] = [];

  const semanticElements = [].concat(
    definitions.get("drgElement"),
    definitions.get("artifact"),
  );

  semanticElements.forEach((semantic) => {
    const extensionElements = semantic.get("extensionElements");

    if (!extensionElements) {
      return;
    }

    extensionElements.get("values").forEach((extensionElement: any) => {
      if (is(extensionElement, "biodi:Bounds")) {
        const bounds = moddle.create("dc:Bounds", {
          height: extensionElement.get("height"),
          width: extensionElement.get("width"),
          x: extensionElement.get("x"),
          y: extensionElement.get("y"),
        });

        const shape = moddle.create("dmndi:DMNShape", {
          bounds,
          dmnElementRef: semantic,
        });

        bounds.$parent = shape;

        addId(shape);

        diagramElements.push(shape);

        shape.$parent = diagramElements;
      }

      if (is(extensionElement, "biodi:Edge")) {
        const dmnElementRef = getDMNElementRef(
          semantic,
          extensionElement.get("source"),
        );

        // referenced DMN element does not exist,
        // we can happily ignore this: https://github.com/bpmn-io/dmn-migrate/issues/18
        if (!dmnElementRef) {
          return;
        }

        const waypoints = extensionElement
          .get("waypoints")
          .map((waypoint: any) => {
            return moddle.create("dc:Point", {
              x: waypoint.get("x"),
              y: waypoint.get("y"),
            });
          });

        const edge = moddle.create("dmndi:DMNEdge", {
          dmnElementRef,
          waypoint: waypoints,
        });

        dmnElementRef.$parent = edge;

        addId(edge);

        waypoints.forEach((wayPoint: any) => (wayPoint.$parent = edge));

        diagramElements.push(edge);

        edge.$parent = diagramElements;
      }
    });

    extensionElements.set(
      "values",
      extensionElements.get("values").filter((extensionElement: any) => {
        return !isAny(extensionElement, ["biodi:Bounds", "biodi:Edge"]);
      }),
    );

    if (!extensionElements.get("values").length) {
      semantic.set("extensionElements", undefined);
    }
  });

  if (diagramElements.length) {
    const dmnDI = createDMNDI(moddle);

    definitions.set("dmnDI", dmnDI);

    dmnDI.$parent = definitions;

    const diagrams = dmnDI.get("diagrams")[0];

    diagrams.set("diagramElements", diagramElements);

    diagramElements.forEach(
      (diagramElement) => (diagramElement.$parent = diagrams),
    );
  }

  return definitions;
}
