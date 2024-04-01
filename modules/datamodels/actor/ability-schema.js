/* globals foundry */

export default class AbilitySchema extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      value: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
      }),
      nonCombatBonus: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
      }),
      defenseBonus: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
      }),
      damageMultiplierBonus: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
      }),
      edges: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
      }),
      troubles: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
      }),
    };
  }

  get defenseScore() {
    return 10 + this.value + this.defenseBonus;
  }

  get nonCombatScore() {
    return this.value + this.nonCombatBonus;
  }
}
