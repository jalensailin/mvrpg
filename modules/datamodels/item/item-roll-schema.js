import MVRPG from "../../config.js";

export default class ItemRollSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    const { rollTypes, abilities, lifepoolTargets } = MVRPG;
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
        choices: Object.keys(rollTypes),
      }),
      ability: new fields.StringField({
        required: true,
        nullable: false,
        initial: "melee",
        choices: Object.keys(abilities),
      }),
      against: new fields.StringField({
        required: true,
        nullable: false,
        initial: "melee",
        choices: ["none", ...Object.keys(abilities)],
      }),
      lifepoolTarget: new fields.StringField({
        required: true,
        nullable: false,
        initial: "health",
        choices: ["none", ...Object.keys(lifepoolTargets)],
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
