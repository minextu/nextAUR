const AbstractController = require("../abstractController");

class Controller extends AbstractController {
  constructor() {
    super();

    this.title = "Add package";
    this.heading = "Add package";

    this.templateValues = { text: "Test:" };
    this.templateName = "addPackage";
  }

  async setSubPage(subpage) {
    if (!subpage) { return false; }

    this.model.setRepo(subpage);
    return true;
  }

  showError(err) {
    alert(err.message);
  }

  async initEvents() {
    this.form = document.forms.namedItem("addPackageForm");

    this.form.addEventListener("submit", e => this.submit(e));
  }

  async submit(e) {
    e.preventDefault();
    let name = this.form.name.value;

    let answer = await this.model.addPackage(name);
    if (answer.error !== undefined) {
      this.showError(new Error(answer.errorText));
    }
    else {
      _getPage('packageList/' + this.model.getRepo());
    }
  }
}

module.exports = Controller;
