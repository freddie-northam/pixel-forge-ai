import Phaser from "phaser";
import type { LevelSpec, EntitySpec } from "@pixelforge/shared";

const TILE_SIZE = 30;
const PLAYER_SIZE_RATIO = 0.75;
const GOAL_SIZE_RATIO = 0.8;
const COLLECTIBLE_SIZE_RATIO = 0.55;
const ENEMY_SIZE_RATIO = 0.65;
const COLLISION_THRESHOLD = 0.45;
const ENEMY_SPEED = TILE_SIZE * 2;
const COLORS = {
  wall: 0x2f5f83,
  hazard: 0xb94747,
  goal: 0x38c58f,
  floor: 0x12334d,
  player: 0xfff37a,
  goalEntity: 0x4ee6a2,
  collectible: 0x9be7ff,
  enemy: 0xff6b6b,
} as const;

interface EnemyEntry {
  rect: Phaser.GameObjects.Rectangle;
  behavior: EntitySpec["behavior"];
  dx: number;
  dy: number;
}

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
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private enemies: EnemyEntry[] = [];
  private wallSet = new Set<string>();
  private collected = false;
  private won = false;
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
    this.won = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#050b11");

    this.wallSet = new Set<string>();
    for (const tile of this.level.tiles) {
      const color = tile.kind === "wall" ? COLORS.wall : tile.kind === "hazard" ? COLORS.hazard : tile.kind === "goal" ? COLORS.goal : COLORS.floor;
      this.add.rectangle(
        tile.x * TILE_SIZE + TILE_SIZE / 2,
        tile.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE,
        TILE_SIZE,
        color
      );
      if (tile.kind === "wall") {
        this.wallSet.add(`${tile.x},${tile.y}`);
      }
    }

    const playerEntity = this.level.entities.find((item) => item.type === "player");
    if (!playerEntity) {
      throw new Error("Level missing player entity");
    }

    this.player = this.add.rectangle(
      playerEntity.x * TILE_SIZE + TILE_SIZE / 2,
      playerEntity.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * PLAYER_SIZE_RATIO,
      TILE_SIZE * PLAYER_SIZE_RATIO,
      COLORS.player
    );

    const goalTile = this.level.tiles.find((item) => item.kind === "goal");
    if (!goalTile) {
      throw new Error("Level missing goal tile");
    }

    this.goal = this.add.rectangle(
      goalTile.x * TILE_SIZE + TILE_SIZE / 2,
      goalTile.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * GOAL_SIZE_RATIO,
      TILE_SIZE * GOAL_SIZE_RATIO,
      COLORS.goalEntity
    );

    const collectible = this.level.entities.find((item) => item.type === "collectible");
    if (collectible) {
      this.collectible = this.add.rectangle(
        collectible.x * TILE_SIZE + TILE_SIZE / 2,
        collectible.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE * COLLECTIBLE_SIZE_RATIO,
        TILE_SIZE * COLLECTIBLE_SIZE_RATIO,
        COLORS.collectible
      );
    }

    this.enemies = this.level.entities
      .filter((item) => item.type === "enemy")
      .map((enemy, index) => {
        const rect = this.add.rectangle(
          enemy.x * TILE_SIZE + TILE_SIZE / 2,
          enemy.y * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE * ENEMY_SIZE_RATIO,
          TILE_SIZE * ENEMY_SIZE_RATIO,
          COLORS.enemy
        );
        const vertical = index % 2 !== 0;
        return {
          rect,
          behavior: enemy.behavior,
          dx: vertical ? 0 : 1,
          dy: vertical ? 1 : 0,
        };
      });

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard input plugin is unavailable");
    }
    this.cursors = keyboard.createCursorKeys();
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  update(): void {
    if (this.won) return;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) || Phaser.Input.Keyboard.JustDown(this.keyA)) {
      this.movePlayer(-1, 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.movePlayer(1, 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.movePlayer(0, -1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down!) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
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

    if (this.wallSet.has(`${tx},${ty}`)) {
      return;
    }

    this.player.x = nextX;
    this.player.y = nextY;
  }

  private isWallAt(tx: number, ty: number): boolean {
    return this.wallSet.has(`${tx},${ty}`);
  }

  private tickEnemies(): void {
    const dt = this.game.loop.delta / 1000;
    const speed = ENEMY_SPEED;

    for (const entry of this.enemies) {
      const { rect, behavior } = entry;

      if (behavior === "static" || !behavior) continue;

      let moveX = 0;
      let moveY = 0;

      if (behavior === "patrol") {
        moveX = entry.dx * speed * dt;
        moveY = entry.dy * speed * dt;
      } else if (behavior === "chase") {
        const diffX = this.player.x - rect.x;
        const diffY = this.player.y - rect.y;
        if (Math.abs(diffX) > Math.abs(diffY)) {
          moveX = Math.sign(diffX) * speed * dt;
        } else {
          moveY = Math.sign(diffY) * speed * dt;
        }
      }

      const candidateX = rect.x + moveX;
      const candidateY = rect.y + moveY;
      const tx = Math.round((candidateX - TILE_SIZE / 2) / TILE_SIZE);
      const ty = Math.round((candidateY - TILE_SIZE / 2) / TILE_SIZE);

      if (this.isWallAt(tx, ty)) {
        entry.dx = -entry.dx;
        entry.dy = -entry.dy;
        continue;
      }

      if (
        candidateX < TILE_SIZE / 2 ||
        candidateX > this.level.gridWidth * TILE_SIZE - TILE_SIZE / 2 ||
        candidateY < TILE_SIZE / 2 ||
        candidateY > this.level.gridHeight * TILE_SIZE - TILE_SIZE / 2
      ) {
        entry.dx = -entry.dx;
        entry.dy = -entry.dy;
        continue;
      }

      rect.x = candidateX;
      rect.y = candidateY;
    }
  }

  private checkInteractions(): void {
    if (this.won) return;

    if (this.collectible && Phaser.Math.Distance.BetweenPoints(this.player, this.collectible) < TILE_SIZE * COLLISION_THRESHOLD) {
      this.collectible.destroy();
      this.collectible = undefined;
      this.collected = true;
    }

    const hitEnemy = this.enemies.some((entry) => Phaser.Math.Distance.BetweenPoints(this.player, entry.rect) < TILE_SIZE * COLLISION_THRESHOLD);
    if (hitEnemy) {
      this.onFail?.();
      this.scene.restart({ level: this.level, onWin: this.onWin, onFail: this.onFail });
      return;
    }

    const atGoal = Phaser.Math.Distance.BetweenPoints(this.player, this.goal) < TILE_SIZE * COLLISION_THRESHOLD;
    if (atGoal && (this.collected || !this.level.entities.some((item) => item.type === "collectible"))) {
      this.won = true;
      this.onWin?.();
    }
  }
}

export const TILE = TILE_SIZE;
