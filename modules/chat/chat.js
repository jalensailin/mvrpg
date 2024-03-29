/* global game */

import MVUtils from "../utils/utils.js";

export default class MVChat {
  static activateChatListeners(html) {
    html.on("click", ".reroll-links a:not(.mv-inactive-link)", (event) =>
      this.onRoll(event),
    );
  }

  static async onRoll(event) {
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const dieID = MVUtils.GetEventDatum(event, "data-die-id");
    const message = game.messages.get(messageId);
    const [originalD616] = message.rolls;
    originalD616.mvReroll(dieID, message);
  }
}
