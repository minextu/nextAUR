const AbstractModel = require("../abstractModel");

class Model extends AbstractModel {
  setRepo(repo) {
    this.repo = repo;
  }

  getRepo() {
    return this.repo;
  }

  async addPackage(name) {
    let data = new URLSearchParams();
    data.append('name', name);
    data.append('repo', this.repo);

    return fetch('/api/v1/package/add', {
      method: 'POST',
      body: data
    })
      .then(response => response.json())
      .catch(err => {
        console.error(err);
      });
  }
}

module.exports = Model;
