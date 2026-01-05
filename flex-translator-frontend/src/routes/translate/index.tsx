/**
 * Route: /translate
 * This is the **translation home screen**.
 *
 *  What it does:
 * - Loads all documents for the logged-in user (via documentsByUserQueryOptions).
 * - Renders the <NewTranslationForm /> where users can upload text or PDFs
 *   and choose between manual or auto-translation.
 *
 *  Location: src/routes/translate/index.tsx
 *  URL: /translate
 */

import { createFileRoute } from '@tanstack/react-router';
import { documentsByUserQueryOptions } from '../../utils/queryOptions.ts';
import NewTranslationForm from '../../components/NewTranslationForm.tsx';
import { useAuth } from '../../hooks/useAuth.ts';

export const Route = createFileRoute('/translate/')({
  loader: ({ context: { queryClient, getUserId } }) => {
    const user_id = getUserId();
    return queryClient.ensureQueryData(documentsByUserQueryOptions(Number(user_id)));
  },
  component: TranslationComponent,
});

function TranslationComponent() {
  const auth = useAuth();
  const user_id = auth.user_id;

  return <NewTranslationForm />;
}
