import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Repository, FavoriteGroup, FavoriteItem, HistoryItem } from '../types';

interface FavoritesState {
  groups: FavoriteGroup[];
  favorites: FavoriteItem[];
  history: HistoryItem[];
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
  renameGroup: (id: string, name: string) => void;
  addFavorite: (repo: Repository, groupId?: string) => void;
  removeFavorite: (fullName: string, groupId: string) => void;
  moveFavorite: (fullName: string, fromGroupId: string, toGroupId: string) => void;
  isFavorited: (fullName: string) => boolean;
  addHistory: (repo: Pick<Repository, 'fullName' | 'owner' | 'name' | 'avatar' | 'description' | 'language'>) => void;
  clearHistory: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      groups: [{ id: 'default', name: '默认收藏', createdAt: 0 }],
      favorites: [],
      history: [],

      addGroup: (name) => set((s) => ({
        groups: [...s.groups, { id: Date.now().toString(), name, createdAt: Date.now() }],
      })),

      removeGroup: (id) => set((s) => ({
        groups: s.groups.filter((g) => g.id !== id),
        favorites: s.favorites.filter((f) => f.groupId !== id),
      })),

      renameGroup: (id, name) => set((s) => ({
        groups: s.groups.map((g) => g.id === id ? { ...g, name } : g),
      })),

      addFavorite: (repo, groupId = 'default') => set((s) => {
        const exists = s.favorites.some((f) => f.repo.fullName === repo.fullName && f.groupId === groupId);
        if (exists) return s;
        return { favorites: [...s.favorites, { repo, groupId, addedAt: Date.now() }] };
      }),

      removeFavorite: (fullName, groupId) => set((s) => ({
        favorites: s.favorites.filter((f) => !(f.repo.fullName === fullName && f.groupId === groupId)),
      })),

      moveFavorite: (fullName, fromGroupId, toGroupId) => set((s) => {
        const exists = s.favorites.some((f) => f.repo.fullName === fullName && f.groupId === toGroupId);
        if (exists) {
          return { favorites: s.favorites.filter((f) => !(f.repo.fullName === fullName && f.groupId === fromGroupId)) };
        }
        return {
          favorites: s.favorites.map((f) =>
            f.repo.fullName === fullName && f.groupId === fromGroupId ? { ...f, groupId: toGroupId } : f
          ),
        };
      }),

      isFavorited: (fullName) => get().favorites.some((f) => f.repo.fullName === fullName),

      addHistory: (repo) => set((s) => {
        const filtered = s.history.filter((h) => h.repo.fullName !== repo.fullName);
        const item: HistoryItem = { repo, visitedAt: Date.now() };
        return { history: [item, ...filtered].slice(0, 200) };
      }),

      clearHistory: () => set({ history: [] }),
    }),
    { name: 'github-trending-favorites' }
  )
);
