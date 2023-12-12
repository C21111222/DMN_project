import {
  DMN_DecisionRule,
  ExtendedModdleElement,
  is_DMN_LiteralExpression,
  is_ExtendedModdleElement,
  DMN_Decision,
  DMN_data,
  DMN_file,
  ModdleElement,
  is_DMN_Definitions,
  is_DMN_Decision,
  is_DMN_InputData,
  is_DMN_DecisionTable,
} from "./DMN-JS";
import { unaryTest } from "feelin";
declare const DmnJS: any;
declare const DmnModdle: any;

/**
 * Represents a DMN file.
 * 
 * @property dmn_data - The DMN data.
 * @property dmn_input_data - The input data.
 * @property dmn_output_data - The output data.
 * @property is_init - Indicates if the DMN data is initialized.
 * @property dmnModdle - The DMN moddle.
* @property file - The file object.
  
 */
export class DecisionTable {
  private dmnModdle = new DmnModdle();
  public dmn_data: DMN_data | null = null;
  public dmn_input_data: Input_data[] = [];
  public dmn_output_data: Input_data[] = [];
  public is_init: boolean = false;

  constructor(public file: File) {}

  /**
   * Initializes the class by defining DMN data, input data, and output data.
   * Sets the `is_init` flag to true.
   * Logs the result of defining rules.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  public async init() {
    await this.define_dmn_data();
    await this.define_input_data();
    await this.define_output_data();
    this.is_init = true;
    console.log(this.define_rules());
  }

  /**
   * Defines the DMN data by parsing the XML content of the file.
   * @returns {Promise<void>} A promise that resolves when the DMN data is defined.
   */
  private async define_dmn_data() {
    const xml = await this.file.text();
    const file_name = this.file.name;
    const dmn_file: DMN_file = { file_name, file_content: xml };
    try {
      const reader = await this.dmnModdle.fromXML(xml);
      const me: ModdleElement = reader.rootElement;
      this.dmn_data = { ...dmn_file, me: me };
    } catch (error) {
      //  use sweetalert2 to display the error
      const swal = require("sweetalert2");
      swal.fire({
        icon: "error",
        title: "Oops...",
        text: "The DMN file is not valid!",
      });
    }
  }

  /**
   * Recursively retrieves input data from a DRG element.
   * 
   * @param drg_element The DRG element to retrieve input data from.
   * @param res The array to store the retrieved input data.
   * @returns An array of input data.
   */
  private recur_get_input_data(
    drg_element: ExtendedModdleElement,
    res: Input_data[] = [],
  ): Input_data[] {
    if (is_ExtendedModdleElement(drg_element) && drg_element.drgElement) {
      drg_element.drgElement.forEach((element: ExtendedModdleElement) => {
        this.recur_get_input_data(element, res);
      });
    } else if (is_DMN_Decision(drg_element)) {
      this.extractInputDataFromDecision(drg_element, res);
    }
    return res;
  }

  /**
   * Extracts input data from a DMN decision.
   * 
   * @param decision - The DMN decision object.
   * @param res - The array to store the extracted input data.
   */
  private extractInputDataFromDecision(
    decision: DMN_Decision,
    res: Input_data[],
  ): void {
    const decision_table = decision.decisionLogic;
    if (is_DMN_DecisionTable(decision_table)) {
      decision_table.input.forEach((input_clause) => {
        this.extractInputDataFromClause(input_clause, res);
      });
    }
  }

  /**
   * Extracts input data from the input clause.
   * 
   * @param input_clause - The input clause object.
   * @param res - The array to store the extracted input data.
   */
  private extractInputDataFromClause(
    input_clause: any,
    res: Input_data[],
  ): void {
    const input_expression = input_clause.inputExpression;
    if (
      is_DMN_LiteralExpression(input_expression) &&
      input_expression.text &&
      input_expression.typeRef
    ) {
      const name = input_expression.text.split(" ")[0];
      res.push(new Input_data(name, input_expression.typeRef));
    }
  }

