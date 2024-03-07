/* global game renderTemplate Roll */

import MVUtils from "../utils.js";

export default class MVChat {
  static activateChatListeners(html) {
    html.on("click", ".roll-single-result:not(.mv-inactive-link)", (event) =>
      this.onRoll(event),
    );
  }

  static async onRoll(event) {
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const die = MVUtils.GetEventDatum(event, "data-die-id");
    const message = game.messages.get(messageId);
    const roll = new Roll("1d6");

    await roll.evaluate();
    if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true); // Roll Dice So Nice if present.

    const [originalD616] = message.rolls;
    originalD616.rerolls[die].push(roll);
    const { finalResults } = originalD616;

    // Change chat data, taking into account the reroll.
    const chatData = message.getFlag("mvrpg", "messageData");
    chatData.dice = finalResults;
    chatData.edgeOrTroubleCurrent -= 1;
    chatData.rollTotal =
      finalResults.die1 +
      finalResults.dieM +
      finalResults.die3 +
      chatData.modifier;
    chatData.ultimateFantasticResult = originalD616.ultimateFantasticResult; // Recalculate, taking into account rerolls.
    chatData.fantasticResult = originalD616.fantasticResult; // Recalculate, taking into account rerolls.
    // Prepare chat template.
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/chat/d616-card.hbs`,
      chatData,
    );

    // Update the original d616 roll with the new reroll.
    originalD616.options.rerolls = originalD616.rerolls;
    await message.setFlag("mvrpg", "messageData", chatData);
    message.update({ rolls: [originalD616], content });
  }
}
