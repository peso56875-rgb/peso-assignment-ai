import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Users,
  CreditCard,
  Wallet,
  LogOut
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentRequest {
  id: string;
  user_id: string;
  user_email: string;
  transfer_number: string;
  amount: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<{ [key: string]: string }>({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('حدث خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin, filter]);

  const handleApprove = async (request: PaymentRequest) => {
    const credits = parseInt(creditsToAdd[request.id] || '1000');
    if (isNaN(credits) || credits <= 0) {
      toast.error('يرجى إدخال عدد نقاط صحيح');
      return;
    }

    setProcessingId(request.id);
    try {
      // Add credits to user
      const { error: creditsError } = await supabase.rpc('add_credits', {
        p_user_id: request.user_id,
        p_amount: credits,
        p_description: `تفعيل اشتراك شهري - رقم التحويل: ${request.transfer_number}`
      });

      if (creditsError) throw creditsError;

      // Update request status
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          admin_notes: `تمت إضافة ${credits} نقطة`
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast.success(`تم تفعيل الاشتراك وإضافة ${credits} نقطة`);
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('حدث خطأ أثناء تفعيل الاشتراك');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: PaymentRequest) => {
    setProcessingId(request.id);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          admin_notes: 'تم رفض الطلب'
        })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('تم رفض الطلب');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('حدث خطأ أثناء رفض الطلب');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-sm">
            <Clock className="w-4 h-4" />
            قيد المراجعة
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            مفعل
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-sm">
            <XCircle className="w-4 h-4" />
            مرفوض
          </span>
        );
      default:
        return null;
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">لوحة تحكم الإدارة</h1>
              <p className="text-muted-foreground text-sm">إدارة طلبات الاشتراك</p>
            </div>
          </div>
          <Button
            onClick={signOut}
            variant="destructive"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 text-center"
          >
            <CreditCard className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 text-center"
          >
            <Clock className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">قيد المراجعة</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 text-center"
          >
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
            <p className="text-sm text-muted-foreground">مفعل</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 text-center"
          >
            <XCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">مرفوض</p>
          </motion.div>
        </div>

        {/* Filter & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {f === 'all' && 'الكل'}
                {f === 'pending' && 'قيد المراجعة'}
                {f === 'approved' && 'مفعل'}
                {f === 'rejected' && 'مرفوض'}
              </button>
            ))}
          </div>
          <Button
            onClick={fetchRequests}
            variant="outline"
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
              </div>
            ) : requests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 glass-card"
              >
                <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">لا توجد طلبات</p>
              </motion.div>
            ) : (
              requests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">{request.user_email}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>رقم التحويل: <strong className="text-foreground" dir="ltr">{request.transfer_number}</strong></span>
                        <span>المبلغ: <strong className="text-primary">{request.amount} جنيه</strong></span>
                        <span>التاريخ: {formatDate(request.created_at)}</span>
                      </div>
                      {request.admin_notes && (
                        <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                          ملاحظات: {request.admin_notes}
                        </p>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="1000"
                            value={creditsToAdd[request.id] || ''}
                            onChange={(e) => setCreditsToAdd(prev => ({
                              ...prev,
                              [request.id]: e.target.value
                            }))}
                            className="w-24 text-center"
                          />
                          <span className="text-sm text-muted-foreground">نقطة</span>
                        </div>
                        <Button
                          onClick={() => handleApprove(request)}
                          disabled={processingId === request.id}
                          className="bg-green-600 hover:bg-green-700 gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          تفعيل
                        </Button>
                        <Button
                          onClick={() => handleReject(request)}
                          disabled={processingId === request.id}
                          variant="destructive"
                          className="gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          رفض
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
