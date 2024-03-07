/* globals Roll */

export default class D616 extends Roll {
  /**
   * Customize our roll with some useful information, passed in the `options` Object.
   *
   * @param {string} formula            Unused - The string formula to parse (from Foundry)
   * @param {Object} data               The data object against which to parse attributes within the formula
   * @param {Object} [options]          Additional data which is preserved in the database
   * @param {Number} [options.rollType] The type of roll (stat, skill, sanity, damage, etc).
   * @param {String} [options.ability]  The key of the ability to use as a modifier for this roll, e.g. "melee" or "ego".
   * @param {Actor}  [options.actor]    The actor that this roll originates from.
   */
  constructor(formula, data, options = {}) {
    super(
      `1d6 + 1d6[fire] + 1d6 + @actor.system.abilities.${options.ability}.value`,
      { actor: options.actor },
      options,
    );
    const { rolltype, ability, actor, troubles, edges } = options;
    this.type = rolltype;
    this.ability = ability;
    this.actor = actor;
    this.troubles = troubles || 0;
    this.edges = edges || 0;
    this.rerolls = options.rerolls || {
      die1: [],
      dieM: [],
      die3: [],
    };
  }

  /**
   * Map of die IDs to their index in the array of dice.
   */
  static DiceMap = {
    die1: 0,
    dieM: 1,
    die3: 2,
  };

  /**
   * Calculates the total roll values for the specified die.
   *
   * @param {String} dieId - The identifier of the die (die1, dieM, or die3)
   * @return {Array} An array containing the totals for the original d616 roll and all rerolls
   */
  allRollTotals(dieId) {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;

    const rollTotal = this.dice[D616.DiceMap[dieId]].total;

    // If no rerolls, just return the total.
    if (this.rerolls[dieId].length === 0) return [rollTotal];

    // Otherwise return an array containing the total for this roll and all rerolls.
    const rerollTotals = this.rerolls[dieId].map((r) => r.total);
    return [rollTotal].concat(rerollTotals);
  }

  /**
   * Get the final results of the roll, taking into account rerolls for troubles/edges.
   *
   * @return {Object} An object with the results of the roll, taking into account rerolls.
   */
  get finalResults() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;

    const minMaxKey = this.edgesAndTroubles >= 0 ? "max" : "min";
    return {
      die1: Math[minMaxKey](...this.allRollTotals("die1")),
      dieM: Math[minMaxKey](...this.allRollTotals("dieM")),
      die3: Math[minMaxKey](...this.allRollTotals("die3")),
    };
  }

  /**
   * Whether or not the middle die rolled an M (aka 6).
   *
   * @returns {Boolean}
   */
  get fantasticResult() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    const { dieM } = this.finalResults;
    return dieM === 6;
  }

  /**
   * Whether or not all of the dice rolled a 6.
   *
   * @returns {Boolean}
   */
  get ultimateFantasticResult() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    const { die1, dieM, die3 } = this.finalResults;
    return die1 === 6 && dieM === 6 && die3 === 6;
  }

  /**
   * Reduces the number of edges by the number of troubles.
   * A negative return value indicates the number of troubles,
   * while a positive value indicates the number of edges.
   *
   * @return {number} the result of subtracting troubles from edges
   */
  get edgesAndTroubles() {
    return this.edges - this.troubles;
  }
}
