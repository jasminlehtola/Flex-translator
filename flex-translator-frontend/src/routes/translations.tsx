/**
 * /translations.tsx
 *
 * Layout route for listing and managing all translated documents for the logged-in user.
 *
 * Features:
 * - Loads the current user's documents from the backend using `documentsByUserQueryOptions`
 * - Displays a horizontal scrollable list of links to individual document translation views
 * - Integrates the <Groups /> component for organizing documents into groups
 * - Shows a loading spinner while fetching documents
 * - Displays a fallback message when no documents are found
 * - Supports nested routing via <Outlet /> (e.g., opening individual translation views)
 *
 * Route loader:
 * - Preloads documents for the current user using TanStack Query's `ensureQueryData`
 * - Ensures the user is authenticated via context-provided `getUserId()`
 */

import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { documentsByUserQueryOptions } from '../utils/queryOptions.ts';
import LinkButton from '../components/general/LinkButton.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import LoadingComponent from '../components/general/Loading.tsx';
import Groups from '../components/Groups.tsx';

export const Route = createFileRoute('/translations')({
  loader: ({ context: { queryClient, getUserId }, params: { docId } }) => {
    const user_id = getUserId();
    return queryClient.ensureQueryData(documentsByUserQueryOptions(Number(user_id)));
  },
  component: DocumentsLayoutComponent,
});

function DocumentsLayoutComponent() {
  const auth = useAuth();
  const user_id = auth.user_id;

  const { data: documents, isLoading } = useQuery({
    ...documentsByUserQueryOptions(user_id),
    enabled: !!user_id, // do not start if user_id not available
    staleTime: 0,
    retry: false,
  });

  if (isLoading) return <LoadingComponent />;

  if (!documents || documents.length === 0) {
    return <div>No documents found.</div>;
  }

  return (
    <>
      <div>
        <div className="w-full overflow-x-auto h-53 pl-20 pr-20">
          <ul className="flex flex-row flex-wrap justify-center py-4 gap-x-3 gap-y-2">
            {documents.map((document) => (
              <li key={document.id} title={document.title} className="max-w-[18rem] pb-2 pt-2 truncate">
                <LinkButton to={`/translate/${document.id}`}>{document.title}</LinkButton>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Groups documents={documents} />
        </div>
      </div>

      <Outlet />
    </>
  );
}
