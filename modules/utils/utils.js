/* globals DiceTerm */

import MultiverseDie from "../rolls/multiverse-die.js";
import Logger from "./logger.js";

export default class MVUtils {
  /**
   * Inspect an event object for passed-in field specific to the target (link) that was clicked.
   * This code will initially look at the current target, and if the field is not found, it will
   * climb up the parents of the target until one is found, or print an error and return undefined.
   *
   * Inspiration for this is taken from Cyberpunk Red Foundry implementation,
   * but the code is pretty different.
   *
   * @param {Object} event - event data from jquery
   * @param {String} datum - the field we are interested in getting
   * @returns {String} - the value of the field passed in the event data
   */
  static GetEventDatum(event, datum) {
    let { currentTarget } = event;
    let attribute = event.currentTarget.getAttribute(datum);
    while (!attribute) {
      // Climb up the parents
      currentTarget = currentTarget.parentElement;
      if (currentTarget === null) {
        Logger.debug(`Could not find ${datum}`);
        return undefined;
      }
      attribute = currentTarget.getAttribute(datum);
    }
    return attribute;
  }

  /**
   * Generate a RegExp that will match "mv", "MV", "mV", or "Mv".
   * Base Foundry only allows a single-character as a dice term denomination, but this
   * is obviously fairly limiting. We generate a RegExp that looks for our specific denomination,
   * and splice it as an option, into the original regexp string. This way, if it doesn't match,
   * it falls back to the Foundry default without breaking expected behavior.
   *
   * @returns {RegExp} - The modified regexp
   */
  static prepareDiceTermRegExp() {
    const foundryDiceTermRegExp = DiceTerm.REGEXP.source;
    const denomination = MultiverseDie.DENOMINATION;
    // Go from "MV" to "[mM][vV]|"
    const denominationRegExp = `${denomination
      .split("")
      .map((char) => `[${char.toLowerCase()}${char}]`)
      .join("")}|`;

    // Slice the above into the original regexp, just before the instance of `[A-z]`.
    const sliceIndex = foundryDiceTermRegExp.indexOf("[A-z]");
    const finalRegExp =
      foundryDiceTermRegExp.slice(0, sliceIndex) +
      denominationRegExp +
      foundryDiceTermRegExp.slice(sliceIndex);
    return new RegExp(finalRegExp);
  }
}
