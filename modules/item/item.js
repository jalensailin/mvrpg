export default class MVItem extends Item {
  static async create(data) {
    if (data.type !== "simpleItem" || data.effects) return super.create(data);

    data.effects = [];
    data.effects.push({
      name: "Damage Multiplier Bonus",
      img: "icons/skills/wounds/injury-face-impact-orange.webp",
      changes: [
        {
          key: "system.abilities.melee.damageMultiplierBonus",
          mode: 2,
          value: "1",
        },
        {
          key: "system.abilities.agility.damageMultiplierBonus",
          mode: 2,
          value: "1",
        },
      ],
    });

    return super.create(data);
  }
}
