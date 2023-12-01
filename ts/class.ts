
import { DMN_DecisionRule, ExtendedModdleElement,is_DMN_LiteralExpression, is_ExtendedModdleElement, DMN_Decision, DMN_DecisionTable, DMN_Definitions, DMN_InformationRequirement, DMN_data, DMN_file, ModdleElement, Set_current_diagram, is_DMN_Definitions, is_DMN_Decision, is_DMN_InputData, is_DMN_DecisionTable } from "./DMN-JS";
import {unaryTest} from "feelin";
declare const DmnJS : any
declare const DmnModdle: any;


export class DecisionTable {
  private dmnModdle = new DmnModdle();
  public dmn_data: DMN_data|null = null;
  public dmn_input_data: Input_data[] = [];
  public dmn_output_data: Input_data[] = [];
  public is_init: boolean = false;

  constructor(public file: File) {
  }

  public async init() {
    await this.define_dmn_data();
    await this.define_input_data();
    await this.define_output_data();
    this.is_init = true;
    console.log(this.define_rules());

  }

  private async define_dmn_data() {
    const xml = await this.file.text();
    const file_name = this.file.name;
    const dmn_file: DMN_file = {file_name, file_content: xml};
    
    const reader = await this.dmnModdle.fromXML(xml);
    const me: ModdleElement = reader.rootElement;
    this.dmn_data = {...dmn_file, me: me};
  }

  private recur_get_input_data(drg_element: ExtendedModdleElement, res: Input_data[] = []): Input_data[] {
    if (is_ExtendedModdleElement(drg_element) && drg_element.drgElement) {
      drg_element.drgElement.forEach((element: ExtendedModdleElement) => {
        this.recur_get_input_data(element, res);
      });
    } else if (is_DMN_Decision(drg_element)) {
      this.extractInputDataFromDecision(drg_element, res);
    }
    return res;
  }
  
  private extractInputDataFromDecision(decision: DMN_Decision, res: Input_data[]): void {
    const decision_table = decision.decisionLogic;
    if (is_DMN_DecisionTable(decision_table)) {
      decision_table.input.forEach(input_clause => {
        this.extractInputDataFromClause(input_clause, res);
      });
    }
  }
  
  private extractInputDataFromClause(input_clause: any, res: Input_data[]): void {
    const input_expression = input_clause.inputExpression;
    if (is_DMN_LiteralExpression(input_expression) && input_expression.text && input_expression.typeRef) {
      const name = input_expression.text.split(" ")[0];
      res.push(new Input_data(name, input_expression.typeRef));
    }
  }
  
  private async define_input_data(): Promise<void> {
    if (this.dmn_data && this.dmn_data.me) {
      const input_data = this.recur_get_input_data(this.dmn_data.me);
      this.dmn_input_data = input_data;
    } else {
      // Handle the case where dmn_data or dmn_data.me is not available
      console.error("DMN data is not initialized.");
    }
  }

  private recur_get_output_data(drg_element: ExtendedModdleElement, res: Input_data[] = []): Input_data[] {
    if (is_ExtendedModdleElement(drg_element) && drg_element.drgElement) {
      drg_element.drgElement.forEach((element: ExtendedModdleElement) => {
        this.recur_get_output_data(element, res);
      });
    } else if (is_DMN_Decision(drg_element)) {
      this.extractOutputDataFromDecision(drg_element, res);
    }
    return res;
  }

  private extractOutputDataFromDecision(decision: DMN_Decision, res: Input_data[]): void {
    const decision_table = decision.decisionLogic;
    if (is_DMN_DecisionTable(decision_table)) {
      decision_table.output.forEach(output_clause => {
        this.extractOutputDataFromClause(output_clause, res);
      });
    }
  }

  private extractOutputDataFromClause(output_clause: any, res: Input_data[]): void {
    const name = output_clause.name;
    const type = output_clause.typeRef;
    res.push(new Input_data(name, type));
  }

