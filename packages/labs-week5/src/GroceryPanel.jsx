import React, { useState } from "react";
import Spinner from "./Spinner";

const MDN_URL = "https://mdn.github.io/learning-area/javascript/apis/fetching-data/can-store/products.json";

/**
 * Creates and returns a new promise that resolves after a specified number of milliseconds.
 *
 * @param {number} ms the number of milliseconds to delay
 * @returns {Promise<undefined>} a promise that resolves with the value of `undefined` after the specified delay
 */
function delayMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function GroceryPanel({ onAddTodo }) {
    const [groceryData, setGroceryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    async function fetchData(url) {
        setIsLoading(true);
        setError(null);
        setGroceryData([]);

        try {
            await delayMs(2000);
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch data");

            const data = await response.json();
            setGroceryData(data);
        } catch (err) {
            setError("Error fetching grocery data.");
        } finally {
            setIsLoading(false);
        }
    }

    function handleDropdownChange(e) {
        const url = e.target.value;
        setGroceryData([]);
        setError(null);
    
        if (url) {
            fetchData(url);
        }
    }

    function handleAddTodoClicked(item) {
        const todoName = `Buy ${item.name} ($${item.price.toFixed(2)})`;
        onAddTodo(todoName);
    }

    return (
        <div>
            <h1 className="text-xl font-bold">Grocery Prices Today</h1>
            <label className="mb-4 flex gap-4 items-center">
                Get prices from:
                <select 
                    className="border border-gray-300 p-1 rounded-sm disabled:opacity-50"
                    disabled={isLoading}
                    onChange={handleDropdownChange}
                >
                    <option value="">(None selected)</option>
                    <option value={MDN_URL}>MDN</option>
                    <option value="invalid">Who knows?</option>
                </select>
                {isLoading && <Spinner className="text-gray-500" />}
                {error && <span className="text-red-500">{error}</span>}
            </label>

            {groceryData.length > 0 ? (
                <PriceTable items={groceryData} onAddClicked={handleAddTodoClicked} />
            ) : (
                !isLoading && "No data"
            )}
        </div>
    );
}

function PriceTable({ items, onAddClicked }) {
    return (
        <table className="mt-4">
            <thead>
                <tr>
                    <th className="text-left">Name</th>
                    <th>Price</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => (
                    <PriceTableRow key={item.name} item={item} onAddClicked={() => onAddClicked(item)} />
                ))}
            </tbody>
        </table>
    );
}

function PriceTableRow({ item, onAddClicked }) {
    return (
        <tr>
            <td>{item.name}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>
                <button 
                    className="italic px-2 rounded-sm border border-gray-300 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
                    onClick={onAddClicked}
                >
                    Add to todos
                </button>
            </td>
        </tr>
    );
}
