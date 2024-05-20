import Logger from "../utils/logger.js";

export default class MVChatMessage extends ChatMessage {
  /**
   * Allow user to modify Edges and Troubles on an already rolled D616.
   *
   * @returns {Promise<void>}
   */
  async modifyEdgesTroubles() {
    const [roll] = this.rolls;

    // Create Dialog.
    const dialogContent = await renderTemplate(
      "systems/mvrpg/templates/dialogs/modify-edges-troubles.hbs",
      { edges: roll.edges, troubles: roll.troubles },
    );
    const confirmChange = await Dialog.wait(
      {
        content: dialogContent,
        title: game.i18n.localize("MVRPG.dialog.modifyEdgesTroubles.title"),
        buttons: {
          confirm: {
            icon: `<i class="fa-solid fa-spider"></i>`,
            label: game.i18n.localize("MVRPG.dialog.buttons.confirm"),
            callback: (html) => {
              const fd = new FormDataExtended(html.find("form")[0]);
              const formData = foundry.utils.expandObject(fd.object);
              mergeObject(roll.options, formData);
              mergeObject(roll, formData);
            },
          },
        },
      },
      {
        classes: ["mvrpg", "mvrpg-dialog"],
        width: 300,
      },
    ).catch(() => {
      Logger.log("Roll cancelled");
      return false;
    });
    if (!confirmChange) return;

    // Regenerate chat data, taking into account the reroll.
    const chatData = roll.prepareChatTemplateData();
    // Prepare chat template.
    const msgContent = await renderTemplate(roll.template, chatData);
    this.update({ rolls: [roll], content: msgContent });
  }
}
