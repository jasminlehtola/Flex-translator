/**
 * Route: /translate/:docId/autoTranslate
 * This is the **auto-translation screen** for a specific document.
 *
 *  What it does:
 * - Automatically triggers the backend auto-translation process for the given :docId.
 * - Displays a full-screen loading UI (<LoadingAuto />) while the backend translates.
 * - When finished, navigates to the completed screen (/translate/:docId/completedScreen).
 * - If the process fails, shows an error and redirects the user back to /.
 *
 *  Location: src/routes/translate/$docId/autoTranslate.tsx
 *  URL: /translate/:docId/autoTranslate
 *
 *  Notes:
 * - This route is used only when the user selects "Auto-translate" in the upload form.
 * - Previously in flat structure: translate.$docId.autoTranslate.tsx
 */

import { createFileRoute } from '@tanstack/react-router';
import { autoTranslateDocument } from '../../../api/documentsApiClient';
import { useEffect, useState, useRef } from 'react';
import LoadingAuto from '../../../components/general/LoadingAuto';
import { fetchProgress } from '../../../api/chunksApiClient';
import { downloadPdf } from '../../../api/documentsApiClient';

export const Route = createFileRoute('/translate/$docId/autoTranslate')({
  component: AutoLoadingScreen,
});

function AutoLoadingScreen() {
  const navigate = Route.useNavigate();
  const { docId } = Route.useParams();
  const [translated, setTranslated] = useState(0);
  const [total, setTotal] = useState(0);
  const [percent, setPercent] = useState(0);
  const alreadyStarted = useRef(false);

  // If the input document was a pdf, this works and downloads the document in pdf.
  // If it was not a pdf, this just gives an error in console but doesn't affect anything else.
  const handleSaveAsDocx = async () => {
    try {
      const res = await downloadPdf(Number(docId));
      const data = await res;
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = window.document.createElement('a');
      link.href = url;
      const safeTitle = (document.title || 'translated_document').replace(/[<>:"/\\|?*]+/g, '_');
      console.log('doctitle:', document.title, ', safetitle:', safeTitle);
      link.download = `${safeTitle || 'translated_document'}.docx`;
      console.log('Document made to pdf!');

      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  useEffect(() => {
    if (alreadyStarted.current) return;
    alreadyStarted.current = true;

    async function startAutoTranslation() {
      try {
        console.log(`Starting auto-translation for document ${docId}`);
        const options = 'deepl';

        // Start automatic translation in backend
        autoTranslateDocument(Number(docId), options).then(handleSaveAsDocx);

        console.log(`Auto-translation started. Polling progress...`);

        // Poll until translation is ready
        const intervalId = setInterval(async () => {
          const progressData = await fetchProgress(Number(docId));
          console.log(progressData);

          const translated = parseInt(progressData.translated);
          const total = parseInt(progressData.total);
          const percent = Math.round((translated / total) * 100);
          setPercent(percent);
          setTranslated(translated);
          setTotal(total);

          if (percent >= 100) {
            clearInterval(intervalId);
            console.log('Auto-translation complete.');
            localStorage.setItem(`isFinished-${docId}`, 'true');
            localStorage.setItem(`completedScreen-${docId}`, 'true');
            navigate({
              to: '/translate/$docId/completedScreen',
              params: { docId: String(docId) },
            });
          }
        }, 500); // polling every 0.5 seconds
      } catch (error) {
        console.error('Auto-translation failed:', error);
        alert('Auto-translation failed. Please try again.');
        navigate({ to: '/' });
      }
    }

    startAutoTranslation();
  }, []);

  return (
    <div>
      <LoadingAuto translated={translated} total={total} percent={percent} />
    </div>
  );
}
