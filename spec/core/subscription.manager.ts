import * as Rx from 'rxjs';

export class SubscriptionManager {
  private subscription: Set<Rx.Subscription> = new Set();

  /**
   * Destroys all RxJs subscriptions.
   *
   * @return {void}
   */
  destroy (
  ): void {
    this.subscription.forEach((data) => {
      if (typeof data?.unsubscribe !== 'function') {
        return;
      }
      data.unsubscribe();
    });
    this.subscription.clear();
  }

  /**
   * Adds a subscription to subsciption list.
   *
   * @param {Subscription} sub
   * @return {void}
   */
  subscribe (
    sub: Rx.Subscription,
  ): void {
    this.subscription.add(sub);
  }
}