  /**
   * Defines the input data for the DMN project.
   * 
   * @returns A Promise that resolves when the input data is defined.
   */
  private async define_input_data(): Promise<void> {
    if (this.dmn_data && this.dmn_data.me) {
      const input_data = this.recur_get_input_data(this.dmn_data.me);
      this.dmn_input_data = input_data;
    } else {
      // Handle the case where dmn_data or dmn_data.me is not available
      console.error("DMN data is not initialized.");
    }
  }

  /**
   * Recursively retrieves output data from a DRG element.
   * 
   * @param drg_element The DRG element to process.
   * @param res The array to store the output data.
   * @returns An array of output data.
   */
  private recur_get_output_data(
    drg_element: ExtendedModdleElement,
    res: Input_data[] = [],
  ): Input_data[] {
    if (is_ExtendedModdleElement(drg_element) && drg_element.drgElement) {
      drg_element.drgElement.forEach((element: ExtendedModdleElement) => {
        this.recur_get_output_data(element, res);
      });
    } else if (is_DMN_Decision(drg_element)) {
      this.extractOutputDataFromDecision(drg_element, res);
    }
    return res;
  }

  /**
   * Extracts output data from a DMN decision.
   * 
   * @param decision - The DMN decision to extract output data from.
   * @param res - The input data array.
   */
  private extractOutputDataFromDecision(
    decision: DMN_Decision,
    res: Input_data[],
  ): void {
    const decision_table = decision.decisionLogic;
    if (is_DMN_DecisionTable(decision_table)) {
      decision_table.output.forEach((output_clause) => {
        this.extractOutputDataFromClause(output_clause, res);
      });
    }
  }

  /**
   * Extracts output data from the given output clause and adds it to the provided array.
   * 
   * @param output_clause - The output clause to extract data from.
   * @param res - The array to add the extracted data to.
   */
  private extractOutputDataFromClause(
    output_clause: any,
    res: Input_data[],
  ): void {
    const name = output_clause.name;
    const type = output_clause.typeRef;
    res.push(new Input_data(name, type));
  }

  /**
   * Defines the output data for the DMN project.
   * 
   * @returns A Promise that resolves when the output data is defined.
   */
  private async define_output_data(): Promise<void> {
    if (this.dmn_data && this.dmn_data.me) {
      const output_data = this.recur_get_output_data(this.dmn_data.me);
      this.dmn_output_data = output_data;
      if (this.dmn_output_data.length === 1 && this.dmn_output_data[0].name === undefined) {
        const swal = require("sweetalert2");
        swal.fire({
          icon: "error",
          title: "Oops...",
          text: "The DMN file is not valid!",
        });
      }
    } else {
      // Handle the case where dmn_data or dmn_data.me is not available
      console.error("DMN data is not initialized.");
    }
  }

  /**
   * Defines the rules for the DMN project.
   * @returns {Array} An array of rules.
   */
  private define_rules() {
    const decision = is_DMN_Definitions(this.dmn_data!.me)
      ? this.dmn_data!.me.drgElement.filter(is_DMN_Decision)
      : [];
    const decision_table = is_DMN_Decision(decision[0])
      ? decision[0].decisionLogic
      : null;
    const rules = is_DMN_DecisionTable(decision_table)
      ? decision_table.rule
      : [];
    return rules;
  }

