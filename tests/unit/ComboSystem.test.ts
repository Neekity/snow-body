import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('phaser', () => ({
  default: {},
  __esModule: true,
}));

import { ComboSystem } from '../../src/systems/ComboSystem';
import { BALANCE } from '../../src/config/balance.config';

interface MockTimer {
  destroy: ReturnType<typeof vi.fn>;
  callback: () => void;
}

type Listener = { fn: (...args: any[]) => void; ctx: any };

class SimpleEventEmitter {
  private listeners = new Map<string, Listener[]>();

  on(event: string, fn: (...args: any[]) => void, ctx?: any): this {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push({ fn, ctx });
    return this;
  }

  off(event: string, fn: (...args: any[]) => void, ctx?: any): this {
    const list = this.listeners.get(event);
    if (!list) return this;
    this.listeners.set(
      event,
      list.filter((l) => !(l.fn === fn && l.ctx === ctx)),
    );
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const list = this.listeners.get(event);
    if (!list || list.length === 0) return false;
    list.slice().forEach((l) => l.fn.apply(l.ctx, args));
    return true;
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0;
  }
}

const createMockScene = () => {
  const events = new SimpleEventEmitter();
  const timers: MockTimer[] = [];

  return {
    events,
    time: {
      delayedCall: vi.fn((delay: number, callback: () => void) => {
        const timer: MockTimer = { destroy: vi.fn(), callback };
        timers.push(timer);
        return timer;
      }),
    },
    _timers: timers,
  } as any;
};

const makeEnemy = (x = 100, y = 100) => ({
  defeat: vi.fn(),
  x,
  y,
});

const hitEnemy = (scene: any, snowballId: string, enemy: any) => {
  scene.events.emit('snowball:hit_enemy', {
    snowball: {},
    snowballId,
    enemy,
  });
};

