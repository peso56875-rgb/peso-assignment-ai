import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    try {
      // Check if user has credits record
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No record found, initialize credits
        await initializeCredits();
        return;
      }

      if (error) throw error;
      setCredits(data?.credits || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const initializeCredits = async () => {
    if (!user) return;

    try {
      // Call the database function to initialize credits
      const { error } = await supabase.rpc('initialize_user_credits', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      // Fetch the newly created credits
      const { data } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      setCredits(data?.credits || 100);
    } catch (error) {
      console.error('Error initializing credits:', error);
      // Fallback: try direct insert
      try {
        await supabase.from('user_credits').insert({
          user_id: user.id,
          credits: 100
        });
        
        await supabase.from('credit_transactions').insert({
          user_id: user.id,
          amount: 100,
          transaction_type: 'credit',
          description: 'رصيد ترحيبي للمستخدم الجديد'
        });
        
        setCredits(100);
      } catch (insertError) {
        console.error('Fallback insert error:', insertError);
      }
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const deductCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: description
      });

      if (error) throw error;

      if (data === true) {
        setCredits(prev => prev - amount);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  };

  const hasEnoughCredits = (amount: number = 20): boolean => {
    return credits >= amount;
  };

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    transactions,
    fetchCredits,
    fetchTransactions,
    deductCredits,
    hasEnoughCredits,
    initializeCredits
  };
};
