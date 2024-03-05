/* eslint-disable max-classes-per-file */
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
    this.rerolls = {
      die1: [],
      dieM: [],
      die3: [],
    };
  }

  /**
   * Whether or not the middle die rolled an M (aka 6).
   *
   * @returns {Boolean}
   */
  get fantasticResult() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    const dieM = this.dice[1];
    return dieM.total === 6;
  }

  /**
   * Whether or not all of the dice rolled a 6.
   *
   * @returns {Boolean}
   */
  get ultimateFantasticResult() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    const [die1, dieM, die3] = this.dice;
    return die1.total === 6 && dieM.total === 6 && die3.total === 6;
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

export class MVReroll extends Roll {
  constructor(formula, data, options = {}) {
    super("1d6", data, options);
    const { rerollType } = options;
    this.rerollType = rerollType; // "Trouble" or "Edge"
  }
}
