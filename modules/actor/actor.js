import Logger from "../utils/logger.js";
import { MVSettings } from "../utils/settings.js";

const { Dialog } = foundry.applications.api;

export default class SuperActor extends Actor {
  /**
   * Applies damage to the selected targets.
   *
   * @param {D616} originRoll - The roll from which the damage originates.
   * @return {Promise<Actor|void>} A promise that resolves to an array of promises representing the update operations.
   */
  async applyDamage(originRoll, target) {
    const { lifepoolTarget } = originRoll;
    const updateKey = `system.lifepool.${lifepoolTarget}.value`;
    let { damageReduction } = this.system.lifepool[lifepoolTarget];

    const targetName = target.name;
    const targetUuid = target.uuid;
    // Set up dialog for each this.
    const { renderTemplate } = foundry.applications.handlebars;
    const dialogContent = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/damage-confirmation.hbs`,
      {
        targetName,
        damageReduction,
      },
    );
    if (!MVSettings.skipRollDialog()) {
      const confirmDamage = await Dialog.wait({
        content: dialogContent,
        position: { width: 300 },
        window: {
          title: game.i18n.localize("MVRPG.dialog.damageConfirm.title"),
        },
        classes: ["mvrpg", "dialog"],
        buttons: [
          {
            action: "confirm",
            icon: "fas fa-spider",
            class: "dialog-button",
            label: game.i18n.localize("MVRPG.dialog.buttons.confirm"),
            callback: (event, button) => {
              const { FormDataExtended } = foundry.applications.ux;
              const fd = new FormDataExtended(button.form);
              const formData = foundry.utils.expandObject(fd.object);
              damageReduction = formData.damageReduction;
            },
          },
        ],
      });

      if (!confirmDamage) return null;
    }

    const damageTotal = parseInt(
      originRoll.calculateDamage(damageReduction).total,
    );

    const newLifepoolValue =
      this.system.lifepool[lifepoolTarget].value - damageTotal;

    this.update({ [updateKey]: newLifepoolValue });
    return { targetUuid, targetName, damageTotal };
  }

  /**
   * Undoes the damage applied to the health or focus.
   *
   * @param {string} lifepoolTarget - "health" or "focus".
   * @param {number} damageTotal - The total amount of damage to undo.
   * @return {void}
   */
  undoDamage(lifepoolTarget, damageTotal) {
    const updateKey = `system.lifepool.${lifepoolTarget}.value`;
    const newLifepoolValue =
      this.system.lifepool[lifepoolTarget].value + parseInt(damageTotal);
    this.update({ [updateKey]: newLifepoolValue });
  }
}
