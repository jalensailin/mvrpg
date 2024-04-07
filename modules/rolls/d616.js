/* globals fromUuidSync Roll renderTemplate game Dialog foundry FormDataExtended $ mergeObject ChatMessage */

import { MVSettings } from "../utils/settings.js";

export default class D616 extends Roll {
  /**
   * Customize our roll with some useful information, passed in the `options` Object.
   *
   * @param {string} formula            Unused - The string formula to parse (from Foundry)
   * @param {Object} data               The data object against which to parse attributes within the formula
   * @param {Object} [options]          Additional data which is preserved in the database
   * @param {Number} [options.rollType] The type of roll (stat, skill, sanity, damage, etc).
   * @param {String} [options.ability]  The key of the ability to use as a modifier for this roll, e.g. "melee" or "ego".
   * @param {Actor}  [options.actor]    The actor that this roll originates from.
   */
  constructor(formula, data, options = {}) {
    super(
      formula ||
        `1d6 + 1d6[fire] + 1d6 + @actor.system.abilities.${options.ability}.value`,
      { actor: options.actor },
      options,
    );
    const { rolltype, ability, actor, troubles, edges } = options;
    this.type = rolltype;
    this.actor = actor;
    this.ability = ability;
    this.troubles = troubles || 0;
    this.edges = edges || 0;
    this.rerolls = options.rerolls || {
      history: [],
      die1: [],
      dieM: [],
      die3: [],
    };

    switch (rolltype) {
      case "initiative":
        this.modifier = actor.system.initiative.value;
        this.combatantUuid = options.combatantUuid;
        this.template = "systems/mvrpg/templates/chat/d616-initiative-card.hbs";
        break;
      default:
        this.modifier = actor.system.abilities[ability].value;
        this.combatantUuid = null;
        this.template = "systems/mvrpg/templates/chat/d616-card.hbs";
        break;
    }
  }

  /**
   * Map of die IDs to their index in the array of dice.
   */
  static DiceMap = {
    die1: 0,
    dieM: 1,
    die3: 2,
  };

  /**
   * Evaluate a roll. We override this so that any d616 roll will automatically come with
   * a dialog prompt, that can be skipped with ctrl-click.
   *
   * @override
   * The following `@param` descriptions comes from the Foundry VTT code.
   * @param {object} [options={}]     Options which inform how the Roll is evaluated
   * @param {boolean} [options.minimize=false]    Minimize the result, obtaining the smallest possible value.
   * @param {boolean} [options.maximize=false]    Maximize the result, obtaining the largest possible value.
   * @param {boolean} [options.async=true]        Evaluate the roll asynchronously. false is deprecated
   * @returns {Roll|Promise<Roll>}    The evaluated Roll instance
   *
   */
  async evaluate({ minimize = false, maximize = false, async = true } = {}) {
    // Allow user to confirm the roll (which they can skip with ctrl-click).
    if (!MVSettings.skipRollDialog()) {
      const rollConfirm = await this.confirmRoll().catch(() => {
        // eslint-disable-next-line no-console
        console.log("Roll cancelled");
        return false;
      });
      if (!rollConfirm) return null;
    }
    return super.evaluate({ minimize, maximize, async });
  }

  /**
   * Prepare a chat message from this roll. We override this to assign
   * the message's template based on the type of roll. We also store the data
   * used to render the template in a flag on the chat message. The rest of the
   *
   * @override
   * The following `@param` descriptions comes from the Foundry VTT code.
   * @param {object} messageData          The data object to use when creating the message
   * @param {options} [options]           Additional options which modify the created message.
   * @param {string} [options.rollMode]   The template roll mode to use for the message from CONFIG.Dice.rollModes
   * @param {boolean} [options.create=true]   Whether to automatically create the chat message, or only return the
   *                                          prepared chatData object.
   * @returns {Promise<ChatMessage|object>} A promise which resolves to the created ChatMessage document if create is
   *                                        true, or the Object of prepared chatData otherwise.
   */
  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    const chatData = this.prepareChatTemplateData();
    const content = await renderTemplate(this.template, chatData).catch(
      (error) => {
        // eslint-disable-next-line no-console
        console.error(
          "No template was supplied for this d616 roll. Falling back to default template.",
          error,
        );
      },
    );

    // Assign content if not already defined in the messageData.
    if (content && !messageData.content) messageData.content = content;

