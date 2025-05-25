import MVDialog from "../dialog/dialog-base.js";
import { MVSettings } from "../utils/settings.js";

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
      const confirmDamage = await MVDialog.wait({
        content: dialogContent,
        window: { title: "MVRPG.dialog.damageConfirm.title" },
        submit: (result, dialog) => {
          const { formData } = dialog;
          damageReduction = formData.damageReduction;
        },
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
