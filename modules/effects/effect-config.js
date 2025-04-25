import MVEffect from "./effects.js";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * @param {*} html
 * @override
 */
export default class MVEffectConfig extends ActiveEffectConfig {
  /**
   * Open AE config on the "effects" tab.
   * @override
   */
  static get defaultOptions() {
    const [tabs] = foundry.utils.duplicate(super.defaultOptions.tabs);
    tabs.initial = "effects";
    return foundry.utils.mergeObject(super.defaultOptions, { tabs: [tabs] });
  }

  /**
   * @param {*} html
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", ".toggle-text-input", (event) => {
      this.toggleTextInput(event);
    });

    html.on("change", "select.effect-drop-down", (event) => {
      const selectElement = event.currentTarget;
      MVEffectConfig.updateDropDownToolTip(selectElement);
    });
  }

  /**
   * A function to toggle between <input> and <select> elements in the Active Effect config.
   * In general, users will want the drop-down option, because it is more intuitive, but some
   * may still wish to input custom values, in which case they can switch to the text input.
   *
   * @param {Event} event - The event triggering the function.
   * @return {void}
   */
  async toggleTextInput(event) {
    const index = $(event.currentTarget).data("index"); // Get the index from the button.
    const keyInput = $(event.currentTarget).next(); // Get the input, either an actual <input> element, or a <select> element.
    const elementType = keyInput.prop("nodeName").toLowerCase(); // Get the element type ("input" or "select").
    const name = keyInput.attr("name");
    const value = keyInput.val();

    const buttonIcon = $(event.currentTarget).find("i"); // Find the button icon.
    const buttonWidth = buttonIcon.outerWidth();

    let finalTemplate;
    switch (elementType) {
      // Replace the <input> element with a <select> element.
      case "input": {
        const selectOptions = MVEffect.getEffectKeys();
        // Warn the user before swapping back to <select> if the value is not in the list of options (since it will get lost).
        if (!selectOptions.includes(value)) {
          const confirmInput = await Dialog.confirm({
            title: game.i18n.localize("MVRPG.dialog.confirmTextInput.title"),
            content: game.i18n.localize("MVRPG.dialog.confirmTextInput.text"),
          });
          if (!confirmInput) return;
        }

        const effectOptions = MVEffect.getEffectOptions();

        const { renderTemplate } = foundry.applications.handlebars;
        const selectTemplate = await renderTemplate(
          `systems/${game.system.id}/templates/effects/effects-drop-down.hbs`,
          { changes: this.object.changes, index, effectOptions },
        );

        const jquerySelectObject = $(selectTemplate);
        jquerySelectObject.val(value || selectOptions[0]);
        finalTemplate = jquerySelectObject;

        buttonIcon.removeClass("fa-list"); // Remove list icon.
        buttonIcon.addClass("fa-keyboard"); // Toggle to keyboard icon.
        const buttonTooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleTextInput",
        );
        buttonIcon.attr("data-tooltip", buttonTooltip);
        break;
      }
      // Replace the <select> element with an <input> element.
      case "select": {
        // Typically it's best to keep all styling in a css file, but in this case, the width relies on a value derived above so we need to add it here.
        const inputTemplate = `<input type="text" name="${name}" value="${value || ""}" style="width: calc(100% - ${buttonWidth + 8}px);"/>`;
        finalTemplate = inputTemplate;

        buttonIcon.removeClass("fa-keyboard"); // Remove keyboard icon.
        buttonIcon.addClass("fa-list"); // Toggle to list icon.
        const buttonTooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleDropDown",
        );
        buttonIcon.attr("data-tooltip", buttonTooltip);
        break;
      }
      default:
        break;
    }

    keyInput.replaceWith(finalTemplate);
  }

  /**
   * Update the tooltip for the drop-down to display the selected key.
   *
   * @param {*} selectElement
   */
  static updateDropDownToolTip(selectElement) {
    const newVal = $(selectElement).val();
    $(selectElement).attr("data-tooltip", newVal);
  }
}
