
DROP POLICY "System can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'editor'::app_role])
  );
