import React, { useEffect, useState } from 'react';
import beautifyText from './beautifyText';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-publishable-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function BibleVerse({
	reference,
	setCardHeight,
	setLoading,
	setError,
	setVerseText,
	setBibleReference,
}) {
	const [verseContent, setVerseContent] = useState('');

	useEffect(() => {
		console.log('Fetching ', reference, ' via Supabase Edge Function...');
		
		async function fetchVerse() {
			try {
				setLoading(true);
				setError(false);

				// Invoking the edge function securely via your publishable client
				const { data, error } = await supabase.functions.invoke('get-bible-verse', {
					body: { reference },
				});

				// Catch edge function failures or network exceptions
				if (error || !data) {
					throw new Error(error?.message || 'Failed to retrieve verse from function');
				}

				// Format and update reference header
				const beautifiedBook = beautifyText(data.reference);
				setBibleReference(beautifiedBook);

				// Parse raw HTML payload and safely transform structure inside the browser DOM context
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

				// Dynamically auto-adjust height bounds
				setCardHeight({
					cardContainerValue: 'auto',
					cardValue: 'auto',
				});

				setVerseContent(doc.body.innerHTML);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching verse:', err);
				setError(true);
				setVerseContent('<p>Error fetching verse</p>');
				setLoading(false);
			}
		}

		if (reference) {
			fetchVerse();
		}
	}, [reference]);

	return <div dangerouslySetInnerHTML={{ __html: verseContent }} />;
}
