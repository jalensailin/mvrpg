/* globals foundry */

import MVRPG from "../../config.js";

export default class TeamManeuverSchema extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      active: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
      }),
      choice: new fields.StringField({
        required: true,
        nullable: false,
        initial: "defensive",
        choices: Object.keys(MVRPG.teamManeuvers),
      }),
      averageRank: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: true,
        initial: 4,
        min: 1,
        max: 6,
      }),
    };
  }

  get maneuverLevel() {
    return Math.ceil(this.averageRank / 2);
  }

  get focusCost() {
    return this.maneuverLevel * 5;
  }
}
