import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerWix } from "@electron-forge/maker-wix";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import type { ForgeConfig } from "@electron-forge/shared-types";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    executableName: "MUZZiC",
    // icon: "./public/logo.ico"
  },

  makers: [
    new MakerWix({
      exe: "MUZZiC",
      name: "MUZZiC",
      // icon: "./public/logo.ico",
      manufacturer: "1sT-Services",
      ui: { chooseDirectory: true },
      programFilesFolderName: "MUZZiC",
      description: "A music player I guess",
      appUserModelId: "com.painfuego.music",
      beforeCreate: (creator) => {
        creator.wixTemplate = creator.wixTemplate.replace(/Value="{{ApplicationName}} \(Machine\)"/g, 'Value="{{ApplicationName}}"');
      },
    }),
    new MakerZIP({}, ["linux", "darwin"]),
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
      renderer: [{ name: "", config: "./configs/vite/vite.renderer.config.ts" }],
      build: [
        { entry: "./src/main/index.ts", config: "./configs/vite/vite.main.config.ts" },
        { entry: "./src/plugins/index.ts", config: "./configs/vite/vite.plugins.config.ts" },
        { entry: "./src/preload/index.ts", config: "./configs/vite/vite.preload.config.ts" },
      ],
    }),
  ],
};

export default config;
