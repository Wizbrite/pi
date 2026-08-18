import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedMistake {
  id: string;
  subject: string;
  topic: string;
  question: string;
  incorrectAnswer: string;
  correctAnswer: string;
  attemptsFailed: number;
}

interface PracticeStore {
  mistakes: SavedMistake[];
  addMistake: (mistake: Omit<SavedMistake, 'id' | 'attemptsFailed'>) => void;
  removeMistake: (id: string) => void;
}

export const usePracticeStore = create<PracticeStore>()(
  persist(
    (set) => ({
      mistakes: [],
      addMistake: (newMistake) =>
        set((state) => {
          const existingIndex = state.mistakes.findIndex(
            (m) => m.question === newMistake.question
          );

          if (existingIndex > -1) {
            const updated = [...state.mistakes];
            updated[existingIndex].attemptsFailed += 1;
            return { mistakes: updated };
          }

          return {
            mistakes: [
              ...state.mistakes,
              { ...newMistake, id: Date.now().toString(), attemptsFailed: 1 },
            ],
          };
        }),
      removeMistake: (id) =>
        set((state) => ({
          mistakes: state.mistakes.filter((m) => m.id !== id),
        })),
    }),
    { name: 'pi-practice-store' }
  )
);