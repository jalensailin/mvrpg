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
      against: new fields.StringField({
        required: true,
        nullable: false,
        initial: "melee",
        choices: ["none", ...MVRPG.abilities],
      }),
      bonus: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: -99,
        max: 99,
      }),
      edges: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
        max: 99,
      }),
      troubles: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
        max: 99,
      }),
    };
  }
}
