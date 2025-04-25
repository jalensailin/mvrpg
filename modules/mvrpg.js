import SuperActor from "./actor/actor.js";
import SuperSheet from "./actor/super-sheet.js";
import MVChatMessage from "./chat/chat-message.js";
import MVChatLog from "./chat/chat.js";
import MVCombat from "./combat/combat.js";
import MVCombatant from "./combat/combatant.js";
import SuperDataModel from "./datamodels/actor/super-datamodel.js";
import PowerDataModel from "./datamodels/item/power-datamodel.js";
import SimpleItemDataModel from "./datamodels/item/simple-item-datamodel.js";
import TagDataModel from "./datamodels/item/tag-datamodel.js";
import TraitDataModel from "./datamodels/item/trait-datamodel.js";
import MVEffectConfig from "./effects/effect-config.js";
import MVEffect from "./effects/effects.js";
import MVItemSheet from "./item/item-sheet.js";
import MVItem from "./item/item.js";
import * as MVRolls from "./rolls/d616.js";
import MultiverseDie from "./rolls/multiverse-die.js";
import MVRollParser from "./rolls/roll-parser.js";
import loadTemplates, { registerHelpers } from "./utils/handlebars.js";
import Logger from "./utils/logger.js";
import createItemMacro from "./utils/macros.js";
import registerSettings from "./utils/settings.js";

// CONFIG.debug.hooks = true;

Hooks.once("init", async () => {
  Logger.log("I am GROOT");

  const { ActorSheet, ItemSheet } = foundry.appv1.sheets;

  // Register rolls and dice.
  CONFIG.Dice.parser = MVRollParser;
  CONFIG.Dice.terms.mv = MultiverseDie;
  Object.values(MVRolls).forEach((cls) => CONFIG.Dice.rolls.push(cls));

  // Register Actor and sheet.
  CONFIG.Actor.documentClass = SuperActor;
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("mvrpg", SuperSheet, {
    makeDefault: true,
  });

  // Register Item sheet.
  CONFIG.Item.documentClass = MVItem;
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
  CONFIG.Item.dataModels.simpleItem = SimpleItemDataModel;

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
