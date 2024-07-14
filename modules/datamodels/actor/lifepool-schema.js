export default class LifepoolSchema extends foundry.abstract.DataModel {
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
      max: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        min: 0,
        label: "MVRPG.dataModels.lifepool.max",
      }),
      damageReduction: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 0,
        label: "MVRPG.dataModels.lifepool.damageReduction",
      }),
    };
  }
}
