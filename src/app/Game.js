import GameMap from './GameMap';
import getStage from "../assets/maps";
import Player from './player';
import Enemy from "./Enemy";
import Input from './Input';
import Asset from './Asset';
import Hud from './Hud';
import {createCanvas, selectDom} from "./Utils";
import {
  UP, RIGHT, DOWN, LEFT, ENTER,
  MAP_SIZE, BLOCK_SIZE,
  GAME_READY, GAME_PLAYING, GAME_OVER, GAME_STAGE_CLEAR, ENEMY_HEAD_SPRITE
} from "./constants";

class Game {
  constructor() {
    this.canvas = selectDom('canvas');
    this.canvas.width = MAP_SIZE;
    this.canvas.height = MAP_SIZE;
    this.ctx = this.canvas.getContext('2d');

    const nvcs = createCanvas(MAP_SIZE, MAP_SIZE);
    this.novCanvas =nvcs.canvas;
    this.novCtx = nvcs.context;

    this.nextms = 0;
    this.input = Input;
    this.state = GAME_READY;
    this.stageNum = 1;
  }

  init () {
    Asset.loadImage(PLAYER_SPRITE);
    Asset.loadImage(ENEMY_BODY_SPRITE);
    Asset.loadImage(ENEMY_HEAD_SPRITE);
    Asset.loadAudio(MOVE_AUDIO);
    Asset.loadAudio(HIT_AUDIO);
    Asset.loadAudio(SHOT_AUDIO);

    this.map = new GameMap(this.ctx);
    this.player = new Player(MAP_SIZE / 2 - 16, MAP_SIZE - 32,  this.map);
    this.input
      .on({ key: ENTER, onKeyDown: () => {
        switch(this.state) {
          case GAME_READY:
            Hud.showHud(READY_HUD, false);
            this.load(this.stageNum);
            this.state = GAME_PLAYING;
            sequence.play();
            break;
          case GAME_PLAYING:
            break;
          case GAME_OVER:
            Hud.showHud(OVER_HUD, false);\
            this.load(this.stageNum);
            this.state = GAME_PLAYING;
            break;
          case GAME_STAGE_CLEAR:
            Hud.showHud(CLEAR_HUD, false);
            this.stageNum ++;
            this.load(this.stageNum);
            this.state = GAME_PLAYING;
            break;
        }
      }})
  }

  load (num) {
    const stage = getStage(num);

    this.map.load(stage.map);
    this.player.init(stage.player.x * BLOCK_SIZE, stage.player.y * BLOCK_SIZE);
    this.enemies = stage.enemies.map(({x, y, cmd}) => new Enemy(x * BLOCK_SIZE, y * BLOCK_SIZE, this.map, cmd, this));


    this.input
      .on({ key: UP, onKeyDown: () => {
          this.player.move(UP);
        } })
      .on({ key: DOWN, onKeyDown: () => {
        this.player.move(DOWN);
        }})
      .on({ key: LEFT, onKeyDown: () => {
        this.player.move(LEFT)
        }})
      .on({ key: RIGHT, onKeyDown: () => {
        this.player.move(RIGHT)
        }});
  }

  update (time) {
    const timeSlice = (time / 1000) * 60;
    this.player.update(timeSlice);
    this.enemies.forEach(enemy => enemy.update(timeSlice));
    this.enemies.every(enemy => !enemy.isAlive) && (this.state === GAME_PLAYING) && this.stageClear();
  }

  start() {
    window.requestAnimationFrame(this.render.bind(this))
  }

  renderReady (nms) {
    this.ctx.clearRect(0,0, MAP_SIZE, MAP_SIZE);
    this.map.renderReady(this.ctx);
    this.player.render(this.ctx);
  }

  renderPlaying(nms) {
    let time = nms - this.nextms;
    this.nextms = nms;

    this.update(time);
    this.ctx.clearRect(0,0, MAP_SIZE, MAP_SIZE);
    this.map.render(this.ctx);
    this.player.render(this.ctx);
    Hud.renderHp(this.ctx);
    this.novCtx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
    this.novCtx.fillStyle = 'rgba(0,0,0,0.4)';
    this.novCtx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
    this.enemies.forEach(enemy => enemy.draw(this.ctx, this.novCtx));
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'darken';
    this.ctx.drawImage(this.novCanvas, 0, 0);
    this.ctx.restore();

    if (this.player.hp <= 0 && this.state === GAME_PLAYING) {
      this.gameOver();
    }
  }

  render (nms) {
    if (this.state === GAME_READY) {
      this.renderReady(nms);
    } else if (this.state === GAME_PLAYING || this.state === GAME_OVER || this.state === GAME_STAGE_CLEAR) {
      this.renderPlaying(nms);
    }
    window.requestAnimationFrame(this.render.bind(this));
  }

  // These methods change game state.
  gameOver() {
    this.state = GAME_OVER;
    this.player.isAlive = false;
    Hud.showHud(OVER_HUD, true);
  }

  stageClear () {
    this.state = GAME_STAGE_CLEAR;
    Hud.showHud(CLEAR_HUD, true);
  }
}

export default new Game();
