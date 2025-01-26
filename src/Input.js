import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Input() {
    const [value, setValue] = useState('');
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            });
            if (response.ok) {
                alert('Data submitted successfully!');
                setValue('');
            } else {
                alert('Failed to submit data.');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            alert('Failed to submit data.');
        }
    };
    return (
        <div>
            <h1>Input</h1>
            <Link to="/">
                    <button id="gs-btn">GS</button>
                </Link>  
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter text"
                    required
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default Input;
