import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('product_twins')
      .select('*, categories(name, icon)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setProducts(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function addProduct(productData: any) {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('product_twins')
      .insert({ ...productData, user_id: user.id })
      .select()
      .single();
    if (!error) setProducts(prev => [data, ...prev]);
    return { data, error };
  }

  async function updateProduct(id: string, updates: any) {
    const { data, error } = await supabase
      .from('product_twins')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error) setProducts(prev => prev.map(p => p.id === id ? data : p));
    return { data, error };
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase
      .from('product_twins')
      .update({ status: 'disposed' })
      .eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
    return { error };
  }

  return { products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<any | null>(null);
  const [guidance, setGuidance] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [serviceRecords, setServiceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [p, g, r, d, s] = await Promise.all([
        supabase.from('product_twins').select('*, categories(name, icon)').eq('id', id).single(),
        supabase.from('guidance_items').select('*').eq('product_twin_id', id).order('created_at'),
        supabase.from('reminders').select('*').eq('product_twin_id', id).order('due_date'),
        supabase.from('decisions').select('*').eq('product_twin_id', id),
        supabase.from('service_records').select('*').eq('product_twin_id', id).order('service_date', { ascending: false }),
      ]);
      setProduct(p.data);
      setGuidance(g.data || []);
      setReminders(r.data || []);
      setDecisions(d.data || []);
      setServiceRecords(s.data || []);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  return { product, guidance, reminders, decisions, serviceRecords, loading, setProduct, setGuidance, setReminders };
}
