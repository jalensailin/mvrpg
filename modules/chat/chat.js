/* global game */

import MVUtils from "../utils/utils.js";

export default class MVChat {
  static activateChatListeners(html) {
    html.on("click", ".reroll-links a:not(.mv-inactive-link)", (event) =>
      this.onRoll(event),
    );

    html.on("click", ".undo-last-reroll", (event) =>
      this.undoLastReroll(event),
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
    const skipDialog = event.ctrlKey;
    originalD616.undoLastReroll(message, skipDialog);
  }
}
