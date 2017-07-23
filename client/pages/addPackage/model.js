const AbstractModel = require("../abstractModel");

class Model extends AbstractModel {
  setRepo(repo) {
    this.repo = repo;
  }

  getRepo() {
    return this.repo;
  }

  async addPackage(name) {
    return this.fetch('/api/v1/package/add', 'POST', {
      name: name, repo: this.repo
    })
      .catch(err => {
        console.error(err);
      });
  }
}

module.exports = Model;
