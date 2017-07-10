var test = require("unit.js");
var Package = require("../../server/package");

describe("#Pkg", () => {
	it("can load metadata", async () => {
		// expected values
		let serverPkgId = 425670;
		let serverPkgName = "pacaur";
		let serverPkgDescription = "An AUR helper that minimizes user interaction";
		let serverPkgDownloadUrl = "/cgit/aur.git/snapshot/pacaur.tar.gz";
		let serverPkgDepends = ["cower", "expac", "sudo", "git"];
		let serverPkgMakeDepends = ["perl"];

		let pkg = new Package();

		test
			.object(pkg);

		await pkg.fetchName(serverPkgName);

		test
			.object(pkg)
			// check remote id property
			.given(id = pkg.getRemoteId())
			.number(id)
			.value(id).isEqualTo(serverPkgId)
			// check name
			.given(name = pkg.getName())
			.string(name)
			.value(name).isEqualTo(serverPkgName)
			// check description
			.given(description = pkg.getDescription())
			.string(description)
			.value(description).isEqualTo(serverPkgDescription)
			// check version
			.given(version = pkg.getVersion())
			.string(version)
			// check server url
			.given(url = pkg.getDownloadUrl())
			.string(url)
			.value(url).isEqualTo(serverPkgDownloadUrl)
			// check depends
			.given(depends = pkg.getDepends())
			.object(depends)
			.array(depends).is(serverPkgDepends)
			// check make depends
			.given(makeDepends = pkg.getMakeDepends())
			.object(makeDepends)
			.array(makeDepends).is(serverPkgMakeDepends);
	});

	it("will fail on unkown pkg", done => {
		let serverPkgName = "pkg_that_does_not_exist_test";
		let pkg = new Package();

		pkg.fetchName(serverPkgName).then(res => {
			done(new Error("Pkg should not exist!"));
		}).catch(err => {
			done();
		});
	});
});
