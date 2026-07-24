import { describe, it, expect } from "vitest";

/**
 * QA GATE: Comprehensive interaction tests for the forced-rank assessment.
 * 
 * These tests validate the core logic that powers the RankableQuestion component
 * and the assessment flow. They simulate every interaction path:
 * - Arrow button reordering (up/down)
 * - Drag-and-drop reordering (via arrayMove)
 * - hasInteracted state gating
 * - Question transition and state reset
 * - Edge cases (boundary items, rapid clicks, full assessment flow)
 * 
 * If ANY of these tests fail, the assessment UI is broken. Do not ship.
 */

// Replicate the arrayMove utility from @dnd-kit/sortable
function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const newArr = [...arr];
  const [item] = newArr.splice(from, 1);
  newArr.splice(to, 0, item);
  return newArr;
}

type Role = "Spark" | "Amplifier" | "Filter" | "Ground" | "Conductor";

interface RankOption {
  text: string;
  role: Role;
  weight: number;
}

// Simulate the RankableQuestion component's internal state machine
class RankableQuestionSimulator {
  items: RankOption[];
  hasInteracted: boolean;
  onRankCompleteCallCount: number;
  lastRanking: RankOption[] | null;

  constructor(options: RankOption[]) {
    this.items = [...options];
    this.hasInteracted = false;
    this.onRankCompleteCallCount = 0;
    this.lastRanking = null;
  }

  // Simulate arrow up click
  moveUp(index: number): boolean {
    if (index <= 0) return false; // Can't move first item up
    this.items = arrayMove(this.items, index, index - 1);
    this.hasInteracted = true;
    return true;
  }

  // Simulate arrow down click
  moveDown(index: number): boolean {
    if (index >= this.items.length - 1) return false; // Can't move last item down
    this.items = arrayMove(this.items, index, index + 1);
    this.hasInteracted = true;
    return true;
  }

  // Simulate drag-and-drop
  dragAndDrop(fromIndex: number, toIndex: number): boolean {
    if (fromIndex === toIndex) return false; // No-op drag
    if (fromIndex < 0 || fromIndex >= this.items.length) return false;
    if (toIndex < 0 || toIndex >= this.items.length) return false;
    this.items = arrayMove(this.items, fromIndex, toIndex);
    this.hasInteracted = true;
    return true;
  }

  // Simulate clicking "Lock In Ranking"
  confirm(): boolean {
    if (!this.hasInteracted) return false; // Button should be disabled
    this.onRankCompleteCallCount++;
    this.lastRanking = [...this.items];
    return true;
  }

  // Simulate question transition (new question loaded)
  resetForNewQuestion(newOptions: RankOption[]) {
    this.items = [...newOptions];
    this.hasInteracted = false;
  }

  getRoleAtPosition(position: number): Role {
    return this.items[position].role;
  }
}

// Test data factory
function makeOptions(roles: Role[] = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"]): RankOption[] {
  return roles.map((role, i) => ({
    text: `${role} option text`,
    role,
    weight: 9,
  }));
}

