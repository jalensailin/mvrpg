/* global game */

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
      case "delete":
        await effect.delete();
        break;
      case "edit":
        effect.sheet.render(true);
        break;
      default:
        break;
    }
  }
}