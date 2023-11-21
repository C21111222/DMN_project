
import { DMN_DecisionRule,  DMN_Decision, DMN_DecisionTable, DMN_Definitions, DMN_InformationRequirement, DMN_data, DMN_file, ModdleElement, Set_current_diagram, is_DMN_Definitions, is_DMN_Decision, is_DMN_InputData, is_DMN_DecisionTable } from "./DMN-JS";
import {unaryTest} from "feelin";
declare const DmnJS : any
declare const DmnModdle: any;

export class Data_display {
    private decision_table: DecisionTable;
    constructor(
      public file: File
    ) {
      this.decision_table = new DecisionTable(file);
      this.display_table();
      this.display_input_data();
    }
  
    private async display_table() {
      const xml = await this.file.text();
      const viewer = new DmnJS({container: '#canvas',});
            
      try {
        const { warnings } = await viewer.importXML(xml);
        console.log('rendered');
      } catch (err) {
        console.log('error rendering', err)
      }
          
    }
  
    private display_input_data() {
      // on les affiche dans le tableau :
      const table_div = document.getElementById("input_data_table") as HTMLTableElement;
      if (table_div) {
        // on affiche les data en entrée attendues :
        // on crée l'entête du tableau td et th :
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        const thead = document.createElement("thead");
        const table = document.createElement("table");
        th.innerHTML = "Input Data";
        tr.appendChild(th);
        thead.appendChild(tr);
        table.appendChild(thead);
        table_div.appendChild(table);
  
        const tr1 = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.innerHTML = "Data name";
        tr1.appendChild(td1);
        const td2 = document.createElement("td");
        td2.innerHTML = "Data type";
        tr1.appendChild(td2);
        table.appendChild(tr1);
        // on affiche les données en entrée, leur nom et leur type :
        for (const data of this.decision_table.dmn_input_data) {
          const tr1 = document.createElement("tr");
          const td1 = document.createElement("td");
          td1.innerHTML = data.name!;
          tr1.appendChild(td1);
          const td2 = document.createElement("td");
          td2.innerHTML = data.type;
          tr1.appendChild(td2);
          table.appendChild(tr1);
        }
      }
      
    }

    public delete_display() {
        const canvas = document.getElementById("canvas");
        canvas!.innerHTML = "";
        }

  }
  
  
  
  
  export class Input_data {
    constructor(
      public name: string,
      public type: string,
    ) {}
  }
  
  
  export class DecisionTable {
    private dmnModdle = new DmnModdle();
    public dmn_data: DMN_data|null = null;
    public dmn_input_data: Input_data[] = [];
  
    constructor(
      public file: File,
    ) {
      (async () => {
        const xml = await file.text();
        const file_name = file.name;
        const dmn_file: DMN_file = {file_name, file_content: xml};
        
        const reader = await this.dmnModdle.fromXML(xml);
        const me: ModdleElement = reader.rootElement;
        this.dmn_data = {...dmn_file, me: me}
  
        Set_current_diagram(dmn_file, this.dmn_data);
        this.define_input_data();
      })();
    }
  
    private define_input_data() {
      // on récupère les DMN_InputData :
      const input_data = is_DMN_Definitions(this.dmn_data!.me) ? this.dmn_data!.me.drgElement.filter(is_DMN_InputData) : [];
      console.log(input_data);
      this.dmn_input_data = input_data.map((input) => {
        const name = input.name!;
        const type = input.variable.typeRef!;
        return new Input_data(name, type);
      }
      );
      
    }

    private define_rules() {
        const decision = is_DMN_Definitions(this.dmn_data!.me) ? this.dmn_data!.me.drgElement.filter(is_DMN_Decision) : [];
        const decision_table = is_DMN_Decision(decision[0]) ? decision[0].decisionLogic : null;
        const rules = is_DMN_DecisionTable(decision_table) ? decision_table.rule : [];
        console.log(rules);
        return rules;
    }

    public eval(json: any) {
        //on verifie que les données en entrée sont bien celles attendues :
        // pour chaque donnée en entrée, on vérifie que le nom et le type correspondent à ceux attendus :
        this.dmn_input_data.forEach((input_data) => {
            const data_name = input_data.name;
            const data_type = input_data.type;
            const data_value = json[data_name];
            if (typeof data_value !== data_type) {
                // on déclenche une notification d'erreur avec sweetalert2 :
                const swal = require('sweetalert2');
                swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `The data ${data_name} must be of type ${data_type} !`,
                });
            }
        }
        );


        
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
  
  