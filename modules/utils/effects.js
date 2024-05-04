/* global game Dialog Hooks renderTemplate $ */

import { MVSettings } from "./settings.js";

export default class EffectUtils {
  /**
   * Perform an action based on the event triggered.
   *
   * @param {Actor|Item} document - The document object
   * @param {Event} event - The event object
   * @return {Promise<void>} Promise that resolves when the action is completed
   */
  static async onEffectAction(document, event) {
    const { action, effectId } = event.currentTarget.dataset;
    const effect =
      document.documentName === "Item"
        ? document.effects.get(effectId)
        : Array.from(document.allApplicableEffects()).find(
            (e) => e.id === effectId,
          );
    switch (action) {
      case "create": {
        const [effectDoc] = await document.createEmbeddedDocuments(
          "ActiveEffect",
          [
            {
              name: game.i18n.format(game.i18n.translations.DOCUMENT.New, {
                type: game.i18n.translations.DOCUMENT.ActiveEffect,
              }), // Foundry's localization ("New Active Effect")
              icon: "icons/svg/aura.svg",
              origin: this.uuid,
            },
          ],
        );

        effectDoc.sheet.render(true);
        break;
      }
      case "toggle":
        effect.update({ disabled: !effect.disabled });
        break;
      case "delete": {
        const skipDialog = MVSettings.skipDeleteDialog();
        if (!skipDialog) {
          const confirmDelete = await Dialog.confirm({
            title: game.i18n.localize("MVRPG.dialog.deleteOwnedItem.title"),
            content: game.i18n.format("MVRPG.dialog.deleteOwnedItem.text", {
              itemType: game.i18n.translations.DOCUMENT.ActiveEffect,
              itemName: effect.name,
            }),
          });
          if (!confirmDelete) return;
        }
        effect.delete();
        break;
      }
      case "edit":
        effect.sheet.render(true);
        break;
      default:
        break;
    }
  }
}

/**
 * Insert a drop-down for the effect's change key, replacing the default text-input.
 */
Hooks.on("renderActiveEffectConfig", async (app, html, data) => {
  const effectKeyInputs = html.find(
    "li.effect-change > .key > input[type='text']",
  );

  for (const [index, input] of Array.from(effectKeyInputs).entries()) {
    // eslint-disable-next-line no-await-in-loop
    const selectTemplate = await renderTemplate(
      `systems/${game.system.id}/templates/shared/effects-drop-down.hbs`,
      { changes: app.object.changes, index },
    );
    $(input).replaceWith(selectTemplate);
  }
});
