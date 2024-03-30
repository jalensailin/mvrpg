/* global loadTemplates game Handlebars */

import MVRPG from "../config.js";

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export default async function preloadTemplates() {
  return loadTemplates([
    `systems/${game.system.id}/templates/actor/identity-tab.hbs`,
    `systems/${game.system.id}/templates/actor/document-list.hbs`,
    `systems/${game.system.id}/templates/actor/powers-tab.hbs`,
    `systems/${game.system.id}/templates/chat/reroll-history-tooltip.hbs`,
    `systems/${game.system.id}/templates/item/settings-tab.hbs`,
    `systems/${game.system.id}/templates/shared/effects-list.hbs`,
  ]);
}

export async function registerHelpers() {
  Handlebars.registerHelper(
    "systemFilePath",
    (string) => `systems/${game.system.id}/${string}`,
  );

  /**
   * Compares two values with the given operator. If no operator is provided,
   * '===' is used by default.
   *
   * @see http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44
   * @param {*} lValue
   * @param {string} operator
   * @param {*} rValue
   */
  Handlebars.registerHelper("mvCompare", function (...args) {
    if (args.length < 3) {
      throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    // eslint-disable-next-line prefer-const
    let [lValue, operator, rValue, options] = args;

    if (options === undefined) {
      options = rValue;
      rValue = operator;
      operator = "===";
    }

    const operators = {
      "===": (l, r) => {
        return l === r;
      },
      "!==": (l, r) => {
        return l !== r;
      },
      "<": (l, r) => {
        return l < r;
      },
      ">": (l, r) => {
        return l > r;
      },
      "<=": (l, r) => {
        return l <= r;
      },
      ">=": (l, r) => {
        return l >= r;
      },
      typeof(l, r) {
        // eslint-disable-next-line valid-typeof
        return typeof l === r;
      },
      "&&": (l, r) => {
        return !!l && !!r;
      },
      "||": (l, r) => {
        return !!l || !!r;
      },
    };

    if (!operators[operator]) {
      throw new Error(
        `Handlerbars Helper 'compare' doesn't know the operator ${operator}`,
      );
    }

    const result = operators[operator](lValue, rValue);

    if (result) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  /**
   * Get a particular object from config.js
   *
   * @param {string} property
   * @returns {Object}
   */
  Handlebars.registerHelper("mvGetConfigObj", (property) => {
    if (!(property in MVRPG)) return null;
    return MVRPG[property];
  });

  Handlebars.registerHelper("changeModeSymbol", (change) => {
    switch (change.mode) {
      case 1:
        return "x";
      case 2:
        return change.value > 0 ? "+" : "";
      case 3:
        return "<=";
      case 4:
        return ">=";
      case 5:
        return "=";
      default:
        return "";
    }
  });
}
