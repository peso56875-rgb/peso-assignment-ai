import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.log('Notifications not available or not permitted');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/peso-logo.png',
        badge: '/peso-logo.png',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  const notifyAssignmentComplete = useCallback(() => {
    sendNotification('✅ تم إنشاء الأسايمنت', {
      body: 'الأسايمنت جاهز للتحميل الآن!',
      tag: 'assignment-complete'
    });
  }, [sendNotification]);

  const notifyQuizComplete = useCallback(() => {
    sendNotification('✅ تم حل الكويز', {
      body: 'الإجابات جاهزة للعرض والتحميل!',
      tag: 'quiz-complete'
    });
  }, [sendNotification]);

  const notifyPresentationComplete = useCallback(() => {
    sendNotification('✅ تم إنشاء العرض التقديمي', {
      body: 'العرض التقديمي جاهز للتحميل!',
      tag: 'presentation-complete'
    });
  }, [sendNotification]);

  const notifyExamComplete = useCallback(() => {
    sendNotification('✅ تم توليد أسئلة الامتحان', {
      body: 'الأسئلة جاهزة للعرض والتحميل!',
      tag: 'exam-complete'
    });
  }, [sendNotification]);

  const notifyLowCredits = useCallback((credits: number) => {
    sendNotification('⚠️ رصيد منخفض', {
      body: `تبقى لديك ${credits} نقطة فقط. قم بشحن رصيدك للاستمرار.`,
      tag: 'low-credits'
    });
  }, [sendNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    notifyAssignmentComplete,
    notifyQuizComplete,
    notifyPresentationComplete,
    notifyExamComplete,
    notifyLowCredits
  };
};
