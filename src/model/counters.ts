import { supabase } from "../lib/supabase";

export type Counter = {
  id: string;
  title: string;
  counter: number;
};

export const CountersModel = {
  getCounters: async (userId: string) => {
    const { data, error } = await supabase
      .from("counters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching counters:", error);
      return [];
    }

    return data;
  },
  createCounter: async (counter: Counter, user_id: string) => {
    return supabase.from("counters").insert([{ ...counter, user_id }]);
  },
  updateCount: async (id: string, newCount: number, userId: string) => {
    return supabase
      .from("counters")
      .update({ counter: newCount })
      .eq("id", id)
      .eq("user_id", userId);
  },
  deleteCounter: async (id: string, userId: string) => {
    return supabase
      .from("counters")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
  },
  upsertCounters: async (counters: Counter[], user_id: string) => {
    const countersWithUserId = counters.map((counter) => ({
      ...counter,
      user_id,
    }));
    return supabase
      .from("counters")
      .upsert(countersWithUserId, { onConflict: "id" });
  },
};
