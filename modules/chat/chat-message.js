import Logger from "../utils/logger.js";

export default class MVChatMessage extends ChatMessage {
  /**
   * Allow user to modify Edges and Troubles on an already rolled D616.
   *
   * @returns {Promise<void>}
   */
  async modifyRoll() {
    const [roll] = this.rolls;

    const confirmChange = await roll
      .confirmRoll("MVRPG.dialog.rollConfirm.modifyRoll")
      .catch(() => {
        Logger.log("Roll modification cancelled");
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
