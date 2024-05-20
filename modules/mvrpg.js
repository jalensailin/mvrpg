import SuperSheet from "./actor/super-sheet.js";
import MVChatLog from "./chat/chat.js";
import SuperDataModel from "./datamodels/actor/super-datamodel.js";
import * as MVRolls from "./rolls/d616.js";
import registerSettings from "./utils/settings.js";
import loadTemplates, { registerHelpers } from "./utils/handlebars.js";
import TagDataModel from "./datamodels/item/tag-datamodel.js";
import MVItemSheet from "./item/item-sheet.js";
import TraitDataModel from "./datamodels/item/trait-datamodel.js";
import PowerDataModel from "./datamodels/item/power-datamodel.js";
import MVCombatant from "./combat/combatant.js";
import MultiverseDie from "./rolls/multiverse-die.js";
import MVUtils from "./utils/utils.js";
import MVEffectConfig from "./effects/effect-config.js";
import MVEffect from "./effects/effects.js";
import createItemMacro from "./utils/macros.js";
import Logger from "./utils/logger.js";
import MVChatMessage from "./chat/chat-message.js";
import MVCombat from "./combat/combat.js";
import SuperActor from "./actor/actor.js";

// CONFIG.debug.hooks = true;

Hooks.once("init", async () => {
  Logger.log("I am GROOT");

  // Register rolls and dice.
  Object.values(MVRolls).forEach((cls) => CONFIG.Dice.rolls.push(cls));
  CONFIG.Dice.terms.mv = MultiverseDie;
  // Override the regexp that matches dice terms so that it recognizes 'mv'/'MV' as valid terms.
  CONFIG.Dice.termTypes.DiceTerm.REGEXP = MVUtils.prepareDiceTermRegExp();

  // Register Actor and sheet.
  CONFIG.Actor.documentClass = SuperActor;
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("mvrpg", SuperSheet, {
    makeDefault: true,
  });

  // Register Item sheet.
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("mvrpg", MVItemSheet, {
    makeDefault: true,
  });

  // Register Active Effect Class/Sheet.
  CONFIG.ActiveEffect.documentClass = MVEffect;
  DocumentSheetConfig.registerSheet(
    ActiveEffect,
    game.system.id,
    MVEffectConfig,
    { makeDefault: true },
  );

  // Register Class overrides.
  CONFIG.ui.chat = MVChatLog;
  CONFIG.ChatMessage.documentClass = MVChatMessage;
  CONFIG.Combatant.documentClass = MVCombatant;
  CONFIG.Combat.documentClass = MVCombat;

  // Register Actor data models.
  CONFIG.Actor.dataModels.super = SuperDataModel;
  CONFIG.Actor.dataModels.npc = SuperDataModel;

  // Register Item data models.
  CONFIG.Item.dataModels.tag = TagDataModel;
  CONFIG.Item.dataModels.trait = TraitDataModel;
  CONFIG.Item.dataModels.power = PowerDataModel;

  // Register System Classes/Functions for ease of access for users and module/macro devs.
  game.mvrpg = {
    D616: MVRolls.default,
  };

  // Turn off legacy tranferral for active effects. Necessary for v11.
  CONFIG.ActiveEffect.legacyTransferral = false;

  loadTemplates();
  registerHelpers();
  registerSettings();
});

Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
