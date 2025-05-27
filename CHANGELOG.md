<!-- markdownlint-disable MD024 -->

# Multiverse RPG for Foundry - Changelog

## Version 3.0.1 (2025-05-27)

### Bug Fixes

- Fix weird trailing period in powers tab.

## Version 3.0.0 (2025-05-27)

### General

- Updated system for compatibility with Foundry v13. Foundry v12 is no longer supported.
- Add Dice Shake animation to icon on rollable items.
- The Range input in Item Sheet settings can now accomodate text input in addition to numeric input.
- Add a Simple Item item-type to keep track of inventory items.
- Add new power sets options from the x-men book.
- A ton of improvements to the codebase to make it more robust and maintainable.

## Version 2.0.0 (2024-07-15)

### General

- Updated system for compatibility with Foundry v12. Foundry v11 is no longer supported.

## Version 1.2.2 (2024-07-15)

### Bug Fixes

- Issue #38: AEs that affect Damage Multiplier/Modifier Bonuses apply to damage calculations correctly.

## Version 1.2.1 (2024-05-27)

### General

- Updated readme for clarity.

### Bug Fixes

- Fixed issue with the "none" action-type being improperly localized. [Issue #35]

## Version 1.2.0 (2024-05-23)

### Enhancements

- Users can now adjust more roll details after the roll was already made. The button to do so has been renamed to `Modify Roll`, and can still be accessed by right-clicking a roll message in chat.
- Added ability to apply damage to selected tokens from the chat. [Issue #31]
  - This will take into account any damage reduction that the actor has, which can be adjusted in a dialog.
  - A chat card detailing the total damage done will be sent to the chat, where this damage can also be undone if something was misapplied.

### Bug Fixes

- Hide the damage calculation button if roll was not a "combat" roll.

## Version 1.1.0 (2024-05-19)

### Enhancements

- Add the ability for the user to adjust amount of edges/troubles after a roll has already been made. Simply right-click on the chat message and select `Modify Edges/Troubles`. [Issue #21]
- Add a visual indicator (glowing text effect) for when a combatant has a fantastic result on their initiative. [Issue #22]
- Add option to set what ability defense a roll is against (e.g. melee defense, etc.), as well as setting a target number.
  - Items can also set what ability defense they are rolled against.
  - Chat card will say what ability defense it was rolled against, and whether or not the roll beat the target number (TN).

## Version 1.0.0 (2024-05-18)

- Initial Foundry Release.
