import { DecisionTable } from "./decision_table";
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
          console.warn("DMN Viewer Warnings:", warnings);
        }
        console.log("DMN Viewer Rendered");
      } catch (err) {
        console.error("DMN Viewer Error Rendering:", err);
      }
    }
  
    /**
     * Displays the input data table on the page.
     */
    private display_input_data() {
      const table_div = document.getElementById("input_data_table");
      if (!table_div) {
        console.error("Input data table element not found.");
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
      // on affiche le résultat dans le tableau :
      const table_div = document.getElementById(
        "output_data_table",
      ) as HTMLTableElement;
      if (table_div) {
        // on crée l'entête du tableau td et th :
        const table = document.createElement("table");
  
        const tr1 = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.innerHTML = "Data name";
        tr1.appendChild(td1);
        const td2 = document.createElement("td");
        td2.innerHTML = "Data value";
        tr1.appendChild(td2);
        table.appendChild(tr1);
        // on affiche les données en entrée, leur nom et leur type :
        for (const data of this.decision_table.dmn_input_data) {
          const tr1 = document.createElement("tr");
          const td1 = document.createElement("td");
          td1.innerHTML = data.name!;
          tr1.appendChild(td1);
          const td2 = document.createElement("td");
          td2.innerHTML = json[data.name!];
          tr1.appendChild(td2);
          table.appendChild(tr1);
        }
        table_div.appendChild(table);
        table_div.style.display = "block";
        //on met la propriete display à block pour afficher le tableau :
      }
    }
  
    /**
     * Deletes the display by clearing the canvas, input data table, and output data table.
     */
    public delete_display() {
      this.clearElementById("canvas");
      this.clearElementById("input_data_table");
      this.clearElementById("output_data_table");
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