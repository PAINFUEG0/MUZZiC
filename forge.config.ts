/** @format */

import pkg from "./package.json";
import { MakerWix } from "@electron-forge/maker-wix";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import type { ForgeConfig } from "@electron-forge/shared-types";

const icon = pkg.icon;
const name = pkg.productName;

export default {
  packagerConfig: { icon, name, asar: true, overwrite: true, osxSign: {} },

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

  makers: [
    new MakerWix({
      icon,
      name,
      programFilesFolderName: name,
      appUserModelId: pkg.appUserModelId,
      upgradeCode: "89581fa5-b7e5-480b-bac5-5fdfb8d18944",
      ui: { chooseDirectory: true },
      beforeCreate(creator) {
        creator.wixTemplate = creator.wixTemplate.replace(/(?<={{ApplicationName}})(\s+\((Machine|User).*\))/gi, "");
      },
    }),
    new MakerDeb({
      options: {
        icon: icon.replace(".ico", ".png"),
        productName: name,
        version: pkg.version,
        maintainer: pkg.author.name,
        description: pkg.description,
        categories: ["Audio"],
      },
    }),
    new MakerDMG({ name, title: name, icon: icon.replace(".ico", ".icns") }),
  ],
} satisfies ForgeConfig;
