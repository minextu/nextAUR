const AbstractView = require("../abstractView");

class View extends AbstractView {
  constructor() {
    super();

    this.title = "Create repository";
    this.heading = "Create repository";

    this.templateValues = { };
    this.templateName = "createRepository";
  }

  showError(err) {
    alert(err.message);
  }

  async initEvents() {
    this.form = document.forms.namedItem("createRepoForm");

    this.form.addEventListener("submit", e => this.submit(e));
  }

  submit(e) {
    let name = this.form.name.value;
    this.presenter.submit(name);

    e.preventDefault();
  }
}

module.exports = View;
