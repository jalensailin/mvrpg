import SuperActor from "../documents/actor.js";
import MVDialog from "../sheets/dialog-base.js";
import Logger from "../utils/logger.js";
import { MVSettings } from "../utils/settings.js";
import MultiverseDie from "./multiverse-die.js";

export default class D616 extends Roll {
  /**
   * Customize our roll with some useful information, passed in the `options` Object.
   *
   * @param {string} formula            The string formula to parse (from Foundry)
   * @param {Object} data               The data object against which to parse attributes within the formula
   * @param {Object} [options]          Additional data which is preserved in the database
   * @param {Number} [options.rollType] The type of roll (stat, skill, sanity, damage, etc).
   * @param {String} [options.ability]  The key of the ability to use as a modifier for this roll, e.g. "melee" or "ego".
   * @param {Actor}  [options.actor]    The actor that this roll originates from.
   */
  constructor(formula, data, options = {}) {
    super(
      formula || `${D616.Formula} + ${options.modifier}`,
      { actor: options.actor },
      options,
    );
    const { rollType, ability, modifier, actor, item, troubles, edges } =
      options;
    this.type = rollType;
    this.actor = actor;
    this.item = item;
    this.ability = ability;
    this.modifier = modifier;

    const against = this.type === "nonCombat" ? "none" : this.ability;
    this.against = options.against || against;
    this.tn = options.tn || 10 + this.actor.system.rank;
    this.lifepoolTarget =
      this.type !== "combat" ? "none" : options.lifepoolTarget || "health";

    this.troubles = troubles || 0;
    this.edges = edges || 0;
    this.rerolls = options.rerolls || {
      history: [],
      die1: [],
      dieM: [],
      die3: [],
    };
    this.template = "systems/mvrpg/templates/chat/d616-card.hbs";

    this.combatantUuid = options.combatantUuid || null;
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
   * The label for the "fantastic" result die
   * @type {string}
   */
  fantasticResultLabel = game.i18n.localize("MVRPG.rolls.fantasticResultDie");

  /**
   * Return the (re)roll history for each die in a single object.
   * @returns {Object}
   */
  get allDiceHistory() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    return {
      die1: this.dieHistory("die1"),
      dieM: this.dieHistory("dieM"),
      die3: this.dieHistory("die3"),
    };
  }

  /**
   * Get the final results of the roll, taking into account rerolls for troubles/edges.
   *
   * @return {Object} An object with the results of the roll, taking into account rerolls.
   */
  get finalResults() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;

    const die1 = this.activeResultDie("die1");
    const dieM = this.activeResultDie("dieM");
    const die3 = this.activeResultDie("die3");

