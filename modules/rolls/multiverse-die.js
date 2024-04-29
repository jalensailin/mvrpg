/* globals Die game */

export default class MultiverseDie extends Die {
  constructor(termData) {
    termData.faces = 6;
    super(termData);
  }

  /* -------------------------------------------- */

  /** @override */
  static DENOMINATION = "MV";

  /* -------------------------------------------- */

  /** @override */
  get total() {
    if (this.fantasticResult) return 6;
    return super.total;
  }

  get fantasticResult() {
    return super.total === 1;
  }

  /** @override */
  getResultLabel(result) {
    return {
      1: game.i18n.localize("MVRPG.rolls.fantasticResultDie"),
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
    }[result.result];
  }
}
