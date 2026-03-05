// modules
import React, { useState, useEffect, useRef } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import WebFont from 'webfontloader';
import { TbCopy } from 'react-icons/tb';
import { TbCopyCheckFilled } from 'react-icons/tb';
// components
import BibleVerse from './BibleVerse';
import normalizeReference from './normalizeReference';
import AnimateWord from './AnimateWord';
// assets
import loadingAnimation from '../assets/animations/loading.json';
import errorAnimation from '../assets/animations/error.json';
// css
import './Home.css';
import 'animate.css'; // animation css

function Home({ selection }) {
	// State variables
	const [cardHeight, setCardHeight] = useState({
		cardContainerValue: '327px',
		cardValue: '300px',
	}); // Default card size
	const [color, setColor] = useState('');
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(true);
	const [verseText, setVerseText] = useState('');
	const [version, setVersion] = useState(
		'The Holy Bible. English Standard Version ®',
	);
	const selectedWord = normalizeReference(selection) || selection; // Normalize the selection
	const [bibleReference, setBibleReference] = useState('');

	useEffect(() => {
		// Pre-load the fonts
		WebFont.load({
			custom: {
				families: ['garet-bold', 'circular-pro'], // Name from @font-face
			},
			active() {
				console.log('Fonts have been loaded');
			},
			inactive() {
				console.log('Failed to load fonts');
			},
		});

		// Get a random color from the colors collection
		const randomColor = colors[Math.floor(Math.random() * colors.length)];
		setColor(randomColor);
	}, []);

	const handleCopyClick = () => {
		const verseToCopy = `${bibleReference}, "${verseText.trimEnd()}"`;
		navigator.clipboard.writeText(verseToCopy);
		setCopied(true);
		console.log('Verse copied.');
	};

	// Randomize text colors
	// Define a collection of colors
	const colors = [
		'#afafafff',
		'#C6D8FF',
		'#a2ddf5ff',
		'#FF7518',
		'#bca4dfff',
		'#c5b100',
  		'#8d99ff',
  		'#ff8d8d',
  		'#8dcaff',
  		'#ffffff',
  		'#a98747',
	];

	return (
		<>
			<div
				className="card-container"
				style={{ height: cardHeight.cardContainerValue }}>
				<div className="top-tape"></div>
				<div
					className="card"
					style={{ height: cardHeight.cardValue }}>
					<div className="card-content">
						{selectedWord ? (
							<div className="word-content">
								<div className="top">
									<div>
										<AnimateWord
											word={bibleReference}
											color={color}
										/>
										{loading ? (
											''
										) : (
											<div className="line"></div>
										)}
									</div>
								</div>

								<div className="bottom-container">
									<div className="bottom">
										<text style={{ color }}>
											{selectedWord ? (
												<BibleVerse
													reference={selectedWord}
													setCardHeight={
														setCardHeight
													}
													setLoading={setLoading}
													setError={setError}
													setVerseText={setVerseText}
													setBibleReference={
														setBibleReference
													}
												/>
											) : null}
										</text>
									</div>
								</div>

								{loading ? (
									''
								) : (
									<div
										className="copy"
										style={{ color: color }}>
										{copied ? (
											<TbCopyCheckFilled className="copy-icon" />
										) : (
											<TbCopy
												onClick={handleCopyClick}
												className="copy-icon animate__animated animate__wobble"
											/>
										)}
									</div>
								)}

								{loading ? (
									''
								) : (
									<div className="version">{version}</div>
								)}
							</div>
						) : (
							<div></div>
						)}
					</div>

					{/* Absolute positioned div for rendering loading animation on top of the card when loading is activated.*/}
					<div
						className={`${
							loading ? 'loading-active' : 'loading-hidden'
						}`}>
						<Player
							autoplay
							loop={true} // Ensure it doesn't loop
							src={loadingAnimation} // Path to your Lottie JSON file
						/>
					</div>

					<div
						className={`${
							error ? 'error-active' : 'error-hidden'
						}`}>
						<Player
							autoplay
							loop={true} // Ensure it doesn't loop
							src={errorAnimation} // Path to your Lottie JSON file
							style={{ height: '270px', width: '270px' }} // Adjust the size
						/>
					</div>
				</div>
			</div>
		</>
	);
}

export default Home;
