/* global game Dialog Hooks renderTemplate $ ActiveEffectConfig */
/* eslint-disable max-classes-per-file */

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
 * @param {*} html
 * @override
 */
export class MVEffectConfig extends ActiveEffectConfig {
  /**
   * @param {*} html
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", ".toggle-text-input", (event) => {
      this.toggleTextInput(event);
    });
  }

  /**
   * A function to toggle between <input> and <select> elements in the Active Effect config.
   * In general, users will want the drop-down option, because it is more intuitive, but some
   * may still wish to input custom values, in which case they can switch to the text input.
   *
   * @param {Event} event - The event triggering the function.
   * @return {void}
   */
  async toggleTextInput(event) {
    const index = $(event.currentTarget).data("index"); // Get the index from the button.
    const keyInput = $(event.currentTarget).next(); // Get the input, either an actual <input> element, or a <select> element.
    const elementType = keyInput.prop("nodeName").toLowerCase(); // Get the element type ("input" or "select").
    const name = keyInput.attr("name");
    const value = keyInput.val();

    const buttonIcon = $(event.currentTarget).find("i"); // Find the button icon.
    const buttonWidth = buttonIcon.outerWidth();
    buttonIcon.removeClass(); // Remove all classes from button icon (to be replaced later on).

    let finalTemplate;
    switch (elementType) {
      // Replace the <input> element with a <select> element.
      case "input": {
        const selectTemplate = await renderTemplate(
          `systems/${game.system.id}/templates/effects/effects-drop-down.hbs`,
          { changes: this.object.changes, index },
        );
        const jquerySelectObject = $(selectTemplate);
        jquerySelectObject.val(value);
        finalTemplate = jquerySelectObject;

        buttonIcon.addClass("fa-solid fa-keyboard"); // Toggle to keyboard icon.
        break;
      }
      // Replace the <select> element with an <input> element.
      case "select": {
        // Typically it's best to keep all styling in a css file, but in this case, the width relies on a value derived above so we need to add it here.
        const inputTemplate = `<input type="text" type="text" name="${name}" value="${value}" style="width: calc(100% - ${buttonWidth + 8}px);"/>`;
        finalTemplate = inputTemplate;

        buttonIcon.addClass("fa-solid fa-list"); // Toggle to list icon.
        break;
      }
      default:
        break;
    }

    keyInput.replaceWith(finalTemplate);
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
      `systems/${game.system.id}/templates/effects/effects-drop-down.hbs`,
      { changes: app.object.changes, index },
    );

    const buttonTemplate = `<a class="toggle-text-input" data-index="${index}"><i class="fa-solid fa-keyboard"></i></a>`;
    $(input).replaceWith(`${buttonTemplate}${selectTemplate}`);
  }
});
