export default class RangeSchema extends foundry.abstract.DataModel {
  static defineSchema({ rangeValInitial = "10" } = {}) {
    const { fields } = foundry.data;
    return {
      value: new fields.StringField({
        required: true,
        nullable: true,
        initial: rangeValInitial,
      }),
      multiplyByRank: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
      }),
      reach: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
      }),
    };
  }
}
