import Logger from "../utils/logger.js";
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
    const dialogContent = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/damage-confirmation.hbs`,
      {
        targetName,
        damageReduction,
      },
    );
    if (!MVSettings.skipRollDialog()) {
      const confirmDamage = await Dialog.wait(
        {
          content: dialogContent,
          title: game.i18n.localize("MVRPG.dialog.damageConfirm.title"),
          buttons: {
            confirm: {
              icon: `<i class="fa-solid fa-spider"></i>`,
              label: game.i18n.localize("MVRPG.dialog.buttons.confirm"),
              callback: (html) => {
                const fd = new FormDataExtended(html.find("form")[0]);
                const formData = foundry.utils.expandObject(fd.object);
                damageReduction = formData.damageReduction;
              },
            },
          },
        },
        {
          classes: ["mvrpg", "mvrpg-dialog"],
          width: 300,
        },
      ).catch((err) => {
        Logger.log("Damage calculation cancelled", err);
        return false;
      });
      if (!confirmDamage) return null;
    }
    const damageTotal = parseInt(
      originRoll.calculateDamage(damageReduction).total,
    );

    const newLifepoolValue =
      this.system.lifepool[lifepoolTarget].value - damageTotal;

    this.update({ [updateKey]: newLifepoolValue });
    return { targetUuid, targetName, lifepoolTarget, damageTotal };
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