  private async define_output_data(): Promise<void> {
    if (this.dmn_data && this.dmn_data.me) {
      const output_data = this.recur_get_output_data(this.dmn_data.me);
      this.dmn_output_data = output_data;
    } else {
      // Handle the case where dmn_data or dmn_data.me is not available
      console.error("DMN data is not initialized.");
    }
  }

  private define_rules() {
      const decision = is_DMN_Definitions(this.dmn_data!.me) ? this.dmn_data!.me.drgElement.filter(is_DMN_Decision) : [];
      const decision_table = is_DMN_Decision(decision[0]) ? decision[0].decisionLogic : null;
      const rules = is_DMN_DecisionTable(decision_table) ? decision_table.rule : [];
      return rules;
  }

  public async eval(json: any): Promise<Record<string, any>> {
    if (!this.is_init) {
      await this.init();
    }
    
    // Initialize a result object
    const result: Record<string, any> = {};
  
    // Validate input data and populate the result object
    this.dmn_input_data.forEach((input_data) => {
      const data_name = input_data.name;
      const data_type = input_data.type;
      const data_value = json[data_name];
      if (typeof data_value !== data_type) {
        // Trigger an error notification with sweetalert2
        const swal = require('sweetalert2');
        swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `The data ${data_name} must be of type ${data_type}!`,
        });
      } else {
        // Assign the valid data to the result object
        result[data_name] = data_value;
      }
    });
  
    // Return the result object wrapped in a Promise
    return Promise.resolve(result);
  }
}

export class Current_run {
  public decision_table?: DecisionTable;
  public data_input?: any;
  public data_display?: Data_display;

  constructor(
    public current_run : boolean = false,
  ) {}

  public delete_display() {
    this.data_display!.delete_display();
  }
}
  

export class Data_display {
  private decision_table: DecisionTable;

  constructor(public file: File) {
    this.decision_table = new DecisionTable(file);
    this.init();
  }

  private async init() {
    await this.display_table();
    await this.decision_table.init();
    this.display_input_data();
    this.display_output_data();
  }

  private async display_table() {
    const xml = await this.file.text();
    const viewer = new DmnJS({ container: '#canvas' });

    try {
      const { warnings } = await viewer.importXML(xml);
      if (warnings.length) {
        console.warn('DMN Viewer Warnings:', warnings);
      }
      console.log('DMN Viewer Rendered');
    } catch (err) {
      console.error('DMN Viewer Error Rendering:', err);
    }
  }

  private display_input_data() {
    const table_div = document.getElementById("input_data_table");
    if (!table_div) {
      console.error("Input data table element not found.");
      return;
    }

    const table = this.createTable(['Name', 'Type'], this.decision_table.dmn_input_data.map(data => [data.name, data.type]));
    table_div.appendChild(table);
  }



  private createTable(headers: string[], rows: string[][]): HTMLTableElement {
    const table = document.createElement("table");
    table.classList.add("data");

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headers.forEach(headerText => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    rows.forEach(rowData => {
      const row = tbody.insertRow();
      rowData.forEach(cellData => {
        const cell = row.insertCell();
        cell.textContent = cellData;
      });
    });

    return table;
  }

  public display_output_data() {
    console.log(this.decision_table.dmn_output_data);
    const table_div = document.getElementById("output_data_table");
    if (!table_div) {
      console.error("Input data table element not found.");
      return;
    }

    const table = this.createTable(['Name', 'Type'], this.decision_table.dmn_output_data.map(data => [data.name, data.type]));
    table_div.appendChild(table);
    table_div.style.display = "block";

  }

  public display_result(json: any) {
    // on affiche le résultat dans le tableau :
    const table_div = document.getElementById("output_data_table") as HTMLTableElement;
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

  public delete_display() {
    this.clearElementById("canvas");
    this.clearElementById("input_data_table");
    this.clearElementById("output_data_table");
  }

  private clearElementById(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = "";
    }
  }
}
  
  
  
  
export class Input_data {
    constructor(
      public name: string,
      public type: string,
    ) {}
}