import { create } from 'zustand';
import axios from 'axios';

export const useCartStore = create((set, get) => ({
  // ✅ เก็บข้อมูล User ไว้ใน Store เพื่อให้ Reactive (เปลี่ยนปุ๊บ หน้าจอเปลี่ยนปั๊บ)
  user: JSON.parse(localStorage.getItem('user')) || null,
  cart: [],
  isDrawerOpen: false,

  // ✅ ฟังก์ชันจัดการ User
  setUser: (userData) => set({ user: userData }),
  
  logout: () => {
    localStorage.clear();
    set({ user: null, cart: [] });
    window.location.href = "/";
  },

  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setCart: (newCart) => set({ cart: newCart || [] }),

  syncWithBackend: async (updatedCart) => {
    const { user } = get(); // ดึง user จาก store
    if (user?.email) {
      try {
        await axios.patch('http://localhost:5000/api/auth/cart', {
          email: user.email,
          cart: updatedCart
        });
        // อัปเดตข้อมูล cart ใน user object ด้วย
        const updatedUser = { ...user, cart: updatedCart };
        set({ user: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) { console.error("Sync Error:", err); }
    }
  },

  addToCart: async (product, selectedSize) => {
    const { cart, syncWithBackend } = get();
    const qtyInStock = product.sizeStock?.[selectedSize] || 0;
    let newCart;
    const existingItem = cart.find(i => i._id === product._id && i.size === selectedSize);

    if (existingItem) {
      if (existingItem.quantity >= qtyInStock) return;
      newCart = cart.map(i => (i._id === product._id && i.size === selectedSize) ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      newCart = [...cart, { ...product, quantity: 1, size: selectedSize, selected: true }];
    }

    set({ cart: newCart });
    await syncWithBackend(newCart);
  },

  toggleSelection: async (productId, size) => {
    const { cart, syncWithBackend } = get();
    const newCart = cart.map(item => 
      (item._id === productId && item.size === size) 
      ? { ...item, selected: !item.selected } : item
    );
    set({ cart: newCart });
    await syncWithBackend(newCart);
  },

  toggleSelectAll: async (isSelected) => {
    const { cart, syncWithBackend } = get();
    const newCart = cart.map(item => ({ ...item, selected: isSelected }));
    set({ cart: newCart });
    await syncWithBackend(newCart);
  },

  removeFromCart: async (productId, size) => {
    const { cart, syncWithBackend } = get();
    const item = cart.find(i => i._id === productId && i.size === size);
    if (!item) return;
    let newCart;
    if (item.quantity === 1) {
      newCart = cart.filter(i => !(i._id === productId && i.size === size));
    } else {
      newCart = cart.map(i => (i._id === productId && i.size === size) ? { ...i, quantity: i.quantity - 1 } : i);
    }
    set({ cart: newCart });
    await syncWithBackend(newCart);
  },

  clearItem: async (productId, size) => {
    const newCart = get().cart.filter(i => !(i._id === productId && i.size === size));
    set({ cart: newCart });
    await get().syncWithBackend(newCart);
  },

  clearSelectedItems: async () => {
    const newCart = get().cart.filter(item => !item.selected);
    set({ cart: newCart });
    await get().syncWithBackend(newCart);
  },
}));