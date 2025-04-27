import MVRPG from "../config.js";
import { MVSettings } from "../utils/settings.js";

export default class MVEffect extends ActiveEffect {
  /**
   * We intercept the apply method and check if the change value
   * contains an actor property (indicated by the @ symbol). If
   * it does, we let the Roll system evaluate the expression (since
   * it's designed to do so already, no need to reinvent the wheel here),
   * and apply the result to the change value.
   *
   * @override
   */
  apply(actor, change) {
    if (!change.value.includes("@")) return super.apply(actor, change);

    // Synchronous evaluation.This would preclude the use of non-deterministic
    // DiceTerms (e.g. 1d4) in the roll expression (probably a good thing).
    const roll = new Roll(change.value, actor);
    roll.evaluateSync();
    change.value = roll.total;
    return super.apply(actor, change);
  }

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
    if (!fieldObject) return key; // If the field is not found, return the original key.

    let index = 1;
    while (index < keyPropList.length) {
      keyProp = keyPropList[index];
      fieldObject = fieldObject.fields[keyProp];

      if (!fieldObject) return key; // If the field is not found, return the original key

      index += 1;
    }

    if (!fieldObject || !fieldObject.label) return key; // If the field OR label is not found, return the original key.

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

  static getEffectOptions() {
    const effectOptions = [];
    Object.entries(MVRPG.effects).forEach(([effectCategory, effectKeyList]) => {
      const optionGroup = game.i18n.localize(
        `MVRPG.effects.categories.${effectCategory}`,
      );
      effectKeyList.forEach((effectKey) => {
        const label = MVEffect.getEffectLabel(effectKey);
        const category = MVEffect.getEffectCategory(effectKey);
        effectOptions.push({
          label: `${label} (${category})`,
          value: effectKey,
          group: optionGroup,
        });
      });
    });
    return effectOptions;
  }
}
