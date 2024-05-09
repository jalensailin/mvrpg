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
