/* global Combatant */

import D616 from "../rolls/d616.js";

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
      "1d6 + 1d6[fire] + 1d6 + @actor.system.initiative.value",
      {}, // Unused parameter (see D616 constructor)
      {
        rolltype: "initiative",
        actor,
        edges: actor.system.initiative.edge ? 1 : 0,
        combatantUuid: this.uuid,
      },
    );
    return roll;
  }
}
