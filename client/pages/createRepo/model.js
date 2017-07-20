const AbstractModel = require("../abstractModel");

class Model extends AbstractModel {
  createRepo(name) {
    let data = new URLSearchParams();
    data.append('name', name);
    data.append('test', "zeszis");

    return fetch('/api/v1/repo/create', {
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
