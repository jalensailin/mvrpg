import Logger from "./logger.js";

export default class MVUtils {
  /**
   * Walks up the DOM tree from the event's currentTarget, looking for a given attribute.
   * Supports both standard attributes and data-* attributes (auto-converting kebab-case to camelCase).
   * Stops climbing if a parent element with a specified class is reached.
   *
   * @param {Event} event - The DOM event object.
   * @param {string} key - The attribute name or dataset key to search for.
   * @param {Object} [options] - Optional settings.
   * @param {boolean} [options.useDataset=true] - If true, looks in dataset (data-* attributes); otherwise, uses getAttribute.
   * @param {string} [options.stopClass="application"] - Stops climbing when this class is encountered on an ancestor.
   * @returns {string|undefined} - The value of the attribute if found.
   */
  static getClosestAttribute(
    event,
    key,
    { useDataset = true, stopClass = "application" } = {},
  ) {
    let el = event.currentTarget;
    const camelKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

    while (el) {
      const value = useDataset ? el.dataset?.[camelKey] : el.getAttribute(key);
      if (value != null) return value;

      // Stop if we've reached a boundary element
      if (el.classList.contains(stopClass)) break;

      el = el.parentElement;
    }

    Logger.debug(
      `Could not find attribute "${key}" before reaching ".${stopClass}" element.`,
    );
    return undefined;
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
