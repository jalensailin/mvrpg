/* global game Dialog Hooks renderTemplate $ ActiveEffectConfig CONFIG */
/* eslint-disable max-classes-per-file */

import MVRPG from "../config.js";
import { MVSettings } from "../utils/settings.js";

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

  /**
   * Retrieves a flattened list of effect keys.
   *
   * @return {Array<string>} The list of effect keys.
   */
  static getEffectKeys() {
    let selectOptions = [];
    for (const effectKeys of Object.values(MVRPG.effects)) {
      selectOptions = selectOptions.concat(effectKeys);
    }
    return selectOptions;
  }

  /**
   * Retrieves the label for a given effect key. It does this by
   * "walking the tree" of the data model, where the label is located.
   *
   * @param {string} key - The key of the effect.
   * @return {string} The localized label of the effect.
   */
  static getEffectLabel(key) {
    const actorSchema = CONFIG.Actor.dataModels.super.schema;
    const keyPropList = key.split(".");
    keyPropList.shift();

    let [keyProp] = keyPropList;
    let fieldObject = actorSchema.fields[keyProp];
    let index = 1;
    while (index < keyPropList.length) {
      keyProp = keyPropList[index];
      fieldObject = fieldObject.fields[keyProp];
      index += 1;
    }

    if (!fieldObject || !fieldObject.label) return key; // If the field/label is not found, return the original key.

    const label = game.i18n.localize(fieldObject.label);
    return label;
  }

  /**
   * Retrieves the localized category for a given effect key.
   *
   * @param {string} key - The key of the effect.
   * @return {string} The localized category of the effect.
   */
  static getEffectCategory(key) {
    const keyPropList = key.split(".");
    keyPropList.shift();
    // Find the effect category
    const effectCategories = Object.keys(MVRPG.effects);
    const category = effectCategories.find((c) => keyPropList.includes(c));
    if (!category) return "";
    const localizedCategory = game.i18n.localize(
      `MVRPG.effects.categories.${category}`,
    );
    return localizedCategory;
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

    html.on("change", "select.effect-drop-down", (event) => {
      const selectElement = event.currentTarget;
      MVEffectConfig.updateDropDownToolTip(selectElement);
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

    let finalTemplate;
    switch (elementType) {
      // Replace the <input> element with a <select> element.
      case "input": {
        const selectOptions = EffectUtils.getEffectKeys();
        // Warn the user before swapping back to <select> if the value is not in the list of options (since it will get lost).
        if (!selectOptions.includes(value)) {
          const confirmInput = await Dialog.confirm({
            title: game.i18n.localize("MVRPG.dialog.confirmTextInput.title"),
            content: game.i18n.localize("MVRPG.dialog.confirmTextInput.text"),
          });
          if (!confirmInput) return;
        }

        const selectTemplate = await renderTemplate(
          `systems/${game.system.id}/templates/effects/effects-drop-down.hbs`,
          { changes: this.object.changes, index },
        );
        const jquerySelectObject = $(selectTemplate);
        jquerySelectObject.val(value || selectOptions[0]);
        finalTemplate = jquerySelectObject;

        buttonIcon.removeClass("fa-list"); // Remove list icon.
        buttonIcon.addClass("fa-keyboard"); // Toggle to keyboard icon.
        const buttonTooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleTextInput",
        );
        buttonIcon.attr("data-tooltip", buttonTooltip);
        break;
      }
      // Replace the <select> element with an <input> element.
      case "select": {
        // Typically it's best to keep all styling in a css file, but in this case, the width relies on a value derived above so we need to add it here.
        const inputTemplate = `<input type="text" name="${name}" value="${value || ""}" style="width: calc(100% - ${buttonWidth + 8}px);"/>`;
        finalTemplate = inputTemplate;

        buttonIcon.removeClass("fa-keyboard"); // Remove keyboard icon.
        buttonIcon.addClass("fa-list"); // Toggle to list icon.
        const buttonTooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleDropDown",
        );
        buttonIcon.attr("data-tooltip", buttonTooltip);
        break;
      }
      default:
        break;
    }

    keyInput.replaceWith(finalTemplate);
  }

  /**
   * Update the tooltip for the drop-down to display the selected key.
   *
   * @param {*} selectElement
   */
  static updateDropDownToolTip(selectElement) {
    const newVal = $(selectElement).val();
    $(selectElement).attr("data-tooltip", newVal);
  }
}

/**
 * Insert a drop-down for the effect's change key, replacing the default text-input.
 * We only replace it if the value is in the list of options, otherwise we just insert
 * the appropriate button and leave it as a text-input.
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
    const selectOptions = EffectUtils.getEffectKeys();
    const valueInOptions = selectOptions.includes(input.value);

    let buttonTooltip = game.i18n.localize(
      "MVRPG.sheets.effects.tooltips.toggleTextInput",
    );
    let iconClass = "fa-keyboard";
    if (!valueInOptions && input.value) {
      // If the value is not in the list of options AND not empty, then it's a custom key.
      buttonTooltip = game.i18n.localize(
        "MVRPG.sheets.effects.tooltips.toggleDropDown",
      );
      iconClass = "fa-list";
    }
    const buttonTemplate = `<a class="toggle-text-input" data-index="${index}" data-tooltip="${buttonTooltip}"><i class="fa-solid ${iconClass}"></i></a>`;

    if (valueInOptions || !input.value) {
      // If the value is in the list of options OR empty, then it's a default key (or empty).
      $(input).replaceWith(`${buttonTemplate}${selectTemplate}`);
    } else {
      $(input).before(`${buttonTemplate} `);
      const iconWidth = html.find(".toggle-text-input").outerWidth();
      $(input).css("width", `calc(100% - ${(iconWidth || 16) + 8}px)`);
    }
  }
});
