import React, {useState} from 'react';
import axios from 'axios';

const AddVideo = ({onVideoAdded}) => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/videos`, {youtubeUrl});
            setYoutubeUrl('');
            setLoading(false);
            if (onVideoAdded) {
                onVideoAdded(res.data);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error adding video');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2 style={styles.header}>Add YouTube Video</h2>
            <div style={styles.inputGroup}>
                <input
                    type="url"
                    placeholder="YouTube URL"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Adding...' : 'Add'}
                </button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
        </form>
    );
};

const styles = {
    form: {
        marginTop: '20px',
        padding: '20px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '5px 5px gray'
    },
    header: {
        marginBottom: '15px',
        color: '#333',
        textAlign: 'center'
    },
    inputGroup: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
    },
    input: {
        flex: 1,
        marginRight: '10px', // Add spacing between the input and the button
        padding: '10px 15px',
        width: 'auto', // Adjust width to be auto so it fills flex container
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s',
        boxSizing: 'border-box' // Ensure padding is included in width calculation
    },
    button: {
        padding: '10px 25px',
        backgroundColor: '#6C91C2',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    error: {
        color: '#ff4d4f',
        marginTop: '10px',
        textAlign: 'center'
    }
};

export default AddVideo;