import Phaser from "phaser";
import type { LevelSpec } from "@pixelforge/shared";

const TILE_SIZE = 30;

interface SceneData {
  level: LevelSpec;
  onWin?: () => void;
  onFail?: () => void;
}

export class PlayScene extends Phaser.Scene {
  private level!: LevelSpec;
  private player!: Phaser.GameObjects.Rectangle;
  private goal!: Phaser.GameObjects.Rectangle;
  private collectible?: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies: Phaser.GameObjects.Rectangle[] = [];
  private collected = false;
  private onWin?: () => void;
  private onFail?: () => void;

  constructor() {
    super("PlayScene");
  }

  init(data: SceneData): void {
    this.level = data.level;
    this.onWin = data.onWin;
    this.onFail = data.onFail;
    this.collected = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#050b11");

    for (const tile of this.level.tiles) {
      const color = tile.kind === "wall" ? 0x2f5f83 : tile.kind === "hazard" ? 0xb94747 : tile.kind === "goal" ? 0x38c58f : 0x12334d;
      this.add.rectangle(
        tile.x * TILE_SIZE + TILE_SIZE / 2,
        tile.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE,
        TILE_SIZE,
        color
      );
    }

    const playerEntity = this.level.entities.find((item) => item.type === "player");
    if (!playerEntity) {
      throw new Error("Level missing player entity");
    }

    this.player = this.add.rectangle(
      playerEntity.x * TILE_SIZE + TILE_SIZE / 2,
      playerEntity.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * 0.75,
      TILE_SIZE * 0.75,
      0xfff37a
    );

    const goalTile = this.level.tiles.find((item) => item.kind === "goal");
    if (!goalTile) {
      throw new Error("Level missing goal tile");
    }

    this.goal = this.add.rectangle(
      goalTile.x * TILE_SIZE + TILE_SIZE / 2,
      goalTile.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * 0.8,
      TILE_SIZE * 0.8,
      0x4ee6a2
    );

    const collectible = this.level.entities.find((item) => item.type === "collectible");
    if (collectible) {
      this.collectible = this.add.rectangle(
        collectible.x * TILE_SIZE + TILE_SIZE / 2,
        collectible.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE * 0.55,
        TILE_SIZE * 0.55,
        0x9be7ff
      );
    }

    this.enemies = this.level.entities
      .filter((item) => item.type === "enemy")
      .map((enemy) => {
        return this.add.rectangle(
          enemy.x * TILE_SIZE + TILE_SIZE / 2,
          enemy.y * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE * 0.65,
          TILE_SIZE * 0.65,
          0xff6b6b
        );
      });

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard input plugin is unavailable");
    }
    this.cursors = keyboard.createCursorKeys();
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
      this.movePlayer(-1, 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
      this.movePlayer(1, 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.movePlayer(0, -1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.movePlayer(0, 1);
    }

    this.tickEnemies();
    this.checkInteractions();
  }

  private movePlayer(dx: number, dy: number): void {
    const nextX = this.player.x + dx * TILE_SIZE;
    const nextY = this.player.y + dy * TILE_SIZE;

    const tx = Math.round((nextX - TILE_SIZE / 2) / TILE_SIZE);
    const ty = Math.round((nextY - TILE_SIZE / 2) / TILE_SIZE);
    const wall = this.level.tiles.find((tile) => tile.kind === "wall" && tile.x === tx && tile.y === ty);

    if (wall) {
      return;
    }

    this.player.x = nextX;
    this.player.y = nextY;
  }

  private tickEnemies(): void {
    this.enemies.forEach((enemy, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const phase = Math.floor(this.time.now / 360) % 2 === 0 ? direction : -direction;
      const candidate = enemy.x + phase * (TILE_SIZE / 6);
      if (candidate < TILE_SIZE * 1.5 || candidate > this.level.gridWidth * TILE_SIZE - TILE_SIZE * 1.5) {
        return;
      }
      enemy.x = candidate;
    });
  }

  private checkInteractions(): void {
    if (this.collectible && Phaser.Math.Distance.BetweenPoints(this.player, this.collectible) < TILE_SIZE * 0.5) {
      this.collectible.destroy();
      this.collectible = undefined;
      this.collected = true;
    }

    const hitEnemy = this.enemies.some((enemy) => Phaser.Math.Distance.BetweenPoints(this.player, enemy) < TILE_SIZE * 0.45);
    if (hitEnemy) {
      this.onFail?.();
      this.scene.restart({ level: this.level, onWin: this.onWin, onFail: this.onFail });
      return;
    }

    const atGoal = Phaser.Math.Distance.BetweenPoints(this.player, this.goal) < TILE_SIZE * 0.45;
    if (atGoal && (this.collected || !this.level.entities.some((item) => item.type === "collectible"))) {
      this.onWin?.();
    }
  }
}

export const TILE = TILE_SIZE;
