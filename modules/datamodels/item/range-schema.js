export default class RangeSchema extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      _value: new fields.StringField({
        required: true,
        nullable: true,
        initial: "10",
      }),
      multiplyByRank: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
      }),
      reach: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
      }),
    };
  }

  /**
   * Get the range value as an integer if it is a valid integer,
   * otherwise return the value as a string.
   *
   * @returns {number|string} - The range value as a number or string.
   */
  get value() {
    const { parseInt, isNaN } = Number;
    const numRange = parseInt(this._value);
    return isNaN(numRange) ? this._value : numRange;
  }

  /**
   * Sets the range value as a string.
   *
   * @param {string|number} val - The new value of the range.
   */
  set value(val) {
    this._value = val;
  }

  /**
   * Determines if the range value can be parsed as an integer.
   *
   * @returns {boolean} - True if the range value is a valid integer, false otherwise.
   */

  get rangeIsInt() {
    const { parseInt, isNaN } = Number;
    return !isNaN(parseInt(this._value));
  }

  /** @inheritdoc */
  static migrateData(source) {
    if (source.value) {
      source._value = source.value;
    }
    return super.migrateData(source);
  }
}