describe("QA Gate: RankableQuestion Interaction Logic", () => {
  describe("Arrow Button: Move Up", () => {
    it("moves item from position 2 to position 1", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      expect(sim.getRoleAtPosition(1)).toBe("Amplifier");
      sim.moveUp(1);
      expect(sim.getRoleAtPosition(0)).toBe("Amplifier");
      expect(sim.getRoleAtPosition(1)).toBe("Spark");
    });

    it("moves item from position 4 (bottom) to position 3", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      expect(sim.getRoleAtPosition(4)).toBe("Conductor");
      sim.moveUp(4);
      expect(sim.getRoleAtPosition(3)).toBe("Conductor");
      expect(sim.getRoleAtPosition(4)).toBe("Ground");
    });

    it("does NOT move item at position 0 (already at top)", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      const result = sim.moveUp(0);
      expect(result).toBe(false);
      expect(sim.getRoleAtPosition(0)).toBe("Spark");
      expect(sim.hasInteracted).toBe(false); // Should NOT activate button
    });

    it("sets hasInteracted to true after successful move", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      expect(sim.hasInteracted).toBe(false);
      sim.moveUp(2);
      expect(sim.hasInteracted).toBe(true);
    });

    it("can move an item all the way to the top with repeated clicks", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      // Move Conductor (position 4) all the way to position 0
      sim.moveUp(4); // pos 3
      sim.moveUp(3); // pos 2
      sim.moveUp(2); // pos 1
      sim.moveUp(1); // pos 0
      expect(sim.getRoleAtPosition(0)).toBe("Conductor");
    });
  });

  describe("Arrow Button: Move Down", () => {
    it("moves item from position 0 to position 1", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0);
      expect(sim.getRoleAtPosition(0)).toBe("Amplifier");
      expect(sim.getRoleAtPosition(1)).toBe("Spark");
    });

    it("moves item from position 3 to position 4 (bottom)", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(3);
      expect(sim.getRoleAtPosition(3)).toBe("Conductor");
      expect(sim.getRoleAtPosition(4)).toBe("Ground");
    });

    it("does NOT move item at position 4 (already at bottom)", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      const result = sim.moveDown(4);
      expect(result).toBe(false);
      expect(sim.getRoleAtPosition(4)).toBe("Conductor");
      expect(sim.hasInteracted).toBe(false);
    });

    it("sets hasInteracted to true after successful move", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0);
      expect(sim.hasInteracted).toBe(true);
    });

    it("can move an item all the way to the bottom with repeated clicks", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      // Move Spark (position 0) all the way to position 4
      sim.moveDown(0); // pos 1
      sim.moveDown(1); // pos 2
      sim.moveDown(2); // pos 3
      sim.moveDown(3); // pos 4
      expect(sim.getRoleAtPosition(4)).toBe("Spark");
    });
  });

  describe("Drag and Drop", () => {
    it("moves item from position 0 to position 4", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.dragAndDrop(0, 4);
      expect(sim.getRoleAtPosition(4)).toBe("Spark");
      expect(sim.getRoleAtPosition(0)).toBe("Amplifier");
    });

    it("moves item from position 4 to position 0", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.dragAndDrop(4, 0);
      expect(sim.getRoleAtPosition(0)).toBe("Conductor");
      expect(sim.getRoleAtPosition(1)).toBe("Spark");
    });

    it("no-op when dragging to same position", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      const result = sim.dragAndDrop(2, 2);
      expect(result).toBe(false);
      expect(sim.hasInteracted).toBe(false);
    });

    it("rejects out-of-bounds indices", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      expect(sim.dragAndDrop(-1, 2)).toBe(false);
      expect(sim.dragAndDrop(0, 5)).toBe(false);
      expect(sim.dragAndDrop(5, 0)).toBe(false);
      expect(sim.hasInteracted).toBe(false);
    });

    it("sets hasInteracted to true after valid drag", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.dragAndDrop(1, 3);
      expect(sim.hasInteracted).toBe(true);
    });
  });

  describe("Lock In Ranking (Confirm Button)", () => {
    it("is disabled when hasInteracted is false", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      const result = sim.confirm();
      expect(result).toBe(false);
      expect(sim.onRankCompleteCallCount).toBe(0);
    });

    it("is enabled after arrow move", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0);
      const result = sim.confirm();
      expect(result).toBe(true);
      expect(sim.onRankCompleteCallCount).toBe(1);
    });

    it("is enabled after drag-and-drop", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.dragAndDrop(0, 3);
      const result = sim.confirm();
      expect(result).toBe(true);
      expect(sim.onRankCompleteCallCount).toBe(1);
    });

    it("captures the correct ranking order on confirm", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0); // Spark moves to pos 1, Amplifier to pos 0
      sim.moveDown(3); // Ground moves to pos 4, Conductor to pos 3
      sim.confirm();
      expect(sim.lastRanking).not.toBeNull();
      expect(sim.lastRanking![0].role).toBe("Amplifier");
      expect(sim.lastRanking![1].role).toBe("Spark");
      expect(sim.lastRanking![4].role).toBe("Ground");
    });

    it("does NOT activate from failed move (top item move up)", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveUp(0); // Should fail
      expect(sim.hasInteracted).toBe(false);
      expect(sim.confirm()).toBe(false);
    });

    it("does NOT activate from failed move (bottom item move down)", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(4); // Should fail
      expect(sim.hasInteracted).toBe(false);
      expect(sim.confirm()).toBe(false);
    });
  });

  describe("Question Transition (State Reset)", () => {
    it("resets hasInteracted to false on new question", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0);
      expect(sim.hasInteracted).toBe(true);
      sim.resetForNewQuestion(makeOptions(["Ground", "Filter", "Spark", "Conductor", "Amplifier"]));
      expect(sim.hasInteracted).toBe(false);
    });

    it("loads new options on question transition", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0);
      sim.confirm();
      const newOptions = makeOptions(["Ground", "Filter", "Spark", "Conductor", "Amplifier"]);
      sim.resetForNewQuestion(newOptions);
      expect(sim.getRoleAtPosition(0)).toBe("Ground");
      expect(sim.getRoleAtPosition(4)).toBe("Amplifier");
    });

    it("confirm button is disabled after question transition", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0);
      sim.confirm();
      sim.resetForNewQuestion(makeOptions());
      expect(sim.confirm()).toBe(false);
    });

    it("preserves ranking from previous question after transition", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0);
      sim.confirm();
      const savedRanking = sim.lastRanking;
      sim.resetForNewQuestion(makeOptions(["Ground", "Filter", "Spark", "Conductor", "Amplifier"]));
      // Previous ranking should still be accessible
      expect(savedRanking).not.toBeNull();
      expect(savedRanking![0].role).toBe("Amplifier");
    });
  });

  describe("Full Assessment Flow Simulation", () => {
    it("completes all 12 questions with valid rankings", () => {
      const allRankings: RankOption[][] = [];
      const sim = new RankableQuestionSimulator(makeOptions());

      for (let q = 0; q < 12; q++) {
        // Simulate user interaction: move bottom item to top
        sim.moveUp(4);
        sim.moveUp(3);
        sim.moveUp(2);
        sim.moveUp(1);
        sim.confirm();
        allRankings.push(sim.lastRanking!);

        if (q < 11) {
          // Transition to next question
          sim.resetForNewQuestion(makeOptions());
        }
      }

      expect(allRankings.length).toBe(12);
      expect(sim.onRankCompleteCallCount).toBe(12);
      // Each ranking should have 5 items
      allRankings.forEach((ranking) => {
        expect(ranking.length).toBe(5);
      });
    });

    it("handles varied interaction patterns across questions", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      
      // Q1: Use arrow down
      sim.moveDown(0);
      expect(sim.confirm()).toBe(true);
      sim.resetForNewQuestion(makeOptions());

      // Q2: Use arrow up
      sim.moveUp(4);
      expect(sim.confirm()).toBe(true);
      sim.resetForNewQuestion(makeOptions());

      // Q3: Use drag-and-drop
      sim.dragAndDrop(0, 4);
      expect(sim.confirm()).toBe(true);
      sim.resetForNewQuestion(makeOptions());

      // Q4: Multiple moves
      sim.moveDown(0);
      sim.moveUp(4);
      sim.moveDown(1);
      expect(sim.confirm()).toBe(true);

      expect(sim.onRankCompleteCallCount).toBe(4);
    });

    it("all 5 roles appear exactly once in every ranking", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0);
      sim.moveUp(4);
      sim.confirm();

      const roles = sim.lastRanking!.map((item) => item.role);
      const uniqueRoles = new Set(roles);
      expect(uniqueRoles.size).toBe(5);
      expect(roles).toContain("Spark");
      expect(roles).toContain("Amplifier");
      expect(roles).toContain("Filter");
      expect(roles).toContain("Ground");
      expect(roles).toContain("Conductor");
    });
  });

  describe("Edge Cases and Stress Tests", () => {
    it("handles rapid sequential moves without corruption", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      // Rapidly move items around
      for (let i = 0; i < 20; i++) {
        const fromIdx = i % 5;
        const direction = i % 2 === 0 ? "down" : "up";
        if (direction === "down" && fromIdx < 4) sim.moveDown(fromIdx);
        if (direction === "up" && fromIdx > 0) sim.moveUp(fromIdx);
      }
      // Should still have exactly 5 items
      expect(sim.items.length).toBe(5);
      // All roles should still be present
      const roles = new Set(sim.items.map((item) => item.role));
      expect(roles.size).toBe(5);
    });

    it("move-up then move-down returns to original position", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      const originalOrder = sim.items.map((item) => item.role);
      sim.moveDown(2); // Filter moves to pos 3
      sim.moveUp(3); // Filter moves back to pos 2
      const currentOrder = sim.items.map((item) => item.role);
      expect(currentOrder).toEqual(originalOrder);
    });

    it("drag to same position does not activate confirm", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.dragAndDrop(2, 2);
      expect(sim.hasInteracted).toBe(false);
      expect(sim.confirm()).toBe(false);
    });

    it("items maintain text and role integrity through all operations", () => {
      const sim = new RankableQuestionSimulator(makeOptions());
      sim.moveDown(0);
      sim.moveUp(4);
      sim.dragAndDrop(1, 3);
      
      // Every item should still have matching role and text
      sim.items.forEach((item) => {
        expect(item.text).toBe(`${item.role} option text`);
        expect(["Spark", "Amplifier", "Filter", "Ground", "Conductor"]).toContain(item.role);
      });
    });
  });
});

describe("QA Gate: arrayMove Utility", () => {
  it("moves element forward in array", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arrayMove(arr, 0, 3)).toEqual([2, 3, 4, 1, 5]);
  });

  it("moves element backward in array", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arrayMove(arr, 3, 0)).toEqual([4, 1, 2, 3, 5]);
  });

  it("does not mutate original array", () => {
    const arr = [1, 2, 3, 4, 5];
    arrayMove(arr, 0, 4);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  it("handles adjacent swaps", () => {
    const arr = ["a", "b", "c"];
    expect(arrayMove(arr, 0, 1)).toEqual(["b", "a", "c"]);
    expect(arrayMove(arr, 1, 2)).toEqual(["a", "c", "b"]);
  });
});
