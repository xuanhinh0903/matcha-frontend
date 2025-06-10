/**
 * A simple event utility to handle cross-component communication
 * without relying on Redux for function storage
 */
type EventHandler = () => void;

class CallEvents {
  private eventHandlers: Record<string, EventHandler[]> = {};

  // Register a handler for a specific event
  public on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  // Remove a handler
  public off(event: string, handler: EventHandler): void {
    if (!this.eventHandlers[event]) return;

    this.eventHandlers[event] = this.eventHandlers[event].filter(
      (h) => h !== handler
    );
  }

  // Trigger an event
  public emit(event: string): void {
    if (!this.eventHandlers[event]) return;

    console.log(`Emitting event: ${event}`);
    this.eventHandlers[event].forEach((handler) => {
      try {
        handler();
      } catch (error) {
        console.error('Error executing event handler:', error);
      }
    });
  }
}

// Export a singleton instance
export const callEvents = new CallEvents();
