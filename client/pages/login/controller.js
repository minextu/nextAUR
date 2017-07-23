const AbstractController = require("../abstractController");

class Controller extends AbstractController {
  constructor() {
    super();

    this.title = "Login";
    this.heading = "Login";

    this.templateValues = { };
    this.templateName = "login";
  }

  showError(err) {
    alert(err.message);
  }

  async initEvents() {
    this.form = document.forms.namedItem("loginForm");

    this.form.addEventListener("submit", e => this.submit(e));
  }

  async submit(e) {
    e.preventDefault();
    let nickname = this.form.nickname.value;
    let password = this.form.password.value;

    let answer = await this.model.login(nickname, password);
    if (answer.error !== undefined) {
      this.showError(new Error(answer.errorText));
    }
    else {
      _getPage('/');
    }
  }
}

module.exports = Controller;
