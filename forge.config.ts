/** @format */

import pkg from "./package.json";
import { MakerWix } from "@electron-forge/maker-wix";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import type { ForgeConfig } from "@electron-forge/shared-types";
import type { MakerDebConfig } from "@electron-forge/maker-deb";
import type { MakerRpmConfig } from "@electron-forge/maker-rpm";

const icon = pkg.icon;
const name = pkg.productName;

const options: MakerDebConfig["options"] & MakerRpmConfig["options"] = {
  icon: icon.replace(".ico", ".png"),
  productName: name,
  version: pkg.version,
  license: pkg.license,
  maintainer: pkg.author.name,
  description: pkg.description,
  categories: ["Audio", "AudioVideo"],
};

export default {
  packagerConfig: {
    icon,
    name,
    asar: true,
    overwrite: true,
    executableName: process.platform === "linux" ? pkg.name : name,
    osxSign: {},
  },

  makers: [
    new MakerDeb({ options }),
    new MakerRpm({ options }),
    new MakerDMG({
      name,
      title: name,
      icon: icon.replace(".ico", ".icns"),
    }),
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
  ],

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
} satisfies ForgeConfig;
