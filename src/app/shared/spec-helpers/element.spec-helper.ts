import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Spec helpers for working with the DOM
 */

/**
 * Emulates a left click on the element with the given `data-testid` attribute.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 */
export function click<T>(fixture: ComponentFixture<T>, testId: string): void {
  const element = findEl(fixture, testId);
  const event = makeClickEvent(element.nativeElement);
  element.triggerEventHandler('click', event);
}

/**
 * Finds an element inside the Component by the given `data-testid` attribute.
 * Throws an error if no element was found.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 *
 */
export function findEl<T>(fixture: ComponentFixture<T>, testId: string): DebugElement {
  return queryByCss<T>(fixture, testIdSelector(testId));
}

/**
 * Makes a fake click event that provides the most important properties.
 * Sets the button to left.
 * The event can be passed to DebugElement#triggerEventHandler.
 *
 * @param target Element that is the target of the click event
 */
export function makeClickEvent(target: EventTarget): Partial<MouseEvent> {
  return {
    preventDefault(): void {},
    stopPropagation(): void {},
    stopImmediatePropagation(): void {},
    type: 'click',
    target,
    currentTarget: target,
    bubbles: true,
    cancelable: true,
    button: 0,
  };
}

/**
 * Returns a selector for the `data-testid` attribute with the given attribute value.
 *
 * @param testId Test id set by `data-testid`
 *
 */
export function testIdSelector(testId: string): string {
  return `[data-testid="${testId}"]`;
}

/**
 * Finds a single element inside the Component by the given CSS selector.
 * Throws an error if no element was found.
 *
 * @param fixture Component fixture
 * @param selector CSS selector
 *
 */
export function queryByCss<T>(
  fixture: ComponentFixture<T>,
  selector: string,
): DebugElement {
  // The return type of DebugElement#query() is declared as DebugElement,
  // but the actual return type is DebugElement | null.
  // See https://github.com/angular/angular/issues/22449.
  const debugElement = fixture.debugElement.query(By.css(selector));
  // Fail on null so the return type is always DebugElement.
  if (!debugElement) {
    throw new Error(`queryByCss: Element with ${selector} not found`);
  }
  return debugElement;
}