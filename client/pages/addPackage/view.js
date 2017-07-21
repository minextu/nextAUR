const AbstractView = require("../abstractView");

class View extends AbstractView {
  constructor() {
    super();

    this.title = "Add package";
    this.heading = "Add package";

    this.templateValues = { text: "Test:" };
    this.templateName = "addPackage";
  }

  showError(err) {
    alert(err.message);
  }

  async initEvents() {
    this.form = document.forms.namedItem("addPackageForm");

    this.form.addEventListener("submit", e => this.submit(e));
  }

  submit(e) {
    let name = this.form.name.value;
    this.presenter.submit(name);

    e.preventDefault();
  }
}

module.exports = View;
