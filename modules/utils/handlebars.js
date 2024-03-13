/* global loadTemplates game Handlebars */

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export default async function preloadTemplates() {
  return loadTemplates([
    `systems/${game.system.id}/templates/actor/identity-tab.hbs`,
  ]);
}

export async function registerHelpers() {
  Handlebars.registerHelper(
    "systemFilePath",
    (string) => `systems/${game.system.id}/${string}`,
  );
}
