/** @format */

import pkg from "./package.json";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerWix } from "@electron-forge/maker-wix";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import type { ForgeConfig } from "@electron-forge/shared-types";

const ui = { chooseDirectory: true };

const icon = pkg.icon;
const name = pkg.name.toUpperCase();
const description = pkg.description;
const manufacturer = pkg.author.name;
const appUserModelId = pkg.appUserModelId;
const upgradeCode = "89581fa5-b7e5-480b-bac5-5fdfb8d18944";

const beforeCreate = (creator: any) => (creator.wixTemplate = creator.wixTemplate.replace(/Value="{{ApplicationName}} \(Machine\)"/g, 'Value="{{ApplicationName}}"'));

export default {
  packagerConfig: { asar: true, executableName: name, icon },

  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    }),
    new VitePlugin({
      renderer: [{ name: "main_window", config: "./configs/vite/vite.renderer.config.ts" }],
      build: [
        { entry: "./src/main/index.ts", config: "./configs/vite/vite.main.config.ts" },
        { entry: "./src/preload/index.ts", config: "./configs/vite/vite.preload.config.ts" },
      ],
    }),
  ],

  makers: [new MakerZIP({}, ["linux", "darwin"]), new MakerWix({ ui, name, icon, exe: name, description, beforeCreate, manufacturer, appUserModelId, upgradeCode, programFilesFolderName: name })],
} satisfies ForgeConfig;
