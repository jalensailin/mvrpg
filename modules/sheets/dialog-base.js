import MVRPG from "../config.js";

const { Dialog } = foundry.applications.api;

export default class MVDialog extends Dialog {
  /**
   * Default button for all dialogs.
   *
   * @typedef {Object} DefaultButton
   * @property {"confirm"} action - The action to perform when the button is clicked.
   * @property {"fas fa-spider"} icon - The icon to display on the button.
   * @property {"dialog-button"} class - The CSS class to apply to the button.
   * @property {"MVRPG.dialog.buttons.confirm"} label - The label to display on the button.
   */
  /** @type {DefaultButton} */
  static DEFAULT_BUTTON = {
    action: "confirm",
    icon: "fas fa-spider",
    class: "dialog-button",
    label: "MVRPG.dialog.buttons.confirm",
  };

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    position: { width: 300 },
    classes: [MVRPG.ID, "dialog"],
    buttons: [this.DEFAULT_BUTTON],
  };

  /**
   * Retrieves and processes the form data from the dialog element.
   *
   * @return {Object} An expanded object containing the form data.
   */

  get formData() {
    const { FormDataExtended } = foundry.applications.ux;

    const form = this.element.querySelector("form");
    const fd = new FormDataExtended(form);
    return foundry.utils.expandObject(fd.object);
  }
}
