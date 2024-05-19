/* global ChatLog game Hooks */

import D616 from "../rolls/d616.js";
import { MVSettings } from "../utils/settings.js";
import MVUtils from "../utils/utils.js";

export default class MVChatLog extends ChatLog {
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", ".reroll-links a:not(.mv-inactive-link)", (event) =>
      this.onRoll(event),
    );

    html.on("click", ".undo-last-reroll", (event) =>
      this.undoLastReroll(event),
    );

    html.on("click", ".create-damage-card", (event) =>
      this.createDamageCard(event),
    );
  }

  /**
   * Adds context options to chat messages.
   *
   * @override
   */
  _getEntryContextOptions() {
    const isD616 = (msgHtml) => {
      const message = game.messages.get(msgHtml[0].dataset.messageId, {
        strict: true,
      });
      return message.rolls[0] instanceof D616;
    };
    const options = super._getEntryContextOptions();
    options.push(
      // Modify Edges and Troubles on an already rolled D616.
      {
        name: "MVRPG.chat.contextOptions.modifyEdgesTroubles",
        icon: `<i class="fa-solid fa-plus-minus"></i>`,
        condition: isD616,
        callback: (msgHtml) => {
          const message = game.messages.get(msgHtml[0].dataset.messageId, {
            strict: true,
          });
          message.modifyEdgesTroubles();
        },
      },
    );
    return options;
  }

  async onRoll(event) {
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const dieID = MVUtils.GetEventDatum(event, "data-die-id");
    const message = game.messages.get(messageId);
    const [originalD616] = message.rolls;
    originalD616.mvReroll(dieID, message);
  }

  async undoLastReroll(event) {
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const message = game.messages.get(messageId);
    const [originalD616] = message.rolls;
    const skipDialog = MVSettings.skipDeleteDialog();
    originalD616.undoLastReroll(message, skipDialog);
  }

  createDamageCard(event) {
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const message = game.messages.get(messageId);
    const [originalD616] = message.rolls;
    originalD616.createDamageCard(message.speaker.alias);
  }

  /**
   * Removes the undo button if the user is not the GM.
   *
   * @param {*} html
   * @returns {void}
   */
  static denyPlayerAccess(message, html) {
    // Remove the undo button if the user is not the GM.
    const { isGM } = game.user;
    if (isGM) return;
    html.find(".undo-last-reroll").remove();

    // Remove the reroll links if the user is not the author of the message.
    const { isAuthor } = message;
    if (isAuthor) return;
    html.find(".roll-single-result").addClass("mv-inactive-link");
  }
}

/**
 * Perform message-specific actions on render.
 *
 * @param {ChatMessage} message - The ChatMessage document being rendered
 * @param {jQuery} html - The inner HTML of the document that will be displayed and may be modified
 * @param {Object} messageData - The object of data used when rendering the application
 * @return {void}
 */
Hooks.on("renderChatMessage", async (message, html, messageData) => {
  MVChatLog.denyPlayerAccess(message, html);
});
