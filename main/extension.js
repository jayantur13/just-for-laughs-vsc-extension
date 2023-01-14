// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const {
  workspace,
  ConfigurationTarget,
  commands,
  window,
  ViewColumn,
  Uri,
} = require("vscode");
const { api } = require("./api");
let i = 0;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const config = workspace.getConfiguration("justforlaughs.ext");
  //In case if justforlaughs.get.URL: "" set it to default one
  if (config.has("subredditURL") && config.get("subredditURL") === "") {
    config.update(
      "URL",
      "https://www.reddit.com/r/memes/new.json",
      ConfigurationTarget.Global
    );
  }
  let url = await config.get("subredditURL");
  let res = await api(url);
  let data = res.children
    .filter((item) => {
      return item.data.post_hint === "image";
    })
    .map((el, index) => {
      let id = index;
      let author = el.data.author;
      let title = el.data.title;
      let type = el.data.post_hint;
      let url = el.data.url_overridden_by_dest;

      return {
        "id": id,
        "author": author,
        "title": title === undefined ? "Unreadable/Missing title" : title,
        "type": type,
        "url": url,
      };
    });

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log(url);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand(
    "justforlaughs.ext.getmeme",
    async function () {
      // The code you place here will be executed every time your command is executed
      if (data == null) return;
      const getOne = data[i];
      if (data[i] <= data[data.length - 1]) {
        // Display a webview tab to the user
        const panel = window.createWebviewPanel(
          "memedose",
          "Just for Laughs",
          ViewColumn.One,
          {} // Webview options. More on these later.
        );

        //Favicon
        panel.iconPath = Uri.joinPath(context.extensionUri, "", "images/logo.png");
        //The actual webview that is shown to the user
        panel.webview.html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meme Dose</title>
      <style>
      body.vscode-light {
        color: black;
      }
      
      body.vscode-dark {
        color: white;
      }
      
      body.vscode-high-contrast {
        color: red;
      }
      .content h3 {
        margin: auto;
        width: 50%;
        text-align: center;
        padding: 10px;
      }
      .content img {
        display: block;
        margin-left: auto;
        margin-right: auto;
      }
      </style>
      </head>
      <body>
      <div class="content">
      ${`<h3>${getOne.title} - ${getOne.author}</h3>   
      <img src=${getOne.url} width="500" height="400"/>
      <h3>${i + 1}/${data.length}</h3>`}
      </div>
      </body>
      </html>`;
        i++;
      } else {
        await window.showInformationMessage("Restarting..count.");
        i = 0;
      }
    }
  );

  let getSetURL = commands.registerCommand(
    "justforlaughs.ext.getsetURL",
    async function () {
      if (url !== "") {
        await window.showInformationMessage("Your current url ", url);
      }
    }
  );

  let setMyURL = commands.registerCommand(
    "justforlaughs.ext.setmyURL",
    async function () {
      if (url) {
        await window
          .showInputBox({
            placeHolder: url,
          })
          .then((val) => {
            if (val) {
              const config = workspace.getConfiguration("justforlaughs.ext");
              //In case if in settings.json justforlaughs.get.URL: "",set to default url
              //And if URL text field is empty and Enter key pressed,set to default url
              if (config.has("subredditURL") && config.get("subredditURL") === "") {
                config.update(
                  "URL",
                  "https://www.reddit.com/r/memes/new.json",
                  ConfigurationTarget.Global
                );
                window.showInformationMessage("Subreddit updated to " + val);
              }
            } else {
              //Update nothing;ESC key pressed
            }
          });
      }
    }
  );

  context.subscriptions.push(disposable, getSetURL, setMyURL);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
