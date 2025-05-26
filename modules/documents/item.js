export default class MVItem extends Item {
  /** @inheritdoc */
  async _preCreate(data, options, user) {
    if (data.type !== "simpleItem" || data.effects)
      return super._preCreate(data, options, user);

    this.updateSource({
      effects: [
        {
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
        },
      ],
    });

    return super._preCreate(data, options, user);
  }
}
