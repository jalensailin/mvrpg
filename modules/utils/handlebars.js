/* global loadTemplates game Handlebars */

import MVRPG from "../config.js";

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export default async function preloadTemplates() {
  return loadTemplates([
    // Actor Sheet
    `systems/${game.system.id}/templates/actor/combat-tab.hbs`,
    `systems/${game.system.id}/templates/actor/identity-tab.hbs`,
    `systems/${game.system.id}/templates/actor/powers-tab.hbs`,
    `systems/${game.system.id}/templates/actor/document-list.hbs`,

    // Item Sheet
    `systems/${game.system.id}/templates/item/settings-tab.hbs`,

    // Shared
    `systems/${game.system.id}/templates/effects/effects-list.hbs`,

    // Rolls
    `systems/${game.system.id}/templates/chat/reroll-history-tooltip.hbs`,
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
   * Thanks to the Cyberpunk Red Foundry team for this one.
   *
   * @param {*} args
   * @returns {Number}
   */
  Handlebars.registerHelper("mvMath", (...args) => {
    let mathArgs = [...args];
    let mathFunction = mathArgs[0];
    mathArgs.shift();
    mathArgs.pop();
    if (Array.isArray(mathArgs[0])) {
      [mathArgs] = mathArgs;
    }
    mathArgs = mathArgs.map(Number);
    if (typeof Math[mathFunction] === "function") {
      return Math[mathFunction].apply(null, mathArgs);
    }
    // Math doesn't have basic functions, we can account
    // for those here as needed:
    if (typeof mathArgs === "undefined") {
      mathFunction = `${mathFunction} bad args: ${mathArgs}`;
    }
    switch (mathFunction) {
      case "sum":
        return mathArgs.reduce((a, b) => parseInt(a) + parseInt(b), 0);
      case "subtract": {
        const minutend = mathArgs.shift();
        const subtrahend = mathArgs.reduce((a, b) => a + b, 0);
        return minutend - subtrahend;
      }
      case "product": {
        return mathArgs.reduce((a, b) => a * b, 1);
      }
      default:
        console.error(`Not a Math function: ${mathFunction}`);
        return "null";
    }
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

  Handlebars.registerHelper("mvListIncludes", (array, string) => {
    return array.includes(string);
  });
}
