import MVRPG from "../config.js";
import D616 from "../rolls/d616.js";
import EffectUtils from "../documents/effects.js";
import { MVSettings } from "../utils/settings.js";
import MVUtils from "../utils/utils.js";
import MVDialog from "./dialog-base.js";

const { ActorSheetV2 } = foundry.applications.sheets;
const HbsAppMixin = foundry.applications.api.HandlebarsApplicationMixin;

export default class SuperSheet extends HbsAppMixin(ActorSheetV2) {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [MVRPG.ID, "sheet", "actor"],
      template: `systems/${game.system.id}/templates/actor/super-sheet.hbs`,
      width: 600,
      height: 670,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "combat",
        },
        {
          navSelector: ".powers-tabs",
          contentSelector: ".powers-body",
          initial: "powers",
        },
      ],
      scrollY: [".editor-content"],
    });
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: [MVRPG.ID, "sheet", "actor"],
    position: { width: 600, height: 670 },
    form: { submitOnChange: true },
    // actions: {},
  };

  /** @inheritdoc */
  static TABS = {
    primary: {
      initial: "combat",
      labelPrefix: "MVRPG.sheets.actorSheet.titles",
      tabs: [{ id: "powers" }, { id: "combat" }, { id: "identity" }],
    },
    secondary: {
      initial: "powers",
      labelPrefix: "MVRPG.sheets.actorSheet.titles",
      tabs: [
        { id: "powers" },
        { id: "traits" },
        { id: "tags" },
        { id: "inventory" },
        { id: "effects" },
      ],
    },
  };

  /** @inheritdoc */
  static PARTS = {
    main: {
      template: `systems/${MVRPG.ID}/templates/actor/super-sheet.hbs`,
    },
  };

  /**
   * @override
   */
  async getData() {
    const foundryData = super.getData();
    const mvrpgData = {};
    const { actor } = this;
    // Prepare speed data for the template.
    mvrpgData.displaySpeed =
      actor.getFlag(game.system.id, "displaySpeed") || "run";
    mvrpgData.speedSelectOptions = {};
    Object.entries(actor.system.speed).forEach(([speedName, speedVal]) => {
      if (!speedVal) return;
      mvrpgData.speedSelectOptions[speedName] = game.i18n.localize(
        `MVRPG.sheets.superSheet.speed.${speedName}`,
      );
    });

    // Prepare only data relevant to damage mutipliers for simplicity in the template.
    const damageData = Object.entries(actor.system.abilities)
      .filter(([name]) => name !== "resilience" && name !== "vigilance")
      .map(([name, abilityData]) => ({
        name,
        damageModifier: abilityData.damageModifier,
        damageMultiplier: abilityData.damageMultiplier,
      }));
    mvrpgData.damageData = damageData;

    // Prepare rollable items for combat tab.
    const rollableItems = actor.items.filter(
      (item) => item.system.roll?.hasRoll,
    );
    mvrpgData.rollableItems = rollableItems;

    const TextEditor = foundry.applications.ux.TextEditor.implementation;
    mvrpgData.enrichedNotes = await TextEditor.enrichHTML(
      actor.system.identity.notes,
      { async: true },
    );

    const allEffects = Array.from(this.actor.allApplicableEffects());
    mvrpgData.allEffects = allEffects;

    return { ...foundryData, ...mvrpgData };
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const mvrpgData = {};
    const { actor } = this;

    mvrpgData.actor = actor;

    // Prepare speed data for the template.
    mvrpgData.displaySpeed =
      actor.getFlag(game.system.id, "displaySpeed") || "run";
    mvrpgData.speedSelectOptions = {};
    Object.entries(actor.system.speed).forEach(([speedName, speedVal]) => {
      if (!speedVal) return;
      mvrpgData.speedSelectOptions[speedName] = game.i18n.localize(
        `MVRPG.sheets.superSheet.speed.${speedName}`,
      );
    });

    // Prepare only data relevant to damage mutipliers for simplicity in the template.
    const damageData = Object.entries(actor.system.abilities)
      .filter(([name]) => name !== "resilience" && name !== "vigilance")
      .map(([name, abilityData]) => ({
        name,
        damageModifier: abilityData.damageModifier,
        damageMultiplier: abilityData.damageMultiplier,
      }));
    mvrpgData.damageData = damageData;

    // Prepare rollable items for combat tab.
    const rollableItems = actor.items.filter(
      (item) => item.system.roll?.hasRoll,
    );
    mvrpgData.rollableItems = rollableItems;

    const TextEditor = foundry.applications.ux.TextEditor.implementation;
    mvrpgData.enrichedNotes = await TextEditor.enrichHTML(
      actor.system.identity.notes,
      { async: true },
    );

    const allEffects = Array.from(this.actor.allApplicableEffects());
    mvrpgData.allEffects = allEffects;

    return { ...context, ...mvrpgData };
  }

  /**
   * @param {*} html
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;
    html.find(".rollable").click((event) => this.onRoll(event));

    html.find(".open-config").click(() => this.showConfig());

    html.find(".doc-action").click((event) => this.onItemAction(event));

    html
      .find(".effect-action")
      .click((event) => EffectUtils.onEffectAction(this.actor, event));

    // Handle Dragging of Documents.
    const handler = (ev) => this._onDragStart(ev);
    html.find(".doc-entry").each((i, element) => {
      element.setAttribute("draggable", true);
      element.addEventListener("dragstart", handler, false);
    });

    // Handle dragging of abilities.
    // html.find(".ability-name").each((i, element) => {
    //   element.setAttribute("draggable", true);
    //   element.addEventListener("dragstart", handler, false);
    // });

    html.find(".toggle-maneuver").click(() => this.toggleManeuver());
  }

  /**
   * Handles different actions for items.
   *
   * @param {event} event - the event triggering the action
   * @return {void}
   */
  onItemAction(event) {
    const { action, docType } = event.currentTarget.dataset;
    const itemId = MVUtils.getClosestAttribute(event.currentTarget, "item-id");
    const doc = this.actor.items.get(itemId);

    switch (action) {
      case "create":
        this.actor.createEmbeddedDocuments("Item", [
          {
            name: game.i18n.format(game.i18n.translations.DOCUMENT.New, {
              type: game.i18n.localize(`TYPES.Item.${docType}`),
            }), // Foundry's localization ("New Active Effect")
            type: docType,
          },
        ]);
        break;
      case "edit":
        doc.sheet.render(true);
        break;
      case "delete": {
        const skipDialog = MVSettings.skipDeleteDialog();
        this.deleteOwnedItem(doc, skipDialog);
        break;
      }
      case "toChat":
        this.sendItemToChat(doc);
        break;
      default:
        break;
    }
  }

  async deleteOwnedItem(doc, skipDialog) {
    if (!skipDialog) {
      const confirmDelete = await MVDialog.wait({
        window: { title: "MVRPG.dialog.deleteOwnedItem.title" },
        content: game.i18n.format("MVRPG.dialog.deleteOwnedItem.text", {
          itemType: game.i18n.localize(`TYPES.Item.${doc.type}`),
          itemName: doc.name,
        }),
      });
      if (!confirmDelete) return;
    }
    this.actor.deleteEmbeddedDocuments("Item", [doc.id]);
  }

  /**
   * Handle the roll event and execute associated actions.
   *
   * @param {Event} event - The roll event
   * @return {Promise} A promise that resolves when the roll event is handled
   */
  async onRoll(event) {
    const itemId = MVUtils.getClosestAttribute(event.currentTarget, "item-id");
    if (itemId) return D616.createItemRoll(this.actor, itemId);

    const { rollType, ability } = event.currentTarget.dataset;
    const actorData = this.actor.system;

    let modifier;
    switch (rollType) {
      case "initiative":
        modifier = actorData.initiative.value;
        break;
      case "nonCombat":
        modifier = actorData.abilities[ability].nonCombatScore;
        break;
      default:
        modifier = actorData.abilities[ability].value;
        break;
    }
    const { edges, troubles } = actorData.abilities[ability];

    // Dispatch the roll.
    return D616.createD616Roll({
      rollType,
      ability,
      modifier,
      edges,
      troubles,
      actor: this.actor,
    });
  }

  async showConfig() {
    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/init-speed-dialog.hbs`,
      { actor: this.actor },
    );

    new MVDialog({
      content,
      id: "init-speed-dialog",
      window: { title: "MVRPG.dialog.initSpeed.title" },
      submit: (result, dialog) => {
        const { formData } = dialog;
        this.actor.update(formData);
      },
    }).render(true);
  }

  sendItemToChat(item) {
    const { description } = item.system;
    const title = item.name;
    let content = "";
    content += `<h1>${title}</h1>`;
    content += `<div>${description}</div>`;
    const chatData = {
      content,
      flavor: game.i18n.localize(`TYPES.Item.${item.type}`),
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    };
    ChatMessage.create(chatData);
  }

  toggleManeuver() {
    const { active } = this.actor.system.teamManeuver;
    this.actor.update({ "system.teamManeuver": { active: !active } });
  }
}
