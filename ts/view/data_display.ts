import { DMNModel } from "../models/decision_table";
import {showErrorAlert } from "../utils/alert";
import { Data } from "../models/data";
import { extractDecisionById } from "../utils/xml_parser";
declare const DmnJS: any;

/**
 * Represents a class for displaying data in a decision table.
 * This class is responsible for displaying the table, input data, and output data.
 * It also handles the display of the result.
 * @class
 * @property {DMNModel} dmn_model - The DMN model.
 */
export class DataDisplay {
  /**
   * Creates an instance of the class.
   * @param {DMNModel} dmn_model - The DMN model.
   */
  constructor(public dmn_model: DMNModel) {}

  /**
   * Initializes the class by displaying the table, initializing the decision table,
   * and displaying the input and output data.
   * @returns {Promise<void>} A promise that resolves when the initialization is complete.
   */
  public async init() {
    await this.display_table();
    this.display_input_data();
    await this.create_subtables();
  }

  /**
   * Displays the table by importing and rendering the DMN XML.
   * @returns {Promise<void>} A promise that resolves when the table is displayed.
   */
  private async display_table() {
    const xml = await this.dmn_model.file.text();
    const viewer = new DmnJS({ container: "#canvas" });

    try {
      const { warnings } = await viewer.importXML(xml);
      if (warnings.length) {
        console.warn("Warnings while rendering table:");
        console.warn(warnings);
      }
    } catch (err) {
      showErrorAlert("Error displaying table", err.message);
    }
  }

  /**
   * Create the subtables (represented by the <decision> elements in the DMN XML).
   * @returns {Promise<void>} A promise that resolves when the subtables are displayed.
   */
  private async create_subtables() {
    // on teste si le fichier contient des sous-tables
    if (this.dmn_model.dmn_decision.length <= 1) {
      return;
    }
    const subtables = this.dmn_model.dmn_decision;

    for (const [index, decision] of subtables.entries()) {
      const xml = await this.dmn_model.file.text();
      const newxml: string = extractDecisionById(xml, decision.id!);
      const div = document.createElement("div");
      div.id = `subtable_${decision.id}`;
      div.classList.add("subtable");
      div.setAttribute("hidden", "");

      const subtablesContainer = document.getElementById("canvas_subtable");
      if (subtablesContainer) {
        subtablesContainer.appendChild(div);
      } else {
        showErrorAlert(
          "Error displaying subtable",
          "Subtables container not found",
        );
      }
      try {
        const viewer = new DmnJS({ container: `#subtable_${decision.id}` });
        const { warnings } = await viewer.importXML(newxml);
        if (warnings.length) {
          console.warn("Warnings while rendering subtable:");
          console.warn(warnings);
        }
      } catch (err) {
        showErrorAlert("Error displaying subtable", err.message);
      }
    }
  }

  /**
   * Displays the input data table on the page.
   */
  private display_input_data() {
    const table_div = document.getElementById("input_data_table");
    if (!table_div) {
      showErrorAlert(
        "Error displaying input data",
        "Could not find input data table div",
      );
      return;
    }

    const table = this.createTable(
      ["Name", "Type"],
      this.dmn_model.dmn_input_data.map((data: Data) => [data.name, data.type]),
    );
    table_div.appendChild(table);
  }

  /**
   * Creates an HTML table element with the specified headers and rows.
   *
   * @param headers - An array of strings representing the table headers.
   * @param rows - An array of arrays of strings representing the table rows.
   * @returns The created HTMLTableElement.
   */
  private createTable(headers: string[], rows: string[][]): HTMLTableElement {
    const table = document.createElement("table");
    table.classList.add("data");

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    rows.forEach((rowData) => {
      const row = tbody.insertRow();
      rowData.forEach((cellData) => {
        const cell = row.insertCell();
        cell.textContent = cellData;
      });
    });

    return table;
  }

  /**
   * Displays the result in the table.
   * @param json - The JSON object containing the data values.
   */
  public display_result(json: any) {
    const table_div = document.getElementById(
      "output_data_table",
    ) as HTMLTableElement;
    if (table_div) {
      const table = this.createTable(
        ["Data name", "Data value"],
        this.dmn_model.dmn_output_data.map((data: Data) => [
          data.name,
          json[data.name!],
        ]),
      );
      table_div.appendChild(table);
      this.show_result();
    }
  }

  /**
   * Displays the result by setting the display style of the output_data_div table element to "block".
   */
  public show_result() {
    const table_div = document.getElementById(
      "output_data_div",
    ) as HTMLTableElement;
    if (table_div) {
      table_div.style.display = "block";
    }
  }

  /**
   * Hides the result by setting the display style of the output_data_div table element to "none".
   */
  public hide_result() {
    const table_div = document.getElementById(
      "output_data_div",
    ) as HTMLTableElement;
    if (table_div) {
      table_div.style.display = "none";
    }
  }

  /**
   * Hides the subtables.
   */
  public hide_subtables() {
    const subtables = document.getElementById(
      "canvas_subtable",
    ) as HTMLDivElement;
    subtables.setAttribute("hidden", "");
  }

  /**
   * Deletes the result by clearing the element with the specified ID.
   */
  public delete_result() {
    this.clearElementById("output_data_table");
  }

  /**
   * Deletes the display by clearing the canvas, input data table, and output data table.
   */
  public delete_display() {
    this.clearElementById("canvas");
    this.clearElementById("input_data_table");
    this.clearElementById("output_data_table");
    this.hide_result();
    this.hide_subtables();
  }

  /**
   * Clears the inner HTML content of an element with the specified ID.
   *
   * @param elementId - The ID of the element to clear.
   */
  private clearElementById(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = "";
    }
  }
}
