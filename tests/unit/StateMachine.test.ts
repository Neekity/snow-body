import { describe, it, expect, vi } from 'vitest';
import { StateMachine } from '../../src/fsm/StateMachine';

type TestState = 'idle' | 'running' | 'jumping';
type TestEvent = 'run' | 'jump' | 'land';

describe('StateMachine', () => {
  it('should initialize with the given state', () => {
    const fsm = new StateMachine<TestState, TestEvent>('idle');
    expect(fsm.getState()).toBe('idle');
  });

  it('should transition between states', () => {
    const fsm = new StateMachine<TestState, TestEvent>('idle');
    fsm.addTransition({ from: 'idle', to: 'running', event: 'run' });

    const result = fsm.transition('run');
    expect(result).toBe(true);
    expect(fsm.getState()).toBe('running');
  });

  it('should not transition if no valid transition exists', () => {
    const fsm = new StateMachine<TestState, TestEvent>('idle');

    const result = fsm.transition('jump');
    expect(result).toBe(false);
    expect(fsm.getState()).toBe('idle');
  });

  it('should respect guard conditions', () => {
    const fsm = new StateMachine<TestState, TestEvent>('idle');
    let canJump = false;

    fsm.addTransition({
      from: 'idle',
      to: 'jumping',
      event: 'jump',
      guard: () => canJump,
    });

    // Guard returns false, should not transition
    let result = fsm.transition('jump');
    expect(result).toBe(false);
    expect(fsm.getState()).toBe('idle');

    // Guard returns true, should transition
    canJump = true;
    result = fsm.transition('jump');
    expect(result).toBe(true);
    expect(fsm.getState()).toBe('jumping');
  });

  it('should notify listeners on state entry', () => {
    const fsm = new StateMachine<TestState, TestEvent>('idle');
    const callback = vi.fn();

    fsm.onEnter('running', callback);
    fsm.addTransition({ from: 'idle', to: 'running', event: 'run' });

    fsm.transition('run');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should allow manual state setting', () => {
    const fsm = new StateMachine<TestState, TestEvent>('idle');
    const callback = vi.fn();

    fsm.onEnter('jumping', callback);
    fsm.setState('jumping');

    expect(fsm.getState()).toBe('jumping');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple transitions from the same state', () => {
    const fsm = new StateMachine<TestState, TestEvent>('idle');

    fsm.addTransition({ from: 'idle', to: 'running', event: 'run' });
    fsm.addTransition({ from: 'idle', to: 'jumping', event: 'jump' });

    fsm.transition('run');
    expect(fsm.getState()).toBe('running');

    fsm.setState('idle');
    fsm.transition('jump');
    expect(fsm.getState()).toBe('jumping');
  });
});
