/* global loadTemplates game Handlebars */

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export default async function preloadTemplates() {
  return loadTemplates([
    `systems/${game.system.id}/templates/actor/identity-tab.hbs`,
    `systems/${game.system.id}/templates/actor/owned-item-list.hbs`,
    `systems/${game.system.id}/templates/actor/powers-tab.hbs`,
  ]);
}

export async function registerHelpers() {
  Handlebars.registerHelper(
    "systemFilePath",
    (string) => `systems/${game.system.id}/${string}`,
  );

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
