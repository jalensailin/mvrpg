import { MVSettings } from "../utils/settings.js";
import MVUtils from "../utils/utils.js";

const { ChatLog } = foundry.applications.sidebar.tabs;

export default class MVChatLog extends ChatLog {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    actions: {
      applyDamage: MVChatLog.applyDamage,
      createDamageCard: MVChatLog.createDamageCard,
      reroll: MVChatLog.reroll,
      undoDamage: MVChatLog.undoDamage,
      undoLastReroll: MVChatLog.undoLastReroll,
    },
  };

  /**
   * Iterates over the selected tokens and applies damage to each.
   * Produce a chat card to record the damage done.
   *
   * @param {Event} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>}
   */
  static async applyDamage(event, target) {
    const messageId = MVUtils.getClosestAttribute(target, "message-id");
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
    for (const targetToken of targets) {
      const update = targetToken.actor.applyDamage(originRoll, targetToken);
      promises.push(update);
    }

    const updates = (await Promise.all(promises)).filter((u) => u);
    if (updates.length === 0) return;

    const { renderTemplate } = foundry.applications.handlebars;
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
   * @param {HTMLAnchorElement} target - The target element.
   * @return {Promise<void>}
   */
  static undoDamage(event, target) {
    const button = target;
    const damageItem = button.parentElement;

    const { targetUuid, lifepoolTarget, damageTotal } = button.dataset;
    const targetToken = fromUuidSync(targetUuid);

    if (!targetToken) {
      ui.notifications.error(
        game.i18n.localize("MVRPG.notifications.targetNotFound"),
      );
      return;
    }

    // Undo the damage.
    targetToken.actor.undoDamage(lifepoolTarget, damageTotal);

    // Grey out the button and add the undone class.
    button.classList.add("mv-inactive-link");
    damageItem.classList.add("undone");

    // Update the message so changes persist to the database.
    const messageId = MVUtils.getClosestAttribute(target, "message-id");
    const message = game.messages.get(messageId);
    const content = target.closest(".mvrpg-damage-card");
    message.update({ content: content.outerHTML });
  }

  /**
   * Adds context options to chat messages.
   * @inheritdoc
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

  /**
   * Handle the event to reroll a D616.
   *
   * @param {Event} event - The event that triggered the reroll.
   * @param {HTMLDivElement} target - The target element that triggered the event.
   * @return {Promise<void>}
   */
  static async reroll(event, target) {
    if (event.target.classList.contains("mv-inactive-link")) return;
    const messageId = MVUtils.getClosestAttribute(target, "message-id");
    const message = game.messages.get(messageId);

    const dieID = event.target.getAttribute("data-die-id");
    const [originalD616] = message.rolls;

    originalD616.mvReroll(dieID, message);
  }

  /**
   * Handle the event to undo the last reroll of a D616.
   *
   * @param {Event} event - The event that triggered the undo last reroll.
   * @param {HTMLAnchorElement} target - The target element that triggered the event.
   * @return {Promise<void>}
   */
  static async undoLastReroll(event, target) {
    const messageId = MVUtils.getClosestAttribute(target, "message-id");
    const message = game.messages.get(messageId);
    const [originalD616] = message.rolls;
    const skipDialog = MVSettings.skipDeleteDialog();
    originalD616.undoLastReroll(message, skipDialog);
  }

  /**
   * Creates a damage card for a D616 roll and sends it to the chat.
   *
   * @param {Event} event - The event object that triggered the creation of the damage card.
   * @param {HTMLAnchorElement} target - The target element associated with the event.
   * @returns {void}
   */
  static createDamageCard(event, target) {
    const messageId = MVUtils.getClosestAttribute(target, "message-id");
    const message = game.messages.get(messageId);
    const [originalD616] = message.rolls;
    originalD616.createDamageCard(message.speaker.alias, messageId);
  }

  /**
   * Removes the undo button if the user is not the GM.
   *
   * @param {ChatMessage} message - The ChatMessage document
   * @param {HTMLElement} html
   * @returns {void}
   */
  static denyPlayerAccess(message, html) {
    // Remove the undo button if the user is not the GM.
    const { isGM } = game.user;
    if (isGM) return;
    html.querySelector("[data-action='undoLastReroll']").remove();

    // Remove the reroll links if the user is not the author of the message.
    const { isAuthor } = message;
    if (isAuthor) return;
    html.querySelector(".roll-single-result").classList.add("mv-inactive-link");
  }
}

/**
 * Perform message-specific actions on render.
 *
 * @param {ChatMessage} message - The ChatMessage document being rendered
 * @param {HTMLElement} html - The inner HTML of the document that will be displayed and may be modified
 * @param {Object} messageData - The object of data used when rendering the application
 * @return {void}
 */
Hooks.on("renderChatMessageHTML", async (message, html, messageData) => {
  MVChatLog.denyPlayerAccess(message, html);
});
