export default class MVChatMessage extends ChatMessage {
  /**
   * Allow user to modify Edges and Troubles on an already rolled D616.
   *
   * @returns {Promise<void>}
   */
  async modifyRoll() {
    const [roll] = this.rolls;

    const confirmChange = await roll.confirmRoll(
      "MVRPG.dialog.rollConfirm.modifyRoll",
    );

    if (!confirmChange) return;

    // Regenerate chat data, taking into account the reroll.
    const chatData = roll.prepareChatTemplateData();
    // Prepare chat template.
    const { renderTemplate } = foundry.applications.handlebars;
    const msgContent = await renderTemplate(roll.template, chatData);
    this.update({ rolls: [roll], content: msgContent });
  }
}
