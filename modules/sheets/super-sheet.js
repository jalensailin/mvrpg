import D616 from "../rolls/d616.js";
import { MVSettings } from "../utils/settings.js";
import MVUtils from "../utils/utils.js";
import MVDialog from "./dialog-base.js";
import MVSheetMixin from "./base-document-sheet.js";

const { ActorSheetV2 } = foundry.applications.sheets;

export default class SuperSheet extends MVSheetMixin(ActorSheetV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = /** @type {const} */ ({
    classes: ["actor"],
    position: { width: 600, height: 670 },
    actions: {
      rollable: SuperSheet.onRoll,
      openConfig: SuperSheet.showConfig,
      docAction: SuperSheet.onItemAction,
      toggleManeuver: SuperSheet.toggleManeuver,
    },
  });

  /** @inheritdoc */
  static TABS = /** @type {const} */ ({
    primary: {
      initial: "combat",
      labelPrefix: "MVRPG.sheets.superSheet.titles",
      tabs: [{ id: "powers" }, { id: "combat" }, { id: "identity" }],
    },

    secondary: {
      initial: "powers",
      labelPrefix: "MVRPG.sheets.superSheet.titles",
      tabs: [
        { id: "powers" },
        { id: "traits" },
        { id: "tags" },
        { id: "inventory" },
        { id: "effects" },
      ],
    },
  });

  /** @inheritdoc */
  static PARTS = /** @type {const} */ ({
    codenamePanel: {
      template: `${this.TEMPLATE_PATH}/actor/codename-panel.hbs`,
    },
    lifepoolPanel: {
      template: `${this.TEMPLATE_PATH}/actor/lifepool-panel.hbs`,
    },
    rankPanel: {
      template: `${this.TEMPLATE_PATH}/actor/rank-panel.hbs`,
    },
    abilitiesPanel: {
      template: `${this.TEMPLATE_PATH}/actor/abilities-panel.hbs`,
    },
    tabbedPanel: {
      template: `${this.TEMPLATE_PATH}/actor/tabbed-panel.hbs`,
      templates: [
        `${this.TEMPLATE_PATH}/sheet-shared/tab-nav.hbs`,
        `${this.TEMPLATE_PATH}/actor/powers-tab.hbs`,
        `${this.TEMPLATE_PATH}/actor/combat-tab.hbs`,
        `${this.TEMPLATE_PATH}/actor/identity-tab.hbs`,
        `${this.TEMPLATE_PATH}/actor/document-list.hbs`,
      ],
      // TODO: `.editor-content` not preserving scroll position for some reason.
      scrollable: [".sheet-body", ".rollable-section", ".editor-content"],
    },
  });

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { actor } = this;

    // Prepare tabs
    context.tabs = {};
    Object.keys(SuperSheet.TABS).forEach((tabGroup) => {
      context.tabs[tabGroup] = this._prepareTabs(tabGroup);
    });

    // Prepare speed data for the template.
    context.displaySpeed =
      actor.getFlag(game.system.id, "displaySpeed") || "run";
    context.speedSelectOptions = {};
    Object.entries(actor.system.speed).forEach(([speedName, speedVal]) => {
      if (!speedVal) return;
      context.speedSelectOptions[speedName] = game.i18n.localize(
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
    context.damageData = damageData;

    // Prepare rollable items for combat tab.
    const rollableItems = actor.items.filter(
      (item) => item.system.roll?.hasRoll,
    );
    context.rollableItems = rollableItems;

    // Prepare notes.
    const TextEditor = foundry.applications.ux.TextEditor.implementation;
    context.notes = {
      field: actor.system.schema.getField("identity.notes"),
      value: actor.system.identity.notes,
      enriched: await TextEditor.enrichHTML(actor.system.identity.notes, {
        rollData: actor.getRollData(),
        relativeTo: actor,
      }),
    };

    // Prepare all effects
    const allEffects = Array.from(this.actor.allApplicableEffects());
    context.allEffects = allEffects;

    return context;
  }

  /** @inheritdoc */
  async _onRender(context, options) {
    await super._onRender(context, options);

    // Handle Dragging of Documents.
    const html = this.element;
    const handler = (ev) => this._onDragStart(ev);
    html.querySelectorAll(".doc-entry").forEach((element) => {
      element.setAttribute("draggable", true);
      element.addEventListener("dragstart", handler, false);
    });

    // TODO: Handle dragging of abilities for macros.
    // html.querySelectorAll(".ability-name").forEach((element) => {
    //   element.setAttribute("draggable", true);
    //   element.addEventListener("dragstart", handler, false);
    // });
  }

  /**
   * Handles different actions for items.
   *
   * @param {Event} event - the event triggering the action
   * @param {HTMLElement} target - The target element
   * @return {void}
   */
  static onItemAction(event, target) {
    const { docAction, docType } = target.dataset;
    const itemId = MVUtils.getClosestAttribute(target, "item-id");
    const doc = this.actor.items.get(itemId);

    switch (docAction) {
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

  /**
   * Handles deleting an owned item.
   *
   * @param {Item} doc - The item to delete
   * @param {boolean} skipDialog - Whether to skip the confirmation dialog
   * @return {Promise<SuperActor[]>} A promise that resolves when the item is deleted.
   */
  async deleteOwnedItem(doc, skipDialog) {
    if (!skipDialog) {
      const confirmDelete = await MVDialog.prompt({
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
   * @param {HTMLElement} target - The target element
   * @return {Promise} A promise that resolves when the roll event is handled
   */
  static async onRoll(event, target) {
    const itemId = MVUtils.getClosestAttribute(target, "item-id");
    if (itemId) return D616.createItemRoll(this.actor, itemId);

    const { rollType, ability } = target.dataset;
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

  /**
   * Render the initiative/speed configuration dialog and wait for the user to close it.
   *
   * @return {Promise<void>}
   */
  static async showConfig() {
    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(
      `${SuperSheet.TEMPLATE_PATH}/dialogs/init-speed-dialog.hbs`,
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

  /**
   * Sends an item's description to the chat log.
   *
   * @param {Item} item - The item to send to the chat log.
   * @return {Promise<ChatMessage>}
   */
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

  /**
   * Toggle the team maneuver on/off.
   * Currently only adds a glow effect.
   *
   * @return {Promise<SuperActor>}
   */
  static toggleManeuver() {
    const { active } = this.actor.system.teamManeuver;
    this.actor.update({ "system.teamManeuver": { active: !active } });
  }
}
