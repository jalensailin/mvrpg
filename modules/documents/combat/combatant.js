import D616 from "../../rolls/d616.js";

export default class MVCombatant extends Combatant {
  /**
   * Provides the Roll object for initiative.
   *
   * @override
   * @returns {D616}
   */
  getInitiativeRoll() {
    const { actor } = this.token;
    const roll = new D616(
      "", // The formula is hard-coded in d616.js, so we just need to pass a dummy value.
      {}, // Unused parameter (see D616 constructor)
      {
        rollType: "initiative",
        modifier: actor.system.initiative.value,
        actor,
        edges: actor.system.initiative.edge ? 1 : 0,
        combatantUuid: this.uuid,
      },
    );
    return roll;
  }
}

/**
 * Remove glow effect if initiative is cleared on the combatant.
 * For the case where initiative is cleared from the "Reset Initiative" button,
 * see combat.js.
 */
Hooks.on("preUpdateCombatant", (combatant, data) => {
  if (typeof data.initiative === "undefined") return;
  const flags = foundry.utils.mergeObject(data.flags || {}, {
    mvrpg: {
      "-=isFantastic": null,
    },
  });
  if (!data.initiative) data.flags = flags;
});

/**
 * Adds a glow effect to the combatant's name/initiative if it rolled
 * a fantastic result. Also adds a tool-tip explaining.
 */
Hooks.on("renderCombatTracker", (app, html) => {
  const combatants = app.viewed?.combatants.filter((c) =>
    c.getFlag(game.system.id, "isFantastic"),
  );
  if (!combatants) return;

  const tooltip = game.i18n.localize("MVRPG.combatant.isFantastic");

  for (const combatant of combatants) {
    const combatantEntry = html.find(`[data-combatant-id="${combatant.id}"]`);
    const initNumber = combatantEntry.find(".token-initiative");

    combatantEntry.addClass("is-fantastic");
    initNumber.addClass("is-fantastic");

    combatantEntry.find("div.token-name h4").attr("data-tooltip", tooltip);
    initNumber.attr("data-tooltip", tooltip);
  }
});
