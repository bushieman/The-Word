import React, { useEffect, useState } from 'react';
import beautifyText from './beautifyText';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-publishable-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function BibleVerse({
	reference,
	bibleId,
	setCardHeight,
	setLoading,
	setError,
	setVerseText,
	setBibleReference,
}) {
	const [verseContent, setVerseContent] = useState('');

	useEffect(() => {
		if (!reference || !bibleId) return;

		console.log(`Fetching ${reference} for Bible ID: ${bibleId} via Edge Function...`);
		
		async function fetchVerse() {
			try {
				setLoading(true);
				setError(false);

				// Call edge function, passing reference and the dynamic bibleId parameter
				const { data, error } = await supabase.functions.invoke('get-bible-verse', {
					body: { reference, bibleId },
				});

				if (error || !data) {
					throw new Error(error?.message || 'Failed to fetch translation content');
				}

				const beautifiedBook = beautifyText(data.reference);
				setBibleReference(beautifiedBook);

				// Parse inner HTML markup string safely 
				const parser = new DOMParser();
				const doc = parser.parseFromString(data.content, 'text/html');

				doc.querySelectorAll('span').forEach((span) => {
					if (/^\d+$/.test(span.textContent.trim())) {
						const sup = doc.createElement('sup');
						sup.textContent = span.textContent;
						span.replaceWith(sup);
					}
				});
				
				setVerseText(doc.body.textContent);

				// Adjust layout sizing bounds
				setCardHeight({
					cardContainerValue: 'auto',
					cardValue: 'auto',
				});

				setVerseContent(doc.body.innerHTML);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching dynamic verse version:', err);
				setError(true);
				setVerseContent('<p>Verse unavailable for this translation</p>');
				setLoading(false);
			}
		}

		fetchVerse();
	}, [reference, bibleId]); // Dynamic hook fires automatically when bibleId changes!

	return <div dangerouslySetInnerHTML={{ __html: verseContent }} />;
}