  /**
   * Evaluates the given JSON data against the defined rules and returns the result based on the hit policy.
   * @param json The JSON data to be evaluated.
   * @returns A promise that resolves to the result of the evaluation.
   * @throws {Error} If the hit policy is violated or not recognized.
   */
  public async eval(json: any): Promise<Record<string, any>> {
    if (!this.is_init) {
      await this.init();
    }
  
    const rules = this.define_rules();
    const hitPolicy = this.getHitPolicy(); // Supposons que cette méthode existe et récupère la politique de correspondance.
    const results: Record<string, any>[] = [];
  
    rules.forEach((rule: DMN_DecisionRule) => {
      const ruleMatch = rule.inputEntry.every((inputEntry, index) => {
        const inputName = this.dmn_input_data[index].name;
        const expression = inputEntry.text;
        return unaryTest(expression, json[inputName]);
      });
  
      if (ruleMatch) {
        const result: Record<string, any> = {};
        rule.outputEntry.forEach((outputEntry, index) => {
          const outputName = this.dmn_output_data[index].name;
          result[outputName] = outputEntry.text;
        });
        results.push(result);
      }
    });
  
    switch (hitPolicy) {
      case 'UNIQUE':
        if (results.length === 1) {
          return results[0];
        } else if (results.length > 1) {
          throw new Error('Hit policy violation: More than one rule matched for UNIQUE hit policy.');
        }
        break;
      case 'FIRST':
        if (results.length > 0) {
          return results[0];
        }
        break;
      case 'ANY':
        if (results.every(result => JSON.stringify(result) === JSON.stringify(results[0]))) {
          return results[0];
        } else {
          throw new Error('Hit policy violation: Different results for ANY hit policy.');
        }
      case 'COLLECT':
        return results;
      // Ajoutez des cas supplémentaires pour d'autres politiques de correspondance si nécessaire.
      default:
        throw new Error('Hit policy not recognized or not implemented.');
    }
  return {};
  }
  
    /**
     * Retrieves the hit policy of the DMN decision table.
     * 
     * @returns The hit policy of the DMN decision table, or an empty string if the DMN data is not initialized.
     */
    private getHitPolicy(): string {
      if (this.dmn_data && this.dmn_data.me) {
        const decision = is_DMN_Definitions(this.dmn_data.me)
          ? this.dmn_data.me.drgElement.filter(is_DMN_Decision)
          : [];
        const decision_table = is_DMN_Decision(decision[0])
          ? decision[0].decisionLogic
          : null;
        const hitPolicy = is_DMN_DecisionTable(decision_table)
          ? decision_table.hitPolicy
          : null;
        return hitPolicy;
      } else {
        // Handle the case where dmn_data or dmn_data.me is not available
        console.error("DMN data is not initialized.");
        return "";
      }
    }
}



/**
 * Represents the current run of a process.
 */
export class Current_run {
  /**
   * The decision table associated with the current run.
   */
  public decision_table?: DecisionTable;
  
  /**
   * The input data for the current run.
   */
  public data_input?: any;
  
  /**
   * The data display for the current run.
   */
  public data_display?: Data_display;

  /**
   * Creates a new instance of the Current_run class.
   * @param current_run - Indicates if the current run is active or not.
   */
  constructor(public current_run: boolean = false) {}

  /**
   * Deletes the data display for the current run.
   */
  public delete_display() {
    this.data_display!.delete_display();
  }
}

/**
 * Represents a class for displaying data in a decision table.
 */
export class Data_display {
  private decision_table: DecisionTable;

  /**
   * Creates an instance of the class.
   * @param file The file object.
   */
  constructor(public file: File) {
    this.decision_table = new DecisionTable(file);
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
    this.display_output_data();
  }

  /**
   * Displays the table by importing and rendering the DMN XML.
   * @returns {Promise<void>} A promise that resolves when the table is displayed.
   */
  private async display_table() {
    const xml = await this.file.text();
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
      this.decision_table.dmn_input_data.map((data) => [data.name, data.type]),
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
   * Displays the output data of the decision table.
   */
  public display_output_data() {
    console.log(this.decision_table.dmn_output_data);
    const table_div = document.getElementById("output_data_table");
    if (!table_div) {
      console.error("Input data table element not found.");
      return;
    }

    const table = this.createTable(
      ["Name", "Type"],
      this.decision_table.dmn_output_data.map((data) => [data.name, data.type]),
    );
    table_div.appendChild(table);
    table_div.style.display = "block";
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

/**
 * Represents input data.
 */
export class Input_data {
  /**
   * Creates an instance of Input_data.
   * @param name - The name of the input data.
   * @param type - The type of the input data.
   */
  constructor(
    public name: string,
    public type: string,
  ) {}
}
