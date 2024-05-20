import AbilitySchema from "./ability-schema.js";
import IdentitySchema from "./identity-schema.js";
import LifepoolSchema from "./lifepool-schema.js";
import TeamManeuverSchema from "./team-maneuver-schema.js";

export default class SuperDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      abilities: new fields.SchemaField({
        melee: new fields.EmbeddedDataField(AbilitySchema),
        agility: new fields.EmbeddedDataField(AbilitySchema),
        resilience: new fields.EmbeddedDataField(AbilitySchema),
        vigilance: new fields.EmbeddedDataField(AbilitySchema),
        ego: new fields.EmbeddedDataField(AbilitySchema),
        logic: new fields.EmbeddedDataField(AbilitySchema),
      }),
      lifepool: new fields.SchemaField({
        health: new fields.EmbeddedDataField(LifepoolSchema),
        focus: new fields.EmbeddedDataField(LifepoolSchema),
      }),
      speed: new fields.SchemaField({
        run: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          positive: false,
          initial: 5,
          min: 0,
          label: "MVRPG.dataModels.speed.run",
        }),
        climb: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          positive: false,
          initial: 3,
          min: 0,
          label: "MVRPG.dataModels.speed.climb",
        }),
        swim: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          positive: false,
          initial: 3,
          min: 0,
          label: "MVRPG.dataModels.speed.swim",
        }),
        jump: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          positive: false,
          initial: 3,
          min: 0,
          label: "MVRPG.dataModels.speed.jump",
        }),
        flight: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          positive: false,
          initial: 0,
          min: 0,
          label: "MVRPG.dataModels.speed.flight",
        }),
        glide: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          positive: false,
          initial: 0,
          min: 0,
          label: "MVRPG.dataModels.speed.glide",
        }),
        swingline: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          positive: false,
          initial: 0,
          min: 0,
          label: "MVRPG.dataModels.speed.swingline",
        }),
        levitation: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          positive: false,
          initial: 0,
          min: 0,
          label: "MVRPG.dataModels.speed.levitation",
        }),
      }),
      rank: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 4,
        min: 0,
        max: 99,
      }),
      karma: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        positive: false,
        initial: 4,
      }),
      initiative: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          positive: false,
          initial: 3,
          min: 0,
        }),
        edge: new fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
      }),
      teamManeuver: new fields.EmbeddedDataField(TeamManeuverSchema),
      identity: new fields.EmbeddedDataField(IdentitySchema),
    };
  }
}
