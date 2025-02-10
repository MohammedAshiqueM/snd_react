import { create } from 'zustand';
import { userSkills } from '../api';

const useSkillsStore = create((set) => ({
  skills: ["All"],
  fetchSkills: async () => {
    try {
      const response = await userSkills();
      set({ skills: ["All", ...response.data.skills] });
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    }
  },
}));

export default useSkillsStore;
