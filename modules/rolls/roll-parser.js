import MultiverseDie from "./multiverse-die.js";

const { RollParser } = foundry.dice;

export default class MVRollParser extends RollParser {
  /**
   * We override/intercept the _onDiceTerm method to handle "MV/mv" as a denomination.
   * If it doesn't match, it falls back to the Foundry default without breaking
   * expected behavior.
   *
   * @override
   * @returns {Object} - Object with data about the DiceTerm.
   */
  _onDiceTerm(number, faces, modifiers, flavor, formula) {
    const term = super._onDiceTerm(number, faces, modifiers, flavor, formula);
    if (!modifiers || !(modifiers[0].toLowerCase() === "v")) return term;
    const mods = modifiers.slice(1);
    const regExp = MVRollParser.MV_REGEXP;
    const denomination = `${faces}${modifiers[0]}`;
    if (regExp.test(denomination)) {
      term.faces = "mv";
      term.modifiers = mods || null;
    }
    return term;
  }

  static MV_REGEXP = this.getMVRegExp();

  /**
   * Generate a RegExp that will match "mv", "MV", "mV", or "Mv".
   * Base Foundry only allows a single-character as a dice term denomination, but this
   * is obviously fairly limiting. We generate a RegExp that looks for our specific denomination.
   *
   * @returns {RegExp}
   */
  static getMVRegExp() {
    const denomination = MultiverseDie.DENOMINATION;
    const denominationRegExp = denomination
      .split("")
      .map((char) => `[${char.toLowerCase()}${char}]`)
      .join("");
    return new RegExp(denominationRegExp);
  }
}
