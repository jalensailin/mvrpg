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
    const { rolltype, ability, actor } = options;
    this.type = rolltype;
    this.ability = ability;
    this.actor = actor;
    this.troubles = 0;
    this.edges = 0;
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
}
