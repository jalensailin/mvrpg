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
   * Get targeted or selected tokens.
   *
   * @param {Object} options
   * @param {Boolean} [options.targeted = false] - Get targeted tokens instead of selected tokens.
   * @param {Boolean} [options.returnTokens = false] - Return array of Tokens instead of TokenDocuments.
   * @return {Array<Token|TokenDocument>} - Targeted or selected tokens.
   */
  static getIndicatedTokens({ targeted = false, returnTokens = false } = {}) {
    const targets = new Set(game.user.targets);
    const tokens = targeted ? Array.from(targets) : canvas.tokens.controlled;
    tokens.sort((a, b) => (a.name > b.name ? 1 : -1));
    return returnTokens ? tokens : tokens.map((t) => t.document);
  }
}
