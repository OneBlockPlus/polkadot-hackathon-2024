import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ItemList.css';

function ItemList({ onItemSelect, onChatClick, searchQuery, refresh, currentUser }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchItems();
    }, [refresh, searchQuery]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/items');
            setItems(response.data.filter(item => item.isListed));
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch item list');
            setLoading(false);
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(selectedItem && selectedItem._id === item._id ? null : item);
    };

    const formatAddress = (address) => {
        return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown';
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="item-list">
            <h2>Item List</h2>
            <div className="item-grid">
                {items.map((item) => (
                    <div key={item._id} className="item-card" onClick={() => handleItemClick(item)}>
                        <div className="item-image-container">
                            {item.image ? (
                                <img 
                                    src={`http://localhost:5000/uploads/${item.image}`} 
                                    alt={item.name} 
                                    className="item-image" 
                                    onError={(e) => {
                                        console.error('Image load error:', e.target.src);
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                            ) : (
                                <div className="image-placeholder">No image</div>
                            )}
                            <div className="image-error" style={{display: 'none'}}>Image load failed</div>
                        </div>
                        <h3>{item.name}</h3>
                        <p className="item-price">{item.price} DOT</p>
                        <div className="item-seller-container">
                            <span className="item-seller-label">Seller:</span>
                            <span className="item-seller-address">{formatAddress(item.seller)}</span>
                        </div>
                        {selectedItem && selectedItem._id === item._id && (
                            <div className="item-details">
                                <p className="item-description">{item.description}</p>
                                <div className="item-buttons">
                                    {currentUser.toLowerCase() !== item.seller.toLowerCase() && (
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Chat button clicked for item:', item);
                                            onChatClick(item);
                                        }} className="chat-button">Chat</button>
                                    )}
                                    <button onClick={(e) => {e.stopPropagation(); onItemSelect(item);}} className="details-button">Details</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ItemList;
