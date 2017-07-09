var rp = require('request-promise');

const apiUrl = "https://aur.archlinux.org/rpc/";

class Pkg {
	constructor() {}

	getRemoteId() {
		return this.remoteId;
	}

	getName() {
		return this.name;
	}

	getDescription() {
		return this.description;
	}

	getVersion() {
		return this.version;
	}

	getDownloadUrl() {
		return this.downloadUrl;
	}

	getDepends() {
		return this.depends;
	}

	getMakeDepends() {
		return this.makeDepends;
	}

	fetchName(name) {
		// set request options
		let options = {
			uri: apiUrl,
			qs: {
				v: 5,
				type: "info",
				arg: [name]
			},
			json: true
		};

		return rp(options).then(res => {
			// fail if more or less than 1 result was found
			if (res.resultcount !== 1) {
				let err = `pkg '${name}' not found`;
				throw new Error(err);
			}
			return res;
		}).then(res => {
			// set info
			let info = res.results[0];
			this.remoteId = info.ID;
			this.name = info.Name;
			this.description = info.Description;
			this.version = info.Version;
			this.downloadUrl = info.URLPath;
			this.depends = info.Depends;
			this.makeDepends = info.MakeDepends;

			return this;
		}).catch(e => {
			throw e;
		});
	}
}
module.exports = Pkg;
