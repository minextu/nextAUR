const AbstractController = require("../abstractController");

class Controller extends AbstractController {
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

  async submit(e) {
    e.preventDefault();
    let name = this.form.name.value;

    let answer = await this.model.createRepo(name);
    if (answer.error !== undefined) {
      this.showError(new Error(answer.errorText));
    }
    else {
      _getPage('repoList');
    }
  }
}

module.exports = Controller;
