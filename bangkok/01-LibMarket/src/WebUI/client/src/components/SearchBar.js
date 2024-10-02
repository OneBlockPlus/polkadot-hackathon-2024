import React, { useState } from 'react';
import './SearchBar.css'; // 我们将创建这个文件

function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSearch} className="search-form">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索物品"
                className="search-input"
            />
            <button type="submit" className="search-button">搜索</button>
        </form>
    );
}

export default SearchBar;