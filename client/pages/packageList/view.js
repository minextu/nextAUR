const AbstractView = require("../abstractView");

class View extends AbstractView {
  constructor() {
    super();

    this.title = "Packages";
    this.heading = "Packages";

    this.templateValues = { };
    this.templateName = "packageList";
  }

  setPackages(packages) {
    this.templateValues.packages = packages;
  }

  setRepo(repo) {
    this.templateValues.repo = repo;
  }

  showError(err) {
    alert(err.message);
  }

  hideBuild(id) {
    document.getElementById(`taskBuild_${id}`).style.display = "none";
  }

  async init() {
    let buildLinks = document.querySelectorAll('[data-role=build]');
    for (let i = 0; i < buildLinks.length; i++) {
      buildLinks[i].addEventListener("click", (e) => { this.build(e); });
    }
  }

  build(e) {
    e.preventDefault();
    let packageId = e.target.getAttribute('href').replace(/^.*\//, '');
    this.presenter.build(packageId);
  }
}

module.exports = View;
