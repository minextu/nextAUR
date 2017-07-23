module.exports.NotFound = class CErr extends Error {
  constructor(message) {
    super(message); this.name = 'NotFound';
  }
};

module.exports.Exists = class CErr extends Error {
  constructor(message) {
    super(message); this.name = 'Exists';
  }
};

module.exports.Dependency = class CErr extends Error {
  constructor(message) {
    super(message); this.name = 'Dependency';
  }
};

module.exports.InvalidCharacters = class CErr extends Error {
  constructor(message) {
    super(message); this.name = 'InvalidCharacters';
  }
};

module.exports.UserNotFound = class CErr extends Error {
  constructor(message) {
    super(message); this.name = 'UserNotFound';
  }
};

module.exports.InvalidNickname = class CErr extends Error {
  constructor(message) {
    super(message); this.name = 'InvalidNickname';
  }
};

module.exports.InvalidPassword = class CErr extends Error {
  constructor(message) {
    super(message); this.name = 'InvalidPassword';
  }
};

module.exports.NotLoggedIn = class CErr extends Error {
  constructor(message) {
    super(message); this.name = 'NotLoggedIn';
  }
};
