import Logger from "../utils/logger.js";
import { MVSettings } from "../utils/settings.js";

export default class SuperActor extends Actor {
  /**
   * Applies damage to the selected targets.
   *
   * @param {D616} originRoll - The roll from which the damage originates.
   * @return {Promise<Actor|void>} A promise that resolves to an array of promises representing the update operations.
   */
  async applyDamage(originRoll, tokenName) {
    const { lifepoolTarget } = originRoll;
    const updateKey = `system.lifepool.${lifepoolTarget}.value`;
    let { damageReduction } = this.system.lifepool[lifepoolTarget];

    // Set up dialog for each this.
    const dialogContent = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/damage-confirmation.hbs`,
      {
        tokenName,
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
    const damageTotal = originRoll.calculateDamage(damageReduction).total;

    const newLifepoolValue =
      this.system.lifepool[lifepoolTarget].value - parseInt(damageTotal);
    const updateValue = Math.max(
      newLifepoolValue,
      -this.system.lifepool[lifepoolTarget].max,
    );
    return this.update({ [updateKey]: updateValue });
  }
}
