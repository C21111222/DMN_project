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
} from "../utils/DMN-JS";
import { unaryTest } from "feelin";
import { Data } from "./data";
import  { showErrorAlert, showWarningAlert } from "../utils/alert";
import { migrateDiagram } from "../utils/migrate_DMN";
declare const DmnModdle: any;

/**
 * Represents a DMN file, based on the DMN-JS moddle.
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
    public dmn_input_data: Data[] = [];
    public dmn_output_data: Data[] = [];
    public hitPolicy: string = "UNIQUE";
    public rules: DMN_DecisionRule[] = [];
    public is_init: boolean = false;
  
    constructor(public file: File) {}
  
    /**
     * Initializes the class by defining DMN data, input data, and output data.
     * Sets the `is_init` flag to true.
     * Logs the result of defining rules.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    public async init() {
      await this.manage_dmn_version();
      await this.define_dmn_data();
      this.define_input_data();
      this.define_output_data();
      this.define_rules();
      this.define_hitPolicy();
      this.is_init = true;
    }

  /**
   * Defines the version of the DMN file and modifies it for compatibility to 1.3.0.
   */
  private async manage_dmn_version(): Promise<void> {
    const xml = await this.file.text();
    console.log("migrating")
    const migrated_xml = await migrateDiagram(xml) as string;
    console.log("migrated")
    this.file = new File([migrated_xml], this.file.name, { type: "text/xml" });
  }


    /**
     * Defines the DMN data by parsing the XML content of the file.
     * @returns {Promise<void>} A promise that resolves when the DMN data is defined.
     */
    private async define_dmn_data(): Promise<void> {
      const xml = await this.file.text();
      const file_name = this.file.name;
      const dmn_file: DMN_file = { file_name, file_content: xml };
      try {
        const reader = await this.dmnModdle.fromXML(xml);
        const me: ModdleElement = reader.rootElement;
        this.dmn_data = { ...dmn_file, me: me };
      } catch (error) {
        showErrorAlert("Error parsing DMN file", error);
        
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
      res: Data[] = [],
    ): Data[] {
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
      res: Data[],
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
      res: Data[],
    ): void {
      const input_expression = input_clause.inputExpression;
      if (
        is_DMN_LiteralExpression(input_expression) &&
        input_expression.text &&
        input_expression.typeRef
      ) {
        const name = input_expression.text.split(" ")[0];
        res.push(new Data(name, input_expression.typeRef));
      }
    }
  
    /**
     * Defines the input data for the DMN project.
     *
     * @returns A Promise that resolves when the input data is defined.
     */
    private define_input_data(): void {
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
      res: Data[] = [],
    ): Data[] {
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
      res: Data[],
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
      res: Data[],
    ): void {
      const name = output_clause.name;
      const type = output_clause.typeRef;
      res.push(new Data(name, type));
    }
  
    /**
     * Defines the output data for the DMN project.
     */
    private define_output_data(): void {
      if (this.dmn_data && this.dmn_data.me) {
        const output_data = this.recur_get_output_data(this.dmn_data.me);
        this.dmn_output_data = output_data;
        if (
          this.dmn_output_data.length === 1 &&
          this.dmn_output_data[0].name === undefined
        ) {
          showWarningAlert("Error parsing DMN file", "No output data found.");
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
      this.rules = rules;
    }

  /**
   * Defines the hit policy for the DMN project.
   */
  private define_hitPolicy(): void {
    if (this.dmn_data && this.dmn_data.me) {
      const decision = is_DMN_Definitions(this.dmn_data.me)
        ? this.dmn_data.me.drgElement.filter(is_DMN_Decision)
        : [];
      const decision_table = is_DMN_Decision(decision[0])
        ? decision[0].decisionLogic
        : null;
      this.hitPolicy = is_DMN_DecisionTable(decision_table) && decision_table.hitPolicy
        ? decision_table.hitPolicy
        : "UNIQUE";
    } else {
      this.hitPolicy = "UNIQUE";
    }
  }
  
  }



/**
 * Evaluates a decision table based on the provided JSON input.
 * @param decision_table - The decision table to evaluate.
 * @param json - The JSON input data.
 * @returns The result of the evaluation.
 * @throws Error if the decision table is not initialized or if there is a hit policy violation.
 */
export function evaluateDecisionTable(decision_table : DecisionTable, json: any): Record<string, any> {
  if (!decision_table.is_init) {
    throw new Error("Decision table is not initialized.");
  }
  const results: Record<string, any>[] = [];
  decision_table.rules.forEach((rule: DMN_DecisionRule) => {
    const ruleMatch = rule.inputEntry.every((inputEntry, index) => {
      const inputName = decision_table.dmn_input_data[index].name;
      const expression = inputEntry.text;
      if (expression == "") {
        return true;
      }
      return unaryTest(expression, {'?':json[inputName]});
    });

    if (ruleMatch) {
      const result: Record<string, any> = {};
      rule.outputEntry.forEach((outputEntry, index) => {
        const outputName = decision_table.dmn_output_data[index].name;
        result[outputName] = outputEntry.text;
      });
      results.push(result);
    }
  });


  switch (decision_table.hitPolicy) {
    case "UNIQUE":
      if (results.length === 1) {
        console.log(results[0]);
        return results[0];
      } else if (results.length > 1) {
        throw new Error(
          "Hit policy violation: More than one rule matched for UNIQUE hit policy.",
        );
      }
      break;
    case "FIRST":
      if (results.length > 0) {
        return results[0];
      }
      break;
    case "ANY":
      if (
        results.every(
          (result) => JSON.stringify(result) === JSON.stringify(results[0]),
        )
      ) {
        return results[0];
      } else {
        throw new Error(
          "Hit policy violation: Different results for ANY hit policy.",
        );
      }
    case "COLLECT":
      if (results.length > 1) {
        const result: Record<string, any> = {};
        results.forEach((res) => {
          Object.keys(res).forEach((key) => {
            if (result[key] === undefined) {
              result[key] = [];
            }
            result[key].push(res[key]);
          });
        });
        return result;
      } else if (results.length === 1) {
        return results[0];
      }
      return results;
    default:
      throw new Error("Hit policy not recognized or not implemented.");
  }
  return {};
}