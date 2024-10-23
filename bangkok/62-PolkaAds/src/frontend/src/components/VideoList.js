import React, {useEffect, useState} from 'react';
import axios from 'axios';
import AddAd from './AddAd';

const VideoList = ({videos, setVideos}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAdForm, setShowAdForm] = useState({});

    const fetchVideos = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/videos`);
            setVideos(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch videos');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
        const interval = setInterval(fetchVideos, 10000); // Polling every 10 seconds
        return () => clearInterval(interval);
    }, [setVideos]);

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/videos/${videoId}`);
            setVideos(prev => prev.filter(video => video._id !== videoId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete video');
        }
    };

    const handleDeleteAd = async (videoId, adId) => {
        if (!window.confirm('Are you sure you want to delete this ad?')) return;
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/videos/${videoId}/ads/${adId}`);
            setVideos(prev =>
                prev.map(video =>
                    video._id === videoId
                        ? {...video, productAds: video.productAds.filter(ad => ad._id !== adId)}
                        : video
                )
            );
        } catch (err) {
            console.error(err);
            alert('Failed to delete ad');
        }
    };

    const handleAdAdded = (videoId, newAd) => {
        setVideos(prev =>
            prev.map(video =>
                video._id === videoId
                    ? {...video, productAds: [...video.productAds, newAd]}
                    : video
            )
        );
    };

    const toggleAdForm = (videoId) => {
        setShowAdForm(prevState => ({
            ...prevState,
            [videoId]: !prevState[videoId]
        }));
    };

    const handleCancelAd = (videoId) => {
        setShowAdForm(prevState => ({
            ...prevState,
            [videoId]: false
        }));
    };

    const truncateMiddle = (str, frontLen, backLen) => {
        if (str.length <= frontLen + backLen) return str;
        const front = str.substring(0, frontLen);
        const back = str.substring(str.length - backLen);
        return `${front}...${back}`;
    };

    if (loading) return <p>Loading videos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2 style={styles.header}>YouTube Videos</h2>
            {videos.map(video => (
                <div key={video._id} style={styles.videoContainer}>
                    <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeID(video.youtubeUrl)}`}
                        frameBorder="0"
                        allowFullScreen
                        title={video.youtubeUrl}
                        style={styles.iframe}
                    ></iframe>

                    <button
                        onClick={() => handleDeleteVideo(video._id)}
                        style={styles.removeVideoButton}
                    >
                        Remove Video
                    </button>

                    <h3 style={styles.subheader}>Product Ads</h3>
                    {video.productAds.length === 0 ? (
                        <div>
                            <p>No ads for this video.</p>
                            {showAdForm[video._id] ? (
                                <>
                                    <AddAd videoId={video._id} onAdAdded={handleAdAdded}/>
                                    <button onClick={() => handleCancelAd(video._id)} style={styles.cancelButton}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => toggleAdForm(video._id)} style={styles.createAdButton}>
                                    Create Ad
                                </button>
                            )}
                        </div>
                    ) : (
                        <ul style={styles.adList}>
                            {video.productAds.map(ad => (
                                <li key={ad._id} style={styles.adItem}>
                                    <img src={ad.image} alt={ad.title} style={styles.adImage}/>
                                    <div style={styles.adContent}>
                                        <p style={styles.adContentParagraph}><strong>Title:</strong> {ad.title}</p>
                                        <p style={styles.adContentParagraph}><strong>Price:</strong> {ad.price} SBY
                                        </p>
                                        <p style={styles.adContentParagraph}><strong>Timing:</strong> {ad.timingStart}s
                                            - {ad.timingEnd}s</p>
                                        <p style={styles.adContentParagraph}>
                                            <strong>Wallet:</strong> {truncateMiddle(ad.walletAddress, 10, 10)}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAd(video._id, ad._id)}
                                        style={styles.removeAdButton}
                                    >
                                        Remove Ad
                                    </button>
                                </li>
                            ))}
                            <div style={styles.centeredContainer}>
                                {showAdForm[video._id] ? (
                                    <>
                                        <AddAd videoId={video._id} onAdAdded={handleAdAdded}/>
                                        <button onClick={() => handleCancelAd(video._id)} style={styles.cancelButton}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => toggleAdForm(video._id)} style={styles.createAdButton}>
                                        Create Ad
                                    </button>
                                )}
                            </div>
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
};

const extractYouTubeID = url => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
};

const styles = {
    header: {
        textAlign: 'center',
        color: '#333',
        marginTop: '20px',
        marginBottom: '20px'
    },
    subheader: {
        marginTop: '15px',
        color: '#555'
    },
    videoContainer: {
        border: '1px solid #ccc',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '10px',
        position: 'relative',
        backgroundColor: '#f9f9f9',
        boxShadow: '5px 5px gray',
        textAlign: 'center'
    },
    iframe: {
        width: '100%', // Make the video responsive
        maxWidth: '560px', // Keep the max width for larger screens
        height: 'auto', // Auto height to maintain aspect ratio
        aspectRatio: '16/9', // Maintain aspect ratio for responsive scaling
        borderRadius: '8px',
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    adList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        padding: 0,
        listStyleType: 'none',
    },
    adItem: {
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center',
        backgroundColor: '#fff',
    },
    adImage: {
        width: '100%',
        height: '150px', // Fixed height for all images
        borderRadius: '4px',
        marginBottom: '10px',
        objectFit: 'scale-down' // Ensures the image fills the area without stretching
    },
    adContent: {
        width: '100%',
        textAlign: 'left',
    },
    adContentParagraph: {
        margin: '5px 0', // Reduces top and bottom margin to 5px
    },
    walletText: {
        width: '200px',  // Set a fixed width
        whiteSpace: 'nowrap',  // Prevent wrapping
        overflow: 'hidden',  // Hide the overflow
        textOverflow: 'ellipsis',  // Display ellipsis
        direction: 'rtl',  // This will place the ellipsis in the middle
        textAlign: 'left'  // Keep the text aligned left
    },
    removeVideoButton: {
        backgroundColor: '#D85555',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'background-color 0.3s',
        marginTop: '10px'
    },
    removeAdButton: {
        marginTop: '10px',
        backgroundColor: '#D85555',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%'
    },
    centeredContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        justifyContent: 'center',
        height: '100%',
    },
    createAdButton: {
        backgroundColor: '#6C91C2',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
        fontSize: '1em',
        transition: 'background-color 0.3s'
    },
    cancelButton: {
        color: '#000000',
        width: '100%',
        background: 'none',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
        fontSize: '1em',
        transition: 'background-color 0.3s'
    }
};

export default VideoList;