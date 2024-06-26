import { MVSettings } from "../utils/settings.js";
import MVUtils from "../utils/utils.js";

export default class MVChatLog extends ChatLog {
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", ".reroll-links a:not(.mv-inactive-link)", (event) =>
      MVChatLog.onRoll(event),
    );

    html.on("click", ".undo-last-reroll", (event) =>
      MVChatLog.undoLastReroll(event),
    );

    html.on("click", ".create-damage-card", (event) =>
      MVChatLog.createDamageCard(event),
    );

    html.on("click", ".apply-damage", (event) => MVChatLog.applyDamage(event));

    html.on("click", ".undo-damage-application", (event) =>
      MVChatLog.undoDamage(event),
    );
  }

  /**
   * Iterates over the selected tokens and applies damage to each.
   *
   * @param {Event} event - The event object.
   */
  static async applyDamage(event) {
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const message = game.messages.get(messageId);
    const [originRoll] = message.rolls;

    const targets = MVUtils.getIndicatedTokens();
    if (targets.length === 0) {
      ui.notifications.warn(
        game.i18n.localize("MVRPG.notifications.noTokensSelected"),
      );
      return;
    }
    const promises = [];
    for (const target of targets) {
      const update = target.actor.applyDamage(originRoll, target);
      promises.push(update);
    }
    const updates = (await Promise.all(promises)).filter((u) => u);
    if (updates.length === 0) return;
    const content = await renderTemplate(
      "systems/mvrpg/templates/chat/damage-application.hbs",
      { lifepoolTarget: originRoll.lifepoolTarget, damageList: updates },
    );
    ChatMessage.create({
      content,
    });
  }

  /**
   * Undoes the damage applied to a target and updates the message.
   *
   * @param {Event} event - The event object.
   * @return {void}
   */
  static undoDamage(event) {
    const button = event.currentTarget;
    const damageItem = button.parentElement;

    const { targetUuid, lifepoolTarget, damageTotal } =
      event.currentTarget.dataset;
    const target = fromUuidSync(targetUuid);

    if (!target) {
      ui.notifications.error(
        game.i18n.localize("MVRPG.notifications.targetNotFound"),
      );
      return;
    }

    // Undo the damage.
    target.actor.undoDamage(lifepoolTarget, damageTotal);

    // Grey out the button and add the undone class.
    $(button).addClass("mv-inactive-link");
    $(damageItem).addClass("undone");

    // Update the message so changes persist to the database.
    const messageId = MVUtils.GetEventDatum(event, "data-message-id");
    const message = game.messages.get(messageId);
    const [content] = $(event.currentTarget).parents(".mvrpg-damage-card");
    message.update({ content: content.outerHTML });
  }

  /**
   * Adds context options to chat messages.
   *
   * @override
   */
  _getEntryContextOptions() {
    const allowModification = (msgHtml) => {
      const message = game.messages.get(msgHtml[0].dataset.messageId, {
        strict: true,
      });
      return message.getFlag(game.system.id, "allowModification");
    };
    const options = super._getEntryContextOptions();
    options.push(
      // Modify properties of an already rolled D616.
      {
        name: "MVRPG.chat.contextOptions.modifyRoll",
        icon: `<i class="fa-solid fa-plus-minus"></i>`,
        condition: allowModification,
        callback: (msgHtml) => {
          const message = game.messages.get(msgHtml[0].dataset.messageId, {
            strict: true,
          });
          message.modifyRoll();
        },
      },
    );
    return options;
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
    originalD616.createDamageCard(message.speaker.alias, messageId);
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