describe('ComboSystem', () => {
  let scene: any;
  let comboSystem: ComboSystem;

  beforeEach(() => {
    scene = createMockScene();
    comboSystem = new ComboSystem(scene);
  });

  afterEach(() => {
    comboSystem.destroy();
  });

  describe('initialization', () => {
    it('should initialize with no active combo', () => {
      expect(comboSystem.getActiveCombo()).toBeNull();
    });

    it('should register event listeners on construction', () => {
      const count = scene.events.listenerCount('snowball:hit_enemy');
      expect(count).toBe(1);
    });
  });

  describe('combo start', () => {
    it('should start combo on first snowball hit', () => {
      hitEnemy(scene, 'snowball-1', makeEnemy());

      const combo = comboSystem.getActiveCombo();
      expect(combo).not.toBeNull();
      expect(combo?.chainLength).toBe(1);
      expect(combo?.snowballId).toBe('snowball-1');
      expect(combo?.active).toBe(true);
    });

    it('should call defeat on the enemy', () => {
      const enemy = makeEnemy();
      hitEnemy(scene, 'snowball-1', enemy);
      expect(enemy.defeat).toHaveBeenCalledOnce();
    });

    it('should start combo timer with correct delay', () => {
      hitEnemy(scene, 'snowball-1', makeEnemy());
      expect(scene.time.delayedCall).toHaveBeenCalledWith(
        BALANCE.combo.chainTimeWindow,
        expect.any(Function),
      );
    });
  });

  describe('chain continuation', () => {
    it('should increment chain when same snowball hits again', () => {
      hitEnemy(scene, 'snowball-1', makeEnemy());
      hitEnemy(scene, 'snowball-1', makeEnemy(150, 100));

      expect(comboSystem.getActiveCombo()?.chainLength).toBe(2);
    });

    it('should reset timer on each hit', () => {
      hitEnemy(scene, 'snowball-1', makeEnemy());
      hitEnemy(scene, 'snowball-1', makeEnemy(150, 100));

      expect(scene.time.delayedCall).toHaveBeenCalledTimes(2);
      expect(scene._timers[0].destroy).toHaveBeenCalled();
    });

    it('should defeat each enemy in the chain', () => {
      const e1 = makeEnemy();
      const e2 = makeEnemy(150, 100);
      hitEnemy(scene, 'snowball-1', e1);
      hitEnemy(scene, 'snowball-1', e2);

      expect(e1.defeat).toHaveBeenCalledOnce();
      expect(e2.defeat).toHaveBeenCalledOnce();
    });
  });

  describe('different snowball', () => {
    it('should start new combo when different snowball hits', () => {
      hitEnemy(scene, 'snowball-1', makeEnemy());
      hitEnemy(scene, 'snowball-2', makeEnemy(150, 100));

      const combo = comboSystem.getActiveCombo();
      expect(combo?.chainLength).toBe(1);
      expect(combo?.snowballId).toBe('snowball-2');
    });
  });

  describe('multiplier calculation', () => {
    it('should emit 1x multiplier for chain length 1', () => {
      let emitted: any = null;
      scene.events.on('combo:score', (e: any) => { emitted = e; });

      hitEnemy(scene, 'sb-1', makeEnemy());
      scene.events.emit('enemy:defeated', { enemy: { x: 100, y: 100 }, score: 100 });

      expect(emitted?.multiplier).toBe(1);
      expect(emitted?.totalScore).toBe(100);
    });

    it('should emit 2x multiplier for chain length 2', () => {
      let emitted: any = null;
      scene.events.on('combo:score', (e: any) => { emitted = e; });

      hitEnemy(scene, 'sb-1', makeEnemy());
      hitEnemy(scene, 'sb-1', makeEnemy(150, 100));
      scene.events.emit('enemy:defeated', { enemy: { x: 150, y: 100 }, score: 100 });

      expect(emitted?.multiplier).toBe(2);
      expect(emitted?.totalScore).toBe(200);
    });

    it('should emit 4x multiplier for chain length 3', () => {
      let emitted: any = null;
      scene.events.on('combo:score', (e: any) => { emitted = e; });

      hitEnemy(scene, 'sb-1', makeEnemy());
      hitEnemy(scene, 'sb-1', makeEnemy(150, 100));
      hitEnemy(scene, 'sb-1', makeEnemy(200, 100));
      scene.events.emit('enemy:defeated', { enemy: { x: 200, y: 100 }, score: 100 });

      expect(emitted?.multiplier).toBe(4);
      expect(emitted?.totalScore).toBe(400);
    });

    it('should cap multiplier at maxMultiplier (16x)', () => {
      let emitted: any = null;
      scene.events.on('combo:score', (e: any) => { emitted = e; });

      for (let i = 0; i < 10; i++) {
        hitEnemy(scene, 'sb-1', makeEnemy(100 + i * 10, 100));
      }
      scene.events.emit('enemy:defeated', { enemy: { x: 190, y: 100 }, score: 100 });

      expect(emitted?.multiplier).toBe(BALANCE.combo.maxMultiplier);
      expect(emitted?.totalScore).toBe(100 * BALANCE.combo.maxMultiplier);
    });

    it('should include correct position in combo event', () => {
      let emitted: any = null;
      scene.events.on('combo:score', (e: any) => { emitted = e; });

      hitEnemy(scene, 'sb-1', makeEnemy(42, 99));
      scene.events.emit('enemy:defeated', { enemy: { x: 42, y: 99 }, score: 50 });

      expect(emitted?.position).toEqual({ x: 42, y: 99 });
      expect(emitted?.baseScore).toBe(50);
    });
  });

  describe('combo timeout', () => {
    it('should end combo when timer fires', () => {
      hitEnemy(scene, 'sb-1', makeEnemy());
      expect(comboSystem.getActiveCombo()).not.toBeNull();

      scene._timers[0].callback();

      expect(comboSystem.getActiveCombo()).toBeNull();
    });

    it('should not emit combo:complete for chain of 1', () => {
      let completeFired = false;
      scene.events.on('combo:complete', () => { completeFired = true; });

      hitEnemy(scene, 'sb-1', makeEnemy());
      scene._timers[0].callback();

      expect(completeFired).toBe(false);
    });

    it('should emit combo:complete for chain > 1', () => {
      let completeData: any = null;
      scene.events.on('combo:complete', (d: any) => { completeData = d; });

      hitEnemy(scene, 'sb-1', makeEnemy());
      hitEnemy(scene, 'sb-1', makeEnemy(150, 100));

      scene._timers[scene._timers.length - 1].callback();

      expect(completeData).not.toBeNull();
      expect(completeData?.chainLength).toBe(2);
      expect(completeData?.multiplier).toBe(2);
    });
  });

  describe('enemy:defeated without active combo', () => {
    it('should not emit combo:score if no active combo', () => {
      let emitted = false;
      scene.events.on('combo:score', () => { emitted = true; });

      scene.events.emit('enemy:defeated', { enemy: { x: 0, y: 0 }, score: 100 });

      expect(emitted).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should remove event listeners on destroy', () => {
      comboSystem.destroy();

      const count = scene.events.listenerCount('snowball:hit_enemy');
      expect(count).toBe(0);
    });

    it('should not respond to events after destroy', () => {
      comboSystem.destroy();
      hitEnemy(scene, 'sb-1', makeEnemy());

      expect(comboSystem.getActiveCombo()).toBeNull();
    });
  });
});
