import React, { useState } from 'react';
import axios from 'axios';
import './SellForm.css';

function SellForm({ onItemListed, walletAddress }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('description', description);
        if (image) {
            formData.append('image', image);
        }
        formData.append('seller', walletAddress);

        try {
            const response = await axios.post('http://localhost:5000/api/items', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Item listed:', response.data);
            onItemListed(); // 通知父组件更新物品列表
        } catch (error) {
            console.error('发布物品失败:', error);
            alert('发布物品失败，请重试');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="sell-form">
            <div className="form-group">
                <label htmlFor="name">Item Name</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="price">Price (DOT)</label>
                <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="image">Image</label>
                <input
                    type="file"
                    id="image"
                    onChange={(e) => setImage(e.target.files[0])}
                    accept="image/*"
                />
            </div>
            <button type="submit" className="submit-button">List Item</button>
        </form>
    );
}

export default SellForm;
