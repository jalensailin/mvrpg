export default class MVCombat extends Combat {
  /**
   * When all combatants are reset, unset the "isFantastic" flag.
   * @override
   */
  async resetAll() {
    const promises = [];
    for (const combatant of this.combatants) {
      promises.push(combatant.unsetFlag(game.system.id, "isFantastic"));
    }
    await Promise.all(promises);
    return super.resetAll();
  }
}
