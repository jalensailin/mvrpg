/* global game */

import { MVSettings } from "../utils/settings.js";
import MVUtils from "../utils/utils.js";

export default class MVChat {
  static activateChatListeners(html) {
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

  static async onRoll(event) {
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const dieID = MVUtils.GetEventDatum(event, "data-die-id");
    const message = game.messages.get(messageId);
    const [originalD616] = message.rolls;
    originalD616.mvReroll(dieID, message);
  }

  static async undoLastReroll(event) {
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const message = game.messages.get(messageId);
    const [originalD616] = message.rolls;
    const skipDialog = MVSettings.skipDeleteDialog();
    originalD616.undoLastReroll(message, skipDialog);
  }

  static createDamageCard(event) {
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
  static removeUndoButton(html) {
    if (game.user.isGM) return;
    html.find(".undo-last-reroll").remove();
  }
}
