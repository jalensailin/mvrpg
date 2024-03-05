/* global ActorSheet mergeObject game renderTemplate Dialog FormDataExtended foundry ChatMessage */

import D616 from "../rolls/d616.js";

export default class SuperSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["mvrpg", "sheet", "actor"],
      template: `systems/${game.system.id}/templates/actor/super-sheet.hbs`,
      width: 600,
      height: 670,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "powers",
        },
      ],
    });
  }

  /**
   * @override
   */
  async getData() {
    const foundryData = super.getData();
    const mvrpgData = {};

    // Group speeds with the same value.
    const speeds = this.actor.system.speed;
    const groupedSpeeds = {};
    for (const [speedType, speedVal] of Object.entries(speeds)) {
      if (Array.isArray(groupedSpeeds[speedVal])) {
        groupedSpeeds[speedVal].push(speedType);
      } else {
        groupedSpeeds[speedVal] = [speedType];
      }
    }
    mvrpgData.speeds = groupedSpeeds;
    mvrpgData.displaySpeed =
      this.actor.getFlag(game.system.id, "displaySpeed") || "run";

    return { ...foundryData, ...mvrpgData };
  }

  /**
   * @param {*} html
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;
    html.find(".rollable").click((event) => this.onRoll(event));

    html.find(".open-config").click(() => this.showConfig());
  }

  /**
   * Handle the roll event and execute associated actions.
   *
   * @param {Event} event - The roll event
   * @return {Promise} A promise that resolves when the roll event is handled
   */
  async onRoll(event) {
    const { rollType, ability } = event.currentTarget.dataset;
    const modifier = this.actor.system.abilities[ability].value;
    // Create the d616 roll
    const roll = new D616(
      "", // The formula is hard-coded in d616.js, so we just need to pass a dummy value.
      {},
      { rollType, ability, actor: this.actor, edges: 3, troubles: 1 },
    );
    // Actually roll the dice
    await roll.evaluate();

    const edgeOrTroubleKey = roll.edgesAndTroubles >= 0 ? "edge" : "trouble";
    const edgeOrTroubleString = `MVRPG.rolls.${edgeOrTroubleKey}s`;

    const edgeOrTroubleCurrent = Math.abs(roll.edgesAndTroubles);

    // Prepare data for chat.
    const [die1, dieM, die3] = roll.dice;
    const chatData = {
      dice: { die1, dieM, die3 },
      rollTotal: roll.total,
      hasEdgesOrTroubles: roll.edgesAndTroubles !== 0,
      edgeOrTroubleKey,
      edgeOrTroubleString,
      edgeOrTroubleCurrent,
      edgeOrTroubleTotal: edgeOrTroubleCurrent,
      edges: roll.edges,
      troubles: roll.troubles,
      modifier,
      ability,
      fantasticResult: roll.fantasticResult,
      ultimateFantasticResult: roll.ultimateFantasticResult,
    };

    // Prepare chat template.
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/chat/d616-card.hbs`,
      chatData,
    );
    const message = await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content,
    });
    // Store this chat-data in a flag so that its easily retrieved later.
    message.setFlag(game.system.id, "messageData", chatData);
  }

  async showConfig() {
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/actor/dialogs/init-speed-dialog.hbs`,
      { actor: this.actor },
    );
    const dialog = new Dialog(
      {
        content,
        title: game.i18n.localize("MVRPG.dialog.initSpeed.title"),
        default: "confirm",
        buttons: {
          confirm: {
            icon: `<i class="fa-solid fa-spider"></i>`,
            label: game.i18n.localize("MVRPG.dialog.buttons.confirm"),
            callback: (html) => {
              const fd = new FormDataExtended(html.find("form")[0]);
              const formData = foundry.utils.expandObject(fd.object);
              this.actor.update(formData);
            },
          },
        },
      },
      {
        id: "init-speed-dialog",
        classes: ["mvrpg", "mvrpg-dialog", "actor"],
        width: 300,
      },
    );
    dialog.render(true);
  }
}
