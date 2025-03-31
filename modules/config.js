const MVRPG = {
  abilities: {
    melee: "MVRPG.sheets.generic.abilities.melee",
    agility: "MVRPG.sheets.generic.abilities.agility",
    resilience: "MVRPG.sheets.generic.abilities.resilience",
    vigilance: "MVRPG.sheets.generic.abilities.vigilance",
    ego: "MVRPG.sheets.generic.abilities.ego",
    logic: "MVRPG.sheets.generic.abilities.logic",
  },

  rollTypes: {
    combat: "MVRPG.sheets.itemSheet.settings.rollTypes.combat",
    nonCombat: "MVRPG.sheets.itemSheet.settings.rollTypes.nonCombat",
  },

  lifepoolTargets: {
    health: "MVRPG.sheets.superSheet.lifepool.health",
    focus: "MVRPG.sheets.superSheet.lifepool.focus",
  },

  effects: {
    melee: [
      "system.abilities.melee.nonCombatBonus",
      "system.abilities.melee.damageModifierBonus",
      "system.abilities.melee.damageMultiplierBonus",
      "system.abilities.melee.defenseBonus",
      "system.abilities.melee.edges",
      "system.abilities.melee.troubles",
    ],
    agility: [
      "system.abilities.agility.nonCombatBonus",
      "system.abilities.agility.damageModifierBonus",
      "system.abilities.agility.damageMultiplierBonus",
      "system.abilities.agility.defenseBonus",
      "system.abilities.agility.edges",
      "system.abilities.agility.troubles",
    ],
    resilience: [
      "system.abilities.resilience.nonCombatBonus",
      "system.abilities.resilience.damageModifierBonus",
      "system.abilities.resilience.damageMultiplierBonus",
      "system.abilities.resilience.defenseBonus",
      "system.abilities.resilience.edges",
      "system.abilities.resilience.troubles",
    ],
    vigilance: [
      "system.abilities.vigilance.nonCombatBonus",
      "system.abilities.vigilance.damageModifierBonus",
      "system.abilities.vigilance.damageMultiplierBonus",
      "system.abilities.vigilance.defenseBonus",
      "system.abilities.vigilance.edges",
      "system.abilities.vigilance.troubles",
    ],
    ego: [
      "system.abilities.ego.nonCombatBonus",
      "system.abilities.ego.damageModifierBonus",
      "system.abilities.ego.damageMultiplierBonus",
      "system.abilities.ego.defenseBonus",
      "system.abilities.ego.edges",
      "system.abilities.ego.troubles",
    ],
    logic: [
      "system.abilities.logic.nonCombatBonus",
      "system.abilities.logic.damageModifierBonus",
      "system.abilities.logic.damageMultiplierBonus",
      "system.abilities.logic.defenseBonus",
      "system.abilities.logic.edges",
      "system.abilities.logic.troubles",
    ],
    health: [
      "system.lifepool.health.max",
      "system.lifepool.health.damageReduction",
    ],
    focus: [
      "system.lifepool.focus.max",
      "system.lifepool.focus.damageReduction",
    ],
    speed: [
      "system.speed.run",
      "system.speed.climb",
      "system.speed.swim",
      "system.speed.jump",
      "system.speed.flight",
      "system.speed.glide",
      "system.speed.swingline",
      "system.speed.levitation",
    ],
  },

  sizes: {
    microscopic: "MVRPG.sheets.generic.sizes.microscopic",
    miniature: "MVRPG.sheets.generic.sizes.miniature",
    tiny: "MVRPG.sheets.generic.sizes.tiny",
    little: "MVRPG.sheets.generic.sizes.little",
    small: "MVRPG.sheets.generic.sizes.small",
    average: "MVRPG.sheets.generic.sizes.average",
    big: "MVRPG.sheets.generic.sizes.big",
    huge: "MVRPG.sheets.generic.sizes.huge",
    gigantic: "MVRPG.sheets.generic.sizes.gigantic",
    titanic: "MVRPG.sheets.generic.sizes.titanic",
    gargantuan: "MVRPG.sheets.generic.sizes.gargantuan",
  },

  powerSets: {
    basic: "MVRPG.sheets.generic.powerSets.basic",
    elementalControl: "MVRPG.sheets.generic.powerSets.elementalControl",
    healing: "MVRPG.sheets.generic.powerSets.healing",
    illusion: "MVRPG.sheets.generic.powerSets.illusion",
    luck: "MVRPG.sheets.generic.powerSets.luck",
    magic: "MVRPG.sheets.generic.powerSets.magic",
    martialArts: "MVRPG.sheets.generic.powerSets.martialArts",
    meleeWeapons: "MVRPG.sheets.generic.powerSets.meleeWeapons",
    omniversalTravel: "MVRPG.sheets.generic.powerSets.omniversalTravel",
    phasing: "MVRPG.sheets.generic.powerSets.phasing",
    plasticity: "MVRPG.sheets.generic.powerSets.plasticity",
    powerControl: "MVRPG.sheets.generic.powerSets.powerControl",
    rangedWeapons: "MVRPG.sheets.generic.powerSets.rangedWeapons",
    resize: "MVRPG.sheets.generic.powerSets.resize",
    shieldBearer: "MVRPG.sheets.generic.powerSets.shieldBearer",
    sixthSense: "MVRPG.sheets.generic.powerSets.sixthSense",
    spiderPowers: "MVRPG.sheets.generic.powerSets.spiderPowers",
    superSpeed: "MVRPG.sheets.generic.powerSets.superSpeed",
    superStrength: "MVRPG.sheets.generic.powerSets.superStrength",
    tactics: "MVRPG.sheets.generic.powerSets.tactics",
    telekenesis: "MVRPG.sheets.generic.powerSets.telekenesis",
    telepathy: "MVRPG.sheets.generic.powerSets.telepathy",
    teleportation: "MVRPG.sheets.generic.powerSets.teleportation",
    translation: "MVRPG.sheets.generic.powerSets.translation",
    weatherControl: "MVRPG.sheets.generic.powerSets.weatherControl",
  },

  powerDurations: {
    permanent: "MVRPG.sheets.generic.powerDurations.permanent",
    instant: "MVRPG.sheets.generic.powerDurations.instant",
    oneRound: "MVRPG.sheets.generic.powerDurations.oneRound",
    concentration: "MVRPG.sheets.generic.powerDurations.concentration",
  },

  actions: {
    none: "MVRPG.sheets.generic.none",
    standard: "MVRPG.sheets.generic.actions.standard",
    movement: "MVRPG.sheets.generic.actions.movement",
    reaction: "MVRPG.sheets.generic.actions.reaction",
  },

  teamManeuvers: {
    defensive: "MVRPG.sheets.superSheet.teamManeuvers.defensive",
    offensive: "MVRPG.sheets.superSheet.teamManeuvers.offensive",
    rally: "MVRPG.sheets.superSheet.teamManeuvers.rally",
  },
};

export default MVRPG;
