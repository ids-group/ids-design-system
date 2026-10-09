export interface AimPoint {
  x: number;
  y: number;
}

export type AimTriangle = readonly [AimPoint, AimPoint, AimPoint];

interface PanelEdges {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// The apex sits behind the exit point, so the exit point itself lies inside the triangle.
const APEX_SLACK = 4;
// A pointer resting this long inside the triangle has stopped heading for the submenu.
const REST_MS = 300;

/** The triangle from where the pointer left the item to the submenu's near edge. */
export function aimTriangle(exit: AimPoint, panel: PanelEdges): AimTriangle {
  const towardsRight = panel.left >= exit.x;
  const nearX = towardsRight ? panel.left : panel.right;
  const apexX = towardsRight ? exit.x - APEX_SLACK : exit.x + APEX_SLACK;

  return [
    { x: apexX, y: exit.y },
    { x: nearX, y: panel.top },
    { x: nearX, y: panel.bottom },
  ];
}

/** Whether `point` is inside `triangle` or on its edge. */
export function isInsideTriangle(
  point: AimPoint,
  triangle: AimTriangle,
): boolean {
  const [apex, edgeTop, edgeBottom] = triangle;
  const side = (from: AimPoint, to: AimPoint): number =>
    (to.x - from.x) * (point.y - from.y) - (to.y - from.y) * (point.x - from.x);
  const sides = [
    side(apex, edgeTop),
    side(edgeTop, edgeBottom),
    side(edgeBottom, apex),
  ];
  const hasNegative = sides.some((value) => value < 0);
  const hasPositive = sides.some((value) => value > 0);

  return !(hasNegative && hasPositive);
}

export interface AimHoverTarget {
  activateHover(): void;
}

/**
 * One per `ds-menu` level. While the pointer travels from an item towards its open submenu,
 * the items it crosses on the way do not take the hover; the submenu closes once the pointer
 * leaves the triangle or rests in it.
 */
export class MenuAim {
  private triangle: AimTriangle | null = null;
  private release: (() => void) | null = null;
  private heldHover: AimHoverTarget | null = null;
  private restTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  /** Starts holding the hover for an open submenu; `release` closes it when the aim ends. */
  start(triangle: AimTriangle, release: () => void): void {
    this.stop();
    this.triangle = triangle;
    this.release = release;
    this.document.addEventListener('mousemove', this.onMove);
    this.armRestTimer();
  }

  /** The pointer reached the submenu, or its owner went away: stop without releasing. */
  stop(): void {
    this.document.removeEventListener('mousemove', this.onMove);
    this.clearRestTimer();
    this.triangle = null;
    this.release = null;
  }

  /** Whether the item may take the hover now; a held item gets it when the aim ends. */
  requestHover(target: AimHoverTarget): boolean {
    if (this.triangle === null) {
      return true;
    }
    this.heldHover = target;

    return false;
  }

  dropHover(target: AimHoverTarget): void {
    if (this.heldHover === target) {
      this.heldHover = null;
    }
  }

  private readonly onMove = (event: MouseEvent): void => {
    if (
      this.triangle &&
      isInsideTriangle({ x: event.clientX, y: event.clientY }, this.triangle)
    ) {
      this.armRestTimer();

      return;
    }
    this.end();
  };

  private end(): void {
    const release = this.release;
    const held = this.heldHover;
    this.stop();
    this.heldHover = null;
    release?.();
    held?.activateHover();
  }

  private armRestTimer(): void {
    this.clearRestTimer();
    this.restTimer = setTimeout(() => this.end(), REST_MS);
  }

  private clearRestTimer(): void {
    if (this.restTimer !== null) {
      clearTimeout(this.restTimer);
      this.restTimer = null;
    }
  }
}
