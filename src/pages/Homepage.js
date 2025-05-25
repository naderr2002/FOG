import React, { useState, useRef, useEffect } from "react";
import logo1 from "../fog.png"; // your logo
import photo1 from "../photo1.png"; // header background photo

const categories = [
  { id: "salads", name: "Salads", icon: "🥗" },
  { id: "soups", name: "Sandwiches", icon: "🥪" },
  { id: "maindishes", name: "Main Dishes", icon: "🍽️" },
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "appetizers", name: "Appetizers", icon: "🍤" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
  { id: "sides", name: "Sides", icon: "🍟" },
  { id: "fish", name: "Shisha", icon: "💨" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
];
export default function App() {

  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const categoryRefs = useRef({});
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const groupByCategory = (productsArray) => {
  return productsArray.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});
};

  
const initialData = [
  {
    "id": 2,
    "name": "Orange Juice",
    "category": "drinks",
    "description": "Freshly squeezed oranges for pure vitamin C.",
    "price": 3,
    "discount": 0,
    "photo": null
  },
  {
    "id": 3,
    "name": "Grilled Chicken",
    "category": "maindishes",
    "description": "Tender grilled chicken marinated with herbs.",
    "price": 12,
    "discount": 2,
    "photo": null
  },
  {
    "id": 4,
    "name": "Caesar Salad",
    "category": "salads",
    "description": "Romaine lettuce with Caesar dressing and croutons.",
    "price": 6,
    "discount": 1,
    "photo": null
  }
];


