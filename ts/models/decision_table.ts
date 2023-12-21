import {
  DMN_DecisionRule,
  ExtendedModdleElement,
  is_DMN_LiteralExpression,
  is_ExtendedModdleElement,
  DMN_DMNElementReference,
  DMN_Decision,
  DMN_data,
  DMN_file,
  ModdleElement,
  is_DMN_Definitions,
  is_DMN_Decision,
  is_DMN_DecisionTable,
} from "../utils/DMN-JS";
import { unaryTest, InterpreterContext } from "feelin";
import { Data } from "./data";
import {
  showErrorAlert,
  showWarningAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/alert";
import { migrateDiagram, needsMigration } from "../utils/migrate_DMN";
declare const DmnModdle: any;

/**
 * Represents a DMN file, based on the DMN-JS moddle.
 *
 * @property dmn_data - The DMN data.
 * @property dmn_input_data - The input data.
 * @property dmn_output_data - The output data.
 * @property is_init - A flag indicating if the DMN file is initialized.
 * @property dmn_decision - The DMN decision.
 * @property dmn_input_decision - The input decision.
 * @property file - The DMN file.
 * @property dmnModdle - The DMN moddle.
 */
export class DMNModel {
  private dmnModdle = new DmnModdle();
  public dmn_data: DMN_data | null = null;
  public dmn_input_data: Data[] = [];
  public dmn_output_data: Data[] = [];
  public is_init: boolean = false;
  public dmn_decision: DMN_Decision[] = [];
  public dmn_input_decision: DMN_Decision[] = [];

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
    await this.define_dmn_decision();
    this.define_input_data();
    this.define_output_data();
    this.is_init = true;
  }

  /**
   * Defines the version of the DMN file and modifies it for compatibility to 1.3.0.
   */
  private async manage_dmn_version(): Promise<void> {
    const xml = await this.file.text();
    if (!needsMigration(xml)) {
      return;
    }
    showLoadingAlert("Migrating DMN file to version 1.3.0", "Please wait...");

    const startTime = Date.now();
    const migrated_xml = (await migrateDiagram(xml)) as string;

    const elapsedTime = Date.now() - startTime;
    const delay = Math.max(2000 - elapsedTime, 0);

    await new Promise((resolve) => setTimeout(resolve, delay));
    closeLoadingAlert();
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
   * Defines the DMN decision by filtering the DRG elements and assigning the result to the dmn_decision property.
   */
  private define_dmn_decision(): void {
    const decision = is_DMN_Definitions(this.dmn_data!.me)
      ? this.dmn_data!.me.drgElement.filter(is_DMN_Decision)
      : [];
    this.dmn_decision = decision;
  }

  /**
   * Defines the input data for the decision table.
   */
  private define_input_data(): void {
    const tmp_decision_tag: String[] = [];
    const input_data: Data[] = [];
    const input_decision: DMN_Decision[] = [];
    this.dmn_decision.forEach((decision) => {
      decision.informationRequirement?.forEach((info) => {
        if (info.requiredDecision) {
          tmp_decision_tag.push(info.requiredDecision.href);
        }
      });
      decision.decisionLogic?.input.forEach((input) => {
        const input_expression = input.inputExpression;
        if (
          is_DMN_LiteralExpression(input_expression) &&
          input_expression.text &&
          input_expression.typeRef &&
          !tmp_decision_tag.includes("#" + input_expression.text.toLowerCase())
        ) {
          if (
            input.label &&
            tmp_decision_tag.includes("#" + input.label.toLowerCase())
          ) {
            //pass
          } else {
            const name = input_expression.text.split(" ")[0];
            input_data.push(new Data(name, input_expression.typeRef));
          }
        }
      });
    });
    this.dmn_decision.forEach((decision) => {
      if (tmp_decision_tag.includes("#" + decision.id)) {
        input_decision.push(decision);
      }
    });
    this.dmn_input_data = input_data;
    this.dmn_input_decision = input_decision;
  }

  /**
   * Defines the output data for the decision table.
   */
  private define_output_data(): void {
    const output_data: Data[] = [];
    if (
      this.dmn_decision.length === 1 &&
      this.dmn_decision[0].decisionLogic.outputLabel
    ) {
      output_data.push(
        new Data(
          this.dmn_decision[0].decisionLogic.outputLabel,
          this.dmn_decision[0].decisionLogic.output[0].typeRef,
        ),
      );
      this.dmn_output_data = output_data;
      return;
    }
    this.dmn_decision.forEach((decision) => {
      decision.decisionLogic?.output.forEach((output) => {
        if (output.name) {
          output_data.push({
            name: output.name,
            type: output.typeRef,
          });
        }
      });
    });
    this.dmn_output_data = output_data;
  }
}

/**
 * Evaluates a decision table based on the provided JSON input.
 * @param decision_table - The decision table to evaluate.
 * @param json - The JSON input data.
 * @returns The result of the evaluation.
 * @throws Error if the decision table is not initialized or if there is a hit policy violation.
 */
export function evaluateDecisionTable(
  dmnmodel: DMNModel,
  json: any,
): Record<string, any> {
  if (!dmnmodel.is_init) {
    throw new Error("Decision table is not initialized.");
  }
  let dmn_decision: DMN_Decision[] = [];
  dmnmodel.dmn_decision.forEach((decision) => {
    dmn_decision.push(decision);
  });
  const results: Record<string, any>[] = [];
  if (dmnmodel.dmn_input_decision.length > 0) {
    dmnmodel.dmn_input_decision.forEach((decision) => {
      const result = evaluateDecision(dmnmodel, decision, json);
      dmn_decision = dmn_decision.filter((d) => d.id !== decision.id);
      if (Array.isArray(result)) {
        result.forEach((r) => {
          results.push(r);
        });
      } else {
        results.push(result);
      }
    });
  }
  dmn_decision.forEach((decision) => {
    const result = evaluateDecision(dmnmodel, decision, json, results);
    if (Array.isArray(result)) {
      result.forEach((r) => {
        results.push(r);
      });
    } else {
      results.push(result);
    }
  });
  console.log(results);
  if (results.length === 1) {
    return results[0];
  } else {
    let result: Record<string, any> = {};
    results.forEach((r) => {
      result = { ...result, ...r };
    });
    return result;
  }
}

/**
 * Evaluates a decision based on the provided JSON input.
 * @param decision - The decision to evaluate.
 * @param json - The JSON input data.
 * @param input_decision - The input decision if there is one.
 * @returns The result of the evaluation.
 * @throws Error if the decision table is not initialized or if there is a hit policy violation.
 */
export function evaluateDecision(
  dmnmodel: DMNModel,
  decision: DMN_Decision,
  json: any,
  input_decision?: Record<string, any>[],
): Record<string, any> {
  if (!dmnmodel.is_init) {
    throw new Error("Decision table is not initialized.");
  }
  const results: Record<string, any>[] = [];
  let hitPolicy = "UNIQUE";
  if (
    decision.decisionLogic?.hitPolicy &&
    decision.decisionLogic?.hitPolicy !== ""
  ) {
    hitPolicy = decision.decisionLogic.hitPolicy;
  }
  if (input_decision) {
    input_decision.forEach((decision) => {
      json = { ...json, ...decision };
    });
  }
  const rules = decision.decisionLogic?.rule;
  if (rules) {
    rules.forEach((rule) => {
      const ruleMatch = rule.inputEntry?.every((inputEntry) => {
        const inputEntryIndex = rule.inputEntry?.indexOf(inputEntry);
        const inputName =
          decision.decisionLogic.input[
            inputEntryIndex!
          ].inputExpression.text.split(" ")[0];
        const inputEntryValue = inputEntry.text;
        if (inputEntryValue == "") {
          return true;
        }
        if (inputEntryValue == "true" || inputEntryValue == "false") {
          const expression = "a = b";
          const context: InterpreterContext = {
            a: inputEntryValue,
            b: json[inputName],
          };

          return unaryTest(expression, context);
        }
        return unaryTest(inputEntryValue, { "?": json[inputName] });
      });
      if (ruleMatch) {
        const result: Record<string, any> = {};
        rule.outputEntry.forEach((outputEntry, index) => {
          let outputName = decision.decisionLogic?.output[index].name;
          let outputEntryValue = outputEntry.text;
          outputEntryValue = outputEntryValue.replace(/"/g, "");
          if (!outputName || outputName === "") {
            outputName = decision.decisionLogic?.outputLabel;
            if (!outputName || outputName === "") {
              outputName = "undefined";
            }
          }
          result[outputName!] = outputEntryValue;
        });
        results.push(result);
      }
    });
    switch (hitPolicy) {
      case "UNIQUE":
        if (results.length > 1) {
          throw new Error("Hit policy violation.");
        }
        return results[0];
      case "FIRST":
        return results[0];
      case "ANY":
        return results[0];
      case "PRIORITY":
        return results[0];
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
      case "RULE ORDER":
        return results;
      default:
        return results[0];
    }
  }
  return {};
}