    return {
      die1: die1.total,
      dieM: this.fantasticResult ? this.fantasticResultLabel : dieM.total,
      die3: die3.total,
      total: die1.total + dieM.total + die3.total + this.modifier,
    };
  }

  /**
   * Whether or not the middle die rolled an M (aka 1).
   *
   * @returns {Boolean}
   */
  get fantasticResult() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    return this.activeResultDie("dieM").fantasticResult;
  }

  /**
   * Whether or not all of the dice rolled a 6.
   *
   * @returns {Boolean}
   */
  get ultimateFantasticResult() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    const { die1, die3 } = this.finalResults;
    return die1 === 6 && this.fantasticResult && die3 === 6;
  }

  /**
   * Whether or not the roll was a success (beat the target number).
   *
   * @returns {Boolean}
   */
  get isSuccess() {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    return this.finalResults.total >= this.tn || this.ultimateFantasticResult;
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

  /**
   * The combatant associated with this roll.
   *
   * @type {Combatant|undefined}
   */
  get combatant() {
    return fromUuidSync(this.combatantUuid);
  }

  /**
   * Evaluate a roll. We override this so that any d616 roll will automatically come with
   * a dialog prompt, that can be skipped with ctrl-click.
   *
   * @override
   * The following `@param` descriptions comes from the Foundry VTT code.
   * @param {object} [options={}]     Options which inform how the Roll is evaluated
   * @param {boolean} [options.minimize=false]    Minimize the result, obtaining the smallest possible value.
   * @param {boolean} [options.maximize=false]    Maximize the result, obtaining the largest possible value.
   * @returns {Promise<Roll>}    The evaluated Roll instance
   *
   */
  async evaluate({ minimize = false, maximize = false } = {}) {
    // Allow user to confirm the roll (which they can skip with ctrl-click).
    if (!MVSettings.skipRollDialog()) {
      const rollConfirm = await this.confirmRoll();
      if (!rollConfirm) return null;
    }
    const roll = await super.evaluate({ minimize, maximize });

    // Update the initiative if applicable.
    if (this.combatant) {
      await roll.updateInitiative();
    }

    return roll;
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
    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(this.template, chatData).catch(
      (error) => {
        // eslint-disable-next-line no-console
        Logger.debug(
          "No template was supplied for this d616 roll. Falling back to default template.",
          error,
        );
      },
    );

    // Allow user to modify properties of an already rolled D616.
    foundry.utils.setProperty(
      messageData,
      `flags.${game.system.id}.allowModification`,
      true,
    );

    // Assign content if not already defined in the messageData.
    // eslint-disable-next-line no-param-reassign
    if (content && !messageData.content) messageData.content = content;

    return super.toMessage(messageData, {
      rollMode,
      create,
    });
  }

  /**
   * Creates a D616 roll with the given options and creates a chat message with the result/roll-info.
   *
   * @param {object} options - The options for creating the roll.
   * @param {string} options.rollType - The type of roll (stat, skill, sanity, damage, etc).
   * @param {number} options.modifier - The modifier for the roll.
   * @param {string} options.ability - The key of the ability to use as a modifier for this roll, e.g. "melee" or "ego".
   * @param {number} options.edges - The number of edges for the roll.
   * @param {number} options.troubles - The number of troubles for the roll.
   * @param {Actor} options.actor - The actor that the roll originates from.
   * @return {Promise<void>} A promise that resolves when the roll and chat message have been created.
   */
  static async createD616Roll(options) {
    // Create the d616 roll
    const roll = new D616(
      "", // The formula is hard-coded in the constructor, so we just need to pass a dummy value.
      {},
      options,
    );

    // Actually roll the dice, prompting for a dialog if requested.
    const rollConfirm = await roll.evaluate();
    if (!rollConfirm) return;

    // Create the chat message.
    const message = await roll.toMessage({
      speaker: ChatMessage.getSpeaker(),
    });

    // If we have troubles and the user specifies, reroll them automatically.
    const rerollTroublesSetting = game.settings.get(
      game.system.id,
      "autoRerollTroubles",
    );
    if (roll.edgesAndTroubles < 0 && rerollTroublesSetting) {
      // If using 3d dice, wait for the original message's animation to finish before automatically rerolling.
      if (game.dice3d)
        await game.dice3d.waitFor3DAnimationByMessageID(message.id);
      await roll.automaticallyRerollTroubles(message);
    }
  }

  /**
   * Prepares the data for a D616 roll from a given item.
   *
   * @param {SuperActor} actor - The actor object.
   * @param {string} itemId - The ID of the item.
   * @return {D616} The created D616 roll.
   */
  static async createItemRoll(actor, itemId) {
    const item = actor.items.get(itemId);
    const actorData = actor.system;

    const rollType = item.system.roll.type;
    const { ability, against, lifepoolTarget } = item.system.roll;

    let modifier =
      rollType === "nonCombat"
        ? actorData.abilities[ability].nonCombatScore
        : actorData.abilities[ability].value;
    let { edges, troubles } = actorData.abilities[ability];

    // Add item's roll data to actor's data.
    modifier += item.system.roll.bonus;
    edges += item.system.roll.edges;
    troubles += item.system.roll.troubles;

    // Dispatch the roll.
    return D616.createD616Roll({
      rollType,
      ability,
      against,
      lifepoolTarget,
      modifier,
      edges,
      troubles,
      actor,
      item,
    });
  }

  /**
   * Prepares the data needed to render a chat template for a D616 roll.
   *
   * @returns {Object}
   */
  prepareChatTemplateData() {
    let rollTitleSlug = `MVRPG.sheets.superSheet.abilities.${this.ability}`;
    if (this.type === "initiative") rollTitleSlug = "MVRPG.rolls.initiative";

    const edgeOrTroubleKey = this.edgesAndTroubles >= 0 ? "edge" : "trouble";
    const edgeOrTroubleString = `MVRPG.rolls.${edgeOrTroubleKey}s`;

    // Create a history for each die result, assigning an M for a fantastic result.
    const diceHistoryLabels = {};
    Object.entries(this.allDiceHistory).forEach(([dieId, diceList]) => {
      diceHistoryLabels[dieId] = diceList.map((die) =>
        die.fantasticResult ? this.fantasticResultLabel : die.total,
      );
    });

    // Prepare data for chat.
    return {
      rollTitle: game.i18n.localize(rollTitleSlug),
      rollSource: this.item?.name,
      type: this.type,
      dice: this.finalResults,
      hasEvaluatedRerolls: this.rerolls.history.length > 0,
      diceHistory: diceHistoryLabels,
      rollTotal: this.finalResults.total,
      against: this.against,
      tn: this.tn,
      hasEdgesOrTroubles: this.edgesAndTroubles !== 0,
      edgeOrTroubleKey,
      edgeOrTroubleString,
      edgeOrTroubleCurrent: this.edgeOrTroubleCurrent,
      edgeOrTroubleTotal: this.edgeOrTroubleTotal,
      edges: this.edges,
      troubles: this.troubles,
      modifier: this.modifier,
      fantasticResult: this.fantasticResult,
      ultimateFantasticResult: this.ultimateFantasticResult,
      isSuccess: this.isSuccess,
      displayDamageButton:
        this.type === "combat" && this.lifepoolTarget !== "none",
    };
  }

  /**
   * Create a list of all the dice rolled which correspond with the given dieId.
   * Note, due to the way Foundry constructs roll objects, we store reroll data
   * in the d616 object, not an actual instance of Die/MultiverseDie. Thus, we must create
   * a new Die/MultiverseDie for each reroll so that we can access various properties.
   *
   * @param {*} dieId - The identifier of the die (die1, dieM, or die3)
   * @returns {Array<Die|MultiverseDie>} - An array, in order, of all the dice rolled which correspond with the dieId
   */
  dieHistory(dieId) {
    if (!this._evaluated) return null; // Early return if the roll has not been evaluted;
    const originalRoll = this.dice[D616.DiceMap[dieId]];
    const { Die } = foundry.dice.terms;
    return [originalRoll].concat(
      this.rerolls[dieId].map((roll) => {
        const term = roll.terms[0];
        return dieId === "dieM" ? new MultiverseDie(term) : new Die(term);
      }),
    );
  }

  /**
   * Return the "active" die for the roll, considering rerolls.
   * I.e., the die that has the highest or lowest result (considering Fantastic results).
   *
   * @param {"die1"|"dieM"|"die3"} dieId - The identifier of the die (die1, dieM, or die3)
   * @returns {Die|MultiverseDie} The die representing the final result of all (re)rolls
   */
  activeResultDie(dieId) {
    const minMaxKey = this.edgesAndTroubles >= 0 ? "max" : "min";

    const dieHistory = this.dieHistory(dieId);
    const activeDie = dieHistory.reduce((accumulator, current) => {
      switch (minMaxKey) {
        case "max": {
          if (accumulator.fantasticResult) return accumulator;
          return accumulator.total > current.total ? accumulator : current;
        }
        case "min": {
          if (current.fantasticResult) return accumulator;
          return accumulator.total < current.total ? accumulator : current;
        }
        default:
          return null;
      }
    });
    return activeDie;
  }

  /**
   * Renders a dialog which can modify roll details and options.
   * Shows when confirming a new roll or modifying an existing roll.
   *
   * @param {string} [titleStr="MVRPG.dialog.rollConfirm.title"] - The title of the dialog.
   * @return {Promise<DialogV2>} A promise that resolves to the rendered dialog.
   */
  async confirmRoll(titleStr = "MVRPG.dialog.rollConfirm.title") {
    // Get the localized title.
    const title = game.i18n.localize(titleStr);
    // Get the correct roll key.
    let rollKey = `MVRPG.sheets.superSheet.abilities.${this.ability}`;
    if (this.type === "initiative") rollKey = "MVRPG.rolls.initiative";
    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/roll-confirmation.hbs`,
      {
        title,
        modifier: this.modifier,
        type: this.type,
        rollKey: game.i18n.localize(rollKey),
        rollSource: this.item?.name,
        against: this.against,
        tn: this.tn,
        lifepoolTarget: this.lifepoolTarget,
        edges: this.edges,
        troubles: this.troubles,
      },
    );

    return MVDialog.wait({
      content,
      window: { title },
      submit: (result, dialog) => {
        const { formData } = dialog;
        // Foundry constructs a new roll object every time messages are loaded.
        // Thus, we need to make sure that the roll.options object is mutated as well
        // as the roll itself.
        foundry.utils.mergeObject(this.options, formData);
        foundry.utils.mergeObject(this, formData);
      },
      render: (ev, dialog) => {
        const html = dialog.element;

        // Enable/disable inputs if the checkbox is checked or unchecked
        html.addEventListener("click", (event) => {
          const { target } = event;
          if (target.type !== "checkbox") return;

          const name = target.dataset.reference;
          const input = html.querySelector(`input[name="${name}"]`);

          if (target.checked) {
            input.disabled = false;
            if (input.value === "0") input.value = "1";
          } else {
            input.disabled = true;
            if (input.value === "1") input.value = "0";
          }
        });
      },
    });
  }

  /**
   * Handle the event to reroll one of the dice in a D616.
   *
   * @param {"die1"|"dieM"|"die3"} dieID - The die ID to reroll.
   * @param {Message} message - The original message with the D616 roll.
   * @return {Promise<Message>}
   */
  async mvReroll(dieID, message) {
    const chat = document.querySelector("#chat");
    const messageHTML = chat.querySelector(`[data-message-id="${message.id}"]`);
    const buttons = messageHTML.querySelectorAll("a");
    // Deactivate links until reroll is complete. This prevents the user from rerolling
    // multiple times in quick succession. The link may be reactivated later
    // when the chat data is updated.
    buttons.forEach((el) => el.classList.add("mv-inactive-link"));

    // Reroll!
    const term = dieID === "dieM" ? "1dMV" : "1d6";
    const flavor =
      dieID === "dieM"
        ? game.settings.get("mvrpg", "rerollMvDieFlavor")
        : game.settings.get("mvrpg", "rerollFlavor");
    const formula = flavor ? `${term}[${flavor || "none"}]` : term;
    const roll = new Roll(formula);
    await roll.evaluate();
    if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true); // Roll Dice So Nice if present.

    // Add reroll to original d616 roll and calculate the new results.
    this.rerolls.history.push(dieID);
    this.rerolls[dieID].push(roll);

    // Regenerate chat data, taking into account the reroll.
    const chatData = this.prepareChatTemplateData();
    // Prepare chat template.
    const { renderTemplate } = foundry.applications.handlebars;
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
      const confirmUndo = await MVDialog.wait({
        window: { title: game.i18n.localize("MVRPG.dialog.confirmUndo.title") },
        content: game.i18n.localize("MVRPG.dialog.confirmUndo.text"),
      });
      if (!confirmUndo) return null;
    }

    const dieID = this.rerolls.history.pop();
    this.rerolls[dieID].pop();

    // Regenerate chat data, taking into account the reroll.
    const chatData = this.prepareChatTemplateData();
    // Prepare chat template.
    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(this.template, chatData);

    // Update initiative tracker if applicable.
    if (this.type === "initiative") await this.updateInitiative();

    // Update the original d616 roll with the new reroll.
    this.options.rerolls = this.rerolls;
    return message.update({ rolls: [this], content });
  }

  /**
   * Automatically reroll all troubles on a D616 roll.
   *
   * @param {ChatMessage} message - The ChatMessage object associated with the roll.
   * @returns {Promise<void>} A promise that resolves when all rerolls have been completed.
   */
  async automaticallyRerollTroubles(message) {
    if (this.ultimateFantasticResult) return; // Ultimate Fantastic results automatically succeed.
    /* eslint-disable no-await-in-loop, no-continue */ // We want the the for-loop to wait for each reroll.
    for (let i = 0; i < Math.abs(this.edgesAndTroubles); i++) {
      // There's probably a way to generalize this but I don't really need to.
      const { die1, dieM, die3 } = this.finalResults;

      // If dieM is a fantastic result, reroll that always.
      if (dieM === this.fantasticResultLabel) {
        await this.mvReroll("dieM", message);
        continue;
      }

      // This is an edge case where dieM is at its lowest value (2), and this value
      // is the tied with or higher than the other two. In this case we want to reroll
      // the non-dieM die with the highest value (either a one or a two).
      if (dieM === 2 && dieM >= die1 && dieM >= die3) {
        if (die1 >= die3) {
          await this.mvReroll("die1", message);
        } else {
          await this.mvReroll("die3", message);
        }
        continue;
      }

      // If dieM isn't fantastic, but is the highest, reroll it.
      if (dieM >= die1 && dieM >= die3) {
        await this.mvReroll("dieM", message);
        continue;
      }

      // Otherwise, if die1 is the highest, reroll it.
      if (die1 > dieM && die1 >= die3) {
        await this.mvReroll("die1", message);
        continue;
      }

      // Otherwise, if die3 is the highest, reroll it.
      if (die3 > die1 && die3 > dieM) {
        await this.mvReroll("die3", message);
        continue;
      }
    } /* eslint-enable no-await-in-loop, no-continue */
  }

  /**
   * Quick utility function to update the initiative tracker
   * with the results of the roll. Used in rerolls (and undos).
   *
   * @returns {Promise<Combatant>}
   */
  async updateInitiative() {
    await this.combatant.setFlag(
      game.system.id,
      "isFantastic",
      this.fantasticResult,
    );
    return this.combatant.update({ initiative: this.finalResults.total });
  }

  /**
   * Calculate damage, taking into account damage resistance.
   *
   * @param {*} damageResistance
   * @returns {object}
   */
  calculateDamage(damageResistance = 0) {
    // Make a dummy actor so we can use its getters
    const actorData = new SuperActor(this.actor).system;
    const abilityData = actorData.abilities[this.ability];
    const dieMResult = this.activeResultDie("dieM").total;
    const { damageMultiplier, damageModifier } = abilityData;
    const finalMultiplier = damageMultiplier - Math.abs(damageResistance);
    let total = dieMResult * finalMultiplier + damageModifier;
    if (finalMultiplier < 1) total = 0;
    if (this.fantasticResult) total *= 2;
    return {
      dieMResult,
      damageMultiplier: finalMultiplier,
      damageModifier,
      damageResistance,
      total,
    };
  }

  /**
   * Creates a damage card based on the roll and dialog input, then sends it to the chat.
   *
   * @param {string} alias - The alias of the speaker.
   * @return {Promise<void>} A promise that resolves when the damage card is created and sent to the chat.
   */
  async createDamageCard(alias) {
    const { dieMResult, damageMultiplier, damageModifier, total } =
      this.calculateDamage();

    const chatData = {
      actor: this.actor,
      ability: this.ability,
      fantasticResult: this.fantasticResult,
      dieMResult,
      damageMultiplier,
      damageModifier,
      lifepoolTarget: this.lifepoolTarget,
      total,
    };
    // Prepare chat template.
    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/chat/damage-card.hbs`,
      chatData,
    );

    // Create the chat message.
    const message = await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ alias }),
      content,
      rolls: [this],
    });
    // Store this chat-data in a flag so that it's easily retrieved later.
    await message.setFlag(game.system.id, "messageData", chatData);
  }
}

/**
 * These properties rely on game settings, which are only available after setup.
 */
Hooks.on("setup", () => {
  D616.Flavor = game.settings.get("mvrpg", "mvDieFlavor") || "none";
  D616.Formula = `1d6 + 1dMV[${D616.Flavor}] + 1d6`;
});
