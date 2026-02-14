export interface StateTransition<TState, TEvent> {
  from: TState;
  to: TState;
  event: TEvent;
  guard?: () => boolean;
}

export class StateMachine<TState extends string, TEvent extends string> {
  private currentState: TState;
  private transitions: Map<string, StateTransition<TState, TEvent>[]>;
  private listeners: Map<TState, Array<() => void>>;

  constructor(initialState: TState) {
    this.currentState = initialState;
    this.transitions = new Map();
    this.listeners = new Map();
  }

  addTransition(transition: StateTransition<TState, TEvent>): void {
    const key = `${transition.from}:${transition.event}`;
    if (!this.transitions.has(key)) {
      this.transitions.set(key, []);
    }
    this.transitions.get(key)!.push(transition);
  }

  transition(event: TEvent): boolean {
    const key = `${this.currentState}:${event}`;
    const possibleTransitions = this.transitions.get(key);

    if (!possibleTransitions || possibleTransitions.length === 0) {
      return false;
    }

    for (const trans of possibleTransitions) {
      if (!trans.guard || trans.guard()) {
        const previousState = this.currentState;
        this.currentState = trans.to;
        this.notifyListeners(trans.to);
        return true;
      }
    }

    return false;
  }

  getState(): TState {
    return this.currentState;
  }

  setState(state: TState): void {
    this.currentState = state;
    this.notifyListeners(state);
  }

  onEnter(state: TState, callback: () => void): void {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, []);
    }
    this.listeners.get(state)!.push(callback);
  }

  private notifyListeners(state: TState): void {
    const callbacks = this.listeners.get(state);
    if (callbacks) {
      callbacks.forEach(cb => cb());
    }
  }
}
