/* globals Roll renderTemplate game Dialog foundry FormDataExtended $ mergeObject ChatMessage */

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
      `1d6 + 1d6[fire] + 1d6 + @actor.system.abilities.${options.ability}.value`,
      { actor: options.actor },
      options,
    );
    const { rolltype, ability, actor, troubles, edges } = options;
    this.type = rolltype;
    this.actor = actor;
    this.ability = ability;
    this.modifier = actor.system.abilities[ability].value;
    this.troubles = troubles || 0;
    this.edges = edges || 0;
    this.rerolls = options.rerolls || {
      history: [],
      die1: [],
      dieM: [],
      die3: [],
    };
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
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/roll-confirmation.hbs`,
      {
        modifier: this.modifier,
        ability: game.i18n.localize(
          `MVRPG.heroSheet.abilities.${this.ability}`,
        ),
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
    const { finalResults } = this;

    // Change chat data, taking into account the reroll.
    const chatData = message.getFlag("mvrpg", "messageData");
    chatData.rerolls = this.rerolls;
    chatData.dice = finalResults;
    chatData.edgeOrTroubleCurrent -= 1;
    chatData.rollTotal =
      finalResults.die1 +
      finalResults.dieM +
      finalResults.die3 +
      chatData.modifier;
    chatData.ultimateFantasticResult = this.ultimateFantasticResult; // Recalculate, taking into account rerolls.
    chatData.fantasticResult = this.fantasticResult; // Recalculate, taking into account rerolls.
    // Prepare chat template.
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/chat/d616-card.hbs`,
      chatData,
    );

    // Update the original d616 roll with the new reroll.
    this.options.rerolls = this.rerolls;
    await message.setFlag("mvrpg", "messageData", chatData);
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

    const { finalResults } = this;

    // Change chat data, taking into account the reroll.
    const chatData = message.getFlag("mvrpg", "messageData");
    chatData.rerolls = this.rerolls;
    chatData.dice = finalResults;
    chatData.edgeOrTroubleCurrent += 1;
    chatData.rollTotal =
      finalResults.die1 +
      finalResults.dieM +
      finalResults.die3 +
      chatData.modifier;
    chatData.ultimateFantasticResult = this.ultimateFantasticResult; // Recalculate, taking into account rerolls.
    chatData.fantasticResult = this.fantasticResult; // Recalculate, taking into account rerolls.
    // Prepare chat template.
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/chat/d616-card.hbs`,
      chatData,
    );
    // Update the original d616 roll with the new reroll.
    this.options.rerolls = this.rerolls;
    await message.setFlag("mvrpg", "messageData", chatData);
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
    return {
      die1: Math[minMaxKey](...this.allRollTotals("die1")),
      dieM: Math[minMaxKey](...this.allRollTotals("dieM")),
      die3: Math[minMaxKey](...this.allRollTotals("die3")),
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
   * @return {number} the result of subtracting troubles from edges
   */
  get edgesAndTroubles() {
    return this.edges - this.troubles;
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
