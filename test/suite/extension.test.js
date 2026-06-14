const assert = require("assert");
const mocha = require("mocha");
const describe = mocha.describe;
const it = mocha.it;

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const { api } = require("../../main/api");
const myExtension = require("../../main/extension");

describe("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start tests");

  it("Extension should be present", () => {
    assert.ok(
      vscode.extensions.getExtension(
        "JayantNavrange.justforlaughs"
      )
    );
  });

  it("Extension should become active", async function () {
    this.timeout(60000);

    const ext = vscode.extensions.getExtension(
      "JayantNavrange.justforlaughs"
    );

    await ext.activate();

    assert.strictEqual(ext.isActive, true);
  });

  it("Extension should register commands", async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(
      commands.includes("justforlaughs.ext.getmeme")
    );

    assert.ok(
      commands.includes("justforlaughs.ext.getsettings")
    );

    assert.ok(
      commands.includes("justforlaughs.ext.changesubreddit")
    );

    assert.ok(
      commands.includes("justforlaughs.ext.changecount")
    );
  });

  it("API should return memes", async function () {
    this.timeout(10000);

    const res = await api("memes", 20);

    assert.ok(res);
    assert.ok(Array.isArray(res.memes));
    assert.ok(res.memes.length > 0);
  });

  it("API should return valid meme objects", async function () {
    this.timeout(10000);

    const res = await api("memes", 5);

    const meme = res.memes[0];

    assert.ok(meme.title);
    assert.ok(meme.author);
    assert.ok(meme.url);
  });

  it("Extension should become deactive", () => {
    let pass = myExtension.deactivate();
    assert.ok(true, pass);
  });
});
