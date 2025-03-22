// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';

function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [status, setStatus] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id });
      } catch (err) {
        console.error("Invalid token format", err);
        localStorage.removeItem('token');
      }
    }
    fetchMenu();
    window.addEventListener("online", () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/menu");
      setMenu(res.data);
    } catch (error) {
      console.error("Error fetching menu", error);
    }
  };

  const addToCart = (item) => {
    const exists = cart.find(i => i._id === item._id);
    if (exists) {
      setCart(cart.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const placeOrder = async () => {
    if (!online) {
      setStatus("You are offline. Order will be queued.");
      return;
    }
    if (!user) {
      setStatus("Please login to place an order.");
      return;
    }
    try {
      const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      await axios.post("http://localhost:5000/api/orders/create", {
        userId: user.id,
        items: cart,
        total
      });
      setStatus("Order placed successfully!");
      setCart([]);
    } catch (err) {
      console.error("Order failed", err);
      setStatus("Failed to place order.");
    }
  };

  if (!user) return <Login setUser={setUser} />;

  return (
    <div className="p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">Mangat Food Delivery</h1>
      <p className={online ? "text-green-600" : "text-red-600"}>{online ? "Online" : "Offline"}</p>

      <h2 className="text-xl mt-6 mb-2 font-semibold">Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menu.map((item) => (
          <div key={item._id} className="border rounded-xl p-4 shadow">
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-gray-600">{item.description}</p>
            <p className="text-sm">₹{item.price}</p>
            <button
              onClick={() => addToCart(item)}
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl mt-6 mb-2 font-semibold">Cart</h2>
      <div>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {cart.map((item, index) => (
              <li key={index} className="mb-1">
                {item.name} x {item.quantity} = ₹{item.price * item.quantity}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={placeOrder}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        disabled={cart.length === 0}
      >
        Place Order
      </button>

      {status && <p className="mt-3 text-blue-700 font-medium">{status}</p>}
    </div>
  );
}

export default App;
