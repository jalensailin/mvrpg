/* globals foundry */

import MVRPG from "../../config.js";

export default class ItemRollSchema extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      hasRoll: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
      }),
      type: new fields.StringField({
        required: true,
        nullable: false,
        initial: "combat",
        choices: MVRPG.rollTypes,
      }),
      ability: new fields.StringField({
        required: true,
        nullable: false,
        initial: "melee",
        choices: MVRPG.abilities,
      }),
      bonus: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: -99,
        max: 99,
      }),
    };
  }
}
