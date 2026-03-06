import Phaser from "phaser";
import type { LevelSpec } from "@pixelforge/shared";
import { PlayScene, TILE } from "./play-scene";

export function createGame(containerId: string, level: LevelSpec, onWin: () => void, onFail: () => void): Phaser.Game {
  const width = level.gridWidth * TILE;
  const height = level.gridHeight * TILE;

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width,
    height,
    parent: containerId,
    backgroundColor: "#050b11",
    pixelArt: true,
    scene: [PlayScene],
    physics: {
      default: "arcade"
    }
  });

  game.events.once(Phaser.Core.Events.READY, () => {
    game.scene.start("PlayScene", { level, onWin, onFail });
  });
  return game;
}

export function loadLevelIntoGame(game: Phaser.Game, level: LevelSpec, onWin: () => void, onFail: () => void): void {
  game.scale.resize(level.gridWidth * TILE, level.gridHeight * TILE);

  if (!game.scene.isActive("PlayScene")) {
    game.scene.start("PlayScene", { level, onWin, onFail });
    return;
  }

  const scene = game.scene.getScene("PlayScene") as PlayScene;
  scene.scene.restart({ level, onWin, onFail });
}
