import React, { useState } from "react";
import Spinner from "./Spinner";
import { useGroceryFetch } from "./useGroceryFetch";

export function GroceryPanel({ onAddTodo }) {
    const [source, setSource] = useState("MDN");
    const { groceryData, isLoading, error } = useGroceryFetch(source);

    function handleDropdownChange(e) {
        setSource(e.target.value);
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
                    onChange={handleDropdownChange}
                    value={source}
                >
                    <option value="">(None selected)</option>
                    <option value="MDN">MDN</option>
                    <option value="Liquor store">Liquor store</option>
                    <option value="Butcher">Butcher</option>
                    <option value="whoknows">Who knows?</option>
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