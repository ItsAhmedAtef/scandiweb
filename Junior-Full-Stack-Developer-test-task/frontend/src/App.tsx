import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import { useCart } from './hooks/useCart';
import './App.css';

const App: React.FC = () => {

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { cart, setCart, addItemToCart } = useCart();

    return (
        <Router>
            <Header
                selectedCategory={selectedCategory}
                cart={cart}
                setCart={setCart}
                addItemToCart={addItemToCart}
            />
            <Routes>
                <Route index element={<Navigate to="/all" replace />} />

                <Route path="/:category"
                    element={
                        <ProductList
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            addItemToCart={addItemToCart}
                        />
                    }
                />
                <Route path="/product/:id"
                    element={
                        <ProductDetails
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            addItemToCart={addItemToCart}
                        />
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
