/* global game */

import { MVReroll } from "../rolls/d616.js";
import MVUtils from "../utils.js";

export default class MVChat {
  static activateChatListeners(html) {
    html.on("click", ".roll-single-result:not(.mv-inactive-link)", (event) =>
      this.onRoll(event),
    );
  }

  static async onRoll(event) {
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const rerollType = MVUtils.GetEventDatum(event, "data-reroll-type");
    const die = MVUtils.GetEventDatum(event, "data-die-id");
    const message = game.messages.get(messageId);
    const roll = new MVReroll(
      "",
      {},
      { rerollType, actor: message.speaker.actor },
    );

    await roll.evaluate();
    roll.toMessage();

    const { rolls } = message;
    const [originalRoll] = message.rolls;
    originalRoll.rerolls[die].push(roll);
    message.update({ rolls });
  }
}
