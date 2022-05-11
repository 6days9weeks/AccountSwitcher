import { Command, EnmitySectionID, ApplicationCommandInputType, ApplicationCommandOptionType, ApplicationCommandType } from "enmity-api/commands";
import { Plugin, registerPlugin } from "enmity-api/plugins";
import { getByProps } from "enmity-api/modules";
import { getItem, setItem } from "enmity-api/storage";
import { sendReply } from "enmity-api/clyde";
import Manifest from "./manifest.json";

const loginToken = getByProps("loginToken").loginToken

const AccountSwitcher: Plugin = {
  ...Manifest,
  name: "AccountSwitcher",
  commands: [],

  onStart() {
    const add_account_token: Command = {
      id: "add_account_token",
      applicationId: EnmitySectionID,

      name: "add-account",
      displayName: "add-account",

      description: "Adds an account to the list.",
      displayDescription: "Account Switcher Moment",
      
      type: ApplicationCommandType.Chat,
      inputType: ApplicationCommandInputType.BuiltInText,
      
      options: [
        {
          name: "name",
          displayName: "name",

          description: "Name of the account",
          displayDescription: "Name of the account",
          
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "token",
          displayName: "token",
          description: "Token of the account",
          displayDescription: "Token of the account",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
    
      execute: async function (args, message) {
        const name = args[0].value;
        let accounts = await getItem("accounts");
        const token = args[1].value;
        await setItem(name, token)
        if (accounts == null) {
          await setItem("accounts", name);
        } else {
          await setItem("accounts", accounts += `:${name}`);
        }
        sendReply(message.channel.id, `Added the account ${name}`)

      }
    }

    const list_account_command: Command = {
      id: "list_account_command",
      applicationId: EnmitySectionID,
      name: "list-accounts",
      displayName: "list-accounts",
      description: "Lists all accounts.",
      displayDescription: "Account Switcher Moment",
      type: ApplicationCommandType.Chat,
      inputType: ApplicationCommandInputType.BuiltInText,
      execute: async function (args, message) {
        let accounts = await getItem("accounts");
        if (accounts == null) {
          sendReply(message.channel.id, "No accounts added yet.");
        } else {
          let content = '**Accounts:**\n';
          accounts.split(":").forEach(account => {content += `${account}\n`});
          sendReply(message.channel.id, content);
        }
      },
    };

    const switch_account_command: Command = {
      id: "switch_account_command",
      applicationId: EnmitySectionID,

      name: "switch",
      displayName: "switch",

      description: "switch accounts easily",
      displayDescription: "switch accounts easily",
      
      type: ApplicationCommandType.Chat,
      inputType: ApplicationCommandInputType.BuiltInText,
      
      options: [
        {
          name: "name",
          displayName: "name",

          description: "Name of the account",
          displayDescription: "Name of the account",
          
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
    
      execute: async function (args, message) {
        const name = args[0].value;
        const token = await getItem(name);
        if (token != null) {
          sendReply(message.channel.id, "Close and reopen the app to switch accounts.")
          await new Promise(f => setTimeout(f, 1000));
          await loginToken(token)
        } else {
          sendReply(message.channel.id, "Account not found.")
        }
      }
    }

    this.commands.push(add_account_token);
    this.commands.push(switch_account_command);
    this.commands.push(list_account_command);
  },

  onStop() {
    this.commands = [];
  }
}

registerPlugin(AccountSwitcher);
