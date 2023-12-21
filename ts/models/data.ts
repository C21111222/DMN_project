// Purpose: Model for data.

/**
 * Represents data.
 */
export class Data {
  /**
   * Creates an instance of Data.
   * @param name - The name of the input data.
   * @param type - The type of the input data.
   */
  constructor(
    public name: string,
    public type: string,
    public value?: string,
  ) {}
}
