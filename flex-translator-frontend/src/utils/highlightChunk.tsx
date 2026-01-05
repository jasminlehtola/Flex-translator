// THIS IS NOT USED RIGHT NOW! Tried to use this in ChunkEditor to highlight changed words
// --> did not get it working

import React, { useEffect, useState } from 'react';
import { fetchChunks } from '../api/chunksApiClient';

type HighlightChunkProps = {
  document: { id: number };
  currentChunkIndex: number;
};

const HighlightChunk: React.FC<HighlightChunkProps> = ({ document, currentChunkIndex }: HighlightChunkProps) => {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const docId = document.id;

  useEffect(() => {
    // Kutsutaan fetchChunks-funktiota backendistä
    const fetchData = async () => {
      try {
        const data = await fetchChunks(docId);
        setChunks(data); // Tallennetaan chunkit tilaan
        setLoading(false); // Ladataan chunkit
        console.log(data);
      } catch (err) {
        setError('Error while fetching chunks');
        setLoading(false);
      }
    };

    fetchData();
  }, [docId]); // Tämä hook kutsutaan, kun documentId muuttuu

  // Näytetään "Loading..." kun dataa haetaan
  if (loading) {
    return <div>Loading...</div>;
  }

  // Jos tulee virhe
  if (error) {
    return <div>{error}</div>;
  }

  // Muokkaa chunkit ja korosta aktiivinen chunk
  const highlightedText = chunks
    .map((chunk, index) => {
      // Jos tämä chunk on käsittelyssä, korostetaan se
      if (index === currentChunkIndex) {
        return `<mark style="background-color: yellow">${chunk}</mark>`; // Korostetaan taustalla
      } else {
        return chunk; // Muut chunkit jäävät normaaliksi
      }
    })
    .join('\n\n'); // Liittää kaikki chunkit takaisin yhdeksi tekstiksi

  return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};

export default HighlightChunk;