    return super.toMessage(messageData, {
      rollMode,
      create,
    });
  }

  prepareChatTemplateData() {
    const edgeOrTroubleKey = this.edgesAndTroubles >= 0 ? "edge" : "trouble";
    const edgeOrTroubleString = `MVRPG.rolls.${edgeOrTroubleKey}s`;

    // Prepare data for chat.
    return {
      isGM: game.user.isGM,
      dice: this.finalResults,
      originalResults: this.originalResults,
      rerolls: this.rerolls,
      rollTotal: this.finalResults.total,
      hasEdgesOrTroubles: this.edgesAndTroubles !== 0,
      edgeOrTroubleKey,
      edgeOrTroubleString,
      edgeOrTroubleCurrent: this.edgeOrTroubleCurrent,
      edgeOrTroubleTotal: this.edgeOrTroubleTotal,
      edges: this.edges,
      troubles: this.troubles,
      modifier: this.modifier,
      ability: this.ability,
      fantasticResult: this.fantasticResult,
      ultimateFantasticResult: this.ultimateFantasticResult,
    };
  }

  /**
   * Calculates the total roll values for the specified die.
   *
   * @param {String} dieId - The identifier of the die (die1, dieM, or die3)
   * @return {Array} An array containing the totals for the original d616 roll and all rerolls
   */
  allRollTotals(dieId) {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;

    const rollTotal = this.dice[D616.DiceMap[dieId]].total;

    // If no rerolls, just return the total.
    if (this.rerolls[dieId].length === 0) return [rollTotal];

    // Otherwise return an array containing the total for this roll and all rerolls.
    const rerollTotals = this.rerolls[dieId].map((r) => r.total);
    return [rollTotal].concat(rerollTotals);
  }

  async confirmRoll() {
    // Get the correct roll key.
    let rollKey = `MVRPG.heroSheet.abilities.${this.ability}`;
    if (this.type === "initiative") rollKey = "MVRPG.rolls.initiative";
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/roll-confirmation.hbs`,
      {
        modifier: this.modifier,
        rollKey: game.i18n.localize(rollKey),
        edges: this.edges,
        troubles: this.troubles,
      },
    );
    return Dialog.wait(
      {
        content,
        title: game.i18n.localize("MVRPG.dialog.rollConfirm.title"),
        default: "confirm",
        buttons: {
          confirm: {
            icon: `<i class="fa-solid fa-spider"></i>`,
            label: game.i18n.localize("MVRPG.dialog.buttons.confirm"),
            callback: (html) => {
              const fd = new FormDataExtended(html.find("form")[0]);
              const formData = foundry.utils.expandObject(fd.object);
              // Foundry constructs a new roll object every time messages are loaded.
              // Thus, we need to make sure that the roll.options object is mutated as well
              // as the roll itself.
              mergeObject(this.options, formData);
              mergeObject(this, formData);
            },
          },
        },
        render: (html) => {
          // Enable/disable inputs if the checkbox is checked or unchecked
          html.on("click", "input[type='checkbox']", (event) => {
            const form = html.find("form");
            const { currentTarget } = event;
            const name = currentTarget.dataset.reference;
            const input = form.find(`input[name="${name}"]`);
            if ($(currentTarget).prop("checked")) {
              input.prop("disabled", false);
              if (input.val() === "0") input.val("1");
            } else {
              input.prop("disabled", true);
              if (input.val() === "1") input.val("0");
            }
          });
        },
      },
      {
        classes: ["mvrpg", "mvrpg-dialog", "roll"],
        width: 300,
      },
    );
  }

  async mvReroll(dieID, message) {
    const chat = document.querySelector("#chat");
    const messageHTML = chat.querySelector(`[data-message-id="${message.id}"]`);
    const buttons = messageHTML.querySelectorAll("a");
    // Deactivate links until reroll is complete. This prevents the user from rerolling
    // multiple times in quick succession. The link may be reactivated later
    // when the chat data is updated.
    buttons.forEach((el) => el.classList.add("mv-inactive-link"));

    // Reroll!
    const roll = new Roll("1d6[cold]");
    await roll.evaluate();
    if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true); // Roll Dice So Nice if present.

    // Add reroll to original d616 roll and calculate the new results.
    this.rerolls.history.push(dieID);
    this.rerolls[dieID].push(roll);

    // Regenerate chat data, taking into account the reroll.
    const chatData = this.prepareChatTemplateData();
    // Prepare chat template.
    const content = await renderTemplate(this.template, chatData);

    // Update initiative tracker if applicable.
    if (this.type === "initiative") await this.updateInitiative();

    // Update the original d616 roll with the new reroll.
    this.options.rerolls = this.rerolls;
    return message.update({ rolls: [this], content });
  }

  async undoLastReroll(message, skipDialog) {
    if (this.rerolls.history.length === 0) return null;

    if (!skipDialog) {
      const confirmUndo = await Dialog.confirm({
        title: game.i18n.localize("MVRPG.dialog.confirmUndo.title"),
        content: game.i18n.localize("MVRPG.dialog.confirmUndo.text"),
      });
      if (!confirmUndo) return null;
    }

    const dieID = this.rerolls.history.pop();
    this.rerolls[dieID].pop();

    // Regenerate chat data, taking into account the reroll.
    const chatData = this.prepareChatTemplateData();
    // Prepare chat template.
    const content = await renderTemplate(this.template, chatData);

    // Update initiative tracker if applicable.
    if (this.type === "initiative") await this.updateInitiative();

    // Update the original d616 roll with the new reroll.
    this.options.rerolls = this.rerolls;
    return message.update({ rolls: [this], content });
  }

  async automaticallyRerollTroubles(message) {
    if (this.ultimateFantasticResult) return; // Ultimate Fantastic results automatically succeed.
    /* eslint-disable no-await-in-loop */ // We want the the for-loop to wait for each reroll.
    for (let i = 0; i < Math.abs(this.edgesAndTroubles); i++) {
      // There's probably a way to generalize this but I don't really need to.
      const { die1, dieM, die3 } = this.finalResults;
      if (dieM >= die1 && dieM >= die3) {
        await this.mvReroll("dieM", message);
      } else if (die1 > dieM && die1 >= die3) {
        await this.mvReroll("die1", message);
      } else if (die3 > die1 && die3 > dieM) {
        await this.mvReroll("die3", message);
      }
    }
  }

  /**
   * Quick utility function to update the initiative tracker
   * with the results of the roll. Used in rerolls (and undos).
   */
  async updateInitiative() {
    const combatant = fromUuidSync(this.combatantUuid);
    combatant.update({ initiative: this.finalResults.total });
  }

  async createDamageCard(alias) {
    const actorData = this.actor.system;
    const abilityData = actorData.abilities[this.ability];
    const { dieMResult, damageMultiplier, total } = this.calculateDamage;

    const chatData = {
      actor: this.actor,
      ability: this.ability,
      dieMResult,
      damageMultiplier,
      modifier: abilityData.value,
      total,
    };
    // Prepare chat template.
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/chat/damage-card.hbs`,
      chatData,
    );

    // Create the chat message.
    const message = await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ alias }),
      content,
    });
    // Store this chat-data in a flag so that it's easily retrieved later.
    await message.setFlag(game.system.id, "messageData", chatData);
  }

  /**
   * Get the final results of the roll, taking into account rerolls for troubles/edges.
   *
   * @return {Object} An object with the results of the roll, taking into account rerolls.
   */
  get finalResults() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;

    const minMaxKey = this.edgesAndTroubles >= 0 ? "max" : "min";

    const die1 = Math[minMaxKey](...this.allRollTotals("die1"));
    const dieM = Math[minMaxKey](...this.allRollTotals("dieM"));
    const die3 = Math[minMaxKey](...this.allRollTotals("die3"));
    return {
      die1,
      dieM,
      die3,
      total: die1 + dieM + die3 + this.modifier,
    };
  }

  /**
   * Get the original results of the roll.
   *
   * @return {Object} An object with the original results of the roll.
   */
  get originalResults() {
    const die1 = this.dice[D616.DiceMap.die1].total;
    const dieM = this.dice[D616.DiceMap.dieM].total;
    const die3 = this.dice[D616.DiceMap.die3].total;
    return {
      die1,
      dieM,
      die3,
      total: die1 + dieM + die3 + this.modifier,
    };
  }

  /**
   * Whether or not the middle die rolled an M (aka 6).
   *
   * @returns {Boolean}
   */
  get fantasticResult() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    const { dieM } = this.finalResults;
    return dieM === 6;
  }

  /**
   * Whether or not all of the dice rolled a 6.
   *
   * @returns {Boolean}
   */
  get ultimateFantasticResult() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    const { die1, dieM, die3 } = this.finalResults;
    return die1 === 6 && dieM === 6 && die3 === 6;
  }

  /**
   * Reduces the number of edges by the number of troubles.
   * A negative return value indicates the number of troubles,
   * while a positive value indicates the number of edges.
   *
   * This only describes the original number of edges/troubles
   * on the roll, not how many there are after rerolls.
   *
   * @return {Number} the result of subtracting troubles from edges
   */
  get edgesAndTroubles() {
    return this.edges - this.troubles;
  }

  /**
   * The total number of edges or troubles (absolute value of above)
   *
   * @return {Number} the total number of edges or troubles
   */
  get edgeOrTroubleTotal() {
    return Math.abs(this.edgesAndTroubles);
  }

  /**
   * The current number of edges or troubles, taking into account
   * the amount of rerolls.
   *
   * @return {Number} the current number of edges or troubles
   */
  get edgeOrTroubleCurrent() {
    return this.edgeOrTroubleTotal - this.rerolls.history.length;
  }

  get calculateDamage() {
    const actorData = this.actor.system;
    const abilityData = actorData.abilities[this.ability];
    const dieMResult = this.finalResults.dieM;
    const damageMultiplier = actorData.rank + abilityData.damageMultiplierBonus;
    const total = dieMResult * damageMultiplier + abilityData.value;
    return { dieMResult, damageMultiplier, total };
  }
}