const [products, setProducts] = useState(groupByCategory(initialData));

  // Initialize refs for categories
  categories.forEach((cat) => {
    if (!categoryRefs.current[cat.id]) categoryRefs.current[cat.id] = React.createRef();
  });

  // Fetch products JSON from backend API on mount



  // Automatic marquee scroll logic with pause on drag
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const speed = 0.5; // px per frame
    let rafId;

    function step() {
      if (!isDragging && scrollContainer) {
        scrollContainer.scrollLeft += speed;
        // Loop effect
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft -= scrollContainer.scrollWidth / 2;
        }
      }
      rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId);
  }, [isDragging]);

  // Drag handlers for manual scroll
  function onDragStart(e) {
    setIsDragging(true);
    dragStartX.current = e.pageX || e.touches[0].pageX;
    scrollStartX.current = scrollRef.current.scrollLeft;
  }

  function onDragMove(e) {
    if (!isDragging) return;
    const currentX = e.pageX || e.touches[0].pageX;
    const deltaX = dragStartX.current - currentX;
    scrollRef.current.scrollLeft = scrollStartX.current + deltaX;

    // Loop manually if needed
    if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
      scrollRef.current.scrollLeft -= scrollRef.current.scrollWidth / 2;
    } else if (scrollRef.current.scrollLeft < 0) {
      scrollRef.current.scrollLeft += scrollRef.current.scrollWidth / 2;
    }
  }

  function onDragEnd() {
    setIsDragging(false);
  }

  // Scroll to category on click
  function scrollToCategory(id) {
    categoryRefs.current[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Cart logic
  function updateCart(productId, delta) {
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: newQty };
    });
  }

  function calcTotal() {
    let total = 0;
    for (const catId in products) {
      if (!Array.isArray(products[catId])) continue;
      for (const p of products[catId]) {
        const qty = cart[p.id] || 0;
        if (qty > 0) {
          const priceAfterDiscount = p.price - (p.discount || 0);
          total += priceAfterDiscount * qty;
        }
      }
    }
    return total.toFixed(2);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Header */}
      <header
        className="relative h-64 flex flex-col items-center justify-center text-white select-none shadow-lg"
        style={{
          backgroundImage: `url(${photo1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-inherit opacity-50"></div>
        <img
          src={logo1}
          alt="Logo"
          className="relative z-10 w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover mb-3"
          loading="lazy"
        />
        <h1 className="relative z-10 text-3xl font-bold tracking-wide">Our Resort Restaurant</h1>
        <p className="relative z-10 mt-1 max-w-xl font-light text-gray-200 text-center px-4">
          Fresh flavors, modern dining experience.
        </p>
      </header>

      {/* Categories scrolling */}
      <nav
        aria-label="Category navigation"
        className="relative bg-white border-b border-gray-300 shadow-sm overflow-hidden select-none"
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        onMouseMove={onDragMove}
        onTouchMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchEnd={onDragEnd}
      >
        <div
          ref={scrollRef}
          className="flex gap-6 py-3 whitespace-nowrap cursor-grab"
          style={{ overflowX: "auto", scrollBehavior: "smooth" }}
        >
          {[...categories, ...categories].map((cat, idx) => (
            <button
              key={`${cat.id}-${idx}`}
              onClick={() => scrollToCategory(cat.id)}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-full cursor-pointer
                 font-semibold text-gray-800 hover:bg-gray-200 active:bg-gray-300 transition-colors select-none"
              aria-label={`Scroll to ${cat.name}`}
              type="button"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm">{cat.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Products sections */}
      <main className="flex-grow px-6 py-8 max-w-5xl mx-auto space-y-14">
        {categories.map(({ id, name }) => (
          <section key={id} ref={categoryRefs.current[id]} id={id} tabIndex={-1}>
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-300 pb-2">{name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.isArray(products[id]) ? (
                products[id].map((p) => {
                  const priceAfterDiscount = (p.price - (p.discount || 0)).toFixed(2);
                  const hasPhoto = !!p.photo;
                  return (
                    <div
                      key={p.id}
                      className="flex gap-4 bg-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                    >
                     {hasPhoto && (
  <div className="flex flex-col items-center flex-shrink-0 w-28">
    <img
      src={p.photo}
      alt={p.name}
      className="w-28 h-28 rounded-lg object-cover"
      loading="lazy"
    />
    <div className="mt-2 text-center min-w-full">
      {p.discount > 0 ? (
        <>
          <span className="line-through text-gray-400 block">${p.price.toFixed(2)}</span>
          <span className="text-red-600 font-bold text-lg block">${(p.price - p.discount).toFixed(2)}</span>
        </>
      ) : (
        <span className="text-gray-900 font-bold text-lg block">${p.price.toFixed(2)}</span>
      )}
    </div>
  </div>
)}


                      <div className="flex flex-col justify-between flex-grow min-w-0">
                        <div>
                          <h3 className="text-xl font-semibold">{p.name}</h3>
                          <p className="text-gray-700 mt-1">{p.description}</p>
                        </div>

                        {/* Buttons aligned right on new line */}
                        <div className={`flex items-center gap-3 mt-4 ${hasPhoto ? "justify-end" : "justify-between"}`}>
                          {!hasPhoto && (
                            <div className="flex items-baseline gap-3 min-w-0">
                              {p.discount > 0 ? (
                                <>
                                  <span className="line-through text-gray-700 whitespace-nowrap">${p.price.toFixed(2)}</span>
                                  <span className="text-red-600 font-bold text-lg whitespace-nowrap">${priceAfterDiscount}</span>
                                </>
                              ) : (
                                <span className="text-gray-900 font-bold text-lg whitespace-nowrap">${p.price.toFixed(2)}</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => updateCart(p.id, -1)}
                              disabled={!cart[p.id]}
                              className={`w-8 h-8 rounded-full border border-gray-400 text-gray-600 font-bold
                              hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed select-none flex-shrink-0`}
                              aria-label={`Remove one ${p.name}`}
                              type="button"
                            >
                              -
                            </button>
                            <span className="min-w-[20px] text-center font-medium select-none">{cart[p.id] || 0}</span>
                            <button
                              onClick={() => updateCart(p.id, 1)}
                              className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 font-bold hover:bg-gray-200 transition select-none flex-shrink-0"
                              aria-label={`Add one ${p.name}`}
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 italic">Loading {name}...</p>
              )}
              {Array.isArray(products[id]) && products[id].length === 0 && (
                <p className="text-gray-500 italic">No {name} available.</p>
              )}
            </div>
          </section>
        ))}
      </main>

      {/* Cart sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl border-l border-gray-300 z-50 transform transition-transform ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
      >
        <header className="sticky top-0 bg-white border-b border-gray-300 p-4 flex items-center justify-between shadow">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            type="button"
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            ×
          </button>
        </header>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
          {Object.keys(cart).length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            Object.entries(cart).map(([productId, qty]) => {
              // Find product details from products
              let product = null;
              outerLoop: for (const catId in products) {
                if (Array.isArray(products[catId])) {
                  for (const p of products[catId]) {
                    if (p.id === productId) {
                      product = p;
                      break outerLoop;
                    }
                  }
                }
              }
              if (!product) return null;

              const priceAfterDiscount = (product.price - (product.discount || 0)).toFixed(2);

              return (
                <div key={productId} className="flex items-center justify-between border-b border-gray-200 py-3">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {qty} × ${priceAfterDiscount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCart(productId, -1)}
                      className="px-2 py-1 rounded border border-gray-400 hover:bg-gray-200"
                      aria-label={`Remove one ${product.name}`}
                      type="button"
                    >
                      −
                    </button>
                    <span>{qty}</span>
                    <button
                      onClick={() => updateCart(productId, 1)}
                      className="px-2 py-1 rounded border border-gray-400 hover:bg-gray-200"
                      aria-label={`Add one ${product.name}`}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {Object.keys(cart).length > 0 && (
          <footer className="p-4 border-t border-gray-300 sticky bottom-0 bg-white">
            <p className="text-lg font-bold">Total: ${calcTotal()}</p>
          </footer>
        )}
      </aside>

      {/* Cart open button */}
      {!cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          aria-label="Open cart"
          type="button"
          className="fixed bottom-8 right-8 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none"
        >
          🛒 ({Object.keys(cart).length})
        </button>
      )}
    </div>
  );
}
