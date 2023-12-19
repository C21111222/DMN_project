import { DMNModel } from "./decision_table";
import { DataDisplay } from "./data_display";

/**
 * Represents the current run of a process.
 */
export class CurrentRun {
  /**
   * The decision table associated with the current run.
   */
  public dmn_model?: DMNModel;

  /**
   * The input data for the current run.
   */
  public data_input?: any;

  /**
   * The data display for the current run.
   */
  public data_display?: DataDisplay;

  /**
   * Creates a new instance of the CurrentRun class.
   * @param current_run - Indicates if the current run is active or not.
   */
  constructor(public current_run: boolean = false) {}

  /**
   * Initializes the current run with a given decision table.
   * It sets the `decision_table` property to the provided decision table
   * and creates a new `DataDisplay` instance for that decision table.
   *
   * @param decision_table - The `DecisionTable` instance to associate with the current run.
   */
  public async init(dmn_model: DMNModel) {
    this.dmn_model = dmn_model;
    await this.dmn_model.init();
    this.data_display = new DataDisplay(dmn_model);
    await this.data_display.init();
  }

  /**
   * Deletes the data display for the current run.
   */
  public delete_display() {
    if (this.data_display) {
      this.data_display!.delete_display();
    }
    this.dmn_model = undefined;
    this.data_input = undefined;
    this.data_display = undefined;
  }
}
