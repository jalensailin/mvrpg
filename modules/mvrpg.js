/* global Hooks Actors ActorSheet CONFIG */
import SuperSheet from "./actor/super-sheet.js";
import * as MVRolls from "./rolls/d616.js";

Hooks.once("init", async () => {
  console.log("I am GROOT");
  Object.values(MVRolls).forEach((cls) => CONFIG.Dice.rolls.push(cls));

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("mvrpg", SuperSheet, {
    makeDefault: true,
  });
});
