const AbstractModel = require("../abstractModel");

class Model extends AbstractModel {
  login(nickname, password) {
    return this.fetch('/api/v1/user/login', 'POST', {
      nickname: nickname,
      password: password
    })
      .catch(err => {
        console.error(err);
      });
  }
}

module.exports = Model;
