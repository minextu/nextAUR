const AbstractView = require("../abstractView");

class View extends AbstractView {
  constructor() {
    super();

    this.title = "Repositories";
    this.heading = "Repositories";

    this.templateValues = { repos: [] };
    this.templateName = "repoList";
  }

  showRepos(repos) {
    this.templateValues.repos = repos;
  }

  showError(err) {
    this.templateValues.error = err.message;
  }
}

module.exports = View;
