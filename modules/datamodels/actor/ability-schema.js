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
        label: "MVRPG.dataModels.abilities.nonCombatBonus",
      }),
      defenseBonus: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
        label: "MVRPG.dataModels.abilities.defenseBonus",
      }),
      damageModifierBonus: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        label: "MVRPG.dataModels.abilities.damageModifierBonus",
      }),
      damageMultiplierBonus: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
        label: "MVRPG.dataModels.abilities.damageMultiplierBonus",
      }),
      edges: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
        label: "MVRPG.dataModels.abilities.edges",
      }),
      troubles: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
        label: "MVRPG.dataModels.abilities.troubles",
      }),
    };
  }

  get defenseScore() {
    return 10 + this.value + this.defenseBonus;
  }

  get nonCombatScore() {
    return this.value + this.nonCombatBonus;
  }

  get damageModifier() {
    return this.value + this.damageModifierBonus;
  }

  get damageMultiplier() {
    return this.parent.rank + this.damageMultiplierBonus;
  }
}
