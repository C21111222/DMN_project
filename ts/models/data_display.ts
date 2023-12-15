import { DecisionTable } from "./decision_table";
import { showWarningAlert, showErrorAlert } from "../utils/alert";
import {Data} from "./data";
declare const DmnJS: any;

/**
 * Represents a class for displaying data in a decision table.
 */
export class DataDisplay {

    /**
     * Creates an instance of the class.
     * @param file The file object.
     */
    constructor(public decision_table: DecisionTable) {
      this.init();
    }
  
    /**
     * Initializes the class by displaying the table, initializing the decision table,
     * and displaying the input and output data.
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    private async init() {
      await this.display_table();
      await this.decision_table.init();
      this.display_input_data();
    }
  
    /**
     * Displays the table by importing and rendering the DMN XML.
     * @returns {Promise<void>} A promise that resolves when the table is displayed.
     */
    private async display_table() {
      const xml = await this.decision_table.file.text();
      const viewer = new DmnJS({ container: "#canvas" });
  
      try {
        const { warnings } = await viewer.importXML(xml);
        if (warnings.length) {
          showWarningAlert("DMN Viewer Warnings", warnings.join("\n"));
        }
      } catch (err) {
        showErrorAlert("Error displaying table", err.message);

      }
    }
  
    /**
     * Displays the input data table on the page.
     */
    private display_input_data() {
      const table_div = document.getElementById("input_data_table");
      if (!table_div) {
        showErrorAlert("Error displaying input data", "Could not find input data table div");
        return;
      }
  
      const table = this.createTable(
        ["Name", "Type"],
        this.decision_table.dmn_input_data.map((data : Data) => [data.name, data.type]),
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
      //on utilise createTable pour créer le tableau :
      const table_div = document.getElementById(
        "output_data_table",
      ) as HTMLTableElement;
      if (table_div) {
        const table = this.createTable(
          ["Data name", "Data value"],
          this.decision_table.dmn_output_data.map((data : Data) => [data.name, json[data.name!]]),
        );
        table_div.appendChild(table);
        this.show_result();
        
      }

    }

    public show_result() {
      const table_div = document.getElementById(
        "output_data_div",
      ) as HTMLTableElement;
      if (table_div) {
        table_div.style.display = "block";
      }
    }

    public hide_result() {
      const table_div = document.getElementById(
        "output_data_div",
      ) as HTMLTableElement;
      if (table_div) {
        table_div.style.display = "none";
      }
    }

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